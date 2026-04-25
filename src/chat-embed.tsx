/**
 * Standalone entry that mounts ChatAssistant on a static page.
 *
 * Used by /os (public/os/index.html) which is served as a flat HTML file
 * and bypasses the React app shell. We need a tiny bundle that can run on its own.
 *
 * Pairs with vite.chat-embed.config.ts which builds this in IIFE format
 * to dist/chat-embed.js (single self-contained file, no module imports needed).
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ChatAssistant from './components/ChatAssistant';
import './chat-embed.css';

function mount() {
  const el = document.getElementById('chat-mount');
  if (!el) {
    console.warn('[chat-embed] #chat-mount not found; nothing to render.');
    return;
  }
  createRoot(el).render(
    <StrictMode>
      <ChatAssistant />
    </StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
