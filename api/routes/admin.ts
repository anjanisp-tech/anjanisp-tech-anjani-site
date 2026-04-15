import express from "express";
import { getDb, getUtils, getKnowledge } from "../helpers.js";

const router = express.Router();

// ── Auth endpoints (no middleware needed) ───────────────────────────

// Login: validate password, set httpOnly signed session cookie
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body || {};
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return res.status(503).json({ error: "Admin not configured" });
    }
    if (!password || password !== adminPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const { createSessionToken, SESSION_COOKIE_NAME } = await getUtils();
    const token = createSessionToken();
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    res.setHeader('Set-Cookie', [
      `${SESSION_COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${isProduction ? '; Secure' : ''}`
    ]);
    return res.json({ success: true });
  } catch (err: any) {
    console.error("[AUTH] Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout: clear session cookie
router.post("/logout", async (_req, res) => {
  try {
    const { SESSION_COOKIE_NAME } = await getUtils();
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    res.setHeader('Set-Cookie', [
      `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${isProduction ? '; Secure' : ''}`
    ]);
    return res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Logout failed" });
  }
});

// Session check: verify if current session cookie is valid
router.get("/session", async (req, res) => {
  try {
    const { verifySessionToken, SESSION_COOKIE_NAME } = await getUtils();
    const cookieHeader = req.headers.cookie || '';
    const cookies: Record<string, string> = {};
    cookieHeader.split(';').forEach((pair: string) => {
      const [key, ...rest] = pair.trim().split('=');
      if (key) cookies[key.trim()] = decodeURIComponent(rest.join('='));
    });
    const token = cookies[SESSION_COOKIE_NAME];
    if (token && verifySessionToken(token)) {
      return res.json({ authenticated: true });
    }
    return res.json({ authenticated: false });
  } catch {
    return res.json({ authenticated: false });
  }
});

// ── Protected admin routes ─────────────────────────────────────────

// Init DB
router.post("/init-db", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");

      await sql`CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, date TEXT NOT NULL, category TEXT NOT NULL, excerpt TEXT NOT NULL, content TEXT NOT NULL, is_premium INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
      await sql`CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, post_id TEXT NOT NULL, parent_id INTEGER DEFAULT NULL, name TEXT NOT NULL, email TEXT NOT NULL, website TEXT, phone TEXT, comment TEXT NOT NULL, is_admin INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
      await sql`CREATE TABLE IF NOT EXISTS subscriptions (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
      await sql`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
      await sql`CREATE TABLE IF NOT EXISTS audits (id SERIAL PRIMARY KEY, status TEXT NOT NULL, details TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
      await sql`CREATE TABLE IF NOT EXISTS analytics_chatbot (id SERIAL PRIMARY KEY, query TEXT NOT NULL, response TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
      await sql`CREATE TABLE IF NOT EXISTS analytics_blog (id SERIAL PRIMARY KEY, post_id TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
      await sql`CREATE TABLE IF NOT EXISTS analytics_calculator (id SERIAL PRIMARY KEY, currency TEXT NOT NULL, revenue REAL NOT NULL, team_size INTEGER NOT NULL, heroic_hours REAL NOT NULL, total_tax REAL NOT NULL, email TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
      await sql`CREATE TABLE IF NOT EXISTS chatbot_leads (id SERIAL PRIMARY KEY, email TEXT NOT NULL, query TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
      await sql`CREATE TABLE IF NOT EXISTS resource_leads (id SERIAL PRIMARY KEY, email TEXT NOT NULL, resource_name TEXT, created_at TIMESTAMP DEFAULT NOW())`;
      await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_premium INTEGER DEFAULT 0`;

      return res.json({ success: true, message: "Postgres tables initialized (with migrations)" });
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        return res.json({ success: true, message: "SQLite tables are ready" });
      }
    }
    res.json({ success: true, message: "Database initialized" });
  } catch (err: any) {
    res.status(500).json({ error: "Initialization failed", details: err.message });
  }
});

