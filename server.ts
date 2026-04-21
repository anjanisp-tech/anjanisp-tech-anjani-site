import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import apiApp from "./api/index.js";
import * as db from "./api/dbService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false, // CSP can break Vite HMR in dev
    crossOriginEmbedderPolicy: false,
  }));

  // Rate limiting on admin routes (5 failed attempts per 15 min window)
  const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Try again later." },
  });
  app.use("/api/admin", adminLimiter);

  // Rate limiting on public form endpoints (prevent spam)
  const formLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many submissions. Try again later." },
  });
  app.use("/api/subscribe", formLimiter);
  app.use("/api/chatbot-lead", formLimiter);
  app.use("/api/resource-lead", formLimiter);

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Direct test route to bypass apiApp router entirely
  app.get("/api-test-ping", (req, res) => {
    res.json({ status: "ok", source: "server.ts direct" });
  });

  app.get("/server-health", (req, res) => {
    res.json({ status: "ok", message: "Server process is alive", timestamp: new Date().toISOString() });
  });

  // Dynamic robots.txt and sitemap.xml from database (via dbService)
  app.get("/robots.txt", async (req, res, next) => {
    try {
      const row = await db.queryOne("SELECT value FROM settings WHERE key = ?", ['robots_txt']);
      if (row?.value) {
        res.header('Content-Type', 'text/plain');
        return res.send(row.value);
      }
      next(); // Fallback to static file
    } catch (e) {
      next();
    }
  });

  app.get("/sitemap.xml", async (req, res, next) => {
    try {
      const row = await db.queryOne("SELECT value FROM settings WHERE key = ?", ['sitemap_xml']);
      if (row?.value) {
        res.header('Content-Type', 'application/xml');
        return res.send(row.value);
      }
      next(); // Fallback to static file
    } catch (e) {
      next();
    }
  });

  // Use the API app for /api routes
  app.use("/api", apiApp);

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
      return res.status(500).json({
        status: "error",
        error: "Internal API Error",
        details: err.message || "An unknown error occurred"
      });
    }
    // Otherwise, let it fall through or send a simple message
    res.status(500).send(`
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
    console.log(`Environment: RESEND_API_KEY=${process.env.RESEND_API_KEY ? "Present" : "MISSING"}, POSTGRES_URL=${process.env.POSTGRES_URL ? "Present" : "MISSING"}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
