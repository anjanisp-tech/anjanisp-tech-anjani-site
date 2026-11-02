// src/lib/cardImage.ts — one place that decides which picture a post shows.
// Thumbnail self-healing plan, 2026-11-02.
//
//   On the page: the post's own cover art if it has one, else its idea sketch
//   (public/hero), else nothing (the page lays out as text only, never an empty box).
//   As the share image: always /api/og/<kind>/<slug>, which follows the same order
//   and falls back to a drawn title card, so it is never blank.

import { heroPath, type HeroKind } from '../data/heroImages';

export function pagePicture(kind: HeroKind, slug: string, img?: string | null): string {
  const own = (img || '').trim();
  return own || heroPath(kind, slug);
}

export function shareImage(kind: HeroKind, slug: string): string {
  return `https://www.anjanipandey.com/api/og/${kind}/${encodeURIComponent(slug)}`;
}
