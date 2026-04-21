import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React runtime
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // Animation library (used by Home, Calculator, ChatAssistant)
            'vendor-motion': ['motion'],
            // Markdown renderer (used by BlogPostDetail, ResourceGuide, ChatAssistant, UploadBlog)
            'vendor-markdown': ['react-markdown'],
            // Google GenAI SDK (chatbot only)
            'vendor-genai': ['@google/genai'],
            // Helmet for SEO
            'vendor-helmet': ['react-helmet-async'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify -- file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
