// api/_cardRender.ts — draws the anjanipandey.com title card (the "floor").
// Thumbnail self-healing plan, Phase 2, 2026-11-02. Ported from metmov.com's
// api/autocard.ts, which has run on metmov.com since 2026-08-10.
//
// This card is only the last resort. The share image prefers, in order: an
// image uploaded to blob cms/hero, the idea sketch shipped in public/hero, the
// post's own cover art, and only then this drawn card. See api/_og.ts.
//
// TEXT AS SHAPES. We never ask a font renderer to draw text at request time.
// On Vercel, sharp/librsvg with a font name drew tofu boxes, and resvg with the
// font as a buffer silently dropped all text (metmov.com, Aug 2026). So every
// letter is turned into an SVG path with opentype.js first, and sharp only has
// to paint shapes. We also read glyph commands ourselves instead of calling
// opentype's getPath/toPathData, which can emit "NaN" mid-title and leave a
// half-drawn card that no error handler would notice (metmov.com, 2026-08-25).
//
// FONT GUARD. If the fonts do not parse, or any glyph gives a bad number, we
// draw a text-free card on the same navy sheet and say why in `degraded`. The
// route turns that into an x-og-degraded header and /api/og-health raises it.
// Never tofu, never half a title, never a blank.

import opentype from 'opentype.js';
import { cardFontBuffers } from './_cardFonts.js';

const BRAND = {
  domain: 'ANJANIPANDEY.COM',
  navy: '#0d1a2e',
  navyLift: '#13243d',
  text: '#eef3f8',
  dim: '#8396b0',
  rule: '#243652',
  teal: '#2bc0ae',
  dot: 'rgba(207,219,232,0.10)',
};

export interface CardOpts {
  kind: 'blog' | 'case';
  title: string;
  category?: string;
  slug: string;
}

type Font = any;
let FONTS: { display: Font; mono: Font } | null | undefined;

function fonts(): { display: Font; mono: Font } | null {
  if (FONTS !== undefined) return FONTS;
  try {
    const bufs = cardFontBuffers();
    if (!bufs) { FONTS = null; return FONTS; }
    const toAB = (b: Buffer) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
    FONTS = { display: opentype.parse(toAB(bufs[0])), mono: opentype.parse(toAB(bufs[1])) };
  } catch (e: any) {
    console.error('[card] font parse failed:', e?.message || e);
    FONTS = null;
  }
  return FONTS;
}

export function cardFontsPresent(): boolean {
  return !!fonts();
}

// Swap the punctuation a title might carry for what the subset holds, then
// drop anything the font still lacks. A dropped character is a small loss; a
// .notdef box on a public card is not acceptable.
function fit(font: Font, text: string): string {
  const swapped = String(text || '')
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/₹\s?/g, 'Rs.')
    .replace(/\s+/g, ' ')
    .trim();
  return [...swapped].filter((ch) => ch === ' ' || (font.charToGlyphIndex(ch) || 0) > 0).join('');
}

function runWidth(font: Font, text: string, size: number, ls: number): number {
  const chars = [...String(text)];
  let total = 0;
  for (const ch of chars) total += font.getAdvanceWidth(ch, size);
  return total + ls * Math.max(0, chars.length - 1);
}

function num(n: number): string | null {
  if (!Number.isFinite(n)) return null;
  return n.toFixed(2).replace(/\.?0+$/, '') || '0';
}

function glyphPathData(glyph: Font, x: number, y: number, scale: number): string | null {
  const cmds = glyph?.path?.commands;
  if (!Array.isArray(cmds)) return null;
  const out: string[] = [];
  for (const c of cmds) {
    const X = (v: number) => num(x + v * scale);
    const Y = (v: number) => num(y - v * scale);
    let seg: (string | null)[];
    switch (c.type) {
      case 'M': seg = ['M', X(c.x), Y(c.y)]; break;
      case 'L': seg = ['L', X(c.x), Y(c.y)]; break;
      case 'Q': seg = ['Q', X(c.x1), Y(c.y1), X(c.x), Y(c.y)]; break;
      case 'C': seg = ['C', X(c.x1), Y(c.y1), X(c.x2), Y(c.y2), X(c.x), Y(c.y)]; break;
      case 'Z': seg = ['Z']; break;
      default: return null;
    }
    if (seg.some((t) => t === null)) return null;
    out.push(seg[0] + seg.slice(1).join(' '));
  }
  return out.join('');
}

// One run of text as one <path>. null means "abandon this card", never "draw what we got".
function runPath(font: Font, text: string, x: number, y: number, size: number, ls: number, fill: string, anchor: 'start' | 'end' = 'start'): string | null {
  const chars = [...String(text)];
  const total = runWidth(font, text, size, ls);
  if (!Number.isFinite(total)) return null;
  const scale = size / font.unitsPerEm;
  let cx = anchor === 'end' ? x - total : x;
  const parts: string[] = [];
  for (const ch of chars) {
    const adv = font.getAdvanceWidth(ch, size);
    if (!Number.isFinite(adv) || !Number.isFinite(cx)) return null;
    const d = glyphPathData(font.charToGlyph(ch), cx, y, scale);
    if (d === null) return null;
    if (d) parts.push(d);
    cx += adv + ls;
  }
  return `<path d="${parts.join('')}" fill="${fill}"/>`;
}

