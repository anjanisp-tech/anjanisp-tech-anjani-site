// api/dbService.ts — Unified database service layer
// Eliminates Postgres/SQLite conditional branching from route handlers.
//
// Usage:
//   import * as db from '../dbService.js';
//   const rows = await db.query("SELECT * FROM posts WHERE category = ?", [cat]);
//   const row  = await db.queryOne("SELECT value FROM settings WHERE key = ?", [key]);
//   await db.execute("INSERT INTO audits (status, details) VALUES (?, ?)", [s, d]);
//
// For queries that genuinely differ between PG and SQLite (ILIKE, date funcs):
//   const rows = await db.queryDual(pgSql, sqliteSql, params);

// ── Lazy module loaders (safe for serverless cold starts) ─────────

let _dbModule: any = null;
async function loadDb() {
  if (!_dbModule) _dbModule = await import('./db.js');
  return _dbModule;
}

let _pgClient: any = null;
async function pg() {
  if (!_pgClient) {
    const mod = await import("@vercel/postgres");
    _pgClient = mod.sql;
  }
  return _pgClient;
}

// ── Parameter conversion ──────────────────────────────────────────
// Converts ?-style placeholders to $1, $2 etc. for Postgres
function toPg(sql: string): string {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

// ── Core query methods ────────────────────────────────────────────

/** Run a SELECT, return all rows. SQL uses ? placeholders. */
export async function query(sql: string, params: any[] = []): Promise<any[]> {
  const { isPostgres, getSqliteDb, useMockDb } = await loadDb();
  if (isPostgres) {
    const client = await pg();
    const result = await client.query(toPg(sql), params);
    return result.rows;
  }
  const db = getSqliteDb();
  if (db && !useMockDb) {
    return db.prepare(sql).all(...params);
  }
  return [];
}

/** Run a SELECT, return first row or null. */
export async function queryOne(sql: string, params: any[] = []): Promise<any | null> {
  const { isPostgres, getSqliteDb, useMockDb } = await loadDb();
  if (isPostgres) {
    const client = await pg();
    const result = await client.query(toPg(sql), params);
    return result.rows[0] ?? null;
  }
  const db = getSqliteDb();
  if (db && !useMockDb) {
    return db.prepare(sql).get(...params) ?? null;
  }
  return null;
}

/** Run INSERT/UPDATE/DELETE. Returns { rowCount, lastId }. */
export async function execute(sql: string, params: any[] = []): Promise<{ rowCount: number; lastId?: number | string }> {
  const { isPostgres, getSqliteDb, useMockDb } = await loadDb();
  if (isPostgres) {
    const client = await pg();
    const result = await client.query(toPg(sql), params);
    return { rowCount: result.rowCount ?? 0, lastId: result.rows?.[0]?.id };
  }
  const db = getSqliteDb();
  if (db && !useMockDb) {
    const info = db.prepare(sql).run(...params);
    return { rowCount: info.changes, lastId: info.lastInsertRowid };
  }
  return { rowCount: 0 };
}

/**
 * INSERT ... RETURNING * (Postgres) or INSERT + SELECT (SQLite).
 * The sql param should NOT include "RETURNING *" — it's appended for Postgres.
 */
export async function insertReturning(
  table: string,
  sql: string,
  params: any[],
  idColumn: string = 'id'
): Promise<any | null> {
  const { isPostgres, getSqliteDb, useMockDb } = await loadDb();
  if (isPostgres) {
    const client = await pg();
    const result = await client.query(toPg(sql) + ' RETURNING *', params);
    return result.rows[0] ?? null;
  }
  const db = getSqliteDb();
  if (db && !useMockDb) {
    const info = db.prepare(sql).run(...params);
    return db.prepare(`SELECT * FROM ${table} WHERE ${idColumn} = ?`).get(info.lastInsertRowid) ?? null;
  }
  return null;
}

// ── Dual-dialect methods (when PG and SQLite SQL genuinely differ) ─

/**
 * For queries where PG and SQLite SQL differ (ILIKE, date funcs, etc).
 * PG sql uses $1,$2 params. SQLite sql uses ? params.
 */
export async function queryDual(pgSql: string, sqliteSql: string, pgParams: any[] = [], sqliteParams?: any[]): Promise<any[]> {
  const { isPostgres, getSqliteDb, useMockDb } = await loadDb();
  if (isPostgres) {
    const client = await pg();
    const result = await client.query(pgSql, pgParams);
    return result.rows;
  }
  const db = getSqliteDb();
  if (db && !useMockDb) {
    return db.prepare(sqliteSql).all(...(sqliteParams ?? pgParams));
  }
  return [];
}

export async function queryOneDual(pgSql: string, sqliteSql: string, pgParams: any[] = [], sqliteParams?: any[]): Promise<any | null> {
  const { isPostgres, getSqliteDb, useMockDb } = await loadDb();
  if (isPostgres) {
    const client = await pg();
    const result = await client.query(pgSql, pgParams);
    return result.rows[0] ?? null;
  }
  const db = getSqliteDb();
  if (db && !useMockDb) {
    return db.prepare(sqliteSql).get(...(sqliteParams ?? pgParams)) ?? null;
  }
  return null;
}

export async function executeDual(pgSql: string, sqliteSql: string, pgParams: any[] = [], sqliteParams?: any[]): Promise<{ rowCount: number }> {
  const { isPostgres, getSqliteDb, useMockDb } = await loadDb();
  if (isPostgres) {
    const client = await pg();
    const result = await client.query(pgSql, pgParams);
    return { rowCount: result.rowCount ?? 0 };
  }
  const db = getSqliteDb();
  if (db && !useMockDb) {
    const info = db.prepare(sqliteSql).run(...(sqliteParams ?? pgParams));
    return { rowCount: info.changes };
  }
  return { rowCount: 0 };
}

// ── DDL & Schema ──────────────────────────────────────────────────

/** Execute raw DDL. No param conversion. Separate PG/SQLite strings. */
export async function execDDL(pgDdl: string, sqliteDdl?: string): Promise<void> {
  const { isPostgres, getSqliteDb, useMockDb } = await loadDb();
  if (isPostgres) {
    const client = await pg();
    await client.query(pgDdl);
  } else {
    const db = getSqliteDb();
    if (db && !useMockDb) {
      db.exec(sqliteDdl ?? pgDdl);
    }
  }
}

// ── Utility ───────────────────────────────────────────────────────

export type DbType = 'postgres' | 'sqlite' | 'mock';

export async function getDbType(): Promise<DbType> {
  const { isPostgres, getSqliteDb, useMockDb } = await loadDb();
  if (isPostgres) return 'postgres';
  const db = getSqliteDb();
  if (db && !useMockDb) return 'sqlite';
  return 'mock';
}

export async function isAvailable(): Promise<boolean> {
  return (await getDbType()) !== 'mock';
}

/** Health-check: run SELECT 1 against whichever DB is active. */
export async function healthCheck(): Promise<{ status: string; type: DbType }> {
  const type = await getDbType();
  if (type === 'postgres') {
    const client = await pg();
    await client.query('SELECT 1');
    return { status: 'ok', type };
  }
  if (type === 'sqlite') {
    const { getSqliteDb } = await loadDb();
    getSqliteDb().prepare('SELECT 1').get();
    return { status: 'ok', type };
  }
  return { status: 'warning', type: 'mock' };
}

/** Access initialPosts fallback data (for mock DB). */
export async function getInitialPosts(): Promise<any[]> {
  const { initialPosts } = await loadDb();
  return initialPosts || [];
}

// ── Database indexes ──────────────────────────────────────────────

const INDEXES: [string, string, string][] = [
  // posts
  ['idx_posts_category', 'posts', 'category'],
  ['idx_posts_created_at', 'posts', 'created_at'],
  // comments
  ['idx_comments_post_id', 'comments', 'post_id'],
  ['idx_comments_parent_id', 'comments', 'parent_id'],
  ['idx_comments_created_at', 'comments', 'created_at'],
  // subscriptions (email is UNIQUE → already indexed)
  ['idx_subscriptions_created_at', 'subscriptions', 'created_at'],
  // analytics
  ['idx_analytics_chatbot_created_at', 'analytics_chatbot', 'created_at'],
  ['idx_analytics_blog_post_id', 'analytics_blog', 'post_id'],
  ['idx_analytics_calc_created_at', 'analytics_calculator', 'created_at'],
  ['idx_analytics_calc_email', 'analytics_calculator', 'email'],
  // leads
  ['idx_chatbot_leads_created_at', 'chatbot_leads', 'created_at'],
  ['idx_chatbot_leads_email', 'chatbot_leads', 'email'],
  ['idx_resource_leads_created_at', 'resource_leads', 'created_at'],
  ['idx_resource_leads_email', 'resource_leads', 'email'],
  // audits
  ['idx_audits_created_at', 'audits', 'created_at'],
];

export async function ensureIndexes(): Promise<{ created: string[]; skipped: string[] }> {
  const created: string[] = [];
  const skipped: string[] = [];

  for (const [name, table, column] of INDEXES) {
    try {
      const ddl = `CREATE INDEX IF NOT EXISTS ${name} ON ${table} (${column})`;
      await execDDL(ddl, ddl);
      created.push(name);
    } catch (err: any) {
      // Table may not exist yet — skip silently
      skipped.push(`${name} (${err.message})`);
    }
  }
  console.log(`[DB] Indexes: ${created.length} ensured, ${skipped.length} skipped`);
  return { created, skipped };
}

// ── Init all tables (Postgres DDL) ────────────────────────────────

export async function initAllTables(): Promise<string> {
  const type = await getDbType();

  if (type === 'postgres') {
    const client = await pg();
    await client.query(`CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, date TEXT NOT NULL, category TEXT NOT NULL, excerpt TEXT NOT NULL, content TEXT NOT NULL, is_premium INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await client.query(`CREATE TABLE IF NOT EXISTS comments (id SERIAL PRIMARY KEY, post_id TEXT NOT NULL, parent_id INTEGER DEFAULT NULL, name TEXT NOT NULL, email TEXT NOT NULL, website TEXT, phone TEXT, comment TEXT NOT NULL, is_admin INTEGER DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await client.query(`CREATE TABLE IF NOT EXISTS subscriptions (id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await client.query(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await client.query(`CREATE TABLE IF NOT EXISTS audits (id SERIAL PRIMARY KEY, status TEXT NOT NULL, details TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await client.query(`CREATE TABLE IF NOT EXISTS analytics_chatbot (id SERIAL PRIMARY KEY, query TEXT NOT NULL, response TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await client.query(`CREATE TABLE IF NOT EXISTS analytics_blog (id SERIAL PRIMARY KEY, post_id TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await client.query(`CREATE TABLE IF NOT EXISTS analytics_calculator (id SERIAL PRIMARY KEY, currency TEXT NOT NULL, revenue REAL NOT NULL, team_size INTEGER NOT NULL, heroic_hours REAL NOT NULL, total_tax REAL NOT NULL, email TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await client.query(`CREATE TABLE IF NOT EXISTS chatbot_leads (id SERIAL PRIMARY KEY, email TEXT NOT NULL, query TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    await client.query(`CREATE TABLE IF NOT EXISTS resource_leads (id SERIAL PRIMARY KEY, email TEXT NOT NULL, resource_name TEXT, created_at TIMESTAMP DEFAULT NOW())`);
    // Migration: add is_premium if missing
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_premium INTEGER DEFAULT 0`);
    await ensureIndexes();
    return "Postgres tables initialized (with migrations and indexes)";
  }

  if (type === 'sqlite') {
    // SQLite tables are created in db.ts getSqliteDb(). Just ensure indexes.
    await ensureIndexes();
    return "SQLite tables are ready (indexes ensured)";
  }

  return "Database initialized (mock mode)";
}

// ── Ensure resource_leads table exists (called defensively) ───────

export async function ensureResourceLeads(): Promise<void> {
  await execDDL(
    `CREATE TABLE IF NOT EXISTS resource_leads (id SERIAL PRIMARY KEY, email TEXT NOT NULL, resource_name TEXT, created_at TIMESTAMP DEFAULT NOW())`,
    `CREATE TABLE IF NOT EXISTS resource_leads (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, resource_name TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`
  );
}