// Audits
router.get("/audits", async (req, res, next) => {
  try {
    const { adminAuth } = await getUtils();
    adminAuth(req, res, next);
  } catch (err) { next(err); }
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb } = await getDb();
    let audits = [];
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      await sql`CREATE TABLE IF NOT EXISTS audits (id SERIAL PRIMARY KEY, status TEXT NOT NULL, details TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
      const result = await sql`SELECT * FROM audits ORDER BY created_at DESC LIMIT 50`;
      audits = result.rows;
    } else {
      const db = getSqliteDb();
      if (db) {
        db.exec(`CREATE TABLE IF NOT EXISTS audits (id INTEGER PRIMARY KEY AUTOINCREMENT, status TEXT NOT NULL, details TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
        audits = db.prepare("SELECT * FROM audits ORDER BY created_at DESC LIMIT 50").all();
      }
    }
    res.json(audits);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch audits", details: err.message });
  }
});

// Run Audit
router.post("/audit", async (req, res, next) => {
  try {
    const { adminAuth } = await getUtils();
    adminAuth(req, res, next);
  } catch (err) { next(err); }
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb } = await getDb();
    const { getKnowledgeBase } = await getKnowledge();

    const results: any = { timestamp: new Date().toISOString(), checks: {} };

    // Database Check
    try {
      if (isPostgres) {
        const { sql } = await import("@vercel/postgres");
        await sql`SELECT 1`;
        results.checks.database = { status: "ok", type: "Postgres" };
      } else {
        const db = getSqliteDb();
        if (db) {
          db.prepare("SELECT 1").get();
          results.checks.database = { status: "ok", type: "SQLite" };
        } else {
          results.checks.database = { status: "warning", type: "Mock" };
        }
      }
    } catch (e: any) {
      results.checks.database = { status: "error", message: e.message };
    }

    // Gemini Check
    try {
      const hasGemini = !!process.env.GEMINI_API_KEY;
      results.checks.gemini = { status: hasGemini ? "ok" : "error", present: hasGemini };
    } catch (e: any) {
      results.checks.gemini = { status: "error", message: e.message };
    }

    // Knowledge Base Check
    try {
      const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.EMAIL;
      const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.KEY;
      let fileId = process.env.GOOGLE_DRIVE_KNOWLEDGE_FILE_ID || process.env.DOC_ID;
      try {
        if (isPostgres) {
          const { sql } = await import("@vercel/postgres");
          const { rows } = await sql`SELECT value FROM settings WHERE key = 'GOOGLE_DRIVE_KNOWLEDGE_FILE_ID'`;
          if (rows.length > 0) fileId = rows[0].value;
        } else {
          const db = getSqliteDb();
          if (db) {
            const row = db.prepare("SELECT value FROM settings WHERE key = ?").get('GOOGLE_DRIVE_KNOWLEDGE_FILE_ID');
            if (row) fileId = (row as any).value;
          }
        }
      } catch (e) {}

      const missing = [];
      if (!email) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
      if (!privateKey) missing.push("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
      if (!fileId) missing.push("GOOGLE_DRIVE_KNOWLEDGE_FILE_ID");

      if (missing.length > 0) {
        results.checks.knowledge = { status: "warning", message: `Missing: ${missing.join(", ")}`, missing };
      } else {
        const k = await getKnowledgeBase();
        results.checks.knowledge = { status: k ? "ok" : "warning", length: k ? k.length : 0 };
      }
    } catch (e: any) {
      results.checks.knowledge = { status: "error", message: e.message };
    }

    // Resend Check
    try {
      const { getResendKey } = await getUtils();
      const apiKey = getResendKey();
      results.checks.resend = { status: apiKey ? "ok" : "warning", present: !!apiKey };
    } catch (e: any) {
      results.checks.resend = { status: "error", message: e.message };
    }

    const overallStatus = Object.values(results.checks).every((c: any) => c.status === "ok") ? "healthy" : "degraded";
    const details = JSON.stringify(results);

    try {
      if (isPostgres) {
        const { sql } = await import("@vercel/postgres");
        await sql`CREATE TABLE IF NOT EXISTS audits (id SERIAL PRIMARY KEY, status TEXT NOT NULL, details TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
        await sql`INSERT INTO audits (status, details) VALUES (${overallStatus}, ${details})`;
      } else {
        const db = getSqliteDb();
        if (db) {
          db.exec(`CREATE TABLE IF NOT EXISTS audits (id INTEGER PRIMARY KEY AUTOINCREMENT, status TEXT NOT NULL, details TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
          db.prepare("INSERT INTO audits (status, details) VALUES (?, ?)").run(overallStatus, details);
        }
      }
    } catch (e: any) {
      console.error("[AUDIT DB ERROR]", e);
      results.db_log_error = e.message;
    }

    res.json({ success: true, status: overallStatus, results });
  } catch (err: any) {
    res.status(500).json({ error: "Audit failed", details: err.message });
  }
});

