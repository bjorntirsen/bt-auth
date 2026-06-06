import { describe, it, expect, vi, beforeEach } from "vitest";
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

  it("shows healthy status after a successful check", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    render(<HealthCheck />);
    await userEvent.click(screen.getByRole("button", { name: /check backend/i }));
    expect(await screen.findByText(/healthy/i)).toBeInTheDocument();
  });
});
