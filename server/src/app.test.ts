import { afterEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const mockEnv = vi.hoisted(() => ({ AUTH_SERVER_URL: undefined as string | undefined }));
const mockDb = vi.hoisted(() => ({
  current: undefined as { execute: () => Promise<unknown> } | undefined,
}));

vi.mock("./db/index", () => ({
  get db() {
    return mockDb.current;
  },
}));
vi.mock("./env", () => ({ env: mockEnv }));

import { app } from "./app";

afterEach(() => {
  mockEnv.AUTH_SERVER_URL = undefined;
  mockDb.current = undefined;
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("GET /api/health", () => {
  it("reports that the database and auth server are not configured", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      checks: {
        database: "not_configured",
        authServer: "not_configured",
      },
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("reports a healthy auth server", async () => {
    mockEnv.AUTH_SERVER_URL = "http://bt-auth-server:8080";
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ status: "UP", groups: ["liveness", "readiness"] }));

    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      checks: {
        database: "not_configured",
        authServer: "healthy",
      },
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://bt-auth-server:8080/actuator/health",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it.each([
    ["a non-2xx response", () => Promise.resolve(jsonResponse({ status: "DOWN" }, 503))],
    ["a status other than UP", () => Promise.resolve(jsonResponse({ status: "DOWN" }))],
    ["an invalid body", () => Promise.resolve(jsonResponse({ healthy: true }))],
    ["an unparseable body", () => Promise.resolve(new Response("not json", { status: 200 }))],
    ["a network error", () => Promise.reject(new TypeError("fetch failed"))],
    [
      "a timeout",
      () =>
        Promise.reject(
          new DOMException("The operation was aborted due to timeout", "TimeoutError"),
        ),
    ],
  ])(
    "reports an unhealthy auth server on %s without failing the health check",
    async (_, fetchResult) => {
      mockEnv.AUTH_SERVER_URL = "http://localhost:8080";
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(globalThis, "fetch").mockImplementation(fetchResult);

      const res = await request(app).get("/api/health");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ok: true,
        checks: {
          database: "not_configured",
          authServer: "unhealthy",
        },
      });
    },
  );

  it("keeps the 503 governed by the database while still reporting the auth server", async () => {
    mockEnv.AUTH_SERVER_URL = "http://localhost:8080";
    mockDb.current = { execute: () => Promise.reject(new Error("connection refused")) };
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ status: "UP" }));

    const res = await request(app).get("/api/health");

    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      ok: false,
      checks: {
        database: "unhealthy",
        authServer: "healthy",
      },
    });
  });

  it("404s unknown api routes as json", async () => {
    const res = await request(app).get("/api/nope");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: "Not found",
    });
  });
});
