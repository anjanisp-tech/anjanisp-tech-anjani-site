/**
 * Build-time content sync for anjanipandey.com.
 *
 * Regenerates src/data/blogData.ts from the live Neon `posts` table so the
 * pre-render step covers EVERY published post. BlogPostDetail seeds its initial
 * state from this bundled data (then refetches from /api/posts/:id on the
 * client), so a post missing here pre-renders as an empty shell to crawlers and
 * social scrapers.
 *
 * FAIL-SAFE: missing DB URL, unreachable DB, query error, or 0 rows -> the
 * committed src/data/blogData.ts is left untouched and the script still exits 0.
 * It never overwrites good content with an empty array, and never breaks the build.
 *
 * Runs first in `npm run build`.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Local dev/build: load .env.local if present. On Vercel, env is injected and
// there is no .env.local, so this is a harmless no-op.
try {
  const { config } = await import('dotenv');
  config({ path: '.env.local' });
} catch { /* dotenv optional */ }

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'src', 'data', 'blogData.ts');
const CS_OUT = path.resolve(__dirname, '..', 'src', 'data', 'caseStudyData.ts');

const HEADER = `// AUTO-GENERATED at build time by scripts/sync-content.mjs from the Neon DB.
// Do not edit by hand; edits are overwritten on the next build. Posts are
// authored in the /admin CMS. This file is the pre-render seed + offline fallback.
export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  img?: string;
  is_premium?: number;
}

export const blogPosts: BlogPost[] = `;

async function main() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) {
    console.warn('[sync-content] no POSTGRES_URL/DATABASE_URL — keeping committed blogData.ts.');
    return;
  }
  let neon;
  try {
    ({ neon } = await import('@neondatabase/serverless'));
  } catch (e) {
    console.warn('[sync-content] @neondatabase/serverless unavailable — keeping blogData.ts.', e?.message);
    return;
  }
  const sql = neon(url);
  try {
    const rows = await sql`SELECT id, title, date, category, excerpt, content, img, is_premium FROM posts ORDER BY created_at DESC`;
    if (Array.isArray(rows) && rows.length > 0) {
      const mapped = rows.map((r) => ({
        id: r.id,
        title: r.title ?? '',
        date: r.date ?? '',
        category: r.category ?? '',
        excerpt: r.excerpt ?? '',
        content: r.content ?? '',
        img: r.img ?? '',
        is_premium: r.is_premium ? 1 : 0,
      }));
      writeFileSync(OUT, HEADER + JSON.stringify(mapped, null, 2) + ';\n', 'utf-8');
      console.log(`[sync-content] blogData.ts regenerated: ${mapped.length} posts.`);
    } else {
      console.warn('[sync-content] posts query returned 0 rows — keeping committed blogData.ts.');
    }
  } catch (e) {
    console.warn('[sync-content] posts sync failed — keeping committed blogData.ts.', e?.message);
  }
  // Case studies: same fail-safe rule. An empty table is a real state here (the lane
  // is new), so 0 rows writes an empty list rather than being treated as a failure;
  // a query ERROR keeps the committed file.
  try {
    const cs = await sql`SELECT slug, title, excerpt, img, category, client, period, results, content FROM case_studies ORDER BY created_at DESC`;
    if (Array.isArray(cs)) {
      const mapped = cs.map((r) => {
        let results = r.results;
        if (typeof results === 'string') { try { results = JSON.parse(results); } catch { results = []; } }
        return {
          slug: r.slug, title: r.title ?? '', excerpt: r.excerpt ?? '', img: r.img ?? '',
          category: r.category ?? '', client: r.client ?? '', period: r.period ?? '',
          results: Array.isArray(results) ? results.map(String) : [], content: r.content ?? '',
        };
      });
      const head = readFileSync(CS_OUT, 'utf-8').split('export const caseStudies')[0];
      writeFileSync(CS_OUT, head + 'export const caseStudies: CaseStudySeed[] = ' + JSON.stringify(mapped, null, 2) + ';\n', 'utf-8');
      console.log(`[sync-content] caseStudyData.ts regenerated: ${mapped.length} case studies.`);
    }
  } catch (e) {
    console.warn('[sync-content] case study sync failed — keeping committed caseStudyData.ts.', e?.message);
  }
}

main()
  .catch((e) => console.warn('[sync-content] unexpected error — keeping blogData.ts.', e?.message))
  .finally(() => process.exit(0));
