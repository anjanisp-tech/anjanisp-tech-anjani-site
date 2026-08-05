// Writes .content-signature.json = a stable hash of the live published blog +
// case-study content. A scheduled GitHub Action commits this ONLY when it
// changes, and that push makes Vercel rebuild (which re-runs the DB->flat sync
// and pre-renders every post). No secrets required (reads the public API).
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const BASE = 'https://www.anjanipandey.com';
const get = async (p) => { const r = await fetch(BASE + p); if (!r.ok) throw new Error(`${p} ${r.status}`); return r.json(); };
const h = (o) => createHash('sha1').update(JSON.stringify(o)).digest('hex');
const blog = await get('/api/posts');
let cs = [];
try { cs = await get('/api/casestudies'); } catch { cs = []; }
const sig = [
  ...blog.map((p) => ['blog', p.id, h(p)]),
  ...cs.map((p) => ['case', p.slug, h(p)]),
].sort((x, y) => (x[0] + x[1]).localeCompare(y[0] + y[1]));
writeFileSync('.content-signature.json', JSON.stringify(sig, null, 2) + '\n');
console.log(`signature written: ${sig.length} items (${blog.length} blog, ${cs.length} case)`);
