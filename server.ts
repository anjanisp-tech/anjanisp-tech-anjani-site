import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import apiApp from "./api/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Use the API app for /api routes
  app.use(apiApp);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Vite in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler (MUST BE LAST)
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[GLOBAL SERVER ERROR]", err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: err.message || "An unknown error occurred"
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Full-stack server running on http://localhost:${PORT}`);
    console.log("Environment Check:");
    console.log("- RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Present" : "MISSING");
    console.log("- RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL || "Not Set");
    console.log("- POSTGRES_URL:", process.env.POSTGRES_URL ? "Present" : "MISSING");
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
