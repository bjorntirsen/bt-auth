import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "drizzle-orm";
import { db } from "./db/index";

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilename);
const clientDistPath = path.resolve(currentDir, "../../client/dist");

export const app = express();

app.get("/api/health", async (_req, res) => {
  if (!db) {
    console.log("No db set up yet");
    res.json({
      ok: true,
      checks: {
        database: "not_configured",
      },
    });

    return;
  }
  try {
    await db.execute(sql`SELECT 1`);

    res.json({
      ok: true,
      checks: {
        database: "healthy",
      },
    });
  } catch (error) {
    console.error("Database health check failed", error);

    res.status(503).json({
      ok: false,
      checks: {
        database: "unhealthy",
      },
    });
  }
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
