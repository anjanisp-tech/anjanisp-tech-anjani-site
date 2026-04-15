/**
 * Pre-render script for anjanipandey.com
 * 1. Vite SSR-builds entry-static.tsx + routes.ts (bundling all deps)
 * 2. Imports the bundle and calls render(url) for each route
 * 3. Extracts Helmet tags from rendered HTML, moves them to <head>
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const SSR_OUTDIR = path.join(ROOT, 'dist-ssr');

// Polyfill browser globals BEFORE any React code loads
setupBrowserPolyfills();

async function prerender() {
  console.log('\nð¦ Building SSR bundle...\n');

  await build({
    root: ROOT,
    build: {
      ssr: true,
      outDir: 'dist-ssr',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          'entry-static': path.join(ROOT, 'src', 'entry-static.tsx'),
          'routes': path.join(ROOT, 'src', 'routes.ts'),
        },
        output: { format: 'esm' },
      },
    },
    ssr: {
      noExternal: true,
    },
    logLevel: 'warn',
  });

  const { render } = await import(path.join(SSR_OUTDIR, 'entry-static.js'));
  const { getPrerenderedRoutes } = await import(path.join(SSR_OUTDIR, 'routes.js'));

  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('â dist/index.html not found. Run `vite build` first.');
    process.exit(1);
  }
  const template = fs.readFileSync(templatePath, 'utf-8');
  const routes: string[] = getPrerenderedRoutes();

  console.log(`ð¨ Pre-rendering ${routes.length} routes...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const routePath of routes) {
    try {
      const { html: rawHtml } = render(routePath);

      // react-helmet-async v3 + React 19: helmetContext doesn't populate via renderToString,
      // but Helmet tags ARE rendered inline in the HTML output. Extract and relocate them.
      
      // Extract tags with data-rh="true" (Helmet's marker)
      const dataRhTagRegex = /<(title|meta|link)[^>]*data-rh="true"[^>]*(?:\/\s*>|>[^<]*<\/\1>)/g;
      const helmetTags: string[] = [];
      let m: RegExpExecArray | null;
      while ((m = dataRhTagRegex.exec(rawHtml)) !== null) {
        helmetTags.push(m[0]);
      }
      
      // Remove extracted tags from body HTML
      let cleanHtml = rawHtml.replace(dataRhTagRegex, '');
      
      // Also catch any plain <title>...</title> rendered by Helmet (without data-rh)
      const plainTitleMatch = cleanHtml.match(/<title>([^<]*)<\/title>/);
      if (plainTitleMatch) {
        if (!helmetTags.some(t => t.startsWith('<title'))) {
          helmetTags.push(plainTitleMatch[0]);
        }
        cleanHtml = cleanHtml.replace(/<title>[^<]*<\/title>/, '');
      }

      let output = template;

      // Inject cleaned rendered HTML into root div
      output = output.replace(
        '<div id="root"></div>',
        `<div id="root">${cleanHtml}</div>`
      );

      // Replace the static title in <head> and inject extracted helmet tags
      if (helmetTags.length > 0) {
        // Remove the original static title from template
        output = output.replace(/<title[^>]*>.*?<\/title>/, '');
        // Inject helmet tags before </head>
        const headTagStr = helmetTags.join('\n    ');
        output = output.replace('</head>', `    ${headTagStr}\n  </head>`);
      }

      // Write output file
      let outputPath: string;
      if (routePath === '/') {
        outputPath = path.join(DIST_DIR, 'index.html');
      } else {
        const dir = path.join(DIST_DIR, routePath);
        fs.mkdirSync(dir, { recursive: true });
        outputPath = path.join(dir, 'index.html');
      }
      fs.writeFileSync(outputPath, output, 'utf-8');

      const extractedTitle = helmetTags.find(t => t.startsWith('<title'));
      const hasTitle = !!extractedTitle;
      const icon = cleanHtml.length > 100 && hasTitle ? 'â' : 'â ï¸';
      console.log(`  ${icon} ${routePath.padEnd(45)} ${cleanHtml.length.toString().padStart(6)} chars  ${helmetTags.length} head tags  ${hasTitle ? 'â title' : 'â NO TITLE'}`);
      successCount++;
    } catch (err: any) {
      console.error(`  â ${routePath.padEnd(45)} FAILED: ${err.message}`);
      failCount++;
    }
  }

  console.log(`\nð ${successCount}/${routes.length} routes pre-rendered successfully`);
  if (failCount > 0) {
    console.log(`â ï¸  ${failCount} routes failed (will fall back to client-side rendering)`);
  }

  // Verify key pages
  for (const check of ['/about', '/']) {
    const checkPath = check === '/' 
      ? path.join(DIST_DIR, 'index.html')
      : path.join(DIST_DIR, check, 'index.html');
    if (fs.existsSync(checkPath)) {
      const checkHtml = fs.readFileSync(checkPath, 'utf-8');
      const titleMatch = checkHtml.match(/<title[^>]*>([^<]*)<\/title>/);
      console.log(`\nð Verify ${check}:`);
      console.log(`   Has content:      ${checkHtml.includes('<div id="root">') && !checkHtml.includes('<div id="root"></div>') ? 'â' : 'â'}`);
      console.log(`   Title:            ${titleMatch ? 'â ' + titleMatch[1] : 'â missing'}`);
      console.log(`   Meta description: ${checkHtml.includes('meta name="description"') ? 'â' : 'â'}`);
      console.log(`   Canonical URL:    ${checkHtml.includes('rel="canonical"') ? 'â' : 'â'}`);
      console.log(`   OG tags:          ${checkHtml.includes('og:title') ? 'â' : 'â'}`);
      // Check no helmet tags leaked into body
      const bodyContent = checkHtml.match(/<div id="root">([\s\S]*?)<\/div>\s*<script/)?.[1] || '';
      const leakedTags = (bodyContent.match(/data-rh="true"/g) || []).length;
      console.log(`   Leaked head tags: ${leakedTags === 0 ? 'â none' : 'â ' + leakedTags + ' tags still in body'}`);
    }
  }

  // Clean up SSR build artifacts
  fs.rmSync(SSR_OUTDIR, { recursive: true, force: true });
  console.log('\nâ¨ Pre-rendering complete!\n');
}

function setupBrowserPolyfills() {
  const noop = () => {};
  if (typeof globalThis.window !== 'undefined') return;

  (globalThis as any).window = {
    scrollTo: noop, addEventListener: noop, removeEventListener: noop,
    dispatchEvent: noop,
    location: { href: 'https://www.anjanipandey.com', pathname: '/', search: '', hash: '', origin: 'https://www.anjanipandey.com' },
    navigator: { userAgent: 'prerender' },
    gtag: noop,
    innerWidth: 1024, innerHeight: 768,
    matchMedia: () => ({ matches: false, addListener: noop, removeListener: noop, addEventListener: noop, removeEventListener: noop, dispatchEvent: noop }),
    getComputedStyle: () => new Proxy({}, { get: () => '' }),
    setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout,
    setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval,
    requestAnimationFrame: (cb: any) => setTimeout(cb, 0),
    cancelAnimationFrame: clearTimeout,
    history: { pushState: noop, replaceState: noop, back: noop, forward: noop },
    performance: { now: () => Date.now(), mark: noop, measure: noop },
    devicePixelRatio: 1,
    screen: { width: 1024, height: 768 },
  };

  const makeEl = (): any => ({
    style: {}, setAttribute: noop, getAttribute: () => null,
    appendChild: noop, removeChild: noop, insertBefore: noop,
    addEventListener: noop, removeEventListener: noop,
    classList: { add: noop, remove: noop, contains: () => false, toggle: noop },
    getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 }),
    children: [], childNodes: [], parentNode: null,
    querySelectorAll: () => [], querySelector: () => null,
    textContent: '', innerHTML: '', outerHTML: '',
  });

  (globalThis as any).document = {
    title: '', createElement: makeEl, createElementNS: makeEl, createTextNode: () => ({}),
    querySelector: () => null, querySelectorAll: () => [],
    getElementById: () => null, getElementsByClassName: () => [], getElementsByTagName: () => [],
    addEventListener: noop, removeEventListener: noop,
    documentElement: { ...makeEl(), scrollTop: 0 },
    head: makeEl(), body: makeEl(),
    cookie: '', createDocumentFragment: () => makeEl(),
    createRange: () => ({ setStart: noop, setEnd: noop, commonAncestorContainer: makeEl(), createContextualFragment: () => makeEl() }),
    createEvent: () => ({ initEvent: noop }),
  };

  (globalThis as any).localStorage = { getItem: () => null, setItem: noop, removeItem: noop, clear: noop, length: 0 };
  (globalThis as any).sessionStorage = (globalThis as any).localStorage;
  Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'prerender', language: 'en', platform: 'linux' }, writable: true, configurable: true });
  (globalThis as any).IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} };
  (globalThis as any).ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
  (globalThis as any).MutationObserver = class { observe(){} disconnect(){} takeRecords(){ return []; } };
  (globalThis as any).requestAnimationFrame = (cb: any) => setTimeout(cb, 0);
  (globalThis as any).cancelAnimationFrame = clearTimeout;
  (globalThis as any).HTMLElement = class {};
  (globalThis as any).SVGElement = class {};
  (globalThis as any).Element = class {};
  (globalThis as any).CustomEvent = class extends Event { detail: any; constructor(type: string, opts?: any) { super(type); this.detail = opts?.detail; } };
  (globalThis as any).getComputedStyle = () => new Proxy({}, { get: () => '' });
  if (typeof globalThis.fetch === 'undefined') {
    (globalThis as any).fetch = async () => ({ ok: false, json: async () => ({}), text: async () => '', status: 500 });
  }
  (globalThis as any).CSS = { supports: () => false };
}

prerender().catch((err) => {
  console.error('Pre-render failed:', err);
  process.exit(1);
});
