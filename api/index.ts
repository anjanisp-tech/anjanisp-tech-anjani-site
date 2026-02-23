import express from "express";
import { sql } from "@vercel/postgres";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Use process.cwd() to ensure we are in the project root, or fallback to /tmp
const KEY_FILE = path.join(process.cwd(), ".resend_key");
const TMP_KEY_FILE = "/tmp/.resend_key";

let memoryKey: string | null = null;

// Helper to get Resend Key with multiple fallbacks
function getResendKey() {
  // 0. Memory cache (fastest, survives until process restart)
  if (memoryKey) return memoryKey;

  // 1. Check local override files
  for (const f of [KEY_FILE, TMP_KEY_FILE]) {
    if (fs.existsSync(f)) {
      try {
        const k = fs.readFileSync(f, 'utf8').trim();
        if (k.startsWith('re_')) {
          memoryKey = k;
          return k;
        }
      } catch (e) {}
    }
  }

  // 2. Check standard environment variables
  const envKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  if (envKey && envKey.startsWith('re_')) return envKey;

  // 3. Smart Search: Look for any env var that looks like a Resend key
  const smartKey = Object.values(process.env).find(v => typeof v === 'string' && v.startsWith('re_'));
  if (smartKey) return smartKey;

  return null;
}

const router = express.Router();
router.use(express.json());

// Sanitize Postgres URLs (sometimes users copy the prefix by mistake)
if (process.env.POSTGRES_URL?.includes('POSTGRES_URL=')) {
  process.env.POSTGRES_URL = process.env.POSTGRES_URL.split('POSTGRES_URL=')[1];
}
if (process.env.DATABASE_URL?.includes('DATABASE_URL=')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.split('DATABASE_URL=')[1];
}

const dbInitializedAt = new Date().toISOString();
const isPostgres = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
console.log("Database configuration detected:", isPostgres ? "Postgres" : "SQLite");
if (isPostgres) {
  console.log("Postgres URL present:", !!process.env.POSTGRES_URL);
  console.log("Database URL present:", !!process.env.DATABASE_URL);
}

// SQLite Fallback (for local/preview without Postgres)
let sqliteDb: any;

function seedSqlite() {
  if (isPostgres) return;
  
  console.log("Seeding SQLite database...");
  const initialPosts = [
    {
      id: "founder-overload-map",
      title: "THE FOUNDER OVERLOAD MAP",
      date: "18-Feb-2026",
      category: "Operations",
      excerpt: "If your company stops moving when you step away, you did not build a business. You built a dependency engine. Learn how to diagnose and fix the structural gaps causing founder overload.",
      content: "Many leaders assume exhaustion is the price of ambition. It is not. Sustainable companies do not demand constant founder energy. They demand sound operating design.\n\nBurnout is usually diagnosed as a personal issue. In practice, it is structural. When execution depends on one person, growth multiplies pressure instead of results.\n\nHere is the pattern visible across scaling firms.\n\n### SYMPTOMS\n\nWhen founders become the system, certain signals appear:\n\n* Decisions require their validation\n* Teams escalate small issues upward\n* Calendars fill with alignment meetings\n* Work slows during their absence\n\nThese symptoms often get misread as growth complexity. They are actually architecture gaps."
    },
    {
      id: "systems-outlast-heroics",
      title: "WHY SPEED BECOMES DANGEROUS INSIDE GROWING ORGANIZATIONS",
      date: "19-Feb-2026",
      category: "Scaling",
      excerpt: "Heroic execution works until complexity increases. Learn why systems, not stamina, are the key to winning at scale and building a durable organization.",
      content: "Many early stage companies grow on momentum. A founder pushes hard. A small team stretches capacity. Strong performers step up repeatedly. Results improve.\n\nThis phase creates confidence. It also creates risk.\n\nHeroic execution works because complexity is still manageable. Decisions are fast. Communication is direct. Corrections happen instantly. Intensity compensates for missing structure."
    },
    {
      id: "hiring-trap-growing-companies",
      title: "THE HIRING TRAP MOST GROWING COMPANIES FALL INTO",
      date: "21-Feb-2026",
      category: "Scaling",
      excerpt: "Hiring increases capacity, but it doesn't improve design. Discover why adding headcount to a broken process only multiplies your problems.",
      content: "Growth creates pressure. Pressure creates friction. Many leaders respond by adding people.\n\nAt first, this works. Output increases. Deadlines are met. Stress drops.\n\nBut over time, something strange happens. Hiring keeps increasing while efficiency stays flat.\n\nThis pattern reveals a structural issue.\n\n**Hiring increases capacity. It does not improve design.**"
    }
  ];

  for (const p of initialPosts) {
    sqliteDb.prepare(`
      INSERT INTO posts (id, title, date, category, excerpt, content)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET title = excluded.title
    `).run(p.id, p.title, p.date, p.category, p.excerpt, p.content);
  }
  console.log("SQLite seeding complete.");
}