function wrapText(font: Font, text: string, size: number, ls: number, maxWidth: number, maxLines: number): string[] {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (runWidth(font, candidate, size, ls) <= maxWidth) line = candidate;
    else {
      if (line) lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  const kept = lines.slice(0, maxLines);
  const used = kept.join(' ').split(/\s+/).filter(Boolean).length;
  if (used < words.length && kept.length) kept[kept.length - 1] = kept[kept.length - 1].replace(/[.,;:]?$/, '') + '…';
  return kept.length ? kept : [''];
}

const W = 1200, H = 630, PAD = 80;

function ground(): string {
  return `<defs>
    <pattern id="d" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1.4" fill="${BRAND.dot}"/></pattern>
    <radialGradient id="v" cx="30%" cy="40%" r="85%"><stop offset="0" stop-color="${BRAND.navyLift}"/><stop offset="1" stop-color="${BRAND.navy}"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#v)"/><rect width="${W}" height="${H}" fill="url(#d)"/>
  <rect x="${PAD}" y="${H - 104}" width="${W - PAD * 2}" height="1" fill="${BRAND.rule}"/>`;
}

function buildSvg(opts: CardOpts, f: { display: Font; mono: Font }): string | null {
  const title = fit(f.display, (opts.title || 'Untitled').trim()) || 'Anjani Pandey';
  const label = fit(f.mono, (opts.category || (opts.kind === 'case' ? 'Case study' : 'Writing')).toUpperCase());

  // Biggest size that fits in three lines.
  let size = 66, lines: string[] = [];
  for (const s of [66, 60, 54, 48]) {
    size = s;
    lines = wrapText(f.display, title, s, -0.5, W - PAD * 2, 3);
    if (!lines[lines.length - 1].endsWith('…')) break;
  }
  const lh = Math.round(size * 1.14);
  const blockH = lh * (lines.length - 1) + size;
  const top = Math.round((H - 104 - 150 - blockH) / 2) + 150 + size * 0.8;

  const parts: (string | null)[] = [];
  parts.push(`<rect x="${PAD}" y="118" width="40" height="4" fill="${BRAND.teal}"/>`);
  parts.push(runPath(f.mono, label.slice(0, 40), PAD + 58, 128, 20, 2.5, BRAND.teal));
  lines.forEach((ln, i) => parts.push(runPath(f.display, ln, PAD, top + i * lh, size, -0.5, BRAND.text)));
  parts.push(runPath(f.mono, BRAND.domain, PAD, H - 58, 20, 3, BRAND.dim));
  parts.push(runPath(f.mono, opts.kind === 'case' ? 'CASE STUDY' : 'ESSAY', W - PAD, H - 58, 20, 3, BRAND.dim, 'end'));
  if (parts.some((p) => p === null)) return null;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ground()}
  ${parts.join('\n  ')}
</svg>`;
}

function buildTextFreeSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${ground()}
  <rect x="${PAD}" y="118" width="40" height="4" fill="${BRAND.teal}"/>
  <rect x="${PAD}" y="250" width="760" height="24" rx="4" fill="${BRAND.text}" opacity="0.9"/>
  <rect x="${PAD}" y="298" width="620" height="24" rx="4" fill="${BRAND.text}" opacity="0.9"/>
  <rect x="${PAD}" y="346" width="420" height="24" rx="4" fill="${BRAND.text}" opacity="0.9"/>
</svg>`;
}

export interface RenderedCard {
  png: Buffer | null;     // null only if sharp itself failed (a deploy problem)
  fontPresent: boolean;
  degraded: null | 'font-missing' | 'text-render-failed' | 'raster-failed';
}

export async function renderCardPng(opts: CardOpts): Promise<RenderedCard> {
  const f = fonts();
  let svg: string | null = null;
  let degraded: RenderedCard['degraded'] = null;
  if (!f) degraded = 'font-missing';
  else {
    try { svg = buildSvg(opts, f); } catch (e: any) { console.error('[card] buildSvg threw:', e?.message || e); }
    if (!svg) degraded = 'text-render-failed';
  }
  if (!svg) svg = buildTextFreeSvg();
  try {
    const sharp = (await import('sharp')).default;
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    return { png, fontPresent: !!f, degraded };
  } catch (e: any) {
    console.error('[card] raster failed:', e?.message || e);
    return { png: null, fontPresent: !!f, degraded: 'raster-failed' };
  }
}

export const __buildSvgForTest = buildSvg;
export const __textFreeForTest = buildTextFreeSvg;
