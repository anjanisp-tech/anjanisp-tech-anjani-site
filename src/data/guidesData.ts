export interface Guide {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  readTime: string;
  publishedDate: string;
  ogImage?: string;
  /** Content visible to everyone (teaser) */
  teaserContent: string;
  /** Full content behind the gate */
  fullContent: string;
  /** Whether this guide is gated */
  gated: boolean;
  /** Whether this guide is published */
  published: boolean;
}

export const guides: Guide[] = [
  {
    slug: 'ai-consulting-stack',
    title: 'How I Build a 3-Person Consulting Firm Using AI',
    subtitle: 'The exact stack, workflows, and mental models behind running MetMov with near-zero overhead.',
    description: 'A practical guide to building a lean consulting operation using AI as infrastructure. Covers the full stack from lead gen to delivery, with real tools, real costs, and real tradeoffs.',
    category: 'AI + Operations',
    readTime: '12 min read',
    publishedDate: '2026-04-15',
    gated: true,
    published: true,
    teaserContent: `Most consulting firms scale by hiring. More people, more overhead, more coordination tax.

I went the other direction. MetMov runs with 3 people and delivers work that typically requires 8-10. The difference isn't hustle. It's architecture.

This guide breaks down exactly how I built that architecture: the AI tools, the workflows, the decision frameworks, and the tradeoffs I made along the way.

## Who This Is For

If you're a solo consultant or running a small firm (1-5 people) and you're hitting the ceiling of what you can deliver without hiring, this is for you. Specifically:

- **Independent consultants** who want to 3x output without 3x hours
- **Small firm founders** tired of the hire-to-grow treadmill
- **Operations people** curious about what AI-native consulting looks like in practice

## The Core Thesis

Most consultants use AI as a tool. A better autocomplete. A faster first draft.

That's like using a car to store groceries. You're missing the engine.

The shift is this: **AI as infrastructure, not as a tool.** When you treat AI as the operating layer of your business, you don't just work faster. You work differently. Your unit economics change. Your service model changes. Your competitive surface changes.

Here's what that looks like in practice.`,

    fullContent: `Most consulting firms scale by hiring. More people, more overhead, more coordination tax.

I went the other direction. MetMov runs with 3 people and delivers work that typically requires 8-10. The difference isn't hustle. It's architecture.

This guide breaks down exactly how I built that architecture: the AI tools, the workflows, the decision frameworks, and the tradeoffs I made along the way.

## Who This Is For

If you're a solo consultant or running a small firm (1-5 people) and you're hitting the ceiling of what you can deliver without hiring, this is for you. Specifically:

- **Independent consultants** who want to 3x output without 3x hours
- **Small firm founders** tired of the hire-to-grow treadmill
- **Operations people** curious about what AI-native consulting looks like in practice

## The Core Thesis

Most consultants use AI as a tool. A better autocomplete. A faster first draft.

That's like using a car to store groceries. You're missing the engine.

The shift is this: **AI as infrastructure, not as a tool.** When you treat AI as the operating layer of your business, you don't just work faster. You work differently. Your unit economics change. Your service model changes. Your competitive surface changes.

Here's what that looks like in practice.

---

## Layer 1: Lead Generation & Research

### The Problem
Traditional consulting lead gen is manual, slow, and expensive. You either pay for leads, attend events, or rely on referrals. All three cap out fast for a small firm.

### My Stack
- **Apollo.io** for prospecting and contact enrichment. I define an ICP (industry, headcount, revenue range, tech signals) and Apollo surfaces decision-makers with verified emails.
- **Claude (Anthropic)** for account research. Before any outreach, I run a research pass: company financials, recent news, org structure, pain signals. What used to take 45 minutes per prospect now takes 3.
- **LinkedIn + AI content** for inbound. I post daily on LinkedIn, using AI to help structure raw ideas into distribution-ready formats. This drives ~40% of inbound leads.

### The Math
Pre-AI: ~5 qualified leads/week, 8 hours of research and outreach effort.
Post-AI: ~15 qualified leads/week, 3 hours of effort. Same quality threshold.

That's not 3x speed. It's a fundamentally different operating model.

---

## Layer 2: Proposal & Scoping

### The Problem
Every proposal is a snowflake. Custom research, custom frameworks, custom decks. At $200-500/hour effective rate, spending 6-8 hours on a proposal that might not close is brutal.

### My Stack
- **Claude** for first-draft proposals. I feed it the research output from Layer 1, my service packages, and past proposals. It generates a 70-80% complete draft in minutes.
- **Notion** as the proposal template library. Every closed deal's proposal becomes a template. AI helps me match new prospects to the closest template.
- **Gamma.app** for presentation-ready decks when clients want slides instead of docs.

### The Workflow
1. Research brief (auto-generated from Layer 1) feeds into proposal prompt
2. Claude generates draft with scope, timeline, pricing, and risk flags
3. I spend 30-45 minutes editing for voice, nuance, and strategic additions
4. Final output in 1 hour vs. 6-8 hours previously

### Key Tradeoff
AI proposals can feel generic if you're lazy about it. The 30-45 minutes of human editing isn't optional. It's where the expertise shows. The AI does the scaffolding. You do the insight.

---

## Layer 3: Delivery & Execution

### The Problem
This is where most AI-curious consultants get stuck. "Sure, AI can write emails. But can it do the actual work?" The answer is nuanced.

### My Stack
- **Claude + custom prompts** for analysis work. Market research, competitive analysis, process mapping, data synthesis. These are high-volume, pattern-heavy tasks where AI genuinely saves 60-70% of time.
- **Make.com** for workflow automation. Client onboarding sequences, status update triggers, deliverable routing. What used to require a project coordinator now runs on autopilot.
- **Notion** as the client delivery workspace. Structured, transparent, async-first.
- **Loom + AI summaries** for client communication. Record a 5-minute walkthrough, AI generates the written summary and action items.

### What AI Can't Do (Yet)
- Senior-level strategic judgment. It can surface patterns, but it can't tell you which pattern matters for this client in this context.
- Relationship management. Reading the room in a stakeholder meeting. Knowing when to push and when to listen.
- Novel framework creation. AI remixes existing thinking well. Original synthesis still requires human cognition.

### The Honest Assessment
AI handles about 40-50% of total delivery effort. But it handles the least differentiated 40-50%. That frees me to spend more time on the 50-60% that clients actually pay a premium for: judgment, synthesis, and strategic direction.

---

## Layer 4: Operations & Back Office

### The Problem
A 3-person firm still needs invoicing, contracts, scheduling, reporting, and admin. These tasks don't generate revenue but they consume real hours.

### My Stack
- **Calendly** for scheduling (obvious, but non-negotiable)
- **Google Workspace + AI** for email management. Smart compose, auto-categorization, draft responses for routine threads.
- **Supabase** as a lightweight CRM/data layer. Client records, engagement history, pipeline tracking.
- **Claude** for contract drafts, SOW generation, and policy documents.

### Hours Saved
Pre-AI: ~10 hours/week on admin and operations.
Post-AI: ~3 hours/week. The remaining 3 hours are mostly human-judgment tasks (reviewing contracts, strategic scheduling decisions).

---

## The Full Picture: Unit Economics

Here's what this adds up to:

| Function | Pre-AI Hours/Week | Post-AI Hours/Week | Savings |
|---|---|---|---|
| Lead Gen & Research | 8 | 3 | 63% |
| Proposals & Scoping | 6 | 2 | 67% |
| Delivery | 25 | 15 | 40% |
| Operations & Admin | 10 | 3 | 70% |
| **Total** | **49** | **23** | **53%** |

That's not "AI makes me slightly faster." That's **half the hours for the same (or better) output.** Which means one of two things: you can take on 2x the clients, or you can spend the saved hours on strategic work that compounds.

I chose a mix of both.

---

## What I'd Do Differently

1. **Start with operations, not delivery.** Most people try to use AI for client work first. Start with your own back office. Lower stakes, faster feedback loops, builds intuition.

2. **Build prompts like SOPs.** Your AI prompts are your process documentation. Treat them that way. Version them. Test them. Improve them.

3. **Don't hide the AI.** I'm transparent with clients about using AI in my workflow. It's a feature, not a secret. "I use AI to handle research and drafting so I can spend more time on strategic thinking for your business."

4. **Measure in hours, not vibes.** Track your time before and after. If you can't quantify the improvement, you're probably not getting one.

---

## Getting Started: The 30-Day Playbook

**Week 1:** Audit your current workflow. Map every recurring task to one of the four layers above. Identify the top 3 time sinks.

**Week 2:** Set up your AI stack for Layer 4 (operations) first. Automate scheduling, email templates, and document generation.

**Week 3:** Move to Layer 1 (lead gen). Set up Apollo or a similar tool. Build your first AI-assisted research workflow.

**Week 4:** Tackle Layer 2 (proposals). Create your first AI-assisted proposal template. Test it on a real prospect.

Layer 3 (delivery) comes after you've built the muscle memory. Don't rush it.

---

## Final Thought

The firms that win in the next 5 years won't be the ones with the most people. They'll be the ones with the best architecture. AI doesn't replace expertise. It amplifies it. But only if you treat it as infrastructure, not as a shortcut.

Build the system. Then let the system build the business.

---

*Want to discuss how this applies to your firm? [Book a call](https://calendly.com/metmovllp/30min) or [connect with me on LinkedIn](https://www.linkedin.com/in/anjanispandey/).*`,
  },
];

/** Get all published guides */
export function getPublishedGuides(): Guide[] {
  return guides.filter((g) => g.published);
}

/** Get a guide by slug */
export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug && g.published);
}

/** Generate guide routes for prerender */
export function getGuideRoutes() {
  return getPublishedGuides().map((g) => ({
    path: `/resources/${g.slug}`,
    prerender: true,
  }));
}
