// api/_ogHealth.ts — the card watchdog (served via api/index.ts, see
// routes/public.ts). Thumbnail self-healing plan, Phase 2, 2026-11-02.
//
//   GET /api/og-health?token=...   (token = OG_HEALTH_TOKEN, else HEALTH_TOKEN)
//
// Lists EVERY post and case study straight from the database (no list cap),
// fetches each one's share image from THIS deployment's /api/og route and checks
// it: 200, an image, over the byte floor, 1200x630, not degraded.
//
//   data class  -> a cover or upload at the wrong size. Fix the picture, not the
//                  code. Counted in selfHealed-style lists, never raised.
//   code class  -> 5xx, fonts missing, drawing failed. Goes in `escalations`
//                  with cause and fix. This is the only thing that should page Anjani.
//
// `needsSketch` lists pieces showing the drawn title card because they have
// neither a sketch nor cover art: the automatic sketch job reads it.
// Read-only. Writes nothing, deletes nothing.

import * as db from './dbService.js';
import { cardFontsPresent } from './_cardRender.js';

const MIN_BYTES = 4_000;
const CONCURRENCY = 6;

type Item = { kind: 'blog' | 'case'; slug: string };

async function listAll(): Promise<Item[]> {
  const items: Item[] = [];
  try { (await db.query('SELECT id FROM posts')).forEach((r: any) => items.push({ kind: 'blog', slug: r.id })); } catch { /* none */ }
  try { (await db.query('SELECT slug FROM case_studies')).forEach((r: any) => items.push({ kind: 'case', slug: r.slug })); } catch { /* none */ }
  return items;
}

async function check(origin: string, it: Item) {
  const url = `${origin}/api/og/${it.kind}/${encodeURIComponent(it.slug)}`;
  try {
    const r = await fetch(url, { redirect: 'manual', headers: { 'cache-control': 'no-cache' } });
    const type = String(r.headers.get('content-type') || '');
    const degraded = r.headers.get('x-og-degraded');
    const source = r.headers.get('x-og-source') || '';
    if (r.status !== 200) return { ...it, ok: false, cls: 'code', cause: `route answered ${r.status}${degraded ? ` (${degraded})` : ''}` };
    const buf = Buffer.from(await r.arrayBuffer());
    if (!type.startsWith('image/')) return { ...it, ok: false, cls: 'code', cause: `content-type ${type}` };
    if (buf.length < MIN_BYTES) return { ...it, ok: false, cls: 'code', cause: `only ${buf.length} bytes` };
    if (degraded) return { ...it, ok: false, cls: 'code', cause: `degraded: ${degraded}` };
    const sharp = (await import('sharp')).default;
    const meta = await sharp(buf).metadata();
    if (meta.width !== 1200 || meta.height !== 630) {
      return { ...it, ok: false, cls: source === 'floor' ? 'code' : 'data', source, cause: `size ${meta.width}x${meta.height} (${source})` };
    }
    return { ...it, ok: true, source };
  } catch (e: any) {
    return { ...it, ok: false, cls: 'code', cause: `fetch failed: ${e?.message || e}` };
  }
}

const FIXES: Record<string, string> = {
  'degraded: font-missing': 'Card fonts did not load. Check api/_cardFonts.ts is imported by api/_cardRender.ts and the base64 strings are intact, then redeploy.',
  'degraded: text-render-failed': 'A title produced a bad glyph coordinate. Check the title for unusual characters.',
  'degraded: raster-failed': 'sharp failed in the function. Check sharp is in dependencies and the function runs on Node, then redeploy.',
};

export default async function handler(req: any, res: any) {
  const token = process.env.OG_HEALTH_TOKEN || process.env.HEALTH_TOKEN || '';
  if (!token) { res.status(503).json({ error: 'og-health disabled: set OG_HEALTH_TOKEN or HEALTH_TOKEN.' }); return; }
  if (((req.query && req.query.token) || '') !== token) { res.status(401).json({ error: 'Unauthorized.' }); return; }

  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'www.anjanipandey.com').split(',')[0];
  const proto = String(req.headers['x-forwarded-proto'] || (/^(localhost|127\.)/.test(host) ? 'http' : 'https')).split(',')[0];
  const origin = `${proto}://${host}`;

  const items = await listAll();
  const results: any[] = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    results.push(...(await Promise.all(items.slice(i, i + CONCURRENCY).map((it) => check(origin, it)))));
  }

  const misses = results.filter((r) => !r.ok);
  const escalations = misses.filter((m) => m.cls === 'code').map((m) => ({
    kind: m.kind, slug: m.slug, cause: m.cause,
    fix: FIXES[m.cause] || `Open /api/og/${m.kind}/${m.slug} and the function logs; this is a code or deploy problem.`,
  }));
  if (!items.length) escalations.push({ kind: 'blog', slug: '*', cause: 'no posts listed', fix: 'The database did not answer. Check POSTGRES_URL / DATABASE_URL on Vercel.' });
  const fontPresent = cardFontsPresent();
  if (!fontPresent && !escalations.some((e) => e.cause.includes('font-missing'))) {
    escalations.unshift({ kind: 'blog', slug: '*', cause: 'degraded: font-missing', fix: FIXES['degraded: font-missing'] });
  }
  const count = (s: string) => results.filter((r) => r.ok && r.source === s).length;

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    site: 'anjanipandey',
    checkedAt: new Date().toISOString(),
    origin,
    checked: results.length,
    ok: results.filter((r) => r.ok).length,
    bespoke: count('bespoke'), sketch: count('sketch'), cover: count('cover'), floor: count('floor'),
    dataMisses: misses.filter((m) => m.cls === 'data').map((m) => ({ kind: m.kind, slug: m.slug, cause: m.cause })),
    escalations,
    fontPresent,
    needsSketch: results.filter((r) => r.ok && r.source === 'floor').map((r) => `${r.kind}/${r.slug}`),
  });
}
