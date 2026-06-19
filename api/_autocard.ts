// api/_autocard.ts — auto-generated cover art for blog posts / case studies.
//
// Pipeline (shared by publish-time and the backfill script):
//   1) Gemini turns the title (+summary) into a jargon-free ABSTRACT visual
//      concept — this is what prevents Imagen from baking text into the image.
//   2) Imagen 4 renders that concept in a locked navy/slate + TEAL editorial
//      style (gold/amber/orange explicitly forbidden so it stays on-brand).
//   3) sharp resizes to 1200x630 and recompresses (~150-250KB).
//
// Private module ("_" prefix) so Vercel does NOT build it as its own
// serverless function; it is imported by api/routes/admin.ts (publish) and by
// scripts/backfill-ai-thumbnails.mjs (backfill).
//
// Fails soft everywhere: any error returns null/'' and the caller falls back to
// the existing placeholder — image generation never blocks publishing.

import { GoogleGenAI } from '@google/genai';

interface CardOpts {
  kind: 'blog' | 'case';
  title: string;
  category?: string;
  slug: string;
  summary?: string;
}

const STYLE =
  "Abstract minimalist conceptual artwork, premium matte 3D render aesthetic. Smooth sculptural geometric forms and flowing lines. " +
  "Deep navy and slate color palette with a single restrained TEAL / CYAN accent only. " +
  "Soft studio lighting, generous negative space, clean composition, subtle grain. " +
  "Strictly NO gold, NO amber, NO orange, NO yellow, NO warm metallics. " +
  "Purely abstract: no text, no letters, no numbers, no people, no faces, no devices, no laptops, no buildings, no charts, no logos.";

function geminiKey(): string {
  return (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
}

async function buildConcept(ai: GoogleGenAI, title: string, summary: string): Promise<string> {
  try {
    const r = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents:
        `Article title: "${title}". Summary: "${summary}".\n` +
        `In ONE vivid sentence, describe a PURELY ABSTRACT visual metaphor for cover art using only sculptural shapes, lines, light and motion. ` +
        `Absolutely no words, letters, numbers or text in the image; no brand names; no people or faces; no devices, laptops, phones; no buildings; no charts or graphs; no business jargon. Just abstract form and metaphor.`,
      config: { temperature: 0.7 },
    });
    return (r.text || '').trim().replace(/\s+/g, ' ').slice(0, 400) ||
      'Smooth abstract sculptural forms and flowing lines in balanced tension.';
  } catch {
    return 'Smooth abstract sculptural forms and flowing lines in balanced tension.';
  }
}

async function generateImageBytes(ai: GoogleGenAI, prompt: string): Promise<Buffer | null> {
  for (const model of ['imagen-4.0-fast-generate-001', 'imagen-4.0-generate-001']) {
    try {
      const r = await ai.models.generateImages({ model, prompt, config: { numberOfImages: 1, aspectRatio: '16:9' } });
      const b64 = r.generatedImages?.[0]?.image?.imageBytes;
      if (b64) return Buffer.from(b64, 'base64');
    } catch (e: any) {
      console.error('[autocard] imagen', model, 'failed:', e?.message || e);
    }
  }
  return null;
}

/**
 * Generate an optimized branded cover PNG (1200x630, ~150-250KB) for a post.
 * Returns the PNG buffer, or null on any failure. No Blob/storage involved —
 * used both by the backfill script (writes to disk) and by generateCardUrl.
 */
export async function generateCardBuffer(opts: { title: string; category?: string; summary?: string }): Promise<Buffer | null> {
  const key = geminiKey();
  if (!key) return null;
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const concept = await buildConcept(ai, opts.title, opts.summary || opts.category || '');
    const raw = await generateImageBytes(ai, `${STYLE} Concept: ${concept}`);
    if (!raw) return null;
    const sharp = (await import('sharp')).default;
    // Navy -> teal duotone. Imagen doesn't reliably honor negative colour
    // instructions (it sometimes injects gold/amber), so we enforce the brand
    // palette deterministically: desaturate, then tint to teal. Guarantees every
    // cover is on-brand regardless of what the model produced.
    return await sharp(raw)
      .resize({ width: 1200, height: 630, fit: 'cover', position: 'left' })
      .modulate({ saturation: 0.15 })
      .tint({ r: 56, g: 189, b: 178 })
      .png({ quality: 80, effort: 9, palette: true, compressionLevel: 9 })
      .toBuffer();
  } catch (e: any) {
    console.error('[autocard] buffer generation failed:', e?.message || e);
    return null;
  }
}

/**
 * Generate a cover for a post/case study and store it on Vercel Blob.
 * Returns the public PNG URL, or '' on any failure (caller falls back to the
 * existing placeholder).
 */
export async function generateCardUrl(opts: CardOpts): Promise<string> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) return '';
    const png = await generateCardBuffer({ title: opts.title, category: opts.category, summary: opts.summary });
    if (!png) return '';
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
