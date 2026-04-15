/**
 * Shared route configuration for client-side routing and pre-rendering.
 * Single source of truth for all routes.
 */
import { blogPosts } from './data/blogData';

export interface RouteEntry {
    path: string;
    /** Whether to pre-render this route at build time */
  prerender: boolean;
}

/** Static routes (no dynamic params) */
export const staticRoutes: RouteEntry[] = [
  { path: '/', prerender: true },
  { path: '/about', prerender: true },
  { path: '/services', prerender: true },
  { path: '/writing', prerender: true },
  { path: '/book', prerender: true },
  { path: '/calculator', prerender: true },
  { path: '/resources', prerender: true },
  { path: '/privacy', prerender: true },
  { path: '/terms', prerender: true },
  { path: '/sitemap', prerender: true },
    // Admin is not pre-rendered (auth-gated, no SEO value)
  { path: '/admin', prerender: false },
  ];

/** Generate blog post routes from the hardcoded blog data */
export function getBlogRoutes(): RouteEntry[] {
    return blogPosts.map((post) => ({
          path: `/blog/${post.id}`,
          prerender: true,
    }));
}

/** All routes that should be pre-rendered */
export function getPrerenderedRoutes(): string[] {
    return [
          ...staticRoutes.filter((r) => r.prerender).map((r) => r.path),
          ...getBlogRoutes().map((r) => r.path),
        ];
}