// Settings
router.get("/settings", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    let settings: Record<string, string> = {};
    try {
      if (isPostgres) {
        const { sql } = await import("@vercel/postgres");
        const { rows } = await sql`SELECT * FROM settings`;
        rows.forEach((r: any) => settings[r.key] = r.value);
      } else {
        const db = getSqliteDb();
        if (db && !useMockDb) {
          const rows = db.prepare("SELECT * FROM settings").all();
          rows.forEach((r: any) => settings[r.key] = r.value);
        }
      }
    } catch (dbErr: any) {
      console.warn("[SETTINGS] Settings table missing:", dbErr.message);
    }
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.post("/settings", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: "Key is required" });
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      try {
        await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`;
      } catch (dbErr: any) {
        if (dbErr.message.includes('relation "settings" does not exist')) {
          await sql`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
          await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`;
        } else { throw dbErr; }
      }
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
      }
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save setting", details: err.message });
  }
});

// Save Resend Key
router.post("/save-resend-key", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  const { key } = req.body;
  if (!key || !key.startsWith('re_')) return res.status(400).json({ error: "Invalid Resend key" });
  try {
    const fs = await import("fs");
    const TMP_KEY_FILE = "/tmp/.resend_key";
    fs.writeFileSync(TMP_KEY_FILE, key, 'utf8');
    res.json({ success: true, message: "Key saved to temporary storage." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save key", details: err.message });
  }
});

// Test Email
router.post("/test-email", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { sendNotification } = await getUtils();
    await sendNotification("Test Email", "This is a test email from your admin dashboard.");
    res.json({ success: true, message: "Test email sent successfully." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to send test email", details: err.message });
  }
});

// Restart Server
router.post("/restart-server", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  res.json({ success: true, message: "Server is restarting. Please wait 10 seconds and refresh." });
  setTimeout(() => {
    console.log("Admin requested server restart. Exiting process...");
    process.exit(0);
  }, 1000);
});

// Knowledge Sync
router.post("/knowledge/sync", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { getKnowledgeBase } = await getKnowledge();
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();

    let fileIdOverride: string | undefined;
    try {
      if (isPostgres) {
        const { sql } = await import("@vercel/postgres");
        const { rows } = await sql`SELECT value FROM settings WHERE key = 'GOOGLE_DRIVE_KNOWLEDGE_FILE_ID'`;
        if (rows.length > 0) fileIdOverride = rows[0].value;
      } else {
        const db = getSqliteDb();
        if (db && !useMockDb) {
          const row = db.prepare("SELECT value FROM settings WHERE key = ?").get('GOOGLE_DRIVE_KNOWLEDGE_FILE_ID');
          if (row) fileIdOverride = (row as any).value;
        }
      }
    } catch (dbErr: any) {
      console.warn("[SYNC] Settings table check failed:", dbErr.message);
    }

    const knowledge = await getKnowledgeBase(true, fileIdOverride);
    res.json({ success: true, length: knowledge.length });
  } catch (err: any) {
    res.status(500).json({ error: "Sync failed", details: err.message });
  }
});

// AI Debug
router.post("/ai-debug", async (req, res, next) => {
  try {
    const { adminAuth } = await getUtils();
    adminAuth(req, res, next);
  } catch (err) { next(err); }
}, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const { getKnowledgeBase } = await getKnowledge();
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();

    let fileIdOverride: string | undefined;
    try {
      if (isPostgres) {
        const { sql } = await import("@vercel/postgres");
        const { rows } = await sql`SELECT value FROM settings WHERE key = 'GOOGLE_DRIVE_KNOWLEDGE_FILE_ID'`;
        if (rows.length > 0) fileIdOverride = rows[0].value;
      } else {
        const db = getSqliteDb();
        if (db && !useMockDb) {
          const row = db.prepare("SELECT value FROM settings WHERE key = ?").get('GOOGLE_DRIVE_KNOWLEDGE_FILE_ID');
          if (row) fileIdOverride = (row as any).value;
        }
      }
    } catch (e) {}

    const knowledge = await getKnowledgeBase(false, fileIdOverride);

    let apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) apiKey = apiKey.trim().replace(/^["']|["']$/g, '');
    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are Anjani Pandey's AI assistant. Use the provided context to answer questions about Anjani's work, writing, and MetMov methodology.
    Context: ${knowledge.substring(0, 15000)}`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: { systemInstruction, temperature: 0.1 }
    });

    const responseText = result.text || "";
    res.json({
      response: responseText,
      context: knowledge.substring(0, 2000) + (knowledge.length > 2000 ? "..." : ""),
      fullContextLength: knowledge.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics
router.get("/analytics", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();

    let chatbotQueries = [];
    let blogViews = [];
    let calculatorLeads = [];
    let chatbotLeads = [];

    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      const chatRes = await sql`SELECT * FROM analytics_chatbot ORDER BY created_at DESC LIMIT 100`;
      const blogRes = await sql`SELECT b.post_id, p.title, COUNT(*) as views FROM analytics_blog b LEFT JOIN posts p ON b.post_id = p.id GROUP BY b.post_id, p.title ORDER BY views DESC`;
      const calcRes = await sql`SELECT * FROM analytics_calculator ORDER BY created_at DESC LIMIT 100`;
      chatbotQueries = chatRes.rows;
      blogViews = blogRes.rows;
      calculatorLeads = calcRes.rows;
      try {
        const leadsRes = await sql`SELECT * FROM chatbot_leads ORDER BY created_at DESC LIMIT 100`;
        chatbotLeads = leadsRes.rows;
      } catch (e) { chatbotLeads = []; }
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        chatbotQueries = db.prepare("SELECT * FROM analytics_chatbot ORDER BY created_at DESC LIMIT 100").all();
        blogViews = db.prepare(`SELECT b.post_id, p.title, COUNT(*) as views FROM analytics_blog b LEFT JOIN posts p ON b.post_id = p.id GROUP BY b.post_id, p.title ORDER BY views DESC`).all();
        calculatorLeads = db.prepare("SELECT * FROM analytics_calculator ORDER BY created_at DESC LIMIT 100").all();
        try { chatbotLeads = db.prepare("SELECT * FROM chatbot_leads ORDER BY created_at DESC LIMIT 100").all(); } catch (e) { chatbotLeads = []; }
      }
    }

    res.json({ chatbotQueries, blogViews, calculatorLeads, chatbotLeads });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch analytics", details: err.message });
  }
});

