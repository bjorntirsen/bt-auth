import { useState } from "react";

type DatabaseStatus = "healthy" | "unhealthy" | "not_configured";

type HealthResponse = {
  ok: boolean;
  checks: {
    database: DatabaseStatus;
  };
};

export function HealthCheck() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkHealth() {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/health");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: HealthResponse = await response.json();

      switch (data.checks.database) {
        case "healthy":
          setStatus("✅ Backend and database are healthy");
          break;

        case "not_configured":
          setStatus("✅ Backend is healthy — database is not configured");
          break;

        case "unhealthy":
          setStatus("⚠️ Backend is running, but the database is unavailable");
          break;
      }
    } catch (error) {
      setStatus(`❌ Failed: ${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={checkHealth} disabled={loading}>
        {loading ? "Checking..." : "Check backend"}
      </button>
      {status && <p>{status}</p>}
    </>
  );
}
