import { useState } from "react";

type HealthResponse = { ok: boolean };

export function HealthCheck() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function checkHealth() {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HealthResponse = await res.json();
      setStatus(data.ok ? "✅ Backend is healthy" : "⚠️ Backend responded but not ok");
    } catch (err) {
      setStatus(`❌ Failed: ${err instanceof Error ? err.message : "unknown error"}`);
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
