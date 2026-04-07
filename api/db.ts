import path from "path";
import { createRequire } from "module";

const requireInEsm = createRequire(import.meta.url);

export const sanitizeUrl = (url: string | undefined) => {
  if (!url) return url;
  let clean = url.trim();
  if (clean.startsWith('POSTGRES_URL=')) {
    clean = clean.substring('POSTGRES_URL='.length);
  } else if (clean.startsWith('DATABASE_URL=')) {
    clean = clean.substring('DATABASE_URL='.length);
  }
  clean = clean.replace(/^["']|["']$/g, '');
  if (clean.includes('YOUR_') || clean.includes('<') || clean.length < 10) {
    return undefined;
  }
  return clean;
};

if (process.env.POSTGRES_URL) process.env.POSTGRES_URL = sanitizeUrl(process.env.POSTGRES_URL);
if (process.env.DATABASE_URL) process.env.DATABASE_URL = sanitizeUrl(process.env.DATABASE_URL);

export const isPostgres = !!(
  process.env.POSTGRES_URL && 
  process.env.POSTGRES_URL.length > 30 && 
  process.env.POSTGRES_URL.includes('://') && 
  !process.env.POSTGRES_URL.includes('TODO_') &&
  !process.env.POSTGRES_URL.includes('placeholder')
);

let sqliteDb: any = null;
let useMockDb = false;

export function getSqliteDb() {
  if (sqliteDb) return sqliteDb;
  if (useMockDb) return null;

  try {
    const isVercel = !!process.env.VERCEL || !!process.env.VERCEL_URL;
    if (isVercel && !isPostgres) {
      console.warn("[DB INIT] Vercel detected without Postgres. Using Mock DB.");
      useMockDb = true;
      return null;
    }

    console.log("[DB INIT] Initializing SQLite...");
    const Database = requireInEsm("better-sqlite3");
    const dbPath = isVercel ? "/tmp/blog.db" : path.join(process.cwd(), "blog.db");
    
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
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    return sqliteDb;
  } catch (err: any) {
    console.error("SQLite Init Error:", err.message);
    useMockDb = true;
    return null;
  }
}

export const initialPosts = [
  {
    id: "founder-overload-map",
    title: "THE FOUNDER OVERLOAD MAP",
    date: "2024-03-25",
    category: "Scaling Strategy",
    excerpt: "The 25-disease taxonomy of founder-led businesses and how to identify structural gaps.",
    content: "Full content of the Founder Overload Map..."
  },
  {
    id: "operating-spine-methodology",
    title: "THE OPERATING SPINE",
    date: "2024-03-20",
    category: "Operations",
    excerpt: "How to implement the 'Operating Spine' methodology to ensure systems outlast heroics.",
    content: "Full content of the Operating Spine methodology..."
  }
];

export function seedSqlite() {
  const db = getSqliteDb();
  if (!db) return;
  
  try {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO posts (id, title, date, category, excerpt, content) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const post of initialPosts) {
      insert.run(post.id, post.title, post.date, post.category, post.excerpt, post.content);
    }
    console.log("[DB SEED] SQLite seeded successfully.");
  } catch (err) {
    console.error("[DB SEED] SQLite seed failed:", err);
  }
}

export { sqliteDb, useMockDb };
