// api/autocard.ts — auto-generated branded cover/OG card.
// When a blog post or case study is published WITHOUT a cover image, we render
// a branded 1200x630 card from the title + category, rasterise it to PNG with
// sharp, store it on Vercel Blob, and return the public URL. The result is a
// normal image URL, so the public grid thumbnails and the prerendered og:image
// both work unchanged.
//
// Fails soft: on any error (Blob not configured, sharp missing, render error)
// it returns '' so publishing is never blocked — the site falls back to its
// existing static placeholder exactly as before.

const BRAND = {
  name: 'ANJANI PANDEY',
  domain: 'anjanipandey.com',
  bg: '#0f172a',        // deep navy (matches --color-accent)
  bgDeep: '#0b1220',    // darker gradient stop
  accent: '#2dd4bf',    // bright teal for legibility on dark (primary is #0F766E)
  accentSoft: 'rgba(45,212,191,0.10)',
  text: '#f8fafc',
  textDim: '#94a3b8',
};

interface CardOpts {
  kind: 'blog' | 'case';
  title: string;
  category?: string;
  slug: string;
}

function escapeXml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Greedy word-wrap. SVG <text> doesn't wrap, so we split into lines by an
// approximate character budget derived from the font size and content width.
function wrapText(text: string, fontSize: number, maxWidth: number, maxLines: number): string[] {
  const charW = fontSize * 0.56; // rough avg glyph width for a bold sans-serif
  const maxChars = Math.max(8, Math.floor(maxWidth / charW));
  const words = (text || '').trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (candidate.length <= maxChars) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  // Ellipsise if we ran out of lines
  if (lines.length === maxLines) {
    const used = lines.join(' ').split(/\s+/).length;
    const total = (text || '').trim().split(/\s+/).length;
    if (used < total) lines[maxLines - 1] = lines[maxLines - 1].replace(/[.,;:]?$/, '') + '…';
  }
  return lines.length ? lines : [''];
}

function buildSvg(opts: CardOpts): string {
  const W = 1200, H = 630, PAD = 80, CONTENT_W = W - PAD * 2;
  const title = (opts.title || 'Untitled').trim();

  // Title size tiers by length
  let fs = 70;
  if (title.length > 38) fs = 58;
  if (title.length > 72) fs = 48;
  if (title.length > 110) fs = 40;
  const lineH = Math.round(fs * 1.18);
  const lines = wrapText(title, fs, CONTENT_W, 4);

  const kindLabel = opts.kind === 'case' ? 'CASE STUDY' : 'ARTICLE';
  const category = (opts.category || '').trim().toUpperCase();

  // Vertical layout: block of title lines centred around the middle, eyebrow
  // above the first line, footer pinned to the bottom.
  const blockH = lines.length * lineH;
  const titleTop = Math.round((H - blockH) / 2) + fs * 0.7;
  const eyebrowY = titleTop - fs - 26;

  const titleTspans = lines
    .map((ln, i) => `<text x="${PAD}" y="${titleTop + i * lineH}" font-size="${fs}" font-weight="800" fill="${BRAND.text}" font-family="Inter, 'Helvetica Neue', Arial, sans-serif" letter-spacing="-1">${escapeXml(ln)}</text>`)
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BRAND.bg}"/>
      <stop offset="1" stop-color="${BRAND.bgDeep}"/>
    </linearGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 0H0V60" fill="none" stroke="${BRAND.accent}" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect x="0" y="0" width="10" height="${H}" fill="${BRAND.accent}"/>

  <!-- header: wordmark + kind pill -->
  <text x="${PAD}" y="118" font-size="30" font-weight="800" fill="${BRAND.text}" font-family="Inter, Arial, sans-serif" letter-spacing="3">${escapeXml(BRAND.name)}</text>
  <rect x="${W - PAD - 196}" y="92" width="196" height="40" rx="20" fill="${BRAND.accentSoft}" stroke="${BRAND.accent}" stroke-opacity="0.5"/>
  <text x="${W - PAD - 98}" y="118" font-size="19" font-weight="700" fill="${BRAND.accent}" font-family="Inter, Arial, sans-serif" letter-spacing="3" text-anchor="middle">${escapeXml(kindLabel)}</text>

  <!-- eyebrow category -->
  ${category ? `<text x="${PAD}" y="${eyebrowY}" font-size="24" font-weight="700" fill="${BRAND.accent}" font-family="Inter, Arial, sans-serif" letter-spacing="5">${escapeXml(category)}</text>` : ''}

  <!-- title -->
  ${titleTspans}

  <!-- footer -->
  <rect x="${PAD}" y="${H - 96}" width="56" height="4" rx="2" fill="${BRAND.accent}"/>
  <text x="${PAD}" y="${H - 56}" font-size="24" font-weight="600" fill="${BRAND.textDim}" font-family="Inter, Arial, sans-serif" letter-spacing="1">${escapeXml(BRAND.domain)}</text>
</svg>`;
}

/**
 * Render a branded card for a post/case study and store it on Vercel Blob.
 * Returns the public PNG URL, or '' on any failure (caller falls back to the
 * existing placeholder).
 */
export async function generateCardUrl(opts: CardOpts): Promise<string> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return '';
    const svg = buildSvg(opts);
    const sharp = (await import('sharp')).default;
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    const { put } = await import('@vercel/blob');
    const key = `cms/auto/${opts.kind}-${opts.slug || Date.now()}.png`;
    const blob = await put(key, png, {
      access: 'public',
      contentType: 'image/png',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return blob.url;
  } catch (err: any) {
    console.error('[autocard] generation failed:', err?.message || err);
    return '';
  }
}

// Exposed for local/offline testing (returns the raw SVG string).
export const __buildSvgForTest = buildSvg;
