import { useState } from "react";

type CheckStatus = "healthy" | "unhealthy" | "not_configured";

type HealthResponse = {
  ok: boolean;
  checks: {
    database: CheckStatus;
    authServer: CheckStatus;
  };
};

function databaseMessage(status: CheckStatus) {
  switch (status) {
    case "healthy":
      return "✅ Backend and database are healthy";

    case "not_configured":
      return "✅ Backend is healthy — database is not configured";

    case "unhealthy":
      return "⚠️ Backend is running, but the database is unavailable";

    default:
      return "⚠️ Backend returned an unknown database status";
  }
}

function authServerMessage(status: CheckStatus) {
  switch (status) {
    case "healthy":
      return "✅ Auth server is healthy";

    case "not_configured":
      return "✅ Auth server is not configured";

    case "unhealthy":
      return "⚠️ Auth server is unavailable";

    default:
      return "⚠️ Backend returned an unknown auth server status";
  }
}

export function HealthCheck() {
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function checkHealth() {
    setLoading(true);
    setStatuses([]);

    try {
      const response = await fetch("/api/health");

      if (!response.ok && response.status !== 503) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: HealthResponse = await response.json();

      setStatuses([
        databaseMessage(data.checks.database),
        authServerMessage(data.checks.authServer),
      ]);
    } catch (error) {
      setStatuses([`❌ Failed: ${error instanceof Error ? error.message : "unknown error"}`]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={checkHealth} disabled={loading}>
        {loading ? "Checking..." : "Check backend"}
      </button>
      {statuses.map((status) => (
        <p key={status}>{status}</p>
      ))}
    </>
  );
}
