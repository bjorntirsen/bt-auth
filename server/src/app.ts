import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilename);
const clientDistPath = path.resolve(currentDir, "../../client/dist");

export const app = express();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
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
