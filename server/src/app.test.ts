import { describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("./db/index", () => ({ db: undefined }));

import { app } from "./app";

describe("GET /api/health", () => {
  it("reports that the database is not configured", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      checks: {
        database: "not_configured",
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
