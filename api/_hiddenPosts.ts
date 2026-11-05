// Posts folded into stronger posts (growth plan 8A S17 fix 3, Anjani's yes 2026-11-05).
// Their old addresses redirect in vercel.json. They stay in the database (nothing deleted);
// this list only keeps them out of the post list, the sitemap and the built site.
// Same list in scripts/sync-content.mjs (HIDDEN_POST_IDS). Undo: remove an id from BOTH places.
export const HIDDEN_POST_IDS = new Set<string>([
  "founder-overload-map",
  "hiring-trap-growing-companies",
  "systems-outlast-heroics",
  "why-companies-break-at-rs50-cr-the-middle-layer-problem-in-scaling-operations-for-founder-led-businesses",
]);
export const notHidden = (p: any) => !HIDDEN_POST_IDS.has(String(p?.id));