// Posts CRUD
router.post("/posts", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  const { title, date, category, excerpt, content, is_premium } = req.body;
  const id = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    const { sql } = await import("@vercel/postgres");

    if (isPostgres) {
      await sql`INSERT INTO posts (id, title, date, category, excerpt, content, is_premium) VALUES (${id}, ${title}, ${date}, ${category}, ${excerpt}, ${content}, ${is_premium ? 1 : 0}) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, date = EXCLUDED.date, category = EXCLUDED.category, excerpt = EXCLUDED.excerpt, content = EXCLUDED.content, is_premium = EXCLUDED.is_premium`;
      const { rows } = await sql`SELECT * FROM posts WHERE id = ${id}`;
      return res.status(201).json(rows[0]);
    }
    const db = getSqliteDb();
    if (db && !useMockDb) {
      db.prepare("INSERT OR REPLACE INTO posts (id, title, date, category, excerpt, content, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?)").run(id, title, date, category, excerpt, content, is_premium ? 1 : 0);
      const newPost = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
      return res.status(201).json(newPost);
    }
    res.status(201).json({ id, title, date, category, excerpt, content, is_premium });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save post", details: err.message });
  }
});

router.delete("/posts/:id", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  const { id } = req.params;
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      await sql`DELETE FROM posts WHERE id = ${id}`;
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        db.prepare("DELETE FROM posts WHERE id = ?").run(id);
      }
    }
    res.json({ success: true, deleted: id });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete post", details: err.message });
  }
});

