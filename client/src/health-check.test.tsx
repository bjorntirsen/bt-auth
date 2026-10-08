import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HealthCheck } from "./health-check";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("HealthCheck", () => {
  it("renders the button", () => {
    render(<HealthCheck />);

    expect(screen.getByRole("button", { name: /check backend/i })).toBeInTheDocument();
  });

  it("shows that the database is not configured", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          checks: {
            database: "not_configured",
            authServer: "not_configured",
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    render(<HealthCheck />);

    await userEvent.click(screen.getByRole("button", { name: /check backend/i }));

    expect(await screen.findByText(/database is not configured/i)).toBeInTheDocument();
  });

  it.each([
    ["healthy", /auth server is healthy/i],
    ["not_configured", /auth server is not configured/i],
    ["unhealthy", /auth server is unavailable/i],
  ])("shows the auth server status %s next to the database status", async (authServer, message) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          checks: {
            database: "healthy",
            authServer,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    render(<HealthCheck />);

    await userEvent.click(screen.getByRole("button", { name: /check backend/i }));

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByText(/backend and database are healthy/i)).toBeInTheDocument();
  });

  it("shows the auth server status when the database is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: false,
          checks: {
            database: "unhealthy",
            authServer: "healthy",
          },
        }),
        {
          status: 503,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    render(<HealthCheck />);

    await userEvent.click(screen.getByRole("button", { name: /check backend/i }));

    expect(await screen.findByText(/database is unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/auth server is healthy/i)).toBeInTheDocument();
  });
});
