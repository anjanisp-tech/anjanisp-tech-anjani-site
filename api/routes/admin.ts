import express from "express";
import { getDb, getUtils, getKnowledge } from "../helpers.js";

const router = express.Router();

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

export default router;
