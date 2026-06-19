// Regenerate branded ABSTRACT AI cover thumbnails for every blog post and write
// them over public/og/<id>.png (the DB img already points there, so no DB
// change is needed). Uses the SAME generator as the live publish flow
// (api/_autocard.ts -> generateCardBuffer), so backfilled and newly-published
// covers share one identical, teal-locked style.
//
// Resume-safe: completed ids are recorded in .ai-thumbnails-done.json; re-run to
// continue if interrupted. Run:   npx tsx scripts/backfill-ai-thumbnails.mjs
// Force a full regen:             npx tsx scripts/backfill-ai-thumbnails.mjs --fresh

import { config } from 'dotenv'; config({ path: '.env.local' });
import { createPool } from '@vercel/postgres';
import { generateCardBuffer } from '../api/_autocard.ts';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';

const pool = createPool({ connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL });
const OUT = 'public/og';
mkdirSync(OUT, { recursive: true });
const DONE_FILE = '.ai-thumbnails-done.json';
let done = (!process.argv.includes('--fresh') && existsSync(DONE_FILE))
  ? JSON.parse(readFileSync(DONE_FILE, 'utf8')) : [];

const { rows } = await pool.query("SELECT id, title, excerpt, category FROM posts ORDER BY created_at");
console.log(`posts: ${rows.length} | already done: ${done.length}`);

let ok = 0, fail = 0;
for (const r of rows) {
  if (done.includes(r.id)) continue;
  const buf = await generateCardBuffer({ title: r.title, category: r.category, summary: r.excerpt });
  if (!buf) { console.log('FAIL', r.id); fail++; continue; }
  writeFileSync(`${OUT}/${r.id}.png`, buf);
  done.push(r.id);
  writeFileSync(DONE_FILE, JSON.stringify(done));
  console.log('OK', r.id, `(${(buf.length / 1024).toFixed(0)}KB)`);
  ok++;
}
console.log(`\nDone. ok=${ok} fail=${fail} total_done=${done.length}/${rows.length}`);
await pool.end();
