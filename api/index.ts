import express from "express";
import { sql } from "@vercel/postgres";
import Database from "better-sqlite3";
import path from "path";

const router = express.Router();
router.use(express.json());

const dbInitializedAt = new Date().toISOString();
const isPostgres = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
console.log("Database configuration detected:", isPostgres ? "Postgres" : "SQLite");
if (isPostgres) {
  console.log("Postgres URL present:", !!process.env.POSTGRES_URL);
  console.log("Database URL present:", !!process.env.DATABASE_URL);
}

// SQLite Fallback (for local/preview without Postgres)
let sqliteDb: any;
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
}

async function initDb() {
  if (isPostgres) {
    try {
      console.log("Initializing Postgres tables...");
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
      if (rowCount === 0) {
        console.log("Seeding initial posts to Postgres...");
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
          await sql`
            INSERT INTO posts (id, title, date, category, excerpt, content)
            VALUES (${p.id}, ${p.title}, ${p.date}, ${p.category}, ${p.excerpt}, ${p.content})
            ON CONFLICT (id) DO NOTHING
          `;
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
  const recipient = "contact@anjanipandey.com";
  console.log(`[NOTIFICATION] To: ${recipient} | Subject: ${subject}`);
  console.log(`Message: ${message}`);
  
  // In a real app, you would use a service like Resend or SendGrid here.
  // Example with Resend:
  /*
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Anjani Pandey Site <notifications@anjanipandey.com>',
          to: [recipient],
          subject: subject,
          text: message
        })
      });
    } catch (err) {
      console.error("Failed to send email via Resend:", err);
    }
  }
  */
}

// API Routes
router.get("/api/health", async (req, res) => {
  await initDb();
  res.json({ 
    status: "ok", 
    dbType: isPostgres ? "Postgres" : "SQLite",
    initializedAt: dbInitializedAt
  });
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
