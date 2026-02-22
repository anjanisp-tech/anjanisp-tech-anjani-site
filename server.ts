import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.NODE_ENV === "production" 
  ? path.join("/tmp", "blog.db") 
  : path.join(__dirname, "blog.db");

console.log(`Initializing database at: ${dbPath}`);
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
  );
`);

// Migration: Ensure columns exist
try { db.exec("ALTER TABLE comments ADD COLUMN phone TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE comments ADD COLUMN parent_id INTEGER DEFAULT NULL"); } catch (e) {}
try { db.exec("ALTER TABLE comments ADD COLUMN is_admin INTEGER DEFAULT 0"); } catch (e) {}

// Seed initial posts if empty
const existingPosts = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
if (existingPosts.count === 0) {
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
      title: "SYSTEMS OUTLAST HEROICS",
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

  const insertPost = db.prepare("INSERT INTO posts (id, title, date, category, excerpt, content) VALUES (?, ?, ?, ?, ?, ?)");
  initialPosts.forEach(p => insertPost.run(p.id, p.title, p.date, p.category, p.excerpt, p.content));
}

const app = express();
app.use(express.json());

// --- API Routes ---

// Middleware for admin routes
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const password = req.headers['x-admin-password'];
  const secret = process.env.ADMIN_PASSWORD || 'admin123';
  if (password === secret) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Posts
app.get("/api/posts", (req, res) => {
  const posts = db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
  res.json(posts);
});

app.get("/api/posts/:id", (req, res) => {
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

app.post("/api/admin/posts", adminAuth, (req, res) => {
  const { title, date, category, excerpt, content } = req.body;
  if (!title || !date || !category || !excerpt || !content) {
    return res.status(400).json({ error: "All fields are mandatory." });
  }
  const id = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  
  try {
    db.prepare("INSERT INTO posts (id, title, date, category, excerpt, content) VALUES (?, ?, ?, ?, ?, ?)")
      .run(id, title, date, category, excerpt, content);
    const newPost = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Failed to create post. ID might already exist." });
  }
});

// Comments
app.get("/api/blog/:id/comments", (req, res) => {
  const { id } = req.params;
  const comments = db.prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC").all(id);
  res.json(comments);
});

app.post("/api/blog/:id/comments", (req, res) => {
  const { id } = req.params;
  const { name, email, website, phone, comment, parent_id, is_admin } = req.body;

  if (!name || !email || !comment) {
    return res.status(400).json({ error: "Name, email, and comment are mandatory." });
  }

  try {
    const info = db.prepare("INSERT INTO comments (post_id, name, email, website, phone, comment, parent_id, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, name, email, website, phone, comment, parent_id || null, is_admin ? 1 : 0);
    
    const newComment = db.prepare("SELECT * FROM comments WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(newComment);
  } catch (err) {
    console.error("Database error while saving comment:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Admin Comments Management
app.get("/api/admin/comments", adminAuth, (req, res) => {
  try {
    const comments = db.prepare(`
      SELECT c.*, p.title as post_title 
      FROM comments c 
      JOIN posts p ON c.post_id = p.id 
      ORDER BY c.created_at DESC
    `).all();
    res.json(comments);
  } catch (err) {
    console.error("Error fetching admin comments:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.delete("/api/admin/comments/:id", adminAuth, (req, res) => {
  try {
    db.prepare("DELETE FROM comments WHERE id = ? OR parent_id = ?").run(req.params.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment." });
  }
});

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
}

setupVite();

if (process.env.NODE_ENV !== "production") {
  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
