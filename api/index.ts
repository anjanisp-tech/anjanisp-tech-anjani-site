import express from "express";
import fs from "fs";
import path from "path";

function logRoute(msg: string) {
  try {
    const timestamp = new Date().toISOString();
    const logPath = path.join(process.cwd(), 'seo_debug.log');
    fs.appendFileSync(logPath, `[ROUTE][${timestamp}] ${msg}\n`);
  } catch (e) {
    console.error("Logging failed:", e);
  }
}

const router = express.Router();
const apiApp = express();
logRoute("api/index.ts module loaded");
apiApp.use(express.json());

// Mount router at both /api and root to handle Vercel rewrites vs local mounting
apiApp.use("/api", router);
apiApp.use("/", router);

// Lazy import helpers to avoid top-level crashes
let dbModule: any;
const getDb = async () => {
  if (!dbModule) dbModule = await import("./db.js");
  return dbModule;
};

let utilsModule: any;
const getUtils = async () => {
  if (!utilsModule) utilsModule = await import("./utils.js");
  return utilsModule;
};

let knowledgeModule: any;
const getKnowledge = async () => {
  if (!knowledgeModule) knowledgeModule = await import("./knowledgeService.js");
  return knowledgeModule;
};

// Error handler for apiApp itself
// Moved to the end of the file

// 1. Simple Ping Route for testing
router.get("/ping", (req, res) => {
  res.json({ status: "ok", message: "API is reachable", version: "1.0.4" });
});

// SEO Routes: robots.txt and sitemap.xml
router.get("/robots.txt", async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    let content = "";
    
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      const { rows } = await sql`SELECT value FROM settings WHERE key = 'robots_txt'`;
      content = rows[0]?.value;
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        const row: any = db.prepare("SELECT value FROM settings WHERE key = ?").get('robots_txt');
        content = row?.value;
      }
    }

    if (!content) {
      const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
      if (fs.existsSync(robotsPath)) {
        content = fs.readFileSync(robotsPath, 'utf-8');
      } else {
        content = "User-agent: *\nAllow: /\n\nSitemap: https://www.anjanipandey.com/sitemap.xml";
      }
    }

    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  } catch (err: any) {
    res.status(500).send("Error generating robots.txt");
  }
});

router.get("/sitemap.xml", async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    let content = "";
    
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      const { rows } = await sql`SELECT value FROM settings WHERE key = 'sitemap_xml_override'`;
      content = rows[0]?.value;
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        const row: any = db.prepare("SELECT value FROM settings WHERE key = ?").get('sitemap_xml_override');
        content = row?.value;
      }
    }

    if (!content || !content.includes('<url>')) {
      // Try dynamic generation first to include blog posts
      let urls = `
  <url>
    <loc>https://www.anjanipandey.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.anjanipandey.com/services</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.anjanipandey.com/calculator</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.anjanipandey.com/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

      try {
        const { isPostgres, getSqliteDb, useMockDb, initialPosts } = await getDb();
        let posts: any[] = [];
        if (isPostgres) {
          const { sql } = await import("@vercel/postgres");
          const { rows } = await sql`SELECT id, created_at FROM posts ORDER BY created_at DESC`;
          posts = rows;
        } else {
          const db = getSqliteDb();
          if (db && !useMockDb) {
            posts = db.prepare("SELECT id, created_at FROM posts ORDER BY created_at DESC").all();
          }
        }

        // Fallback to initialPosts if no posts found in DB (e.g. mock DB or empty)
        if (posts.length === 0 && initialPosts) {
          posts = initialPosts;
        }

        for (const post of posts) {
          const date = post.created_at ? new Date(post.created_at).toISOString().split('T')[0] : (post.date || new Date().toISOString().split('T')[0]);
          urls += `
  <url>
    <loc>https://www.anjanipandey.com/blog/${post.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>`;
        }
      } catch (err) {
        console.error("Error fetching posts for sitemap:", err);
      }

      content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

      // If dynamic generation failed to produce any URLs (shouldn't happen with the hardcoded ones), fallback to static file
      if (!content || !content.includes('<url>')) {
        const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
        if (fs.existsSync(sitemapPath)) {
          const fileContent = fs.readFileSync(sitemapPath, 'utf-8');
          if (fileContent.includes('<url>')) {
            content = fileContent;
          }
        }
      }
    }

    res.setHeader('Content-Type', 'application/xml');
    res.send(content);
  } catch (err: any) {
    res.status(500).send("Error generating sitemap.xml");
  }
});

