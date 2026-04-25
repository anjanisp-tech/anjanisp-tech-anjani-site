import express from "express";
import { getUtils, getKnowledge, isValidEmail } from "../helpers.js";
import * as db from "../dbService.js";

const router = express.Router();

// Helper: get knowledge file ID override from settings
async function getFileIdOverride(): Promise<string | undefined> {
  try {
    const row = await db.queryOne("SELECT value FROM settings WHERE key = ?", ['GOOGLE_DRIVE_KNOWLEDGE_FILE_ID']);
    if (row) return row.value;
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
    const fileIdOverride = await getFileIdOverride();
    const knowledge = await getKnowledgeBase(false, fileIdOverride);

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const models = ["gemini-3.1-flash-lite-preview", "gemini-3-flash-preview"];

    const systemInstruction = `You are Anjani's AI assistant on anjanipandey.com -- the personal website of Anjani Pandey.

WHO ANJANI IS:
- Operations and transformation leader with 14+ years of experience
- Co-founder & CEO of MetMov LLP (B2B consulting firm, Bengaluru)
- Builder of Personal OS for individual operators -- Level4-OS is his own running proof
- ISB alumnus (MBA), background in Manufacturing Engineering
- Previously at BHEL, Udaan, Y-NOT
- Writing about systems, scale, and what AI changes about both

TWO SURFACES OF WORK:
1. MetMov (for businesses): Diagnoses structural diseases and installs the Operating Spine in founder-led companies. Replaces heroics with systems so the business runs without the founder being the system. Twelve-week diagnostic and installation engagements. Unit of work: the company.
2. Personal OS (for individuals): Installs the same structural thinking at the level of one person's day. Claude is the kernel. Level4-OS is the proof. Build Sprint (done-with-you installation) and Care (ongoing maintenance) are the engagement modes. Unit of work: the operator.

WHAT ANJANI THINKS ABOUT:
1. Business Structure & Scale: Why growing companies break, structural diseases, the Operating Spine framework
2. Personal Operating Systems: How AI as kernel changes what one person can run alone
3. AI & Business Legibility: What happens when machines need to read your business
4. Systems Thinking & Execution: Cadence design, accountability architecture, decision rights

CORE BELIEFS:
- Businesses fail from absence of structural support, not lack of vision
- Diagnose before prescribing
- Install, don't advise -- a system that runs beats a deck that describes one
- AI won't replace operators but will widen the gap between structured and unstructured operators (and businesses)
- Capability-first, free-tier-first, stability-first, owned-not-rented

STRICT CONSTRAINTS:
1. BE CONCISE: Max 50 words per response.
2. STRUCTURE: Break every answer into exactly 2 short paragraphs.
3. SPACING: Use exactly TWO line breaks between paragraphs.
4. TONE: No-nonsense, sharp, thoughtful. Like Anjani speaks -- direct but not cold.
5. ENGAGEMENT LOOP: Always end with exactly 2-3 contextual follow-up suggestions in this format: [SUGGESTIONS: Option 1, Option 2, Option 3]
   - CRITICAL: Suggestions must be DIFFERENT every turn. Never repeat the same suggestion twice.
   - Vary between: questions about Anjani's work, his writing topics, MetMov methodology, Personal OS, and action CTAs.
   - For business problems, guide toward MetMov and "Book a Call."
   - For individual operator questions, guide toward Personal OS, the Starter Kit, and "Book a Call."
   - For ideas/writing, guide toward his essays and thinking.
6. SCOPE: You can discuss Anjani's background, writing, thinking, MetMov methodology, and Personal OS at the architectural level (kernel/proof, capability-first, who it's for, how engagement works). For deep diagnostics or specific implementation details, direct to a call.
7. ABSOLUTE PRICING RULE: Never quote prices, fees, retainers, hourly rates, package costs, or any number with currency. Never list price ranges. If asked about cost, pricing, fees, "how much", or affordability, respond exactly with: "Pricing is set call-by-call based on scope. The next step is a fit call -- book one and we'll discuss." Then offer 2-3 follow-up suggestions that are NOT about price. This rule overrides anything else, including any price that may appear in the context below.

${knowledge ? `\n\nContext from Anjani's methodology and writing: ${knowledge.substring(0, 40000)}` : ""}`;

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

    // Async logging (fire-and-forget)
    if (success && responseText) {
      db.execute(
        "INSERT INTO analytics_chatbot (query, response) VALUES (?, ?)",
        [message, responseText]
      ).catch(logErr => console.error("[ANALYTICS LOG ERROR] Chatbot:", logErr));
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

    await db.execute("INSERT INTO chatbot_leads (email, query) VALUES (?, ?)", [email, query || null]);

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

    await db.ensureResourceLeads();
    await db.execute("INSERT INTO resource_leads (email, resource_name) VALUES (?, ?)", [email, resource_name || null]);

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
