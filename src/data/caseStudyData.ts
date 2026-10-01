// AUTO-GENERATED at build time by scripts/sync-content.mjs from the Neon DB.
// Do not edit by hand; edits are overwritten on the next build. Case studies are
// written through the /admin CMS or POST /api/admin/casestudies. This file is the
// pre-render seed + offline fallback, same pattern as blogData.ts.
export interface CaseStudySeed {
  slug: string;
  title: string;
  excerpt: string;
  img: string;
  category: string;
  client: string;
  period: string;
  results: string[];
  content: string;
}

export const caseStudies: CaseStudySeed[] = [];
