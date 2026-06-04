// IndexNow deploy ping (AEO multi-engine index layer, added 2026-06-04).
// Fail-soft by design: this script NEVER fails the build. Production deploys only.
const HOST = 'www.anjanipandey.com';
const KEY = 'bf7ec572bdda497a96b29a1bbdb5411c';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const FALLBACK_URLS = ['https://www.anjanipandey.com/','https://www.anjanipandey.com/services','https://www.anjanipandey.com/about','https://www.anjanipandey.com/writing','https://www.anjanipandey.com/resources','https://www.anjanipandey.com/calculator','https://www.anjanipandey.com/book','https://www.anjanipandey.com/resources/ai-consulting-stack'];

async function main() {
  if (process.env.VERCEL_ENV !== 'production') {
    console.log('[indexnow] non-production build, skipping ping');
    return;
  }
  let urls = [];
  // 1. dist/sitemap.xml (static sitemap copied by Vite)
  try {
    const { readFileSync } = await import('node:fs');
    const xml = readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8');
    urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());
  } catch { /* no static sitemap */ }
  // 2. live sitemap (previous deploy; URL set is what matters)
  if (urls.length === 0) {
    try {
      const r = await fetch(`https://${HOST}/sitemap.xml`, { signal: AbortSignal.timeout(10000) });
      if (r.ok) {
        const xml = await r.text();
        urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());
      }
    } catch { /* offline or not yet live */ }
  }
  // 3. fixed priority set
  if (urls.length === 0) urls = FALLBACK_URLS;
  urls = [...new Set(urls.filter(u => u.includes(HOST)))];
  if (urls.length === 0) { console.log('[indexnow] no URLs resolved, skipping'); return; }
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls }),
      signal: AbortSignal.timeout(15000),
    });
    console.log(`[indexnow] submitted ${urls.length} URLs for ${HOST}: HTTP ${res.status}`);
  } catch (e) {
    console.log(`[indexnow] ping failed (non-fatal): ${e.message}`);
  }
}
main().catch(e => console.log(`[indexnow] error (non-fatal): ${e.message}`));