// Diagnostic route - Minimal dependencies to avoid crashes
router.get("/diagnostic", async (req, res) => {
  try {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY;
    const hasGemini = !!geminiKey && geminiKey.length > 10;
    const geminiMasked = geminiKey ? `${geminiKey.substring(0, 4)}...${geminiKey.substring(geminiKey.length - 4)}` : "missing";
    const hasPostgres = !!process.env.POSTGRES_URL && process.env.POSTGRES_URL.includes('://');
    let hasResend = !!process.env.RESEND_API_KEY || !!process.env.VITE_RESEND_API_KEY;
    if (!hasResend) {
      hasResend = Object.values(process.env).some(v => typeof v === 'string' && v.startsWith('re_'));
    }
    const hasGoogleDrive = !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.EMAIL) && !!(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.KEY);
    const hasAdminPassword = !!process.env.ADMIN_PASSWORD;

    // Get all env keys for debugging (masked)
    const envKeys = Object.keys(process.env).map(key => {
      const val = process.env[key];
      return {
        key,
        present: !!val,
        length: val?.length || 0,
        preview: val && val.length > 4 ? val.substring(0, 2) + "..." + val.substring(val.length - 2) : "..."
      };
    });

    let dbStatus = "Not checked";
    try {
      const { isPostgres, getSqliteDb, useMockDb } = await getDb();
      if (isPostgres) dbStatus = "Postgres (Active)";
      else if (useMockDb) dbStatus = "Mock DB (Active)";
      else {
        const db = getSqliteDb();
        dbStatus = db ? "SQLite (Active)" : "Mock DB (Fallback)";
      }
    } catch (err: any) {
      dbStatus = "Failed: " + (err.message || "Unknown error");
    }

    let knowledgeStatus = "Not checked";
    try {
      const { getKnowledgeBase } = await getKnowledge();
      const k = await getKnowledgeBase();
      knowledgeStatus = k ? `Success (${k.length} chars)` : "Empty";
    } catch (err: any) {
      knowledgeStatus = "Failed: " + (err.message || "Unknown error");
    }

    let geminiTest = "Not tested";
    if (hasGemini) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const apiKey = geminiKey!.trim().replace(/^["']|["']$/g, '');
        const ai = new GoogleGenAI({ apiKey });
        
        // Try multiple models to find one that works in this region/account
        const models = ["gemini-3-flash-preview", "gemini-3.1-flash-lite-preview", "gemini-2.5-flash-image"];
        let errors: string[] = [];
        
        for (const modelName of models) {
          try {
            const testResponse = await ai.models.generateContent({
              model: modelName,
              contents: "hi"
            });
            const text = testResponse.text;
            if (text) {
              geminiTest = `Success (${modelName}): ` + text.substring(0, 20);
              break;
            }
          } catch (err: any) {
            errors.push(`${modelName}: ${err.message}`);
            continue;
          }
        }
        
        if (geminiTest === "Not tested") {
          geminiTest = "Failed all models: " + errors.join(" | ");
        }
      } catch (err: any) {
        geminiTest = "Setup Failed: " + (err.message || "Unknown error");
      }
    }

    res.json({
      status: "ok",
      isVercel: !!process.env.VERCEL,
      timestamp: new Date().toISOString(),
      serverStartTime: process.uptime(),
      version: "1.1.1",
      dbStatus,
      knowledgeStatus,
      geminiTest,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        HAS_POSTGRES: hasPostgres,
        HAS_GEMINI: hasGemini,
        GEMINI_KEY_MASKED: geminiMasked,
        HAS_RESEND: hasResend,
        HAS_GOOGLE_DRIVE: hasGoogleDrive,
        HAS_GOOGLE_EMAIL: !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.EMAIL),
        HAS_GOOGLE_KEY: !!(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.KEY),
        USING_ALT_NAMES: !!(process.env.EMAIL || process.env.KEY),
        HAS_ADMIN_PASSWORD: hasAdminPassword,
        ENV_KEYS: envKeys
      }
    });
  } catch (err: any) {
    res.status(200).json({ status: "error", error: "Diagnostic failed", details: err.message });
  }
});

