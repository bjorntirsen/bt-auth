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
});
