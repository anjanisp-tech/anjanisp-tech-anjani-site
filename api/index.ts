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
    const hasGoogleDrive = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const hasAdminPassword = !!process.env.ADMIN_PASSWORD;

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
        let apiKey = process.env.GEMINI_API_KEY!.trim().replace(/^["']|["']$/g, '');
        const ai = new GoogleGenAI({ apiKey });
        const testResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-preview",
          contents: [{ role: "user", parts: [{ text: "hi" }] }],
          config: { maxOutputTokens: 5 }
        });
        geminiTest = testResponse.text ? "Success: " + testResponse.text.substring(0, 20) : "Empty response";
      } catch (err: any) {
        geminiTest = "Failed: " + (err.message || "Unknown error");
      }
    }

    res.json({
      status: "ok",
      isVercel: !!process.env.VERCEL,
      timestamp: new Date().toISOString(),
      version: "1.0.6",
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
        HAS_ADMIN_PASSWORD: hasAdminPassword
      }
    });
  } catch (err: any) {
    res.status(200).json({ status: "error", error: "Diagnostic failed", details: err.message });
  }
});

// 2. Knowledge Base Endpoint
router.get("/knowledge", async (req, res) => {
  try {
    const { getKnowledgeBase } = await getKnowledge();
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    
    let fileIdOverride: string | undefined;
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
      await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`;
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, value);
      }
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save setting" });
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

    const knowledge = await getKnowledgeBase(false, fileIdOverride);
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `You are "The Scaling Architect," a digital proxy for Anjani Pandey, founder of Metmov. 
Your ICP: Founders of $1M-$10M ARR service/knowledge businesses who are the "hero" bottleneck.
Your Goal: Diagnose "Founder Overload" and convert users to a Diagnostic Call.

STRICT CONSTRAINTS:
1. BE CONCISE: Max 150 words per response.
2. MANDATORY BULLETS: ALL responses MUST be written entirely in bullet points. No introductory or concluding sentences outside of bullets.
3. READABILITY: Use double line breaks (parabreaks) between bullet points or groups of bullets to ensure a clean, airy layout.
4. HIGH-STATUS TONE: No-nonsense, authoritative, structural. Avoid "I think" or "Maybe".
5. ENGAGEMENT LOOP: Always end with exactly 2-3 relevant follow-up questions in this format: [SUGGESTIONS: Question 1?, Question 2?]
6. CONVERSION: If the conversation is deep, prioritize [SUGGESTIONS: Book a Fit Call, Take the Free Diagnostic]. These are direct links.
7. NO ANALYSIS: Do NOT attempt to analyze diagnostic results with the user. If they mention results, direct them to book a Fit Call for a professional review.

KEY KNOWLEDGE & TOP QUESTIONS:
- The "Operating Spine" is a structural framework that replaces founder heroics with repeatable systems.
- "Founder Overload" is the 25-disease taxonomy of businesses where the founder is the bottleneck.
- Common Questions: 
  * "Why does my business stall without me?" (Answer: Lack of structural guardrails).
  * "How is this different from a COO?" (Answer: A COO manages people; the Spine manages the architecture).
  * "How long to install?" (Answer: 12-week Diagnostic & Installation sprints).

${knowledge ? `\n\nContext from Anjani's Methodology: ${knowledge.substring(0, 15000)}` : ""}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [
        ...(history || []).map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }]
        })),
        { role: "user", parts: [{ text: message }] }
      ],
      config: { systemInstruction, temperature: 0.7 }
    });

    res.json({ text: response.text });
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

// 4. Blog Posts Routes
router.get("/posts", async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb, initialPosts } = await getDb();
    
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      const { rows } = await sql`SELECT * FROM posts ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      return res.json(rows);
    }
    
    const db = getSqliteDb();
    if (db && !useMockDb) {
      const posts = db.prepare("SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?").all(limit, offset);
      return res.json(posts);
    }

    res.json(initialPosts.slice(offset, offset + limit));
  } catch (err: any) {
    res.status(200).json({ status: "error", error: "Failed to fetch posts", details: err.message });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb, initialPosts } = await getDb();

    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      const { rows } = await sql`SELECT * FROM posts WHERE id = ${req.params.id}`;
      if (rows.length > 0) return res.json(rows[0]);
    }
    const db = getSqliteDb();
    if (db && !useMockDb) {
      const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
      if (post) return res.json(post);
    }
    const post = initialPosts.find(p => p.id === req.params.id);
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

// 6. Admin Routes
router.post("/admin/posts", async (req, res, next) => {
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
  const { title, date, category, excerpt, content } = req.body;
  const id = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    const { sql } = await import("@vercel/postgres");

    if (isPostgres) {
      await sql`
        INSERT INTO posts (id, title, date, category, excerpt, content)
        VALUES (${id}, ${title}, ${date}, ${category}, ${excerpt}, ${content})
        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, date = EXCLUDED.date, category = EXCLUDED.category, excerpt = EXCLUDED.excerpt, content = EXCLUDED.content
      `;
      const { rows } = await sql`SELECT * FROM posts WHERE id = ${id}`;
      return res.status(201).json(rows[0]);
    }
    const db = getSqliteDb();
    if (db && !useMockDb) {
      db.prepare("INSERT OR REPLACE INTO posts (id, title, date, category, excerpt, content) VALUES (?, ?, ?, ?, ?, ?)")
        .run(id, title, date, category, excerpt, content);
      const newPost = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
      return res.status(201).json(newPost);
    }
    res.status(201).json({ id, title, date, category, excerpt, content });
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