if (!isPostgres) {
  console.log("Using SQLite fallback");
  const dbPath = path.join(process.cwd(), "blog.db");
  sqliteDb = new Database(dbPath);
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  seedSqlite();
}

async function initDb(force = false) {
  if (isPostgres) {
    try {
      console.log(`Initializing Postgres tables (force=${force})...`);
      await sql`
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          date TEXT NOT NULL,
          category TEXT NOT NULL,
          excerpt TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `.catch(e => console.error("Error creating posts table:", e));
      
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
      `.catch(e => console.error("Error creating comments table:", e));
      
      await sql`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `.catch(e => console.error("Error creating subscriptions table:", e));
      
      console.log("Postgres tables check complete.");
      
      // Check if seed data is needed
      const { rowCount } = await sql`SELECT id FROM posts LIMIT 1`;
      
      const initialPosts = [
        {
          id: "founder-overload-map",
          title: "THE FOUNDER OVERLOAD MAP",
          date: "18-Feb-2026",
          category: "Operations",
          excerpt: "If your company stops moving when you step away, you did not build a business. You built a dependency engine. Learn how to diagnose and fix the structural gaps causing founder overload.",
          content: "Many leaders assume exhaustion is the price of ambition. It is not. Sustainable companies do not demand constant founder energy. They demand sound operating design.\n\nBurnout is usually diagnosed as a personal issue. In practice, it is structural. When execution depends on one person, growth multiplies pressure instead of results.\n\nHere is the pattern visible across scaling firms.\n\n### SYMPTOMS\n\nWhen founders become the system, certain signals appear:\n\n* Decisions require their validation\n* Teams escalate small issues upward\n* Calendars fill with alignment meetings\n* Work slows during their absence\n\nThese symptoms often get misread as growth complexity. They are actually architecture gaps."
        },
        {
          id: "systems-outlast-heroics",
          title: "WHY SPEED BECOMES DANGEROUS INSIDE GROWING ORGANIZATIONS",
          date: "19-Feb-2026",
          category: "Scaling",
          excerpt: "Heroic execution works until complexity increases. Learn why systems, not stamina, are the key to winning at scale and building a durable organization.",
          content: "Many early stage companies grow on momentum. A founder pushes hard. A small team stretches capacity. Strong performers step up repeatedly. Results improve.\n\nThis phase creates confidence. It also creates risk.\n\nHeroic execution works because complexity is still manageable. Decisions are fast. Communication is direct. Corrections happen instantly. Intensity compensates for missing structure."
        },
        {
          id: "hiring-trap-growing-companies",
          title: "THE HIRING TRAP MOST GROWING COMPANIES FALL INTO",
          date: "21-Feb-2026",
          category: "Scaling",
          excerpt: "Hiring increases capacity, but it doesn't improve design. Discover why adding headcount to a broken process only multiplies your problems.",
          content: "Growth creates pressure. Pressure creates friction. Many leaders respond by adding people.\n\nAt first, this works. Output increases. Deadlines are met. Stress drops.\n\nBut over time, something strange happens. Hiring keeps increasing while efficiency stays flat.\n\nThis pattern reveals a structural issue.\n\n**Hiring increases capacity. It does not improve design.**"
        }
      ];

      if (rowCount === 0 || force) {
        console.log(`Aggressive Sync: Deleting and re-inserting ${initialPosts.length} posts...`);
        // Clear existing to ensure fresh start with new titles/content
        if (force) await sql`DELETE FROM posts`;
        
        for (const p of initialPosts) {
          await sql`
            INSERT INTO posts (id, title, date, category, excerpt, content)
            VALUES (${p.id}, ${p.title}, ${p.date}, ${p.category}, ${p.excerpt}, ${p.content})
            ON CONFLICT (id) DO UPDATE SET 
              title = EXCLUDED.title,
              date = EXCLUDED.date,
              category = EXCLUDED.category,
              excerpt = EXCLUDED.excerpt,
              content = EXCLUDED.content
          `;
          console.log(`Synced post: ${p.id} - ${p.title}`);
        }
        
        if (rowCount === 0) {
          console.log("Seeding initial posts to Postgres complete.");
        } else {
          console.log("Force sync of posts to Postgres complete.");
        }
      }
    } catch (err) {
      console.error("Postgres Init Error:", err);
    }
  }
}

// Ensure DB is initialized on every request in production
router.use(async (req, res, next) => {
  if (isPostgres) {
    await initDb();
  } else {
    seedSqlite();
  }
  next();
});

// Middleware for admin routes
const adminAuth = (req: any, res: any, next: any) => {
  const password = req.headers['x-admin-password'];
  const secret = process.env.ADMIN_PASSWORD || 'admin123';
  if (password === secret) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Notification Helper
async function sendNotification(subject: string, message: string) {
  const recipient = process.env.RESEND_TO_EMAIL || process.env.VITE_RESEND_TO_EMAIL || "anjanisp@gmail.com";
  const apiKey = getResendKey();
  
  console.log(`[NOTIFICATION ATTEMPT] Subject: ${subject}`);
  
  if (!apiKey) {
    const errorMsg = "RESEND_API_KEY is missing. Please set it in AI Studio Secrets OR use the Manual Override in the Admin panel.";
    console.error(`[NOTIFICATION ERROR] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.VITE_RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    console.log(`[RESEND] Sending from: ${fromEmail} to: ${recipient}`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: `Anjani Pandey Site <${fromEmail}>`,
        to: [recipient],
        subject: subject,
        text: message
      })
    });
    
    const resData = await response.json().catch(() => ({}));
    if (response.ok) {
      console.log("[RESEND] Success:", resData);
      return resData;
    } else {
      console.error("[RESEND] Error Response:", response.status, resData);
      // Provide more helpful error messages for common Resend issues
      let friendlyError = `Resend API error (${response.status})`;
      if (resData.message) friendlyError += `: ${resData.message}`;
      if (response.status === 403 && fromEmail === 'onboarding@resend.dev') {
        friendlyError += ". Note: onboarding@resend.dev can only send to your own registered email address (anjanisp@gmail.com) until you verify a domain.";
      }
      throw new Error(friendlyError);
    }
  } catch (err: any) {
    console.error("[RESEND] Fetch Error:", err);
    throw err;
  }
}