// Comments (admin)
router.get("/comments", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    const { sql } = await import("@vercel/postgres");
    const limit = parseInt(req.query.limit as string) || 500;

    if (isPostgres) {
      const { rows } = await sql`SELECT c.*, p.title as post_title FROM comments c JOIN posts p ON c.post_id = p.id ORDER BY c.created_at DESC LIMIT ${limit}`;
      return res.json(rows);
    }
    const db = getSqliteDb();
    if (db && !useMockDb) {
      const rows = db.prepare(`SELECT c.*, p.title as post_title FROM comments c JOIN posts p ON c.post_id = p.id ORDER BY c.created_at DESC LIMIT ?`).all(limit);
      return res.json(rows);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.delete("/comments/:id", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    const { sql } = await import("@vercel/postgres");

    if (isPostgres) {
      await sql`DELETE FROM comments WHERE id = ${req.params.id} OR parent_id = ${req.params.id}`;
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        db.prepare("DELETE FROM comments WHERE id = ? OR parent_id = ?").run(req.params.id, req.params.id);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// SEO Pipeline
router.get("/seo/pending", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { listPendingInstructions, getSeoFolderId } = await import("../seoService.js");
    const folderId = await getSeoFolderId();
    if (!folderId) {
      return res.json({ instructions: [], error: "GOOGLE_DRIVE_SEO_FOLDER_ID not configured." });
    }
    const instructions = await listPendingInstructions(folderId);
    res.json({ instructions });
  } catch (err: any) {
    console.error("[SEO ROUTE ERROR]", err);
    res.status(500).json({ error: "Failed to list SEO instructions", details: err.message });
  }
});

router.post("/seo/execute", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  const { instructionId } = req.body;
  try {
    const { listPendingInstructions, getSeoFolderId, moveInstruction } = await import("../seoService.js");
    const { executeSeoInstruction } = await import("../seoExecutor.js");

    const folderId = await getSeoFolderId();
    if (!folderId) throw new Error("GOOGLE_DRIVE_SEO_FOLDER_ID not configured.");

    const instructions = await listPendingInstructions(folderId);
    const instruction = instructions.find((i: any) => i.id === instructionId);
    if (!instruction) throw new Error("Instruction not found.");

    const result = await executeSeoInstruction(instruction.content);
    await moveInstruction(instructionId, folderId, 'PROCESSED');

    res.json({ success: true, message: result.message });
  } catch (err: any) {
    console.error("[SEO EXECUTION ERROR]", err);
    try {
      const { getSeoFolderId, moveInstruction } = await import("../seoService.js");
      const folderId = await getSeoFolderId();
      if (folderId && req.body.instructionId) {
        await moveInstruction(req.body.instructionId, folderId, 'FAILED');
      }
    } catch (moveErr) {
      console.error("[SEO MOVE ERROR]", moveErr);
    }
    res.status(500).json({ error: "SEO Execution failed", details: err.message });
  }
});

// Subscriptions
router.get("/subscriptions", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    const { sql } = await import("@vercel/postgres");

    if (isPostgres) {
      const { rows } = await sql`SELECT * FROM subscriptions ORDER BY created_at DESC`;
      return res.json(rows);
    }
    const db = getSqliteDb();
    if (db && !useMockDb) {
      const rows = db.prepare("SELECT * FROM subscriptions ORDER BY created_at DESC").all();
      return res.json(rows);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

// All Emails (unified view across all sources)
router.get("/all-emails", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    let allEmails: any[] = [];

    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");

      // Ensure resource_leads table exists (it's created on-the-fly in chat.ts)
      await sql`CREATE TABLE IF NOT EXISTS resource_leads (id SERIAL PRIMARY KEY, email TEXT NOT NULL, resource_name TEXT, created_at TIMESTAMP DEFAULT NOW())`;

      const result = await sql`
        SELECT email, 'newsletter' as source, created_at, NULL as metadata
        FROM subscriptions
        UNION ALL
        SELECT email, 'chatbot' as source, created_at, query as metadata
        FROM chatbot_leads
        UNION ALL
        SELECT email, 'resource' as source, created_at, resource_name as metadata
        FROM resource_leads
        UNION ALL
        SELECT email, 'comment' as source, created_at, name as metadata
        FROM comments WHERE is_admin = 0
        UNION ALL
        SELECT email, 'calculator' as source, created_at, CAST(revenue AS TEXT) as metadata
        FROM analytics_calculator WHERE email IS NOT NULL AND email != ''
        ORDER BY created_at DESC
      `;
      allEmails = result.rows;
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        // Ensure resource_leads table exists
        db.exec("CREATE TABLE IF NOT EXISTS resource_leads (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, resource_name TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");

        allEmails = db.prepare(`
          SELECT email, 'newsletter' as source, created_at, NULL as metadata
          FROM subscriptions
          UNION ALL
          SELECT email, 'chatbot' as source, created_at, query as metadata
          FROM chatbot_leads
          UNION ALL
          SELECT email, 'resource' as source, created_at, resource_name as metadata
          FROM resource_leads
          UNION ALL
          SELECT email, 'comment' as source, created_at, name as metadata
          FROM comments WHERE is_admin = 0
          UNION ALL
          SELECT email, 'calculator' as source, created_at, CAST(revenue AS TEXT) as metadata
          FROM analytics_calculator WHERE email IS NOT NULL AND email != ''
          ORDER BY created_at DESC
        `).all();
      }
    }

    res.json(allEmails);
  } catch (err: any) {
    console.error("[ALL EMAILS ERROR]", err);
    res.status(500).json({ error: "Failed to fetch emails", details: err.message });
  }
});

