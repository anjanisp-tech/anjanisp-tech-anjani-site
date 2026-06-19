// One-time backfill: generate branded cover cards for blog posts that have no
// cover image, and write the resulting URL back to the DB. Uses the SAME card
// generator as the live publish flow (api/_autocard.ts) so backfilled cards
// match newly-published ones exactly.
//
// Run (Blob mode — needs BLOB_READ_WRITE_TOKEN + POSTGRES_URL in env):
//   node --env-file=.env.local --import tsx scripts/backfill-thumbnails.mjs --dry
//   node --env-file=.env.local --import tsx scripts/backfill-thumbnails.mjs
//
// --dry  : generate + upload cards but DON'T write the DB (preview URLs).

import { createPool } from '@vercel/postgres';
import { generateCardUrl } from '../api/_autocard.ts';

const DRY = process.argv.includes('--dry');

const connectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error('No POSTGRES_URL / DATABASE_URL in env. Did you pass --env-file=.env.local ?');
  process.exit(1);
}
if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
  console.error('No BLOB_READ_WRITE_TOKEN in env — cards cannot be uploaded. Aborting.');
  process.exit(1);
}

const pool = createPool({ connectionString });

const { rows } = await pool.query(
  "SELECT id, title, category FROM posts WHERE COALESCE(img,'') = '' ORDER BY created_at"
);
console.log(`Posts missing a cover image: ${rows.length}${DRY ? '  (DRY RUN)' : ''}`);

let ok = 0, fail = 0;
for (const r of rows) {
  try {
    const url = await generateCardUrl({ kind: 'blog', title: r.title, category: r.category, slug: r.id });
    if (!url) { console.log('  FAIL (no url):', r.id); fail++; continue; }
    if (!DRY) await pool.query('UPDATE posts SET img = $1 WHERE id = $2', [url, r.id]);
    console.log(`  ${DRY ? '[dry] ' : ''}OK  ${r.id}\n       -> ${url}`);
    ok++;
  } catch (e) {
    console.log('  FAIL', r.id, e?.message || e);
    fail++;
  }
}
console.log(`\nDone. ok=${ok} fail=${fail}`);
await pool.end();
