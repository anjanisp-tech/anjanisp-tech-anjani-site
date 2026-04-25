import express from "express";
import fs from "fs";
import path from "path";
import { getUtils, getKnowledge } from "../helpers.js";
import * as db from "../dbService.js";

const router = express.Router();

// Simple Ping Route for testing
router.get("/ping", (req, res) => {
  res.json({ status: "ok", message: "API is reachable", version: "1.0.4" });
});

// SEO Routes: robots.txt and sitemap.xml
router.get("/robots.txt", async (req, res) => {
  try {
    let content = "";

    const row = await db.queryOne("SELECT value FROM settings WHERE key = ?", ['robots_txt']);
    content = row?.value;

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
    <loc>https://www.anjanipandey.com/resources</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.anjanipandey.com/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.anjanipandey.com/book</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

    try {
      let posts = await db.query("SELECT id, created_at FROM posts ORDER BY created_at DESC");

      if (posts.length === 0) {
        posts = await db.getInitialPosts();
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

    let content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

    if (!content.includes('<url>')) {
      const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      if (fs.existsSync(sitemapPath)) {
        const fileContent = fs.readFileSync(sitemapPath, 'utf-8');
        if (fileContent.includes('<url>')) {
          content = fileContent;
        }
      }
    }

    res.setHeader('Content-Type', 'application/xml');
    res.send(content);
  } catch (err: any) {
    res.status(500).send("Error generating sitemap.xml");
  }
});

// Funnel tile — live public projection for Home.tsx "Now Building" card.
// Phase F · Task 2. Mirrors the shape of funnel_summary_public.json but reads
// Supabase server-side on each request, so we get live numbers without a
// deploy-storm (no hourly commits to public/).
//
// Trust boundary (locked by Phase D decisions log 2026-04-20):
//   - Allow-list projection. Only visits, signups, qualified, conversion_pct.
//   - service_role stays server-side. Browser never sees the key.
//   - Graceful hide: on any failure the endpoint returns 204 so the client
//     can render nothing. No error detail leaks to the homepage.
//
// Column mapping: visits=page_view, signups=subscribe, qualified=confirm,
// conversion_pct=end_to_end_rate*100. Same as emit_public_funnel.py v2.1.0.
router.get("/funnel-public", async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL || "https://ydjauliaggmpunfehzzo.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    res.status(204).end();
    return;
  }

  // Current ISO week (IST-bucketed to match the v1 view).
  const IST_OFFSET_MIN = 330;
  const nowIst = new Date(Date.now() + IST_OFFSET_MIN * 60_000);
  const y = nowIst.getUTCFullYear();
  const m = nowIst.getUTCMonth();
  const d = nowIst.getUTCDate();
  // Monday-of-week in IST (view uses Monday-start ISO weeks).
  const dow = new Date(Date.UTC(y, m, d)).getUTCDay();           // 0=Sun..6=Sat
  const offsetToMonday = (dow + 6) % 7;                          // Mon=0 ... Sun=6
  const monday = new Date(Date.UTC(y, m, d - offsetToMonday));
  const weekStart = monday.toISOString().slice(0, 10);           // YYYY-MM-DD

  try {
    const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/funnel_summary_v1?week_start=eq.${weekStart}&limit=1`;
    const upstream = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
        "User-Agent": "anjanipandey-funnel-public/1.0.0",
      },
      // Vercel Node runtime has global fetch (Node 18+).
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      res.status(204).end();
      return;
    }
    const rows: any = await upstream.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(204).end();
      return;
    }
    const row = rows[0];
    const visits = Number(row.page_view) || 0;
    const signups = Number(row.subscribe) || 0;
    const qualified = Number(row.confirm) || 0;
    const e2e = row.end_to_end_rate;
    const conversion_pct = e2e == null ? 0 : Math.round(Number(e2e) * 10000) / 100;

    // Gate: visits=0 → hide (matches emitter exit code 3).
    if (visits === 0 || conversion_pct < 0 || conversion_pct > 100) {
      res.status(204).end();
      return;
    }

    const today = new Date(Date.now() + IST_OFFSET_MIN * 60_000).toISOString().slice(0, 10);
    const weekLabel = `${y}-W${String(getIsoWeek(monday)).padStart(2, "0")}`;

    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({
      schema_version: "1.0.0",
      as_of: today,
      brief_id: weekLabel,
      period: {
        start: row.week_start,
        end: row.week_end,
        label: "last 7 days",
      },
      funnel: {
        visits,
        signups,
        qualified,
        conversion_pct,
      },
      notes: {
        source: "live",
        trust_boundary: "Server-side allow-list projection. Operator-only fields are never exposed. Allow-list: visits, signups, qualified, conversion_pct.",
      },
    });
  } catch (_err) {
    // Silent hide on network / parse failure — homepage must never surface errors.
    res.status(204).end();
  }
});

function getIsoWeek(mondayUtc: Date): number {
  // Thursday of the same ISO week determines the ISO year/week.
  const thursday = new Date(mondayUtc.getTime());
  thursday.setUTCDate(mondayUtc.getUTCDate() + 3);
  const jan1 = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const days = Math.floor((thursday.getTime() - jan1.getTime()) / 86_400_000);
  return Math.floor(days / 7) + 1;
}

// Diagnostic route (admin-only)
router.get("/diagnostic", async (req, res, next) => {
  try {
    const { adminAuth } = await getUtils();
    adminAuth(req, res, next);
  } catch (err) { next(err); }
}, async (req, res) => {
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
      const health = await db.healthCheck();
      dbStatus = `${health.type.charAt(0).toUpperCase() + health.type.slice(1)} (Active)`;
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
    res.status(500).json({ status: "error", error: "Diagnostic failed", details: err.message });
  }
});

export default router;
d", details: err.message });
  }
});

export default router;
