import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import apiApp from "./api/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Direct test route to bypass apiApp router entirely
  app.get("/api-test-ping", (req, res) => {
    res.json({ status: "ok", source: "server.ts direct" });
  });

  app.get("/server-health", (req, res) => {
    res.json({ status: "ok", message: "Server process is alive", timestamp: new Date().toISOString() });
  });

  // Use the API app for /api routes
  app.use("/api", (req, res, next) => {
    try {
      console.log(`[API REQUEST] ${req.method} ${req.url}`);
      next();
    } catch (err: any) {
      console.error("[API MOUNT ERROR]", err);
      res.status(200).json({ 
        status: "error",
        error: "API Mount Error", 
        details: err.message || "An unknown error occurred during API routing"
      });
    }
  }, apiApp);

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
    // If it's an API request, return JSON
    if (req.path.startsWith('/api')) {
      return res.status(200).json({ 
        status: "error",
        error: "Internal API Error", 
        details: err.message || "An unknown error occurred"
      });
    }
    // Otherwise, let it fall through or send a simple message
    res.status(200).send(`
      <html>
        <body style="font-family: sans-serif; padding: 2rem; text-align: center;">
          <h1>Service Temporarily Unavailable</h1>
          <p>We are currently experiencing some technical difficulties. Please try again in a few moments.</p>
          <p style="color: #666; font-size: 0.8rem;">Error: ${err.message || 'Unknown'}</p>
          <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; cursor: pointer;">Try Again</button>
        </body>
      </html>
    `);
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
