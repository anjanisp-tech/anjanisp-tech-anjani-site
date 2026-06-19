// One-time backfill of cover thumbnails for blog posts that have none.
// Token-free path: render the SAME branded card used by the live publish flow
// (api/_autocard.ts), write each as a static asset under public/og/, and point
// the post's img at the absolute URL so BOTH the writing-grid thumbnail and the
// og:image resolve.
//
// Two phases (so images are live before the DB references them):
//   1) generate files:  npx tsx scripts/backfill-static.mjs
//   2) after deploy:     npx tsx scripts/backfill-static.mjs --db
//
// Reads DB creds from .env.local (POSTGRES_URL / DATABASE_URL).

import { config } from 'dotenv';
import { createPool } from '@vercel/postgres';
import { __buildSvgForTest as buildSvg } from '../api/_autocard.ts';
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

config({ path: '.env.local' });

const SITE = 'https://www.anjanipandey.com';
const WRITE_DB = process.argv.includes('--db');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'og');

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;
if (!connectionString) { console.error('No POSTGRES_URL/DATABASE_URL in .env.local'); process.exit(1); }

const pool = createPool({ connectionString });

// In DB mode we only touch rows still missing an image; in generate mode we
// render for those same rows.
const { rows } = await pool.query(
  "SELECT id, title, category FROM posts WHERE COALESCE(img,'') = '' ORDER BY created_at"
);
console.log(`Posts missing a cover image: ${rows.length}  | mode: ${WRITE_DB ? 'DB UPDATE' : 'GENERATE FILES'}`);

if (!WRITE_DB) mkdirSync(OUT_DIR, { recursive: true });

let ok = 0, fail = 0;
for (const r of rows) {
  try {
    const url = `${SITE}/og/${r.id}.png`;
    if (WRITE_DB) {
      await pool.query('UPDATE posts SET img = $1 WHERE id = $2', [url, r.id]);
      console.log('  DB  ', r.id, '->', url);
    } else {
      const svg = buildSvg({ kind: 'blog', title: r.title, category: r.category, slug: r.id });
      const png = await sharp(Buffer.from(svg)).png().toBuffer();
      writeFileSync(path.join(OUT_DIR, `${r.id}.png`), png);
      console.log('  PNG ', `public/og/${r.id}.png`, `(${png.length}b)`);
    }
    ok++;
  } catch (e) {
    console.log('  FAIL', r.id, e?.message || e);
    fail++;
  }
}
console.log(`\nDone. ok=${ok} fail=${fail}`);
await pool.end();
