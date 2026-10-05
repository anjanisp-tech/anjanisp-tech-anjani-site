// The Field Manual. anjanipandey.com is a handbook: every essay is filed into one
// of seven chapters.
//
// 2026-10-02 (Anjani's correction): chapters 01 to 06 are the six failure classes of the
// MetMov method (the "Macro Classification" in the MetMov IP), not the five sales hooks
// the first build used. Each chapter shows a plain founder-facing title, with the
// method's own name for the class in small type underneath. Chapter 07 is the
// operating-in-public track about building the author's own system (the engine's
// "personal brand" territory: AI leverage, operator to builder, specific knowledge).
//
// New essays not listed in FILING go to chapter 07 (see chapterForPost). To put an
// essay in chapters 01 to 06, list its slug in FILING.

export type ChapterSlug =
  | 'who-decides'
  | 'chaos-not-cadence'
  | 'growth-that-breaks'
  | 'letting-go'
  | 'seen-not-acted-on'
  | 'pointed-the-same-way'
  | 'operating-in-public';

export interface Chapter {
  slug: ChapterSlug;
  number: string;
  /** Plain, founder-facing title. */
  title: string;
  /** The MetMov method's name for this failure class, shown small under the title. */
  method: string | null;
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
    slug: 'who-decides',
    number: '01',
    title: 'Who Decides',
    method: 'Decision Architecture Failure',
    ask: 'Nothing big moves until you say yes.',
    intro:
      'The company has grown. The decisions have not left your desk. Nobody below you can say who approves what, up to what limit, by when. So every approval, every exception and every disagreement between two managers still routes through you. It feels like control. It is the ceiling.',
    door: 'spine',
    readFirst: [
      'the-founder-approval-trap-why-your-business-cannot-scale-without-you',
      'founder-bottleneck-how-a-real-founder-delegation-framework-cut-approvals-by-73-in-11-weeks',
      'the-escalation-layer-why-every-decision-lands-on-the-founder',
    ],
  },
  {
    slug: 'chaos-not-cadence',
    number: '02',
    title: 'Chaos, Not Cadence',
    method: 'Execution Rhythm Failure',
    ask: 'Plans are agreed in meetings and quietly die.',
    intro:
      'Everyone is busy. The calendar is full of reviews. And yet the things that were decided do not happen, or happen late, or happen differently. A business runs on a rhythm or it runs on whoever is loudest this week. This chapter is about building the rhythm.',
    door: 'spine',
    readFirst: [
      'early-warning-the-meeting-attendance-signal-founders-miss',
      'the-hidden-constraint-problem',
      'the-output-illusion',
    ],
  },
  {
    slug: 'growth-that-breaks',
    number: '03',
    title: 'Growth That Breaks Things',
    method: 'Growth Structure Failure',
    ask: 'Every new order makes the company more fragile, not stronger.',
    intro:
      'Growth is supposed to compound. In a business without systems it does the opposite: each new customer, hire and product adds load to the same few people and the same thin processes, until speed itself becomes the risk.',
    door: 'spine',
    readFirst: [
      'why-companies-break-at-rs50-cr-the-middle-layer-problem-in-scaling-operations-for-founder-led-businesses',
      'scaling-reality-why-most-founderled-businesses-outgrow-themselves',
      'when-the-hiring-plan-is-the-actual-problem',
    ],
  },
  {
    slug: 'letting-go',
    number: '04',
    title: 'Letting Go',
    method: 'Leadership Maturity Failure',
    ask: 'You say you want to delegate. The work keeps coming back to you.',
    intro:
      'Founders are usually told their problem is delegation skill. More often it is readiness, theirs and the team\'s. Fatigue, avoidance and the quiet need to be the one who decides all pull the work back upward. This chapter names those pulls without treating them as flaws of character.',
    door: 'spine',
    readFirst: [
      'founder-overload-map',
      'delayed-decisions-accumulate-hidden-interest-eventually-the-cost-exceeds-the-risk-of-choosing',
      'the-org-reorg-trap-why-restructuring-never-fixes-the-real-problem',
    ],
  },
  {
    slug: 'seen-not-acted-on',
    number: '05',
    title: 'Seen, Not Acted On',
    method: 'Governance Failure',
    ask: 'The dashboard is green. The business is not.',
    intro:
      'You have the numbers. Live, colour-coded, easy to drill into. What is missing is the step where a number forces a decision. Governance has turned into reporting, and a verbal yes in a meeting stands in for a commitment. This chapter is about turning what you can see into what you do.',
    door: 'spine',
    readFirst: [
      'your-dashboard-is-lying-to-you-why-business-dashboard-vs-real-governance-is-the-question-most-founders-get-wrong',
      'the-execution-illusion-why-your-dashboards-are-lying-and-what-to-do-about-it',
      'cash-flow-volatility-in-smes-is-a-system-problem-not-a-finance-problem',
    ],
  },
  {
    slug: 'pointed-the-same-way',
    number: '06',
    title: 'Pointed the Same Way',
    method: 'Strategic Alignment Failure',
    ask: 'Everyone is working hard. Not everyone is building the same company.',
    intro:
      'Strategy drifts quietly. One big client starts setting the agenda, a second business takes the founder\'s best hours, and the plan on the wall stops matching the work on the floor. This chapter is about keeping the whole company pointed at one thing.',
    door: 'spine',
    readFirst: [
      'scope-tradedown-vs-discount-the-pricing-move-that-protects-your-positioning',
    ],
  },
  {
    slug: 'operating-in-public',
    number: '07',
    title: 'Operating in Public',
    method: null,
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

/** Old chapter addresses from the first build (2026-10-01), for redirects. */
export const OLD_CHAPTER_SLUGS: Record<string, ChapterSlug> = {
  'founder-trap': 'who-decides',
  'structure-without-spine': 'who-decides',
  'execution-breakdown': 'chaos-not-cadence',
  'visibility-collapse': 'seen-not-acted-on',
  'growth-induced-fragility': 'growth-that-breaks',
};

/** Explicit filing, re-done 2026-10-02 against the six method classes and checked
 *  2026-10-05 against the 25-problem list (three essays moved). */
export const FILING: Record<string, ChapterSlug> = {
  // 01 Who Decides (Decision Architecture: founder over-dependency, role ambiguity, escalation layer void)
  'the-founder-approval-trap-why-your-business-cannot-scale-without-you': 'who-decides',
  'founder-bottleneck-how-a-real-founder-delegation-framework-cut-approvals-by-73-in-11-weeks': 'who-decides',
  'the-escalation-layer-why-every-decision-lands-on-the-founder': 'who-decides',
  'decision-fragmentation-the-ownership-void-that-slows-every-scaling-business': 'who-decides',
  'why-founder-control-vs-growth-is-the-real-ceiling-on-your-business': 'who-decides',
  // 02 Chaos, Not Cadence (Execution Rhythm: meetings, execution lag, KPI fragmentation)
  'early-warning-the-meeting-attendance-signal-founders-miss': 'chaos-not-cadence',
  'the-hidden-constraint-problem': 'chaos-not-cadence',
  'the-output-illusion': 'chaos-not-cadence',
  // 03 Growth That Breaks Things (Growth Structure: hiring as medicine, fragility, no middle layer, capacity)
  'why-companies-break-at-rs50-cr-the-middle-layer-problem-in-scaling-operations-for-founder-led-businesses': 'growth-that-breaks',
  'scaling-reality-why-most-founderled-businesses-outgrow-themselves': 'growth-that-breaks',
  'when-the-hiring-plan-is-the-actual-problem': 'growth-that-breaks',
  'hiring-trap-growing-companies': 'growth-that-breaks',
  'scale-sustainability-rule-sustainable-growth-is-always-system-dependent': 'growth-that-breaks',
  'systems-outlast-heroics': 'growth-that-breaks',
  'sustainable-companies-run-on-systems-fragile-ones-run-on-heroics': 'growth-that-breaks',
  'companies-with-shallow-processes-cannot-sustain-deep-growth': 'growth-that-breaks',
  // 04 Letting Go (Leadership Maturity: founder fatigue, avoidance, ego lock)
  'founder-overload-map': 'letting-go',
  'the-org-reorg-trap-why-restructuring-never-fixes-the-real-problem': 'letting-go',
  'delayed-decisions-accumulate-hidden-interest-eventually-the-cost-exceeds-the-risk-of-choosing': 'letting-go',
  // 05 Seen, Not Acted On (Governance: dashboard illusion, cash volatility, compliance neglect)
  'your-dashboard-is-lying-to-you-why-business-dashboard-vs-real-governance-is-the-question-most-founders-get-wrong': 'seen-not-acted-on',
  'the-execution-illusion-why-your-dashboards-are-lying-and-what-to-do-about-it': 'seen-not-acted-on',
  'cash-flow-volatility-in-smes-is-a-system-problem-not-a-finance-problem': 'seen-not-acted-on',
  '-a-verbal-yes-is-not-a-term-business-dashboard-vs-real-governance-in-a-founderled-business': 'seen-not-acted-on',
  // 06 Pointed the Same Way (Strategic Alignment: drift, dilution, client dependency, vision-execution gap)
  'scope-tradedown-vs-discount-the-pricing-move-that-protects-your-positioning': 'pointed-the-same-way',
  // 07 Operating in Public (the author's own system; AI leverage, operator to builder, specific knowledge)
  'every-business-is-the-same-seven-boxes': 'operating-in-public',
  'the-auditable-org-the-question-nobody-asks-their-ai-agents': 'operating-in-public',
  'backup-protects-your-files-continuity-protects-your-operation': 'operating-in-public',
  'operator-to-builder-my-own-report-lied': 'operating-in-public',
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
  'stop-counting-deliverables-count-the-hours-you-got-back': 'operating-in-public',
};

/** Fallback for essays published after the filing above.
 *  2026-10-05 (Anjani's ruling): an essay not listed in FILING goes to chapter 07.
 *  The CMS category is not a reliable signal: most new essays are personal-brand
 *  pieces tagged "Strategy" or "Leadership", which used to drop them into chapters
 *  01 and 06 by mistake. A method essay joins chapters 01 to 06 only by being
 *  listed in FILING. */
const CATEGORY_FALLBACK: Record<string, ChapterSlug> = {};

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
