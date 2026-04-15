import express from "express";
import { getDb, getUtils, getKnowledge, isValidEmail } from "../helpers.js";

const router = express.Router();

// Helper: get knowledge file ID override from settings
async function getFileIdOverride(): Promise<string | undefined> {
  try {
    const { isPostgres, getSqliteDb, useMockDb } = await getDb();
    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      const { rows } = await sql`SELECT value FROM settings WHERE key = 'GOOGLE_DRIVE_KNOWLEDGE_FILE_ID'`;
      if (rows.length > 0) return rows[0].value;
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        const row = db.prepare("SELECT value FROM settings WHERE key = ?").get('GOOGLE_DRIVE_KNOWLEDGE_FILE_ID');
        if (row) return (row as any).value;
      }
    }
  } catch (dbErr: any) {
    console.warn("[CHAT] Settings table check failed:", dbErr.message);
  }
  return undefined;
}

// Knowledge Base Endpoint
router.get("/knowledge", async (req, res) => {
  try {
    const { getKnowledgeBase } = await getKnowledge();
    const fileIdOverride = await getFileIdOverride();
    const knowledge = await getKnowledgeBase(req.query.force === 'true', fileIdOverride);
    res.json({ knowledge });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch knowledge base", details: err.message });
  }
});

// AI Chat Assistant Route (streaming)
router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message) return res.status(400).json({ error: "Message is required" });

    let apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
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
    const fileIdOverride = await getFileIdOverride();
    const knowledge = await getKnowledgeBase(false, fileIdOverride);

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const models = ["gemini-3.1-flash-lite-preview", "gemini-3-flash-preview"];

    const systemInstruction = `You are Anjani's AI assistant on anjanipandey.com -- the personal website of Anjani Pandey.

WHO ANJANI IS:
- Operations and transformation leader with 14+ years of experience
- Co-founder & CEO of MetMov LLP (B2B consulting firm, Bengaluru)
- ISB alumnus (MBA), background in Manufacturing Engineering
- Previously at BHEL, Udaan, Y-NOT
- Writing about systems, scale, and what AI changes about both

WHAT ANJANI THINKS ABOUT:
1. Business Structure & Scale: Why growing companies break, structural diseases, the Operating Spine framework
2. AI & Business Legibility: What happens when machines need to read your business (still forming this thesis)
3. Systems Thinking & Execution: Cadence design, accountability architecture, decision rights

METMOV (what Anjani builds):
- Helps founder-led businesses diagnose structural diseases and install the operating spine
- Replaces heroics with systems so the business runs without the founder being the system
- Operating Spine: Structural architecture replacing heroics with systems
- Founder Overload: 25-disease taxonomy of structural bottlenecks
- 12-week Diagnostic & Installation sprints

CORE BELIEFS:
- Businesses fail from absence of structural support, not lack of vision
- Diagnose before prescribing
- Install, don't advise -- a system that runs beats a deck that describes one
- AI won't replace operators but will widen the gap between structured and unstructured businesses

STRICT CONSTRAINTS:
1. BE CONCISE: Max 50 words per response.
2. STRUCTURE: Break every answer into exactly 2 short paragraphs.
3. SPACING: Use exactly TWO line breaks between paragraphs.
4. TONE: No-nonsense, sharp, thoughtful. Like Anjani speaks -- direct but not cold.
5. ENGAGEMENT LOOP: Always end with exactly 2-3 contextual follow-up suggestions in this format: [SUGGESTIONS: Option 1, Option 2, Option 3]
   - CRITICAL: Suggestions must be DIFFERENT every turn. Never repeat the same suggestion twice.
   - Vary between: questions about Anjani's work, his writing topics, MetMov methodology, and action CTAs.
   - If someone asks about business problems, guide toward MetMov and "Book a Call."
   - If someone asks about ideas/writing, guide toward his essays and thinking.
6. SCOPE: You can discuss Anjani's background, his writing, his thinking, and MetMov. For deep business diagnostics, direct to a call.

${knowledge ? `\n\nContext from Anjani's methodology and writing: ${knowledge.substring(0, 10000)}` : ""}`;

    const chatHistory = (history || [])
      .filter((h: any) => h.content && h.content.trim().length > 0)
      .map((h: any) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.content }]
      }));

    if (chatHistory.length > 0 && chatHistory[0].role === "model") {
      chatHistory.shift();
    }

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
            temperature: 0.5,
            maxOutputTokens: 256
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

// Chatbot Lead Capture
router.post("/chatbot-lead", async (req, res) => {
  try {
    const { email, query } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format" });

    const { isPostgres, getSqliteDb, useMockDb } = await getDb();

    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      await sql`CREATE TABLE IF NOT EXISTS chatbot_leads (id SERIAL PRIMARY KEY, email TEXT NOT NULL, query TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
      await sql`INSERT INTO chatbot_leads (email, query) VALUES (${email}, ${query || null})`;
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        db.prepare("INSERT INTO chatbot_leads (email, query) VALUES (?, ?)").run(email, query || null);
      }
    }

    // Send email notification so leads don't go into a black hole
    const { sendNotification } = await getUtils();
    sendNotification(
      "New Chatbot Lead",
      `Email: ${email}\nQuery: ${query || "(no query)"}\nSource: Chatbot widget`
    ).catch(() => {});

    res.json({ success: true });
  } catch (err: any) {
    console.error("[CHATBOT LEAD ERROR]", err);
    res.status(500).json({ error: "Failed to save lead" });
  }
});

// Resource Lead Capture
router.post("/resource-lead", async (req, res) => {
  try {
    const { email, resource_name } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format" });

    const { isPostgres, getSqliteDb, useMockDb } = await getDb();

    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      await sql`CREATE TABLE IF NOT EXISTS resource_leads (id SERIAL PRIMARY KEY, email TEXT NOT NULL, resource_name TEXT, created_at TIMESTAMP DEFAULT NOW())`;
      await sql`INSERT INTO resource_leads (email, resource_name) VALUES (${email}, ${resource_name || null})`;
    } else {
      const db = getSqliteDb();
      if (db && !useMockDb) {
        db.exec("CREATE TABLE IF NOT EXISTS resource_leads (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, resource_name TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");
        db.prepare("INSERT INTO resource_leads (email, resource_name) VALUES (?, ?)").run(email, resource_name || null);
      }
    }

    // Send email notification so leads don't go into a black hole
    const { sendNotification } = await getUtils();
    sendNotification(
      "New Resource Lead",
      `Email: ${email}\nResource: ${resource_name || "(unknown)"}\nSource: Resource gate`
    ).catch(() => {});

    res.json({ success: true });
  } catch (err: any) {
    console.error("[RESOURCE LEAD ERROR]", err);
    res.status(500).json({ error: "Failed to save lead" });
  }
});

export default router;
