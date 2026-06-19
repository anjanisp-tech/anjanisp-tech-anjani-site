// Generate branded ABSTRACT AI cover thumbnails for every blog post and write
// them over public/og/<id>.png (the DB img already points there, so no DB
// change is needed). Two-step pipeline avoids on-image text artifacts:
//   1) Gemini (text) turns the title+excerpt into a jargon-free abstract visual
//      concept (no words/people/devices).
//   2) Imagen 4 renders that concept in a locked navy/teal editorial style.
//
// Resume-safe: completed ids are recorded in .ai-thumbnails-done.json; re-run to
// continue if interrupted. Run:  npx tsx scripts/backfill-ai-thumbnails.mjs
// Force a full regen:            npx tsx scripts/backfill-ai-thumbnails.mjs --fresh

import { config } from 'dotenv'; config({ path: '.env.local' });
import { GoogleGenAI } from '@google/genai';
import { createPool } from '@vercel/postgres';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';

const key = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
if (!key) { console.error('No GEMINI_API_KEY'); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: key });
const pool = createPool({ connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL });

const OUT = 'public/og';
mkdirSync(OUT, { recursive: true });
const DONE_FILE = '.ai-thumbnails-done.json';
let done = (!process.argv.includes('--fresh') && existsSync(DONE_FILE))
  ? JSON.parse(readFileSync(DONE_FILE, 'utf8')) : [];

const STYLE =
  "Abstract minimalist conceptual artwork, premium matte 3D render aesthetic. Smooth sculptural geometric forms and flowing lines. " +
  "Deep navy and slate color palette with a single restrained teal accent. Soft studio lighting, generous negative space, clean composition, subtle grain. " +
  "Purely abstract: no text, no letters, no numbers, no people, no faces, no devices, no laptops, no buildings, no charts, no logos.";

async function concept(title, excerpt) {
  try {
    const r = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Article title: "${title}". Summary: "${excerpt}".\nIn ONE vivid sentence, describe a PURELY ABSTRACT visual metaphor for cover art using only sculptural shapes, lines, light and motion. ` +
        `Absolutely no words, letters, numbers or text in the image; no brand names; no people or faces; no devices, laptops, phones; no buildings; no charts or graphs; no business jargon. Just abstract form and metaphor.`,
      config: { temperature: 0.7 },
    });
    return (r.text || '').trim().replace(/\s+/g, ' ').slice(0, 400);
  } catch (e) {
    console.log('  concept fail:', e?.message || e);
    return 'Smooth abstract sculptural forms and flowing lines in balanced tension, single teal accent.';
  }
}

async function image(prompt) {
  for (const model of ['imagen-4.0-fast-generate-001', 'imagen-4.0-generate-001']) {
    try {
      const r = await ai.models.generateImages({ model, prompt, config: { numberOfImages: 1, aspectRatio: '16:9' } });
      const b = r.generatedImages?.[0]?.image?.imageBytes;
      if (b) return Buffer.from(b, 'base64');
    } catch (e) { console.log('  image fail', model, ':', e?.message || e); }
  }
  return null;
}

const { rows } = await pool.query("SELECT id, title, excerpt, category FROM posts ORDER BY created_at");
console.log(`posts: ${rows.length} | already done: ${done.length}`);

let ok = 0, fail = 0;
for (const r of rows) {
  if (done.includes(r.id)) continue;
  try {
    const c = await concept(r.title, r.excerpt || r.category || '');
    const buf = await image(`${STYLE} Concept: ${c}`);
    if (!buf) { console.log('FAIL (no image):', r.id); fail++; continue; }
    writeFileSync(`${OUT}/${r.id}.png`, buf);
    done.push(r.id);
    writeFileSync(DONE_FILE, JSON.stringify(done));
    console.log('OK', r.id, `(${buf.length}b)`);
    ok++;
  } catch (e) {
    console.log('FAIL', r.id, e?.message || e);
    fail++;
  }
}
console.log(`\nDone. ok=${ok} fail=${fail} total_done=${done.length}/${rows.length}`);
await pool.end();