router.post("/admin/init-db", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      
      // Create tables
      await sql`
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          date TEXT NOT NULL,
          category TEXT NOT NULL,
          excerpt TEXT NOT NULL,
          content TEXT NOT NULL,
          is_premium INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS comments (
          id SERIAL PRIMARY KEY,
          post_id TEXT NOT NULL,
          parent_id INTEGER DEFAULT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          website TEXT,
          phone TEXT,
          comment TEXT NOT NULL,
          is_admin INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS audits (
          id SERIAL PRIMARY KEY,
          status TEXT NOT NULL,
          details TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS analytics_chatbot (
          id SERIAL PRIMARY KEY,
          query TEXT NOT NULL,
          response TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS analytics_blog (
          id SERIAL PRIMARY KEY,
          post_id TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS analytics_calculator (
          id SERIAL PRIMARY KEY,
          currency TEXT NOT NULL,
          revenue REAL NOT NULL,
          team_size INTEGER NOT NULL,
          heroic_hours REAL NOT NULL,
          total_tax REAL NOT NULL,
          email TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      return res.json({ success: true, message: "Postgres tables initialized" });
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        // SQLite tables are already created in getSqliteDb()
        return res.json({ success: true, message: "SQLite tables are ready" });
      }
    }
    res.json({ success: true, message: "Database initialized" });
  } catch (err: any) {
    res.status(500).json({ error: "Initialization failed", details: err.message });
  }
});

router.get("/admin/audits", async (req, res, next) => {
  try {
    const { adminAuth } = await getUtils();
    adminAuth(req, res, next);
  } catch (err) {
    next(err);
  }
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb } = await getDb();
    let audits = [];
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      // Ensure table exists
      await sql`
        CREATE TABLE IF NOT EXISTS audits (
          id SERIAL PRIMARY KEY,
          status TEXT NOT NULL,
          details TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      const result = await sql`SELECT * FROM audits ORDER BY created_at DESC LIMIT 50`;
      audits = result.rows;
    } else {
      const db = getSqliteDb();
      if (db) {
        db.exec(`
          CREATE TABLE IF NOT EXISTS audits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            status TEXT NOT NULL,
            details TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        audits = db.prepare("SELECT * FROM audits ORDER BY created_at DESC LIMIT 50").all();
      }
    }
    res.json(audits);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch audits", details: err.message });
  }
});

router.post("/admin/audit", async (req, res, next) => {
  try {
    const { adminAuth } = await getUtils();
    adminAuth(req, res, next);
  } catch (err) {
    next(err);
  }
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb } = await getDb();
    const { getKnowledgeBase } = await getKnowledge();
    
    const results: any = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // 1. Database Check
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

    // 2. Gemini Check
    try {
      const hasGemini = !!process.env.GEMINI_API_KEY;
      results.checks.gemini = { status: hasGemini ? "ok" : "error", present: hasGemini };
    } catch (e: any) {
      results.checks.gemini = { status: "error", message: e.message };
    }

    // 3. Knowledge Base Check
    try {
      const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.EMAIL;
      const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.KEY;
      
      // Fetch File ID from settings first, then env
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
            if (row) fileId = row.value;
          }
        }
      } catch (e) {}

      const missing = [];
      if (!email) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
      if (!privateKey) missing.push("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
      if (!fileId) missing.push("GOOGLE_DRIVE_KNOWLEDGE_FILE_ID");

      if (missing.length > 0) {
        results.checks.knowledge = { 
          status: "warning", 
          message: `Missing: ${missing.join(", ")}. Setup required in Admin -> Knowledge.`,
          missing
        };
      } else {
        const k = await getKnowledgeBase();
        results.checks.knowledge = { 
          status: k ? "ok" : "warning", 
          length: k ? k.length : 0,
          message: k ? "Knowledge base loaded successfully." : "Knowledge base is empty (check file content)."
        };
      }
    } catch (e: any) {
      results.checks.knowledge = { status: "error", message: e.message };
    }

    // 4. Resend Check
    try {
      const { getResendKey } = await getUtils();
      const apiKey = getResendKey();
      const hasResend = !!apiKey;
      results.checks.resend = { 
        status: hasResend ? "ok" : "warning", 
        present: hasResend,
        message: hasResend ? "Resend API key found." : "Resend API key missing (check RESEND_API_KEY)."
      };
    } catch (e: any) {
      results.checks.resend = { status: "error", message: e.message };
    }

    const overallStatus = Object.values(results.checks).every((c: any) => c.status === "ok") ? "healthy" : "degraded";
    const details = JSON.stringify(results);

    try {
      if (isPostgres) {
        const { sql } = await import("@vercel/postgres");
        // Ensure table exists before insert
        await sql`
          CREATE TABLE IF NOT EXISTS audits (
            id SERIAL PRIMARY KEY,
            status TEXT NOT NULL,
            details TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `;
        await sql`INSERT INTO audits (status, details) VALUES (${overallStatus}, ${details})`;
      } else {
        const db = getSqliteDb();
        if (db) {
          db.exec(`
            CREATE TABLE IF NOT EXISTS audits (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              status TEXT NOT NULL,
              details TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `);
          db.prepare("INSERT INTO audits (status, details) VALUES (?, ?)").run(overallStatus, details);
        }
      }
    } catch (e: any) {
      console.error("[AUDIT DB ERROR]", e);
      // Don't fail the whole request if just the log insert fails, 
      // but we'll include it in the response
      results.db_log_error = e.message;
    }

    res.json({ success: true, status: overallStatus, results });
  } catch (err: any) {
    res.status(500).json({ error: "Audit failed", details: err.message });
  }
});

// 2. Knowledge Base Endpoint
router.get("/knowledge", async (req, res) => {
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
          if (row) fileIdOverride = row.value;
        }
      }
    } catch (dbErr: any) {
      console.warn("[KNOWLEDGE] Settings table check failed (likely missing):", dbErr.message);
    }

    const knowledge = await getKnowledgeBase(req.query.force === 'true', fileIdOverride);
    res.json({ knowledge });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch knowledge base", details: err.message });
  }
});

// Admin Settings Routes
router.get("/admin/settings", async (req, res, next) => {
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
        rows.forEach(r => settings[r.key] = r.value);
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

router.post("/admin/save-resend-key", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  const { key } = req.body;
  if (!key || !key.startsWith('re_')) return res.status(400).json({ error: "Invalid Resend key" });
  try {
    const { fileURLToPath } = await import("url");
    const { dirname, join } = await import("path");
    const fs = await import("fs");
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const TMP_KEY_FILE = "/tmp/.resend_key";
    
    fs.writeFileSync(TMP_KEY_FILE, key, 'utf8');
    res.json({ success: true, message: "Key saved to temporary storage." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save key", details: err.message });
  }
});

router.post("/admin/test-email", async (req, res, next) => {
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

router.post("/admin/restart-server", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  res.json({ success: true, message: "Server is restarting. Please wait 10 seconds and refresh." });
  setTimeout(() => {
    console.log("Admin requested server restart. Exiting process...");
    process.exit(0);
  }, 1000);
});

router.post("/admin/settings", async (req, res, next) => {
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
          // Try to create the table if it's missing
          await sql`
            CREATE TABLE IF NOT EXISTS settings (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `;
          await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`;
        } else {
          throw dbErr;
        }
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

router.post("/admin/knowledge/sync", async (req, res, next) => {
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
          if (row) fileIdOverride = row.value;
        }
      }
    } catch (dbErr: any) {
      console.warn("[SYNC] Settings table check failed (likely missing):", dbErr.message);
    }

    const knowledge = await getKnowledgeBase(true, fileIdOverride);
    res.json({ success: true, length: knowledge.length });
  } catch (err: any) {
    res.status(500).json({ error: "Sync failed", details: err.message });
  }
});

// 3. AI Chat Assistant Route
router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message) return res.status(400).json({ error: "Message is required" });

    let apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    // Sanitize API Key
    if (apiKey) {
      apiKey = apiKey.trim().replace(/^["']|["']$/g, '');
      if (apiKey.includes('YOUR_') || apiKey.length < 10) apiKey = undefined;
    }

    if (!apiKey) {
      return res.status(200).json({ 
        status: "error", 
        error: "GEMINI_API_KEY (or GOOGLE_API_KEY) is missing or invalid in the backend environment." 
      });
    }

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
          if (row) fileIdOverride = row.value;
        }
      }
    } catch (dbErr: any) {
      console.warn("[CHAT] Settings table check failed (likely missing):", dbErr.message);
    }

    const knowledge = await getKnowledgeBase(false, fileIdOverride);
    const { GoogleGenAI, ThinkingLevel } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    
    // Primary model is 3.1-flash-lite for lowest latency
    const models = ["gemini-3.1-flash-lite-preview", "gemini-3-flash-preview"];
    
    // Core Project Goals: Personal Brand Moat & Metmov Monetisation
    const systemInstruction = `You are "The Scaling Architect," a digital proxy for Anjani Pandey, founder of Metmov. 
Your ICP: Founders of $1M-$10M ARR service/knowledge businesses who are the "hero" bottleneck.
Your Goal: Build a "Personal Brand Moat" by demonstrating the unique value of the Metmov methodology and convert users to a "Fit Call" or "Diagnostic".

STRICT CONSTRAINTS:
1. BE EXTREMELY CONCISE: Max 30 words per response.
2. STRUCTURE: Break every answer into exactly 2 paragraphs.
3. SPACING: Use exactly THREE line breaks (two full empty lines) between the two paragraphs to create a wide gap.
4. HYPHENATED LISTS ONLY: Every line MUST start with a literal hyphen followed by a space (- ). Phrases and keywords are preferred over full sentences. No introductory text.
5. HIGH-STATUS TONE: No-nonsense, authoritative, structural. No "I think" or "Maybe".
6. ENGAGEMENT LOOP: Always end with exactly 2-3 relevant follow-up questions as "bait" in this format: [SUGGESTIONS: Question 1?, Question 2?]
7. MONETIZATION HOOKS: 
   - If high intent, prioritize [SUGGESTIONS: Book a Fit Call, Take the Free Diagnostic].
   - After 3-4 turns, suggest: [SUGGESTIONS: Bottleneck Cost Calculator, Book a Fit Call]
8. NO ANALYSIS: Direct diagnostic mentions to a Fit Call.

KEY KNOWLEDGE:
- Operating Spine: Structural architecture replacing heroics with systems.
- Founder Overload: 25-disease taxonomy of structural bottlenecks.
- Difference from COO: COO manages people; Spine manages architecture.
- Timeline: 12-week Diagnostic & Installation sprints.

${knowledge ? `\n\nContext from Anjani's Metmov Methodology: ${knowledge.substring(0, 10000)}` : ""}`;

    // Clean history: Gemini expects alternating user/model turns starting with user.
    const chatHistory = (history || [])
      .filter((h: any) => h.content && h.content.trim().length > 0)
      .map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }]
      }));

    // Ensure it starts with 'user' if there's history
    if (chatHistory.length > 0 && chatHistory[0].role === "model") {
      chatHistory.shift(); 
    }

    // Set up streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let responseText = "";
    let success = false;

    for (const modelName of models) {
      try {
        const result = await ai.models.generateContentStream({
          model: modelName,
          contents: chatHistory.concat([{ role: "user", parts: [{ text: message }] }]),
          config: {
            systemInstruction,
            temperature: 0.7,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL }
          }
        });

        for await (const chunk of result) {
          const chunkText = chunk.text || "";
          responseText += chunkText;
          res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }
        
        success = true;
        break;
      } catch (err: any) {
        console.warn(`[CHAT] Model ${modelName} failed:`, err.message);
        continue;
      }
    }

    if (!success) {
      res.write(`data: ${JSON.stringify({ error: "All models failed to respond." })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();

    // Async logging
    if (success && responseText) {
      try {
        if (isPostgres) {
          const { sql } = await import("@vercel/postgres");
          await sql`INSERT INTO analytics_chatbot (query, response) VALUES (${message}, ${responseText})`;
        } else {
          const db = getSqliteDb();
          if (db && !useMockDb) {
            db.prepare("INSERT INTO analytics_chatbot (query, response) VALUES (?, ?)").run(message, responseText);
          }
        }
      } catch (logErr) {
        console.error("[ANALYTICS LOG ERROR] Chatbot:", logErr);
      }
    }
    return;
  } catch (err: any) {
    console.error("[CHAT ERROR]", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error", details: err.message });
    }
  }
});

router.post("/admin/ai-debug", async (req, res, next) => {
  try {
    const { adminAuth } = await getUtils();
    adminAuth(req, res, next);
  } catch (err) {
    next(err);
  }
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
          if (row) fileIdOverride = row.value;
        }
      }
    } catch (e) {}

    const knowledge = await getKnowledgeBase(false, fileIdOverride);
    
    let apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) apiKey = apiKey.trim().replace(/^["']|["']$/g, '');

    if (!apiKey) throw new Error("GEMINI_API_KEY missing");

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `You are "The Scaling Architect" (Anjani Pandey). Use the provided context to answer.
    Context: ${knowledge.substring(0, 15000)}`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: { 
        systemInstruction,
        temperature: 0.1
      }
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

// 4. Blog Posts Routes
router.get("/posts", async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb, initialPosts } = await getDb();
    
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = (req.query.search as string) || "";
    const category = (req.query.category as string) || "";

    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      let query;
      if (search && category) {
        query = sql`SELECT * FROM posts WHERE category = ${category} AND (title ILIKE ${'%' + search + '%'} OR content ILIKE ${'%' + search + '%'}) ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      } else if (search) {
        query = sql`SELECT * FROM posts WHERE (title ILIKE ${'%' + search + '%'} OR content ILIKE ${'%' + search + '%'}) ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      } else if (category) {
        query = sql`SELECT * FROM posts WHERE category = ${category} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      } else {
        query = sql`SELECT * FROM posts ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      }
      const { rows } = await query;
      return res.json(rows);
    }
    
    const db = getSqliteDb();
    if (db && !useMockDb) {
      let posts;
      if (search && category) {
        posts = db.prepare("SELECT * FROM posts WHERE category = ? AND (title LIKE ? OR content LIKE ?) ORDER BY created_at DESC LIMIT ? OFFSET ?")
          .all(category, `%${search}%`, `%${search}%`, limit, offset);
      } else if (search) {
        posts = db.prepare("SELECT * FROM posts WHERE (title LIKE ? OR content LIKE ?) ORDER BY created_at DESC LIMIT ? OFFSET ?")
          .all(`%${search}%`, `%${search}%`, limit, offset);
      } else if (category) {
        posts = db.prepare("SELECT * FROM posts WHERE category = ? ORDER BY created_at DESC LIMIT ? OFFSET ?")
          .all(category, limit, offset);
      } else {
        posts = db.prepare("SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?").all(limit, offset);
      }
      return res.json(posts);
    }

    let filtered = initialPosts;
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(s) || p.content.toLowerCase().includes(s));
    }
    res.json(filtered.slice(offset, offset + limit));
  } catch (err: any) {
    res.status(200).json({ status: "error", error: "Failed to fetch posts", details: err.message });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb, initialPosts } = await getDb();
    
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      const { rows } = await sql`SELECT DISTINCT category FROM posts WHERE category IS NOT NULL AND category != ''`;
      return res.json(rows.map(r => r.category));
    }
    
    const db = getSqliteDb();
    if (db && !useMockDb) {
      const rows = db.prepare("SELECT DISTINCT category FROM posts WHERE category IS NOT NULL AND category != ''").all();
      return res.json(rows.map((r: any) => r.category));
    }

    const categories = Array.from(new Set(initialPosts.map(p => p.category))).filter(Boolean);
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch categories", details: err.message });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb, initialPosts } = await getDb();
    const postId = req.params.id;

    // Log view to analytics
    try {
      if (isPostgres) {
        const { sql } = await import("@vercel/postgres");
        await sql`INSERT INTO analytics_blog (post_id) VALUES (${postId})`;
      } else {
        const db = getSqliteDb();
        if (db && !useMockDb) {
          db.prepare("INSERT INTO analytics_blog (post_id) VALUES (?)").run(postId);
        }
      }
    } catch (logErr) {
      console.error("[ANALYTICS LOG ERROR] Blog View:", logErr);
    }

    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      const { rows } = await sql`SELECT * FROM posts WHERE id = ${postId}`;
      if (rows.length > 0) return res.json(rows[0]);
    }
    const db = getSqliteDb();
    if (db && !useMockDb) {
      const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(postId);
      if (post) return res.json(post);
    }
    const post = initialPosts.find(p => p.id === postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch post", details: err.message });
  }
});

// 5. Comments Routes
router.get("/blog/:id/comments", async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    const { sql } = await import("@vercel/postgres");

    if (isPostgres) {
      const { rows } = await sql`SELECT * FROM comments WHERE post_id = ${req.params.id} ORDER BY created_at ASC`;
      return res.json(rows);
    }
    const db = getSqliteDb();
    if (db && !useMockDb) {
      const comments = db.prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC").all(req.params.id);
      return res.json(comments);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.post("/blog/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { name, email, website, phone, comment, parent_id, is_admin } = req.body;
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    const { sql } = await import("@vercel/postgres");
    const { sendNotification } = await getUtils();

    let commentObj;
    if (isPostgres) {
      const { rows } = await sql`
        INSERT INTO comments (post_id, name, email, website, phone, comment, parent_id, is_admin)
        VALUES (${id}, ${name}, ${email}, ${website || null}, ${phone || null}, ${comment}, ${parent_id || null}, ${is_admin ? 1 : 0})
        RETURNING *
      `;
      commentObj = rows[0];
    } else if (useMockDb) {
      commentObj = { id: Date.now(), post_id: id, name, email, website, phone, comment, parent_id, is_admin: is_admin ? 1 : 0, created_at: new Date().toISOString() };
    } else {
      const db = getSqliteDb();
      if (!db) throw new Error("SQLite database not initialized");
      const info = db.prepare("INSERT INTO comments (post_id, name, email, website, phone, comment, parent_id, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(id, name, email, website || null, phone || null, comment, parent_id || null, is_admin ? 1 : 0);
      commentObj = db.prepare("SELECT * FROM comments WHERE id = ?").get(info.lastInsertRowid);
    }
    sendNotification(`New Comment on ${id}`, `From: ${name}\nComment: ${comment}`).catch(() => {});
    res.status(201).json(commentObj);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save comment", details: err.message });
  }
});

router.post("/analytics/calculator", async (req, res) => {
  const { currency, revenue, teamSize, heroicHours, totalTax, email } = req.body;
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    const { sql } = await import("@vercel/postgres");

    if (isPostgres) {
      await sql`
        INSERT INTO analytics_calculator (currency, revenue, team_size, heroic_hours, total_tax, email)
        VALUES (${currency}, ${revenue}, ${teamSize}, ${heroicHours}, ${totalTax}, ${email || null})
      `;
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        db.prepare("INSERT INTO analytics_calculator (currency, revenue, team_size, heroic_hours, total_tax, email) VALUES (?, ?, ?, ?, ?, ?)")
          .run(currency, revenue, teamSize, heroicHours, totalTax, email || null);
      }
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to log calculator results", details: err.message });
  }
});

// 6. Analytics Routes
router.get("/admin/analytics", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    
    let chatbotQueries = [];
    let blogViews = [];
    let calculatorLeads = [];

    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      const chatRes = await sql`SELECT * FROM analytics_chatbot ORDER BY created_at DESC LIMIT 100`;
      const blogRes = await sql`
        SELECT b.post_id, p.title, COUNT(*) as views 
        FROM analytics_blog b
        LEFT JOIN posts p ON b.post_id = p.id
        GROUP BY b.post_id, p.title
        ORDER BY views DESC
      `;
      const calcRes = await sql`SELECT * FROM analytics_calculator ORDER BY created_at DESC LIMIT 100`;
      chatbotQueries = chatRes.rows;
      blogViews = blogRes.rows;
      calculatorLeads = calcRes.rows;
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        chatbotQueries = db.prepare("SELECT * FROM analytics_chatbot ORDER BY created_at DESC LIMIT 100").all();
        blogViews = db.prepare(`
          SELECT b.post_id, p.title, COUNT(*) as views 
          FROM analytics_blog b
          LEFT JOIN posts p ON b.post_id = p.id
          GROUP BY b.post_id, p.title
          ORDER BY views DESC
        `).all();
        calculatorLeads = db.prepare("SELECT * FROM analytics_calculator ORDER BY created_at DESC LIMIT 100").all();
      }
    }

    res.json({ chatbotQueries, blogViews, calculatorLeads });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch analytics", details: err.message });
  }
});

// 7. Admin Routes
router.post("/admin/posts", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  const { title, date, category, excerpt, content, is_premium } = req.body;
  const id = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    const { sql } = await import("@vercel/postgres");

    if (isPostgres) {
      await sql`
        INSERT INTO posts (id, title, date, category, excerpt, content, is_premium)
        VALUES (${id}, ${title}, ${date}, ${category}, ${excerpt}, ${content}, ${is_premium ? 1 : 0})
        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, date = EXCLUDED.date, category = EXCLUDED.category, excerpt = EXCLUDED.excerpt, content = EXCLUDED.content, is_premium = EXCLUDED.is_premium
      `;
      const { rows } = await sql`SELECT * FROM posts WHERE id = ${id}`;
      return res.status(201).json(rows[0]);
    }
    const db = getSqliteDb();
    if (db && !useMockDb) {
      db.prepare("INSERT OR REPLACE INTO posts (id, title, date, category, excerpt, content, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(id, title, date, category, excerpt, content, is_premium ? 1 : 0);
      const newPost = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
      return res.status(201).json(newPost);
    }
    res.status(201).json({ id, title, date, category, excerpt, content, is_premium });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save post", details: err.message });
  }
});

router.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    const { sql } = await import("@vercel/postgres");
    const { sendNotification } = await getUtils();

    if (isPostgres) {
      await sql`INSERT INTO subscriptions (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`;
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        db.prepare("INSERT OR IGNORE INTO subscriptions (email) VALUES (?)").run(email);
      }
    }
    sendNotification("New Newsletter Subscriber", `Email: ${email}`).catch(() => {});
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to subscribe", details: err.message });
  }
});

router.get("/admin/comments", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    const { sql } = await import("@vercel/postgres");

    const limit = parseInt(req.query.limit as string) || 500;
    if (isPostgres) {
      const { rows } = await sql`
        SELECT c.*, p.title as post_title 
        FROM comments c 
        JOIN posts p ON c.post_id = p.id 
        ORDER BY c.created_at DESC
        LIMIT ${limit}
      `;
      return res.json(rows);
    }
    const db = getSqliteDb();
    if (db && !useMockDb) {
      const rows = db.prepare(`
        SELECT c.*, p.title as post_title 
        FROM comments c 
        JOIN posts p ON c.post_id = p.id 
        ORDER BY c.created_at DESC
        LIMIT ?
      `).all(limit);
      return res.json(rows);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.delete("/admin/comments/:id", async (req, res, next) => {
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

// 8. SEO Pipeline Routes
router.get("/admin/seo/pending", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  try {
    logRoute("Route hit /admin/seo/pending");
    const { listPendingInstructions, getSeoFolderId } = await import("./seoService.js");
    logRoute("Service imported");
    const folderId = await getSeoFolderId();
    logRoute(`Folder ID: ${folderId}`);
    if (!folderId) {
      logRoute("Folder ID not configured");
      return res.json({ instructions: [], error: "GOOGLE_DRIVE_SEO_FOLDER_ID not configured." });
    }
    
    const instructions = await listPendingInstructions(folderId);
    logRoute(`Instructions found: ${instructions.length}`);
    res.json({ instructions });
  } catch (err: any) {
    logRoute(`ROUTE ERROR: ${err.message}`);
    console.error("[SEO ROUTE ERROR]", err);
    res.status(500).json({ error: "Failed to list SEO instructions", details: err.message, stack: err.stack });
  }
});

router.post("/admin/seo/execute", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  const { instructionId } = req.body;
  try {
    const logPath = path.join(process.cwd(), 'seo_debug.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[ROUTE][${timestamp}] POST /admin/seo/execute called with ID: ${instructionId}\n`);
    
    const { listPendingInstructions, getSeoFolderId, moveInstruction } = await import("./seoService.js");
    const { executeSeoInstruction } = await import("./seoExecutor.js");
    
    const folderId = await getSeoFolderId();
    if (!folderId) throw new Error("GOOGLE_DRIVE_SEO_FOLDER_ID not configured.");

    const instructions = await listPendingInstructions(folderId);
    const instruction = instructions.find(i => i.id === instructionId);
    
    if (!instruction) throw new Error("Instruction not found.");

    const result = await executeSeoInstruction(instruction.content);
    
    await moveInstruction(instructionId, folderId, 'PROCESSED');
    
    res.json({ success: true, message: result.message });
  } catch (err: any) {
    console.error("[SEO EXECUTION ERROR]", err);
    try {
      const logPath = path.join(process.cwd(), 'seo_debug.log');
      const timestamp = new Date().toISOString();
      fs.appendFileSync(logPath, `[SEO ERROR][${timestamp}] ${err.message}\nStack: ${err.stack}\n`);
    } catch (e) {}

    try {
      const { getSeoFolderId, moveInstruction } = await import("./seoService.js");
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

router.get("/admin/subscriptions", async (req, res, next) => {
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

// Error handler for API routes
router.use((err: any, req: any, res: any, next: any) => {
  console.error("[API ROUTE ERROR]", err);
  res.status(200).json({ status: "error", error: "Internal API Error", details: err.message });
});

// Global error handler for apiApp (must be last)
apiApp.use((err: any, req: any, res: any, next: any) => {
  console.error("[GLOBAL API ERROR]", err);
  res.status(200).json({ 
    status: "error",
    error: "Global API Error", 
    details: err.message || "An unknown error occurred"
  });
});

export default apiApp;
