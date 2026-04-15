import { b as blogPosts, c as getGuideRoutes } from "./assets/guidesData-sCapSEqy.js";
const staticRoutes = [
  { path: "/", prerender: true },
  { path: "/about", prerender: true },
  { path: "/services", prerender: true },
  { path: "/writing", prerender: true },
  { path: "/book", prerender: true },
  { path: "/calculator", prerender: true },
  { path: "/resources", prerender: true },
  { path: "/privacy", prerender: true },
  { path: "/terms", prerender: true },
  { path: "/sitemap", prerender: true },
  // Admin is not pre-rendered (auth-gated, no SEO value)
  { path: "/admin", prerender: false }
];
function getBlogRoutes() {
  return blogPosts.map((post) => ({
    path: `/blog/${post.id}`,
    prerender: true
  }));
}
function getPrerenderedRoutes() {
  return [
    ...staticRoutes.filter((r) => r.prerender).map((r) => r.path),
    ...getBlogRoutes().map((r) => r.path),
    ...getGuideRoutes().map((r) => r.path)
  ];
}
export {
  getBlogRoutes,
  getPrerenderedRoutes,
  staticRoutes
};