// Dashboard summary
router.get("/dashboard", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();

    const stats: any = {
      totalEmails: 0,
      emailsBySource: {},
      recentEmails: [],
      totalComments: 0,
      recentComments: [],
      totalPosts: 0,
      topPosts: [],
      chatbotQueries7d: 0,
      calculatorUses7d: 0,
      subscribers: 0,
    };

    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");

      // Ensure resource_leads exists
      await sql`CREATE TABLE IF NOT EXISTS resource_leads (id SERIAL PRIMARY KEY, email TEXT NOT NULL, resource_name TEXT, created_at TIMESTAMP DEFAULT NOW())`;

      // Total unique emails across all sources
      const emailCount = await sql`
        SELECT COUNT(DISTINCT lower_email) as count FROM (
          SELECT LOWER(email) as lower_email FROM subscriptions
          UNION ALL SELECT LOWER(email) FROM chatbot_leads
          UNION ALL SELECT LOWER(email) FROM resource_leads
          UNION ALL SELECT LOWER(email) FROM comments WHERE is_admin = 0
          UNION ALL SELECT LOWER(email) FROM analytics_calculator WHERE email IS NOT NULL AND email != ''
        ) combined
      `;
      stats.totalEmails = parseInt(emailCount.rows[0]?.count || '0');

      // Emails by source
      const srcCounts = await sql`
        SELECT source, COUNT(*) as count FROM (
          SELECT 'newsletter' as source FROM subscriptions
          UNION ALL SELECT 'chatbot' FROM chatbot_leads
          UNION ALL SELECT 'resource' FROM resource_leads
          UNION ALL SELECT 'comment' FROM comments WHERE is_admin = 0
          UNION ALL SELECT 'calculator' FROM analytics_calculator WHERE email IS NOT NULL AND email != ''
        ) combined GROUP BY source
      `;
      srcCounts.rows.forEach((r: any) => stats.emailsBySource[r.source] = parseInt(r.count));

      // Recent 5 emails (any source)
      const recent = await sql`
        SELECT email, 'newsletter' as source, created_at FROM subscriptions
        UNION ALL SELECT email, 'chatbot', created_at FROM chatbot_leads
        UNION ALL SELECT email, 'resource', created_at FROM resource_leads
        ORDER BY created_at DESC LIMIT 5
      `;
      stats.recentEmails = recent.rows;

      // Comments
      const commentCount = await sql`SELECT COUNT(*) as count FROM comments WHERE is_admin = 0`;
      stats.totalComments = parseInt(commentCount.rows[0]?.count || '0');
      const recentComments = await sql`SELECT name, comment, created_at FROM comments WHERE is_admin = 0 ORDER BY created_at DESC LIMIT 3`;
      stats.recentComments = recentComments.rows;

      // Posts + top
      const postCount = await sql`SELECT COUNT(*) as count FROM posts`;
      stats.totalPosts = parseInt(postCount.rows[0]?.count || '0');
      const topPosts = await sql`SELECT b.post_id, p.title, COUNT(*) as views FROM analytics_blog b LEFT JOIN posts p ON b.post_id = p.id GROUP BY b.post_id, p.title ORDER BY views DESC LIMIT 3`;
      stats.topPosts = topPosts.rows;

      // 7-day activity
      const chat7d = await sql`SELECT COUNT(*) as count FROM analytics_chatbot WHERE created_at > NOW() - INTERVAL '7 days'`;
      stats.chatbotQueries7d = parseInt(chat7d.rows[0]?.count || '0');
      const calc7d = await sql`SELECT COUNT(*) as count FROM analytics_calculator WHERE created_at > NOW() - INTERVAL '7 days'`;
      stats.calculatorUses7d = parseInt(calc7d.rows[0]?.count || '0');

      // Subscribers
      const subCount = await sql`SELECT COUNT(*) as count FROM subscriptions`;
      stats.subscribers = parseInt(subCount.rows[0]?.count || '0');

    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        db.exec("CREATE TABLE IF NOT EXISTS resource_leads (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, resource_name TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");

        const emailCount: any = db.prepare(`
          SELECT COUNT(DISTINCT lower_email) as count FROM (
            SELECT LOWER(email) as lower_email FROM subscriptions
            UNION ALL SELECT LOWER(email) FROM chatbot_leads
            UNION ALL SELECT LOWER(email) FROM resource_leads
            UNION ALL SELECT LOWER(email) FROM comments WHERE is_admin = 0
            UNION ALL SELECT LOWER(email) FROM analytics_calculator WHERE email IS NOT NULL AND email != ''
          )
        `).get();
        stats.totalEmails = emailCount?.count || 0;

        const srcCounts = db.prepare(`
          SELECT source, COUNT(*) as count FROM (
            SELECT 'newsletter' as source FROM subscriptions
            UNION ALL SELECT 'chatbot' FROM chatbot_leads
            UNION ALL SELECT 'resource' FROM resource_leads
            UNION ALL SELECT 'comment' FROM comments WHERE is_admin = 0
            UNION ALL SELECT 'calculator' FROM analytics_calculator WHERE email IS NOT NULL AND email != ''
          ) GROUP BY source
        `).all();
        (srcCounts as any[]).forEach((r: any) => stats.emailsBySource[r.source] = r.count);

        stats.recentEmails = db.prepare(`
          SELECT email, 'newsletter' as source, created_at FROM subscriptions
          UNION ALL SELECT email, 'chatbot', created_at FROM chatbot_leads
          UNION ALL SELECT email, 'resource', created_at FROM resource_leads
          ORDER BY created_at DESC LIMIT 5
        `).all();

        const commentCount: any = db.prepare("SELECT COUNT(*) as count FROM comments WHERE is_admin = 0").get();
        stats.totalComments = commentCount?.count || 0;
        stats.recentComments = db.prepare("SELECT name, comment, created_at FROM comments WHERE is_admin = 0 ORDER BY created_at DESC LIMIT 3").all();

        const postCount: any = db.prepare("SELECT COUNT(*) as count FROM posts").get();
        stats.totalPosts = postCount?.count || 0;
        stats.topPosts = db.prepare("SELECT b.post_id, p.title, COUNT(*) as views FROM analytics_blog b LEFT JOIN posts p ON b.post_id = p.id GROUP BY b.post_id, p.title ORDER BY views DESC LIMIT 3").all();

        const chat7d: any = db.prepare("SELECT COUNT(*) as count FROM analytics_chatbot WHERE created_at > datetime('now', '-7 days')").get();
        stats.chatbotQueries7d = chat7d?.count || 0;
        const calc7d: any = db.prepare("SELECT COUNT(*) as count FROM analytics_calculator WHERE created_at > datetime('now', '-7 days')").get();
        stats.calculatorUses7d = calc7d?.count || 0;

        const subCount: any = db.prepare("SELECT COUNT(*) as count FROM subscriptions").get();
        stats.subscribers = subCount?.count || 0;
      }
    }

    res.json(stats);
  } catch (err: any) {
    console.error("[DASHBOARD ERROR]", err);
    res.status(500).json({ error: "Failed to fetch dashboard", details: err.message });
  }
});

export default router;
