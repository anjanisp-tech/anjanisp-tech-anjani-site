import express from "express";
import { getUtils, isValidEmail } from "../helpers.js";
import * as db from "../dbService.js";

const router = express.Router();

// Blog Posts
router.get("/posts", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = (req.query.search as string) || "";
    const category = (req.query.category as string) || "";

    let posts: any[];
    if (search && category) {
      posts = await db.queryDual(
        `SELECT * FROM posts WHERE category = $1 AND (title ILIKE $2 OR content ILIKE $3) ORDER BY created_at DESC LIMIT $4 OFFSET $5`,
        `SELECT * FROM posts WHERE category = ? AND (title LIKE ? OR content LIKE ?) ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [category, `%${search}%`, `%${search}%`, limit, offset]
      );
    } else if (search) {
      posts = await db.queryDual(
        `SELECT * FROM posts WHERE (title ILIKE $1 OR content ILIKE $2) ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
        `SELECT * FROM posts WHERE (title LIKE ? OR content LIKE ?) ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [`%${search}%`, `%${search}%`, limit, offset]
      );
    } else if (category) {
      posts = await db.query(
        "SELECT * FROM posts WHERE category = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [category, limit, offset]
      );
    } else {
      posts = await db.query(
        "SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [limit, offset]
      );
    }

    // Fallback to initial posts if DB returned nothing (mock mode)
    if (posts.length === 0 && !search && !category) {
      const initialPosts = await db.getInitialPosts();
      let filtered = initialPosts;
      if (category) {
        filtered = filtered.filter((p: any) => p.category === category);
      }
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter((p: any) => p.title.toLowerCase().includes(s) || p.content.toLowerCase().includes(s));
      }
      return res.json(filtered.slice(offset, offset + limit));
    }

    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ status: "error", error: "Failed to fetch posts", details: err.message });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const rows = await db.query("SELECT DISTINCT category FROM posts WHERE category IS NOT NULL AND category != ''");

    if (rows.length > 0) {
      return res.json(rows.map((r: any) => r.category));
    }

    // Fallback to initial posts
    const initialPosts = await db.getInitialPosts();
    const categories = Array.from(new Set(initialPosts.map((p: any) => p.category))).filter(Boolean);
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch categories", details: err.message });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    // Log view to analytics (fire-and-forget)
    db.execute("INSERT INTO analytics_blog (post_id) VALUES (?)", [postId])
      .catch(logErr => console.error("[ANALYTICS LOG ERROR] Blog View:", logErr));

    // Try DB first
    const post = await db.queryOne("SELECT * FROM posts WHERE id = ?", [postId]);
    if (post) return res.json(post);

    // Fallback to initial posts
    const initialPosts = await db.getInitialPosts();
    const fallback = initialPosts.find((p: any) => p.id === postId);
    if (!fallback) return res.status(404).json({ error: "Post not found" });
    res.json(fallback);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch post", details: err.message });
  }
});

// Comments
router.get("/blog/:id/comments", async (req, res) => {
  try {
    const rows = await db.query(
      "SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC",
      [req.params.id]
    );
    res.json(rows);
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
    const { sendNotification } = await getUtils();

    let commentObj;
    const dbType = await db.getDbType();

    if (dbType === 'postgres') {
      const rows = await db.queryDual(
        `INSERT INTO comments (post_id, name, email, website, phone, comment, parent_id, is_admin)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        `SELECT 1`, // unused
        [id, name, email, website || null, phone || null, comment, parent_id || null, is_admin ? 1 : 0]
      );
      commentObj = rows[0];
    } else if (dbType === 'mock') {
      commentObj = { id: Date.now(), post_id: id, name, email, website, phone, comment, parent_id, is_admin: is_admin ? 1 : 0, created_at: new Date().toISOString() };
    } else {
      commentObj = await db.insertReturning(
        'comments',
        "INSERT INTO comments (post_id, name, email, website, phone, comment, parent_id, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [id, name, email, website || null, phone || null, comment, parent_id || null, is_admin ? 1 : 0]
      );
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
    const { sendNotification } = await getUtils();

    await db.executeDual(
      `INSERT INTO subscriptions (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
      `INSERT OR IGNORE INTO subscriptions (email) VALUES (?)`,
      [email]
    );

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
    await db.execute(
      "INSERT INTO analytics_calculator (currency, revenue, team_size, heroic_hours, total_tax, email) VALUES (?, ?, ?, ?, ?, ?)",
      [currency, revenue, teamSize, heroicHours, totalTax, email || null]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to log calculator results", details: err.message });
  }
});

export default router;