// Optimization Logic (SEO & Content)
async function runOptimization() {
  console.log(`[${new Date().toISOString()}] Running scheduled SEO optimization...`);
  try {
    let posts: any[] = [];
    if (isPostgres) {
      const { rows } = await sql`SELECT * FROM posts`;
      posts = rows;
    } else {
      posts = sqliteDb.prepare("SELECT * FROM posts").all();
    }

    for (const post of posts) {
      let content = post.content;
      let changed = false;

      // 1. Ensure structure (H2, H3)
      if (!content.includes("##")) {
        content = content.replace(/###/g, "##");
        changed = true;
      }

      // 2. Add Summary Block if missing
      if (!content.includes("## Summary")) {
        content += `\n\n## Summary\nThis article explores the critical transition from founder-led heroics to system-driven execution. By designing robust operating models, businesses can scale without compounding pressure on leadership.`;
        changed = true;
      }

      // 3. Add Decision Checklist if missing
      if (!content.includes("Decision Checklist")) {
        content += `\n\n## Decision Checklist\n- [ ] Identify current bottlenecks in decision-making\n- [ ] Map decision ownership to specific roles\n- [ ] Document the 'Operating Spine' of your core processes\n- [ ] Test system resilience by removing founder involvement from a single workflow`;
        changed = true;
      }

      // 4. Reinforce conceptual language
      if (!content.includes("Operating Spine")) {
        content = content.replace(/operating design/gi, "Operating Spine (operating design)");
        changed = true;
      }

      if (changed) {
        if (isPostgres) {
          await sql`UPDATE posts SET content = ${content} WHERE id = ${post.id}`;
        } else {
          sqliteDb.prepare("UPDATE posts SET content = ? WHERE id = ?").run(content, post.id);
        }
        console.log(`Optimized post: ${post.id}`);
      }
    }
    console.log("Optimization cycle complete.");
  } catch (err) {
    console.error("Optimization error:", err);
  }
}

// Run optimization every 24 hours
setInterval(runOptimization, 24 * 60 * 60 * 1000);
// Also run once on startup after a short delay
setTimeout(runOptimization, 10000);

// Sitemap Route
router.get("/sitemap.xml", async (req, res) => {
  try {
    let posts: any[] = [];
    if (isPostgres) {
      const { rows } = await sql`SELECT id, created_at FROM posts`;
      posts = rows;
    } else {
      posts = sqliteDb.prepare("SELECT id, created_at FROM posts").all();
    }

    const baseUrl = process.env.APP_URL || 'https://www.anjanipandey.com';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/book</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;

    posts.forEach(post => {
      xml += `
  <url>
    <loc>${baseUrl}/blog/${post.id}</loc>
    <lastmod>${new Date(post.created_at || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xml += `\n</urlset>`;
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});

router.post("/api/admin/test-email", adminAuth, async (req, res) => {
  try {
    await sendNotification("Test Email", "This is a test email to verify your Resend configuration.");
    res.json({ success: true, message: "Test email sent. Check your inbox (and spam folder)." });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to send test email", details: err.message });
  }
});

router.post("/api/admin/save-resend-key", adminAuth, (req, res) => {
  const { key } = req.body;
  if (!key || !key.startsWith('re_')) {
    return res.status(400).json({ error: "Invalid key format. Must start with 're_'" });
  }
  
  memoryKey = key;
  let savedToDisk = false;
  let diskError = null;

  try {
    fs.writeFileSync(KEY_FILE, key, 'utf8');
    savedToDisk = true;
  } catch (err: any) {
    diskError = err.message;
    // Try /tmp as fallback
    try {
      fs.writeFileSync(TMP_KEY_FILE, key, 'utf8');
      savedToDisk = true;
      diskError = null; // Cleared if fallback works
    } catch (e: any) {
      diskError = `Primary: ${err.message}, Fallback: ${e.message}`;
    }
  }

  if (savedToDisk) {
    res.json({ success: true, message: "Key saved successfully (Memory + Disk)." });
  } else {
    res.json({ 
      success: true, 
      message: "Key saved to Memory ONLY (Disk write failed). It will work until the next restart.",
      warning: diskError
    });
  }
});

router.post("/api/admin/restart-server", adminAuth, (req, res) => {
  console.log("[ADMIN] Manual server restart requested.");
  res.json({ success: true, message: "Server process exiting. The platform should restart it automatically." });
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// API Routes
router.get("/api/health", async (req, res) => {
  try {
    // Force re-initialization if requested
    const force = req.query.force === 'true';
    
    if (isPostgres) {
      await initDb(force);
    } else {
      seedSqlite();
    }
    
    const resendKey = getResendKey();
    const isResendConfigured = !!resendKey && resendKey.startsWith('re_');

    res.json({ 
      status: "ok", 
      dbType: isPostgres ? "Postgres" : "SQLite",
      initializedAt: new Date().toISOString(),
      resendConfigured: isResendConfigured,
      postgresConfigured: !!process.env.POSTGRES_URL,
      envCheck: {
        hasResendKey: !!resendKey,
        resendKeyLength: resendKey ? resendKey.length : 0,
        fromEmail: process.env.RESEND_FROM_EMAIL || process.env.VITE_RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        toEmail: process.env.RESEND_TO_EMAIL || process.env.VITE_RESEND_TO_EMAIL || 'anjanisp@gmail.com',
        allKeys: Object.keys(process.env).filter(k => 
          k.toUpperCase().includes('RESEND') || 
          k.toUpperCase().includes('ADMIN') ||
          k.toUpperCase().includes('POSTGRES') ||
          k.toUpperCase().includes('VITE_')
        ),
        usingOverrideFile: fs.existsSync(KEY_FILE) || fs.existsSync(TMP_KEY_FILE) || !!memoryKey
      }
    });
  } catch (err: any) {
    console.error("Health Check Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/debug", async (req, res) => {
  try {
    let postCount, commentCount;
    if (isPostgres) {
      const p = await sql`SELECT COUNT(*) as count FROM posts`;
      const c = await sql`SELECT COUNT(*) as count FROM comments`;
      postCount = p.rows[0];
      commentCount = c.rows[0];
    } else {
      postCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM posts").get();
      commentCount = sqliteDb.prepare("SELECT COUNT(*) as count FROM comments").get();
    }
    res.json({
      status: "ok",
      dbType: isPostgres ? "Postgres" : "SQLite",
      counts: { posts: postCount, comments: commentCount }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/posts", async (req, res) => {
  try {
    if (isPostgres) {
      const { rows } = await sql`SELECT * FROM posts ORDER BY created_at DESC`;
      res.json(rows);
    } else {
      const posts = sqliteDb.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
      res.json(posts);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.get("/api/posts/:id", async (req, res) => {
  try {
    if (isPostgres) {
      const { rows } = await sql`SELECT * FROM posts WHERE id = ${req.params.id}`;
      if (rows.length === 0) return res.status(404).json({ error: "Post not found" });
      res.json(rows[0]);
    } else {
      const post = sqliteDb.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

router.post("/api/admin/posts", adminAuth, async (req, res) => {
  const { title, date, category, excerpt, content } = req.body;
  const id = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  try {
    if (isPostgres) {
      await sql`
        INSERT INTO posts (id, title, date, category, excerpt, content)
        VALUES (${id}, ${title}, ${date}, ${category}, ${excerpt}, ${content})
      `;
      const { rows } = await sql`SELECT * FROM posts WHERE id = ${id}`;
      await sendNotification("New Blog Post Published", `Title: ${title}\nCategory: ${category}\nExcerpt: ${excerpt}`);
      res.status(201).json(rows[0]);
    } else {
      sqliteDb.prepare("INSERT INTO posts (id, title, date, category, excerpt, content) VALUES (?, ?, ?, ?, ?, ?)")
        .run(id, title, date, category, excerpt, content);
      const newPost = sqliteDb.prepare("SELECT * FROM posts WHERE id = ?").get(id);
      await sendNotification("New Blog Post Published", `Title: ${title}\nCategory: ${category}\nExcerpt: ${excerpt}`);
      res.status(201).json(newPost);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.get("/api/blog/:id/comments", async (req, res) => {
  try {
    if (isPostgres) {
      const { rows } = await sql`SELECT * FROM comments WHERE post_id = ${req.params.id} ORDER BY created_at ASC`;
      res.json(rows);
    } else {
      const comments = sqliteDb.prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC").all(req.params.id);
      res.json(comments);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.post("/api/blog/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { name, email, website, phone, comment, parent_id, is_admin } = req.body;
  try {
    if (isPostgres) {
      const { rows } = await sql`
        INSERT INTO comments (post_id, name, email, website, phone, comment, parent_id, is_admin)
        VALUES (${id}, ${name}, ${email}, ${website}, ${phone}, ${comment}, ${parent_id || null}, ${is_admin ? 1 : 0})
        RETURNING *
      `;
      const commentObj = rows[0];
      const type = is_admin ? "Admin Reply" : "New User Comment";
      await sendNotification(`${type} on ${id}`, `From: ${name} (${email})\nComment: ${comment}`);
      res.status(201).json(commentObj);
    } else {
      const info = sqliteDb.prepare("INSERT INTO comments (post_id, name, email, website, phone, comment, parent_id, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(id, name, email, website, phone, comment, parent_id || null, is_admin ? 1 : 0);
      const newComment = sqliteDb.prepare("SELECT * FROM comments WHERE id = ?").get(info.lastInsertRowid);
      const type = is_admin ? "Admin Reply" : "New User Comment";
      await sendNotification(`${type} on ${id}`, `From: ${name} (${email})\nComment: ${comment}`);
      res.status(201).json(newComment);
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/admin/comments", adminAuth, async (req, res) => {
  try {
    if (isPostgres) {
      const { rows } = await sql`
        SELECT c.*, p.title as post_title 
        FROM comments c 
        JOIN posts p ON c.post_id = p.id 
        ORDER BY c.created_at DESC
      `;
      res.json(rows);
    } else {
      const comments = sqliteDb.prepare(`
        SELECT c.*, p.title as post_title 
        FROM comments c 
        JOIN posts p ON c.post_id = p.id 
        ORDER BY c.created_at DESC
      `).all();
      res.json(comments);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.delete("/api/admin/comments/:id", adminAuth, async (req, res) => {
  try {
    if (isPostgres) {
      await sql`DELETE FROM comments WHERE id = ${req.params.id} OR parent_id = ${req.params.id}`;
    } else {
      sqliteDb.prepare("DELETE FROM comments WHERE id = ? OR parent_id = ?").run(req.params.id, req.params.id);
    }
    await sendNotification("Comment Deleted", `Comment ID ${req.params.id} and its replies have been removed.`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

router.post("/api/subscribe", async (req, res) => {
  const { email } = req.body;
  console.log("Subscription request received for:", email);
  if (!email) return res.status(400).json({ error: "Email is required" });
  
  try {
    if (isPostgres) {
      console.log("Attempting Postgres subscription insert...");
      await sql`INSERT INTO subscriptions (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`;
    } else {
      console.log("Attempting SQLite subscription insert...");
      // Create table if not exists for SQLite
      sqliteDb.exec("CREATE TABLE IF NOT EXISTS subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
      sqliteDb.prepare("INSERT OR IGNORE INTO subscriptions (email) VALUES (?)").run(email);
    }
    console.log("Subscription successful for:", email);
    await sendNotification("New Newsletter Subscriber", `Email: ${email}`);
    res.json({ success: true, message: "Subscribed successfully!" });
  } catch (err: any) {
    console.error("Subscription error:", err);
    res.status(500).json({ error: "Failed to subscribe", details: err.message });
  }
});

router.get("/api/admin/subscriptions", adminAuth, async (req, res) => {
  try {
    if (isPostgres) {
      const { rows } = await sql`SELECT * FROM subscriptions ORDER BY created_at DESC`;
      res.json(rows);
    } else {
      sqliteDb.exec("CREATE TABLE IF NOT EXISTS subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
      const rows = sqliteDb.prepare("SELECT * FROM subscriptions ORDER BY created_at DESC").all();
      res.json(rows);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

// For local development (only if run directly)
const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('api/index.ts');
if (isMain && process.env.NODE_ENV !== "production") {
  const PORT = 3000;
  const app = express();
  app.use(express.json());
  app.use(router);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API-only server running on http://localhost:${PORT}`);
  });
}

export default router;
