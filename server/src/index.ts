import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

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

app.listen(port, () => {
  if (process.env.NODE_ENV === "production") {
    console.log(`Server listening on port ${port}`);
  } else {
    console.log(`BFF/API listening on http://localhost:${port}/api`);
  }
});
