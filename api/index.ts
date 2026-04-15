import express from "express";
import publicRoutes from "./routes/public.js";
import chatRoutes from "./routes/chat.js";
import blogRoutes from "./routes/blog.js";
import adminRoutes from "./routes/admin.js";

const router = express.Router();
const apiApp = express();
apiApp.use(express.json());

// Mount router at both /api and root to handle Vercel rewrites vs local mounting
apiApp.use("/api", router);
apiApp.use("/", router);

// Mount route modules
router.use("/", publicRoutes);
router.use("/", chatRoutes);
router.use("/", blogRoutes);
router.use("/admin", adminRoutes);

// Error handler for API routes
router.use((err: any, req: any, res: any, next: any) => {
  console.error("[API ROUTE ERROR]", err);
  res.status(500).json({ status: "error", error: "Internal API Error", details: err.message });
});

// Global error handler for apiApp (must be last)
apiApp.use((err: any, req: any, res: any, next: any) => {
  console.error("[GLOBAL API ERROR]", err);
  res.status(500).json({
    status: "error",
    error: "Global API Error",
    details: err.message || "An unknown error occurred"
  });
});

export default apiApp;
