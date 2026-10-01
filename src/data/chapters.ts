// The Field Manual (2026-10-01). anjanipandey.com stopped being a feed and
// became a handbook: every essay is filed into one of six chapters. Five are
// the structural diseases of founder-led businesses (from the content charter);
// the sixth is the operating-in-public track about building the author's own
// system. New essays file themselves by `category` when they are not listed
// here (see chapterForPost); move a slug into FILING to override.

export type ChapterSlug =
  | 'founder-trap'
  | 'structure-without-spine'
  | 'execution-breakdown'
  | 'visibility-collapse'
  | 'growth-induced-fragility'
  | 'operating-in-public';

export interface Chapter {
  slug: ChapterSlug;
  number: string;
  title: string;
  /** The one line a founder recognises themselves in. */
  ask: string;
  /** Two or three sentences at the top of the chapter page. */
  intro: string;
  /** Which door the chapter ends on. */
  door: 'spine' | 'sprint';
  /** Reading order inside the chapter: slugs listed first appear first. */
  readFirst: string[];
}

export const CHAPTERS: Chapter[] = [
  {
    slug: 'founder-trap',
    number: '01',
    title: 'Founder Trap',
    ask: 'Nothing big moves until you say yes.',
    intro:
      'The company has grown. The decisions have not left your desk. Every approval, every exception, every disagreement between two managers still routes through you. It feels like control. It is the ceiling.',
    door: 'spine',
    readFirst: [
      'founder-overload-map',
      'the-founder-approval-trap-why-your-business-cannot-scale-without-you',
      'founder-bottleneck-how-a-real-founder-delegation-framework-cut-approvals-by-73-in-11-weeks',
    ],
  },
  {
    slug: 'structure-without-spine',
    number: '02',
    title: 'Structure Without Spine',
    ask: 'There is an org chart, but nobody owns the outcome.',
    intro:
      'You have titles, teams and a reporting line. What you do not have is a spine: who decides what, on what rhythm, against which number. So the structure looks complete and the work still falls between people.',
    door: 'spine',
    readFirst: [
      'every-business-is-the-same-seven-boxes',
      'why-companies-break-at-rs50-cr-the-middle-layer-problem-in-scaling-operations-for-founder-led-businesses',
      'decision-fragmentation-the-ownership-void-that-slows-every-scaling-business',
    ],
  },
  {
    slug: 'execution-breakdown',
    number: '03',
    title: 'Execution Breakdown',
    ask: 'Plans are agreed in meetings and quietly die.',
    intro:
      'Everyone is busy. Output is high. And yet the things that were decided do not happen, or happen late, or happen differently. Execution is not an effort problem. It is a process-depth problem.',
    door: 'spine',
    readFirst: [
      'the-execution-illusion-why-your-dashboards-are-lying-and-what-to-do-about-it',
      'the-output-illusion',
      'companies-with-shallow-processes-cannot-sustain-deep-growth',
    ],
  },
  {
    slug: 'visibility-collapse',
    number: '04',
    title: 'Visibility Collapse',
    ask: 'You hear about problems from customers, not your team.',
    intro:
      'The dashboard is green and the business is not. Governance has become a verbal yes in a meeting. The early signals are there, in attendance, in delays, in what people stop reporting, and nobody is reading them.',
    door: 'spine',
    readFirst: [
      'your-dashboard-is-lying-to-you-why-business-dashboard-vs-real-governance-is-the-question-most-founders-get-wrong',
      'early-warning-the-meeting-attendance-signal-founders-miss',
    ],
  },
  {
    slug: 'growth-induced-fragility',
    number: '05',
    title: 'Growth-Induced Fragility',
    ask: 'Every new order makes the company more fragile, not stronger.',
    intro:
      'Growth is supposed to compound. In a business without systems it does the opposite: each new customer, hire and product adds load to the same few people and the same thin processes, until speed itself becomes the risk.',
    door: 'spine',
    readFirst: [
      'scaling-reality-why-most-founderled-businesses-outgrow-themselves',
      'systems-outlast-heroics',
      'cash-flow-volatility-in-smes-is-a-system-problem-not-a-finance-problem',
    ],
  },
  {
    slug: 'operating-in-public',
    number: '06',
    title: 'Operating in Public',
    ask: 'What I learn running a company of one on AI agents, written as it happens.',
    intro:
      'I run my own firm as an operating system: nine AI subsystems doing the back office every day. This chapter is the working log of building it. The mistakes are left in, because that is where the lessons are.',
    door: 'sprint',
    readFirst: [
      'why-i-run-my-business-as-an-operating-system-not-a-company',
      'a-tool-is-not-an-operating-system',
      'what-founders-ask-before-they-trust-an-ai-operating-system-for-a-business',
    ],
  },
];

