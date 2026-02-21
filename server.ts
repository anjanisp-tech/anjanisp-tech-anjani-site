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
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    website TEXT,
    phone TEXT,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Ensure phone column exists for existing databases
try {
  db.exec("ALTER TABLE comments ADD COLUMN phone TEXT");
} catch (e) {
  // Column likely already exists
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/blog/:id/comments", (req, res) => {
    const { id } = req.params;
    const comments = db.prepare("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC").all(id);
    res.json(comments);
  });

  app.post("/api/blog/:id/comments", (req, res) => {
    const { id } = req.params;
    const { name, email, website, phone, comment } = req.body;

    console.log(`Received comment for post ${id}:`, { name, email, website, phone });

    if (!name || !email || !comment) {
      console.error("Validation failed: Missing mandatory fields");
      return res.status(400).json({ error: "Name, email, and comment are mandatory." });
    }

    try {
      const info = db.prepare("INSERT INTO comments (post_id, name, email, website, phone, comment) VALUES (?, ?, ?, ?, ?, ?)").run(id, name, email, website, phone, comment);
      
      const newComment = db.prepare("SELECT * FROM comments WHERE id = ?").get(info.lastInsertRowid);
      console.log("Comment saved successfully:", newComment.id);
      res.status(201).json(newComment);
    } catch (err) {
      console.error("Database error while saving comment:", err);
      res.status(500).json({ error: "Internal server error while saving comment." });
    }
  });

  // Vite middleware for development
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
