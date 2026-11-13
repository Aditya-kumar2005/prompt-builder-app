import express from "express";
import path from "path";
import dotenv from "dotenv";
import { handleApiRequest } from "./api/_backend.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Mount all AI & health routes via the unified serverless-compatible handler
app.all(
  [
    "/api",
    "/api/*",
    "/health",
    "/test-connection",
    "/prompt-craft",
    "/prompt-execute",
    "/image-prompt-craft",
    "/brand-generator",
    "/section-polish",
    "/site-generate",
  ],
  (req, res) => {
    void handleApiRequest(req, res);
  }
);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] App running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app, startServer };
