import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db/index";
import { env } from "./env";

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilename);
const clientDistPath = path.resolve(currentDir, "../../client/dist");

export const app = express();

type CheckStatus = "healthy" | "unhealthy" | "not_configured";

const AUTH_SERVER_TIMEOUT_MS = 2000;

const authServerHealthSchema = z.object({
  status: z.literal("UP"),
});

async function checkDatabase(): Promise<CheckStatus> {
  if (!db) {
    console.log("No db set up yet");
    return "not_configured";
  }
  try {
    await db.execute(sql`SELECT 1`);
    return "healthy";
  } catch (error) {
    console.error("Database health check failed", error);
    return "unhealthy";
  }
}

async function checkAuthServer(): Promise<CheckStatus> {
  if (!env.AUTH_SERVER_URL) {
    return "not_configured";
  }
  try {
    const baseUrl = env.AUTH_SERVER_URL.replace(/\/+$/, "");
    const response = await fetch(`${baseUrl}/actuator/health`, {
      signal: AbortSignal.timeout(AUTH_SERVER_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`Auth server health check failed with HTTP ${response.status}`);
      return "unhealthy";
    }

    const body = authServerHealthSchema.safeParse(await response.json());

    return body.success ? "healthy" : "unhealthy";
  } catch (error) {
    console.error("Auth server health check failed", error);
    return "unhealthy";
  }
}

app.get("/api/health", async (_req, res) => {
  const [database, authServer] = await Promise.all([checkDatabase(), checkAuthServer()]);

  // The auth server check is informational only: the platform health check uses this
  // endpoint, and an auth server outage must not take this container out of routing.
  const ok = database !== "unhealthy";

  res.status(ok ? 200 : 503).json({
    ok,
    checks: {
      database,
      authServer,
    },
  });
});

app.use(
  express.static(clientDistPath, {
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));
app.use((_req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});
