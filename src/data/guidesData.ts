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
    title: 'I Don\u2019t Write Code. I Built a 3-Person Consulting Firm Entirely with AI.',
    subtitle: 'Zero coding. Zero technical background. Here\u2019s the exact AI stack, workflows, and mental models I use to run MetMov.',
    description: 'A non-technical founder\u2019s guide to building a lean consulting operation using AI as infrastructure. No coding required. Real tools, real costs, real tradeoffs from someone who can\u2019t write a line of code.',
    category: 'AI + Operations',
    readTime: '14 min read',
    publishedDate: '2026-04-15',
    ogImage: 'https://www.anjanipandey.com/og/og-ai-consulting-stack.png',
    gated: true,
    published: true,
    teaserContent: `Let me get this out of the way: I cannot write code. Not Python, not JavaScript, not a single line. My background is operations, supply chain, and consulting. I\u2019ve spent 14 years inside businesses, not inside terminals.

And yet: I built a consulting firm that runs on AI infrastructure. MetMov operates with 3 people and delivers work that would typically need 8-10. I built this website you\u2019re reading. I built automated workflows, a CRM layer, lead gen pipelines, proposal systems, and a content engine. All of it powered by AI. None of it requiring me to code.

This is not a flex. This is a signal: **if I can do this, you absolutely can too.**

This guide breaks down exactly how I did it. The tools, the workflows, the decision frameworks, and the honest tradeoffs.

## Who This Is For

This is for professionals who are good at their craft but feel locked out of the AI advantage because they think it requires technical skills. Specifically:

- **Consultants and freelancers** hitting a delivery ceiling and can\u2019t hire their way out
- **Founders and operators** who want AI leverage but don\u2019t have (or want) a technical co-founder
- **Professionals in any field** who sense that AI could transform their workflow but don\u2019t know where to start without coding

If you\u2019ve ever thought "I\u2019d use AI more if I were more technical" \u2014 this guide is specifically for you. That belief is wrong, and I\u2019m going to show you why.

## The Core Thesis

Most people treat AI as a tool. A smarter autocomplete. A faster first draft. That\u2019s like using a car to store groceries. You\u2019re missing the engine.

The real shift: **AI as infrastructure, not as a tool.** When you treat AI as the operating layer of your business, you don\u2019t just work faster. You work differently. Your unit economics change. Your service model changes. Your competitive surface changes.

And here\u2019s the part nobody talks about: **you don\u2019t need to be technical to build this.** The new generation of AI tools (Claude, ChatGPT, Make.com, Notion AI) are designed for people who think in systems, not syntax. If you can describe what you want clearly, you can build it.

Here\u2019s what that looks like in practice.`,

    fullContent: `Let me get this out of the way: I cannot write code. Not Python, not JavaScript, not a single line. My background is operations, supply chain, and consulting. I\u2019ve spent 14 years inside businesses, not inside terminals.

And yet: I built a consulting firm that runs on AI infrastructure. MetMov operates with 3 people and delivers work that would typically need 8-10. I built this website you\u2019re reading. I built automated workflows, a CRM layer, lead gen pipelines, proposal systems, and a content engine. All of it powered by AI. None of it requiring me to code.

This is not a flex. This is a signal: **if I can do this, you absolutely can too.**

This guide breaks down exactly how I did it. The tools, the workflows, the decision frameworks, and the honest tradeoffs.

## Who This Is For

This is for professionals who are good at their craft but feel locked out of the AI advantage because they think it requires technical skills. Specifically:

- **Consultants and freelancers** hitting a delivery ceiling and can\u2019t hire their way out
- **Founders and operators** who want AI leverage but don\u2019t have (or want) a technical co-founder
- **Professionals in any field** who sense that AI could transform their workflow but don\u2019t know where to start without coding

If you\u2019ve ever thought "I\u2019d use AI more if I were more technical" \u2014 this guide is specifically for you. That belief is wrong, and I\u2019m going to show you why.

## The Core Thesis

Most people treat AI as a tool. A smarter autocomplete. A faster first draft. That\u2019s like using a car to store groceries. You\u2019re missing the engine.

The real shift: **AI as infrastructure, not as a tool.** When you treat AI as the operating layer of your business, you don\u2019t just work faster. You work differently. Your unit economics change. Your service model changes. Your competitive surface changes.

And here\u2019s the part nobody talks about: **you don\u2019t need to be technical to build this.** The new generation of AI tools (Claude, ChatGPT, Make.com, Notion AI) are designed for people who think in systems, not syntax. If you can describe what you want clearly, you can build it.

Here\u2019s what that looks like in practice.

---

## A Quick Note on "Technical"

When I say I\u2019m not technical, I mean it literally. I don\u2019t know what an API is at the code level. I\u2019ve never opened a terminal by choice. When Claude writes code for me, I cannot read it to verify whether it\u2019s correct. I test it by running it and seeing what happens.

What I *am* good at: thinking in systems, describing what I want precisely, and iterating fast when something doesn\u2019t work. That turns out to be enough. More than enough.

The skill that matters with AI isn\u2019t coding. It\u2019s **clarity of thought.** If you can explain a process to a smart new hire, you can explain it to Claude. And Claude never forgets, never gets tired, and works at 3 AM without complaining.

---

## Layer 1: Lead Generation & Research

### The Problem
Traditional consulting lead gen is manual, slow, and expensive. You either pay for leads, attend events, or rely on referrals. All three cap out fast for a small firm.

### My Stack (Zero Code Required)
- **Apollo.io** for prospecting and contact enrichment. I define an ICP (industry, headcount, revenue range, tech signals) and Apollo surfaces decision-makers with verified emails. The entire interface is point-and-click. No code.
- **Claude** for account research. Before any outreach, I tell Claude: "Research this company. Tell me their recent news, org structure, likely pain points, and whether they fit our ICP." What used to take 45 minutes per prospect now takes 3. I type in plain English. Claude does the rest.
- **LinkedIn + AI content** for inbound. I post daily on LinkedIn. My process: I write raw thoughts in bullet points, then ask Claude to structure them into a post. I edit for voice and hit publish. This drives ~40% of inbound leads. No social media tools, no scheduling software. Just me, Claude, and LinkedIn.

### The Math
Pre-AI: ~5 qualified leads/week, 8 hours of research and outreach effort.
Post-AI: ~15 qualified leads/week, 3 hours of effort. Same quality threshold.

That\u2019s not 3x speed. It\u2019s a fundamentally different operating model. And I didn\u2019t write a single script to get there.

---

## Layer 2: Proposal & Scoping

### The Problem
Every proposal is custom. Research, frameworks, decks. Spending 6-8 hours on a proposal that might not close is brutal when you\u2019re a small firm.

### My Stack (Zero Code Required)
- **Claude** for first-draft proposals. I feed it the research output from Layer 1, my service packages, and examples of past winning proposals. It generates a 70-80% complete draft in minutes. I literally copy-paste my notes and say "write a proposal based on this."
- **Notion** as the proposal template library. Every closed deal\u2019s proposal becomes a template. I tell Claude which template is closest and it adapts.
- **Gamma.app** for presentation-ready decks. I paste the proposal text, Gamma turns it into slides. No PowerPoint skills required.

### The Workflow
1. Research brief (from Layer 1) goes into Claude as context
2. Claude generates draft with scope, timeline, pricing, and risk flags
3. I spend 30-45 minutes editing for voice, nuance, and strategic additions
4. Final output in 1 hour vs. 6-8 hours previously

### Key Tradeoff
AI proposals can feel generic if you\u2019re lazy about it. The 30-45 minutes of human editing isn\u2019t optional. It\u2019s where the expertise shows. The AI does the scaffolding. You do the insight. This is true whether you\u2019re technical or not.

---

## Layer 3: Delivery & Execution

### The Problem
"Sure, AI can write emails. But can it do the actual work?" This is where most AI-curious professionals get stuck.

### My Stack (Zero Code Required)
- **Claude** for analysis work. Market research, competitive analysis, process mapping, data synthesis. I describe what I need in plain language: "Analyze these 5 competitors across pricing, positioning, and market share. Give me a comparison table." It delivers in minutes what would take a junior analyst a day.
- **Make.com** for workflow automation. Client onboarding sequences, status update triggers, deliverable routing. Make.com is visual \u2014 you drag boxes and connect them. No code. What used to require a project coordinator now runs on autopilot.
- **Notion** as the client delivery workspace. Structured, transparent, async-first.
- **Loom + AI summaries** for client communication. Record a 5-minute walkthrough, AI generates the written summary and action items.

### What AI Can\u2019t Do (Yet)
- Senior-level strategic judgment. It can surface patterns, but it can\u2019t tell you which pattern matters for *this* client in *this* context.
- Relationship management. Reading the room in a stakeholder meeting. Knowing when to push and when to listen.
- Novel framework creation. AI remixes existing thinking well. Original synthesis still requires your brain.

### The Honest Assessment
AI handles about 40-50% of total delivery effort. But it handles the *least differentiated* 40-50%. That frees me to spend more time on the work clients actually pay a premium for: judgment, synthesis, and strategic direction.

---

## Layer 4: Operations & Back Office

### The Problem
A 3-person firm still needs invoicing, contracts, scheduling, reporting, and admin. These don\u2019t generate revenue but consume real hours.

### My Stack (Zero Code Required)
- **Calendly** for scheduling. Point-and-click setup, done in 20 minutes.
- **Google Workspace + Claude** for email management. I draft responses in Claude and paste them. For routine threads, Claude drafts the reply and I just review.
- **Supabase** as a lightweight data layer. Okay, this one Claude actually built for me. I described what I needed ("a database to track clients, engagements, and pipeline") and Claude wrote the schema, the queries, everything. I deployed it by following Claude\u2019s step-by-step instructions. I still can\u2019t read the code it wrote. It works.
- **Claude** for contract drafts, SOW generation, and policy documents. I describe the engagement terms in plain language, Claude generates the legal-ish document, and my actual lawyer reviews it.

### This Website
This is worth calling out separately: **the website you\u2019re reading right now was built entirely by me and Claude.** React, Tailwind, Vite, Vercel deployment, prerendering, SEO optimization \u2014 I understand none of these at the code level. I described what I wanted. Claude built it. I iterated by saying "make this section wider" or "add a button here" or "the mobile layout looks broken, fix it." That\u2019s it.

If I can build and deploy a production website without knowing what React is, the "I\u2019m not technical enough for AI" excuse is dead.

### Hours Saved
Pre-AI: ~10 hours/week on admin and operations.
Post-AI: ~3 hours/week. The remaining 3 hours are mostly human-judgment tasks (reviewing contracts, strategic scheduling decisions).

---

## The Full Picture: Unit Economics

Here\u2019s what this adds up to:

| Function | Pre-AI Hours/Week | Post-AI Hours/Week | Savings |
|---|---|---|---|
| Lead Gen & Research | 8 | 3 | 63% |
| Proposals & Scoping | 6 | 2 | 67% |
| Delivery | 25 | 15 | 40% |
| Operations & Admin | 10 | 3 | 70% |
| **Total** | **49** | **23** | **53%** |

That\u2019s **half the hours for the same (or better) output.** And remember: I achieved this without writing a single line of code myself. The constraint was never technical skill. It was willingness to experiment and clarity of thought.

---

## What I\u2019d Tell You If We Were Having Coffee

1. **Start with operations, not delivery.** Most people try to use AI for client work first. Start with your own back office. Lower stakes, faster feedback loops, builds your intuition for how AI thinks.

2. **Talk to AI like you\u2019d talk to a smart new hire.** Be specific. Give context. Show examples of what "good" looks like. The quality of AI output is directly proportional to the quality of your input. This is a communication skill, not a technical one.

3. **Build prompts like SOPs.** When you find a prompt that works well, save it. Refine it. Reuse it. Your prompt library becomes your operating system.

4. **Don\u2019t hide the AI.** I\u2019m transparent with clients about using AI in my workflow. It\u2019s a feature, not a secret. "I use AI to handle research and drafting so I can spend more time on strategic thinking for your business." Nobody has ever objected. Most are impressed.

5. **Measure in hours, not vibes.** Track your time before and after. If you can\u2019t quantify the improvement, you\u2019re probably not getting one.

---

## Getting Started: The 30-Day Playbook

**Week 1:** Audit your workflow. Write down every recurring task you do in a week. For each one, ask: "Could I describe this clearly enough for a smart assistant to do it?" If yes, that\u2019s an AI candidate.

**Week 2:** Set up Claude (or ChatGPT) for your operations. Start with email drafting, meeting prep, and document generation. Get comfortable with the back-and-forth.

**Week 3:** Move to research and lead gen. Use AI to research prospects, summarize industry reports, or draft outreach messages. This is where the time savings start compounding.

**Week 4:** Tackle proposals or client deliverables. Start with drafts, not finals. Let AI do 70%, you do the remaining 30% that requires your expertise.

---

## Want Help Setting This Up?

I offer a **1:1 AI Setup Sprint** where I personally help you build your Claude-based AI system. We go through your specific workflows, set up the tools, build your prompt library, and get you operational in 2-3 focused sessions. No technical knowledge required \u2014 that\u2019s literally the point.

[Learn more about the AI Setup Sprint](/services) or [book a free call to see if it\u2019s a fit](https://calendly.com/metmovllp/30min).

---

## Final Thought

The professionals who win in the next 5 years won\u2019t be the most technical. They\u2019ll be the ones who learn to think clearly and communicate with AI effectively. That\u2019s a skill anyone can learn. I\u2019m proof.

You don\u2019t need to code. You need to think in systems. AI handles the rest.

---

*Want to discuss how this applies to your work? [Book a call](https://calendly.com/metmovllp/30min) or [connect with me on LinkedIn](https://www.linkedin.com/in/anjanispandey/).*`,
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
