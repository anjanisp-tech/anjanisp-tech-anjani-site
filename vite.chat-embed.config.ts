/**
 * Standalone Vite config for the /os chat-embed bundle.
 *
 * Why a separate config:
 *  - The main `vite.config.ts` builds the React SPA (index.html + routes).
 *  - /os is a flat static HTML file in public/os/ that needs a self-contained
 *    JS bundle to mount the chatbot on its own DOM.
 *  - IIFE format produces ONE file with everything inlined — no ES module
 *    dependencies, no hashed vendor chunks to chase. /os HTML can reference
 *    a stable URL (/chat-embed.js) that never changes between deploys.
 *
 * Run AFTER `vite build` in the build script (with emptyOutDir: false) so it
 * appends to the existing dist/ rather than wiping it.
 */

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    build: {
      // Append to dist/ produced by the main `vite build` — do NOT wipe it.
      outDir: 'dist',
      emptyOutDir: false,
      // Keep CSS in a single file alongside the JS, no code splitting.
      cssCodeSplit: false,
      lib: {
        entry: path.resolve(__dirname, 'src/chat-embed.tsx'),
        formats: ['iife'],
        name: 'ChatEmbed',
        // Stable, no-hash filename so public/os/index.html can reference it forever.
        fileName: () => 'chat-embed.js',
      },
      rollupOptions: {
        output: {
          // Sibling CSS file with a stable name too.
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name ?? '';
            if (name.endsWith('.css')) return 'chat-embed.css';
            return 'chat-embed-[name][extname]';
          },
          // Avoid manual chunks — IIFE wants everything in one file.
          inlineDynamicImports: true,
        },
      },
      // Don't minify-mangle React component names — easier to debug if something breaks.
      minify: 'esbuild',
      sourcemap: true,
    },
  };
});