/** Explicit filing of every essay live on 2026-10-01. */
export const FILING: Record<string, ChapterSlug> = {
  // 01 Founder Trap
  'founder-overload-map': 'founder-trap',
  'the-founder-approval-trap-why-your-business-cannot-scale-without-you': 'founder-trap',
  'founder-bottleneck-how-a-real-founder-delegation-framework-cut-approvals-by-73-in-11-weeks': 'founder-trap',
  'why-founder-control-vs-growth-is-the-real-ceiling-on-your-business': 'founder-trap',
  'the-escalation-layer-why-every-decision-lands-on-the-founder': 'founder-trap',
  'delayed-decisions-accumulate-hidden-interest-eventually-the-cost-exceeds-the-risk-of-choosing': 'founder-trap',
  // 02 Structure Without Spine
  'every-business-is-the-same-seven-boxes': 'structure-without-spine',
  'why-companies-break-at-rs50-cr-the-middle-layer-problem-in-scaling-operations-for-founder-led-businesses': 'structure-without-spine',
  'the-org-reorg-trap-why-restructuring-never-fixes-the-real-problem': 'structure-without-spine',
  'when-the-hiring-plan-is-the-actual-problem': 'structure-without-spine',
  'hiring-trap-growing-companies': 'structure-without-spine',
  'decision-fragmentation-the-ownership-void-that-slows-every-scaling-business': 'structure-without-spine',
  // 03 Execution Breakdown
  'the-execution-illusion-why-your-dashboards-are-lying-and-what-to-do-about-it': 'execution-breakdown',
  'the-output-illusion': 'execution-breakdown',
  'stop-counting-deliverables-count-the-hours-you-got-back': 'execution-breakdown',
  'companies-with-shallow-processes-cannot-sustain-deep-growth': 'execution-breakdown',
  'sustainable-companies-run-on-systems-fragile-ones-run-on-heroics': 'execution-breakdown',
  'the-hidden-constraint-problem': 'execution-breakdown',
  // 04 Visibility Collapse
  'your-dashboard-is-lying-to-you-why-business-dashboard-vs-real-governance-is-the-question-most-founders-get-wrong': 'visibility-collapse',
  '-a-verbal-yes-is-not-a-term-business-dashboard-vs-real-governance-in-a-founderled-business': 'visibility-collapse',
  'early-warning-the-meeting-attendance-signal-founders-miss': 'visibility-collapse',
  'the-auditable-org-the-question-nobody-asks-their-ai-agents': 'visibility-collapse',
  'backup-protects-your-files-continuity-protects-your-operation': 'visibility-collapse',
  // 05 Growth-Induced Fragility
  'scaling-reality-why-most-founderled-businesses-outgrow-themselves': 'growth-induced-fragility',
  'scale-sustainability-rule-sustainable-growth-is-always-system-dependent': 'growth-induced-fragility',
  'systems-outlast-heroics': 'growth-induced-fragility',
  'cash-flow-volatility-in-smes-is-a-system-problem-not-a-finance-problem': 'growth-induced-fragility',
  'scope-tradedown-vs-discount-the-pricing-move-that-protects-your-positioning': 'growth-induced-fragility',
  // 06 Operating in Public
  'every-agent-i-build-now-ships-with-a-list-of-what-it-must-not-do': 'operating-in-public',
  'what-founders-ask-before-they-trust-an-ai-operating-system-for-a-business': 'operating-in-public',
  'the-friction-log-is-the-most-valuable-file-in-my-system': 'operating-in-public',
  'from-operator-to-builder-what-i-learned-by-deleting-half-my-ai-agents': 'operating-in-public',
  'my-automation-read-nothing-and-called-it-an-answer': 'operating-in-public',
  'two-of-my-systems-shared-one-resource-and-neither-knew': 'operating-in-public',
  'my-best-automation-does-nothing-most-weeks': 'operating-in-public',
  'from-operator-to-builder-why-i-let-my-ai-agents-make-mistakes-on-purpose': 'operating-in-public',
  'my-ai-rulebook-has-a-hard-page-limit': 'operating-in-public',
  'the-fix-that-created-a-new-failure': 'operating-in-public',
  'a-tool-is-not-an-operating-system': 'operating-in-public',
  'i-do-not-fix-a-problem-the-first-time-it-happens': 'operating-in-public',
  'operator-to-builder-why-my-ai-agents-have-to-earn-autonomy': 'operating-in-public',
  'why-i-run-my-business-as-an-operating-system-not-a-company': 'operating-in-public',
  'a-redirect-can-work-perfectly-and-still-be-wrong-the-whole-difference-is-one-digit': 'operating-in-public',
  'a-redirect-can-work-perfectly-and-still-be-wrong-the-difference-is-one-digit': 'operating-in-public',
  'what-my-mba-missed-about-the-operator-to-builder-transition': 'operating-in-public',
};

/** Fallback for essays published after the filing above. The CMS category is
 *  a weak signal, so this errs toward the chapter the engine writes most. */
const CATEGORY_FALLBACK: Record<string, ChapterSlug> = {
  AI: 'operating-in-public',
  Operations: 'operating-in-public',
  Leadership: 'founder-trap',
  Scaling: 'growth-induced-fragility',
  Strategy: 'structure-without-spine',
};

export function chapterForPost(post: { id: string; category?: string }): Chapter {
  const slug = FILING[post.id] ?? CATEGORY_FALLBACK[post.category ?? ''] ?? 'operating-in-public';
  return CHAPTERS.find((c) => c.slug === slug)!;
}

export function chapterBySlug(slug: string | undefined): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}

/** Posts in a chapter: readFirst order, then newest first. */
export function postsInChapter<T extends { id: string; category?: string; date: string }>(
  chapter: Chapter,
  posts: T[],
): T[] {
  const inChapter = posts.filter((p) => chapterForPost(p).slug === chapter.slug);
  const rank = (p: T) => {
    const i = chapter.readFirst.indexOf(p.id);
    return i === -1 ? 999 : i;
  };
  return inChapter.sort((a, b) => rank(a) - rank(b) || parseDate(b.date) - parseDate(a.date));
}

/** Dates in the CMS look like "16-Sep-2026". */
export function parseDate(d: string): number {
  const t = Date.parse(d.replace(/-/g, ' '));
  return Number.isNaN(t) ? 0 : t;
}
