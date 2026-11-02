// api/_og.ts — the per-post share image (served via api/index.ts, see
// routes/public.ts). Thumbnail self-healing plan, Phase 2, 2026-11-02. Reached as
// /api/og/<kind>/<slug>, kind = blog | case. Ported from metmov.com's api/_og.ts.
//
// THE CONTRACT. Always answers 200 with an image, in this order:
//   1. Resolve the slug (posts.id or case_studies.slug). An unknown slug still
//      gets a branded card, never a broken image.
//   2. An image uploaded to blob at cms/hero/<kind>-<slug>.png wins.
//   3. Else the post's own cover art (its img field), if it loads and is an image.
//   4. Else the idea sketch shipped in public/hero (src/data/heroImages.ts).
//      (Same order as the pages: cover art first, sketch second. See src/lib/cardImage.ts.)
//   5. Else the title card drawn now from the post's own title (font-guarded).
//   6. If even drawing fails (a deploy problem), redirect to /og-image.png.
//
// Nothing here generates art or writes anything. The old Gemini + Imagen card
// maker (api/_autocard.ts) broke around 2026-08-20 and left ~20 pieces blank; it
// is retired to archive/ and is not called anywhere.

import * as db from './dbService.js';
import { renderCardPng } from './_cardRender.js';
import { heroPath } from '../src/data/heroImages.js';

const BLOB_BASE = (process.env.CARD_BLOB_BASE || 'https://ynv4vjt6xorv3jqp.public.blob.vercel-storage.com').replace(/\/$/, '');
const MIN_BYTES = 4_000;
const CACHE = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';

export type Kind = 'blog' | 'case';

export function cleanSlug(raw: unknown): string {
  return String(raw || '').toLowerCase().replace(/\.png$/, '').replace(/[^a-z0-9-]/g, '').slice(0, 200);
}

export async function resolveEntry(kind: Kind, slug: string): Promise<{ title: string; category: string; img: string; known: boolean }> {
  try {
    const row = kind === 'case'
      ? await db.queryOne('SELECT title, category, img FROM case_studies WHERE slug = ?', [slug])
      : await db.queryOne('SELECT title, category, img FROM posts WHERE id = ?', [slug]);
    if (row?.title) return { title: row.title, category: row.category || '', img: row.img || '', known: true };
  } catch { /* fall through */ }
  return { title: 'Operating spines for founder-led businesses', category: '', img: '', known: false };
}

function originOf(headers: any): string {
  const host = String(headers?.['x-forwarded-host'] || headers?.host || 'www.anjanipandey.com').split(',')[0];
  const proto = String(headers?.['x-forwarded-proto'] || (/^(localhost|127\.)/.test(host) ? 'http' : 'https')).split(',')[0];
  return `${proto}://${host}`;
}

// A missing or bad image is not an error. It just means "try the next layer".
async function fetchImage(url: string): Promise<{ buf: Buffer; type: string } | null> {
  if (!url) return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 2500);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    const type = String(r.headers.get('content-type') || '');
    if (!r.ok || !type.startsWith('image/')) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    return buf.length >= MIN_BYTES ? { buf, type } : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: any, res: any) {
  const kind: Kind = req.query?.kind === 'case' ? 'case' : 'blog';
  const slug = cleanSlug(req.query?.slug);

  try {
    const entry = await resolveEntry(kind, slug);
    res.setHeader('x-og-known', entry.known ? '1' : '0');

    const origin = originOf(req.headers);
    const layers: [string, string][] = slug ? [
      ['bespoke', `${BLOB_BASE}/cms/hero/${kind}-${slug}.png`],
      ['cover', /^https?:\/\//.test(entry.img) ? entry.img : (entry.img.startsWith('/') ? origin + entry.img : '')],
      ['sketch', heroPath(kind, slug) ? origin + heroPath(kind, slug) : ''],
    ] : [];
    for (const [source, url] of layers) {
      const got = await fetchImage(url);
      if (got) {
        res.setHeader('Content-Type', got.type);
        res.setHeader('Cache-Control', CACHE);
        res.setHeader('x-og-source', source);
        res.status(200).send(got.buf);
        return;
      }
    }

    const card = await renderCardPng({ kind, title: entry.title, category: entry.category, slug });
    if (card.png) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', card.degraded ? 'public, max-age=300, s-maxage=300' : CACHE);
      res.setHeader('x-og-source', 'floor');
      if (card.degraded) res.setHeader('x-og-degraded', card.degraded);
      res.status(200).send(card.png);
      return;
    }
  } catch (e: any) {
    console.error('[og] unexpected failure for', kind, slug, e?.message || e);
  }

  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
  res.setHeader('x-og-degraded', 'raster-failed');
  res.redirect(302, '/og-image.png');
}
