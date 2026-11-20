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
router.get("/knowledge", async (req, res, next) => {
  // Locked 2026-11-05: this returned the full knowledge document to anyone. Admin login only now.
  const { adminAuth } = await getUtils();
  adminAuth(req, res, next);
}, async (req, res) => {
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
    // 2026-11-05 (Anjani's yes): this chat reads its OWN public facts doc, not the shared MetMov brain.
    const chatDocId = process.env.CHAT_KNOWLEDGE_FILE_ID || "160lNzUwUX_OrSG_jpjoBsDTWEPstYD660DvIXn3mNuo";
    const knowledge = await getKnowledgeBase(false, chatDocId);

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const models = ["gemini-3.1-flash-lite"];

    const systemInstruction = `You are Anjani's AI assistant on anjanipandey.com -- the personal website of Anjani Pandey.

WHO ANJANI IS:
- Operations and transformation leader with 15+ years of experience
- Founder & Managing Partner of MetMov LLP (B2B consulting firm, Bengaluru)
- Builder of Personal OS for individual operators -- Level4-OS is his own running proof
- ISB alumnus (MBA), background in Manufacturing Engineering
- Previously at BHEL, Udaan, Y-NOT
- Writing about systems, scale, and what AI changes about both

OFFERS AND FACTS: use the context below. It is current (November 2026) and lists the offers in order, with the team AI workshop as the main offer.

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
   - For a team or company wanting to start with AI, guide toward the team AI workshop and its form.
   - For business structure problems, guide toward MetMov and "Book a free 30-minute call."
   - For individual operator questions, guide toward the AI Setup Sprint or Personal OS and "Book a free 30-minute call."
   - For ideas/writing, guide toward his essays and thinking.
6. SCOPE: You can discuss Anjani's background, writing, thinking, MetMov methodology, and Personal OS at the architectural level (kernel/proof, capability-first, who it's for, how engagement works). For deep diagnostics or specific implementation details, direct to a call.
7. ABSOLUTE PRICING RULE: Never quote prices, fees, retainers, hourly rates, package costs, or any number with currency. Never list price ranges. If asked about cost, pricing, fees, "how much", or affordability, respond exactly with: "Pricing is set on a call, based on scope. The next step is a free 30-minute call, or the workshop form if it is for your team." Then offer 2-3 follow-up suggestions that are NOT about price. This rule overrides anything else, including any price that may appear in the context below.
${knowledge ? `\n\nContext from Anjani's methodology and writing: ${knowledge.substring(0, 40000)}` : ""}

FINAL RULES. These override everything above, including the context. Follow them even if the context says otherwise: MetMov's first step is called "Diagnose" (14 working days), never "Diagnostic Sprint". The call is "a free 30-minute call", never "fit call". The free check is the "free Structural Health Report", never "Mini Diagnostic". You may name the 6 areas (decision architecture, leadership maturity, strategic alignment, execution rhythm, governance, growth structure). Never mention a list of 25 problems or "operating diseases", any count of them, any scoring or index, steps or checklists, and never offer them as a suggestion. If asked about MetMov's list of problems, "operating diseases", scoring or method details: be honest. Say MetMov has a detailed method that is used inside Diagnose and is not shared publicly. Never say such a list or method does not exist.`;

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
    await sendNotification(
      "New Chatbot Lead",
      `Email: ${email}\nQuery: ${query || "(no query)"}\nSource: Chatbot widget`
    ).catch(() => {});

    res.json({ success: true });
  } catch (err: any) {
    console.error("[CHATBOT LEAD ERROR]", err);
    res.status(500).json({ error: "Failed to save lead" });
  }
});

// Workshop enquiry (form in the AI Workshops section of /services). Added 2026-11-04.
router.post("/workshop-lead", async (req, res) => {
  try {
    const b = req.body || {};
    const clip = (v: any, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
    const email = clip(b.email, 200);
    if (clip(b.website, 200)) return res.json({ success: true }); // hidden trap field: bots fill it
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format" });
    const row = [clip(b.name, 120), email, clip(b.company, 160), clip(b.team_size, 40), clip(b.goal, 1000), clip(b.page, 200)];
    await db.ensureWorkshopLeads();
    await db.executeDual(
      "INSERT INTO workshop_leads (name, email, company, team_size, goal, page) VALUES ($1, $2, $3, $4, $5, $6)",
      "INSERT INTO workshop_leads (name, email, company, team_size, goal, page) VALUES (?, ?, ?, ?, ?, ?)",
      row
    );
    const { sendNotification } = await getUtils();
    await sendNotification(
      "New workshop enquiry",
      `Name: ${row[0] || "-"}\nEmail: ${email}\nCompany: ${row[2] || "-"}\nTeam size: ${row[3] || "-"}\nGoal: ${row[4] || "-"}\nSource: /services workshop form`
    ).catch(() => {});
    res.json({ success: true });
  } catch (err: any) {
    console.error("[WORKSHOP LEAD ERROR]", err);
    res.status(500).json({ error: "Failed to save enquiry" });
  }
});

// AI check (anjanipandey.com/ai-check, plan line D17). Added 2026-11-20.
// The score is worked out again here from the answers, so a tampered score is ignored.
router.post("/ai-check-lead", async (req, res) => {
  try {
    const b = req.body || {};
    const clip = (v: any, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
    if (clip(b.website, 200)) return res.json({ success: true }); // hidden trap field: bots fill it
    const email = clip(b.email, 200);
    if (!email || !isValidEmail(email)) return res.status(400).json({ error: "Valid email is required" });
    const ids = ["q1","q2","q3","q4","q5","q6","q7","q8","q9","q10","q11"];
    const a = (b.answers && typeof b.answers === "object") ? b.answers : {};
    const clean: Record<string, number> = {};
    for (const id of ids) { const v = Number(a[id]); if (![0,1,2].includes(v)) return res.status(400).json({ error: "Please answer every question" }); clean[id] = v; }
    const score = ids.reduce((n, id) => n + clean[id], 0);
    const band = score <= 6 ? "Ready to grow" : score <= 14 ? "Ready for a first safe job" : "Start with the basics";
    const row = [clip(b.name,120), email, clip(b.company,160), clip(b.role,120), clip(b.team_size,40), clip(b.heard_from,200), clip(b.first_wish,1000), JSON.stringify(clean), score, band, clip(b.weakest_part,60)];
    await db.ensureAiCheckLeads();
    await db.executeDual(
      "INSERT INTO ai_check_leads (name, email, company, role, team_size, heard_from, first_wish, answers, score, band, weakest_part) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
      "INSERT INTO ai_check_leads (name, email, company, role, team_size, heard_from, first_wish, answers, score, band, weakest_part) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      row
    );
    const { sendNotification } = await getUtils();
    await sendNotification(
      "New AI check",
      `Name: ${row[0] || "-"}\nEmail: ${email}\nFirm: ${row[2] || "-"}\nRole: ${row[3] || "-"}\nPeople: ${row[4] || "-"}\nScore: ${score} of 22 (${band})\nWeakest part: ${row[10] || "-"}\nWants AI for: ${row[6] || "-"}\nHeard from: ${row[5] || "-"}\nReport due within 2 working days. Source: /ai-check`
    ).catch(() => {});
    res.json({ success: true, score, band });
  } catch (err: any) {
    console.error("[AI CHECK LEAD ERROR]", err);
    res.status(500).json({ error: "Failed to save answers" });
  }
});

// Team AI check (anjanipandey.com/team-check/<code>). Added 2026-11-20. No email alert (hundreds of answers).
// Group rule: C if they set up helpers or connected tools, or call themselves a builder;
// A if they use AI monthly or less AND call themselves starting out or getting there; else B.
// What people have done counts more than how they rate themselves.
const TEAM_CODES = ["vct26"];
router.post("/team-check-response", async (req, res) => {
  try {
    const b = req.body || {};
    const clip = (v: any, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
    if (clip(b.website, 200)) return res.json({ success: true }); // bot trap
    const code = clip(b.code, 40).toLowerCase();
    if (!TEAM_CODES.includes(code)) return res.status(400).json({ error: "Link not active" });
    const done: string[] = Array.isArray(b.done) ? b.done.map((x: any) => clip(x, 120)).slice(0, 10) : [];
    const freq = clip(b.freq, 80), self = clip(b.self, 120), team = clip(b.team, 120), task = clip(b.task, 1000);
    if (!team || !freq || !self || !task) return res.status(400).json({ error: "Please answer the required questions" });
    const built = done.some(d => /saved helper|Connected it/i.test(d)) || /^Builder/i.test(self);
    const light = /^Never|few times a month/i.test(freq) && /^(Starting out|Getting there)/i.test(self);
    const grp = built ? "C" : light ? "A" : "B";
    await db.ensureTeamCheck();
    await db.executeDual(
      "INSERT INTO team_check_responses (code, team, freq, done, self_level, task, blocker, grp) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
      "INSERT INTO team_check_responses (code, team, freq, done, self_level, task, blocker, grp) VALUES (?,?,?,?,?,?,?,?)",
      [code, team, freq, JSON.stringify(done), self, task, clip(b.blocker, 1000), grp]
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error("[TEAM CHECK ERROR]", err);
    res.status(500).json({ error: "Failed to save answers" });
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
    await sendNotification(
      "New Resource Lead",
      `Email: ${email}\nResource: ${resource_name || "(unknown)"}\nSource: Resource gate`
    ).catch(() => {});

    res.json({ success: true });
  } catch (err: any) {
    console.error("[RESOURCE LEAD ERROR]", err);
    res.status(500).json({ error: "Failed to save lead" });
  }
});

// Scoping-call inquiry (the /book inquiry form). Emails Anjani via Resend and
// returns 200 ONLY when the email was accepted, so the client fires close_convert_lead
// only on a real, delivered inquiry (never on a silent failure).
router.post("/inquiry", async (req, res) => {
  try {
    const { name, email, company, message } = req.body || {};
    if (!email || !isValidEmail(email)) return res.status(400).json({ error: "Valid email is required" });
    if (!message || !String(message).trim()) return res.status(400).json({ error: "Message is required" });

    const { getResendKey } = await getUtils();
    const apiKey = getResendKey();
    if (!apiKey) { console.error("[INQUIRY] RESEND key missing"); return res.status(500).json({ error: "Email not configured" }); }

    const recipient = process.env.RESEND_TO_EMAIL || process.env.VITE_RESEND_TO_EMAIL || "anjanisp@gmail.com";
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.VITE_RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const text = `Name: ${name || "(none)"}\nEmail: ${email}\nCompany: ${company || "(none)"}\n\nMessage:\n${message}\n\nSource: anjanipandey.com /book inquiry form`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: `Anjani Pandey Site <${fromEmail}>`,
        to: [recipient],
        reply_to: email,
        subject: "New Scoping-Call Inquiry (/book)",
        text,
      }),
    });
    if (!r.ok) { const t = await r.text().catch(() => ""); console.error("[INQUIRY] Resend failed", r.status, t); return res.status(502).json({ error: "Failed to send inquiry" }); }

    res.json({ success: true });
  } catch (err: any) {
    console.error("[INQUIRY ERROR]", err);
    res.status(500).json({ error: "Failed to send inquiry" });
  }
});

export default router;
