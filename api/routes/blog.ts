import express from "express";
import { getDb, getUtils, isValidEmail } from "../helpers.js";

const router = express.Router();

// Blog Posts
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
      filtered = filtered.filter((p: any) => p.category === category);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((p: any) => p.title.toLowerCase().includes(s) || p.content.toLowerCase().includes(s));
    }
    res.json(filtered.slice(offset, offset + limit));
  } catch (err: any) {
    res.status(500).json({ status: "error", error: "Failed to fetch posts", details: err.message });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const { isPostgres, getSqliteDb, useMockDb, initialPosts } = await getDb();

    if (isPostgres) {
      const { sql } = await import("@vercel/postgres");
      const { rows } = await sql`SELECT DISTINCT category FROM posts WHERE category IS NOT NULL AND category != ''`;
      return res.json(rows.map((r: any) => r.category));
    }

    const db = getSqliteDb();
    if (db && !useMockDb) {
      const rows = db.prepare("SELECT DISTINCT category FROM posts WHERE category IS NOT NULL AND category != ''").all();
      return res.json(rows.map((r: any) => r.category));
    }

    const categories = Array.from(new Set(initialPosts.map((p: any) => p.category))).filter(Boolean);
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
    const post = initialPosts.find((p: any) => p.id === postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch post", details: err.message });
  }
});

// Comments
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
  if (!name || !email || !comment) return res.status(400).json({ error: "Name, email, and comment are required" });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format" });
  if (comment.length > 5000) return res.status(400).json({ error: "Comment too long (max 5000 characters)" });
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

// Subscribe
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email format" });
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

// Calculator Analytics
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

export default router;
