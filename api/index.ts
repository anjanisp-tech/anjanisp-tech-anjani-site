import express from "express";

const router = express.Router();
const apiApp = express();
apiApp.use(express.json());

// Mount router at both /api and root to handle Vercel rewrites vs local mounting
apiApp.use("/api", router);
apiApp.use("/", router);

// Lazy import helpers to avoid top-level crashes
const getDb = async () => import("./db.js");
const getUtils = async () => import("./utils.js");
const getKnowledge = async () => import("./knowledgeService.js");

// Error handler for apiApp itself
// Moved to the end of the file

// 1. Simple Ping Route for testing
router.get("/ping", (req, res) => {
  res.json({ status: "ok", message: "API is reachable", version: "1.0.3" });
});

// Diagnostic route - Minimal dependencies to avoid crashes
router.get("/diagnostic", async (req, res) => {
  try {
    const hasGemini = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10;
    const geminiMasked = process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 4)}...${process.env.GEMINI_API_KEY.substring(process.env.GEMINI_API_KEY.length - 4)}` : "missing";
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
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        let apiKey = process.env.GEMINI_API_KEY!.trim().replace(/^["']|["']$/g, '');
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Try multiple models to find one that works in this region/account
        const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
        let lastErr = "";
        
        for (const modelName of models) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const testResponse = await model.generateContent("hi");
            const text = testResponse.response.text();
            if (text) {
              geminiTest = `Success (${modelName}): ` + text.substring(0, 20);
              break;
            }
          } catch (err: any) {
            lastErr = err.message;
            continue;
          }
        }
        
        if (geminiTest === "Not tested") {
          geminiTest = "Failed all models. Last error: " + lastErr;
        }
      } catch (err: any) {
        geminiTest = "Setup Failed: " + (err.message || "Unknown error");
      }
    }

    res.json({
      status: "ok",
      isVercel: !!process.env.VERCEL,
      timestamp: new Date().toISOString(),
      version: "1.0.7",
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

    let apiKey = process.env.GEMINI_API_KEY;
    
    // Sanitize API Key
    if (apiKey) {
      apiKey = apiKey.trim().replace(/^["']|["']$/g, '');
      if (apiKey.includes('YOUR_') || apiKey.length < 10) apiKey = undefined;
    }

    if (!apiKey) {
      return res.status(200).json({ 
        status: "error", 
        error: "GEMINI_API_KEY is missing or invalid in the backend environment." 
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
      // Fallback to env var if table doesn't exist
    }

    const knowledge = await getKnowledgeBase(false, fileIdOverride);
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Core Project Goals: Personal Brand Moat & Metmov Monetisation
    const systemInstruction = `You are "The Scaling Architect," a digital proxy for Anjani Pandey, founder of Metmov. 
Your ICP: Founders of $1M-$10M ARR service/knowledge businesses who are the "hero" bottleneck.
Your Goal: Build a "Personal Brand Moat" by demonstrating the unique value of the Metmov methodology and convert users to a "Fit Call" or "Diagnostic".

STRICT CONSTRAINTS:
1. BE CONCISE: Max 150 words per response.
2. MANDATORY BULLETS: ALL responses MUST be written entirely in bullet points. No introductory or concluding sentences outside of bullets.
3. READABILITY: Use double line breaks (parabreaks) between bullet points or groups of bullets to ensure a clean, airy layout.
4. HIGH-STATUS TONE: No-nonsense, authoritative, structural. Avoid "I think" or "Maybe".
5. ENGAGEMENT LOOP: Always end with exactly 2-3 relevant follow-up questions in this format: [SUGGESTIONS: Question 1?, Question 2?]
6. MONETIZATION HOOKS (PROACTIVE): 
   - If the user asks about "how to work with you", "pricing", or shows high intent, prioritize [SUGGESTIONS: Book a Fit Call, Take the Free Diagnostic].
   - After 3-4 turns of deep conversation, proactively suggest: "It sounds like we're identifying a structural bottleneck. Would you like to see the cost of this bottleneck in your business? [SUGGESTIONS: Bottleneck Cost Calculator, Book a Fit Call]"
7. NO ANALYSIS: Do NOT attempt to analyze diagnostic results with the user. If they mention results, direct them to book a Fit Call for a professional review.

KEY KNOWLEDGE & TOP QUESTIONS:
- The "Operating Spine" is a structural framework that replaces founder heroics with repeatable systems.
- "Founder Overload" is the 25-disease taxonomy of businesses where the founder is the bottleneck.
- Common Questions: 
  * "Why does my business stall without me?" (Answer: Lack of structural guardrails).
  * "How is this different from a COO?" (Answer: A COO manages people; the Spine manages the architecture).
  * "How long to install?" (Answer: 12-week Diagnostic & Installation sprints).

${knowledge ? `\n\nContext from Anjani's Metmov Methodology: ${knowledge.substring(0, 15000)}` : ""}`;

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

    // Robust model selection
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
    let lastError: any = null;
    let responseText = "";

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: systemInstruction
        });
        
        const result = await model.generateContent({
          contents: [
            ...chatHistory,
            { role: "user", parts: [{ text: message }] }
          ],
          generationConfig: { temperature: 0.7 }
        });

        responseText = result.response.text();
        if (responseText) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[CHAT] Model ${modelName} failed:`, err.message);
        continue;
      }
    }

    if (!responseText) {
      throw lastError || new Error("All models failed to generate a response.");
    }

    // Log to analytics
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

    res.json({ text: responseText });
  } catch (err: any) {
    console.error("[CHAT ERROR]", err);
    // If it's a Gemini error, it often has a specific structure
    const errorDetails = err.message || "Unknown error";
    res.status(200).json({ 
      status: "error", 
      error: "Chat failed", 
      details: errorDetails 
    });
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

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const systemInstruction = `You are "The Scaling Architect" (Anjani Pandey). Use the provided context to answer.
    Context: ${knowledge.substring(0, 15000)}`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
      generationConfig: { temperature: 0.1 } // Low temp for debugging
    });

    const responseText = result.response.text();

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
