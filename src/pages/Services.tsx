import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, CheckCircle2, Sparkles, Cpu, Layers, Wrench, Users } from 'lucide-react';
import WorkshopForm from '../components/WorkshopForm';
import { FIT_CALL_URL, BUILD_SPRINT_URL, CARE_URL, LINKEDIN_URL, WHATSAPP_URL, CONTACT_EMAIL } from '../constants';
import SEO from '../components/SEO';
import { funnel } from '../lib/funnel';
import { workshops, formatWorkshopDate } from '../data/workshops';

// W3 AEO pass. Single source of truth for the /services FAQ: drives both the
// visible section and the FAQPage JSON-LD node in the @graph below.
// Answers sourced from brand kernel: anjanipandey v1.2 (signed 2026-06-04).
// Ladder rule held: A1-A6 are MetMov-free (rungs 1-2); A7 is the rung-3 cross-link.
// All answers price-free in schema per the 2026-06-04 decision.
const servicesFaqs: { q: string; a: string }[] = [
  {
    q: 'What is a Personal OS?',
    a: 'A Personal OS is an AI operating system built around one person\'s work: standing agents, scheduled automations, and a memory layer that carry the recurring load. The test is what runs while the owner is not typing. I build Personal OS systems on Claude, and I run my own in public, with live metrics on this site.',
  },
  {
    q: 'What does the AI Setup Sprint include?',
    a: 'Two to three focused one-on-one sessions that end with a working Claude-based system shaped to your actual work: projects, prompts, and the first automations. It is the entry rung of the ladder. Price is shared on a short call.',
  },
  {
    q: 'How is a Personal OS different from using ChatGPT or Claude directly?',
    a: 'A chat window answers when asked. An operating system runs on cadence: standing agents, scheduled tasks, and memory that persist between sessions. The difference shows up in what moves while no one is prompting. My own system\'s live metrics are published on this site; that is the standard a Personal OS is built to.',
  },
  {
    q: 'Who delivers the Personal OS Build Sprint?',
    a: 'I do. I architect the build, pair with you weekly, and sign off on the system myself. The sprint includes kickoff, weekly pairing, async support, and a 30-day post-launch warranty.',
  },
  {
    q: 'What does Personal OS Care cover?',
    a: 'Ongoing maintenance for a live Personal OS: a monthly audit call, one new or upgraded subsystem each quarter, model upgrades, bug fixes, and prompt refresh as the underlying models evolve. Support is async, with responses within one business day.',
  },
  {
    q: 'Does Anjani Pandey run his own Personal OS?',
    a: 'Yes. My own multi-subsystem AI operating system runs my consulting practice, my content pipeline, and my personal systems, and it runs in public: the live metrics are on this site. It is both the product and the proof.',
  },
  {
    q: 'Does Anjani Pandey also work with businesses?',
    a: 'Yes, through MetMov, the firm I founded. After a team workshop, a firm can move to MetMov\'s Safe AI Setup and then to Diagnose, which takes 14 working days and leads into an install of about 90 days. The details are at metmov.com.',
  },
];

export default function Services() {
  // Scroll to #workshop-form (or any #section) when arriving from another page. Added 2026-11-04.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash) return;
    const id = window.location.hash.slice(1);
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target || !target.closest) return;
      const el = target.closest('[data-cta-surface]') as HTMLElement | null;
      if (!el) return;
      const source = el.getAttribute('data-cta-surface') || 'unknown';
      const href = (el as HTMLAnchorElement).getAttribute?.('href') || null;
      try {
        funnel.emit('services_cta_click', { source, destination: href });
      } catch {
        /* silent */
      }
    };
    document.addEventListener('click', handler, { capture: true });
    return () => document.removeEventListener('click', handler, { capture: true });
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="AI Workshops and AI Setup for Small Firms | Anjani Pandey"
        description="AI workshops for teams, an AI Readiness Review, and AI setup for individuals, from Anjani Pandey. Firms that want more go on to MetMov's Safe AI Setup and Diagnose."
        canonical="https://www.anjanipandey.com/services"
        jsonLd={{
          // kernel: anjanipandey v1.2 (2026-06-04). All offers price-free in schema
          // (Anjani decision 2026-06-04, extends the 2026-06-01 from-anchored rule to AI Setup Sprint).
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              "@id": "https://www.anjanipandey.com/services#metmov",
              "name": "MetMov Safe AI Setup and Diagnose",
              "description": "Through MetMov, the firm Anjani Pandey founded: a safe AI setup for the whole firm, then Diagnose (14 working days), then an install of about 90 days. For founder-led businesses of INR 10 to 350 crore annual revenue.",
              "provider": {
                "@type": "Organization",
                "name": "MetMov LLP",
                "url": "https://www.metmov.com"
              },
              "areaServed": "Worldwide",
              "serviceType": "Business Consulting"
            },
            {
              "@type": ["Service", "ProfessionalService"],
              "@id": "https://www.anjanipandey.com/services#ai-setup-sprint",
              "image": "https://www.anjanipandey.com/og-image.png",
              "name": "AI Setup Sprint",
              "description": "2-3 focused 1:1 sessions to set up a Claude-based AI system tailored to the individual's work. The entry engagement; scope and price are shared on a short call.",
              "provider": {
                "@type": "Person",
                "@id": "https://www.anjanipandey.com/#person",
                "name": "Anjani Pandey",
                "url": "https://www.anjanipandey.com"
              },
              "areaServed": "Worldwide",
              "serviceType": "AI Consulting"
            },
            {
              "@type": ["Service", "ProfessionalService"],
              "@id": "https://www.anjanipandey.com/services#personal-os-build-sprint",
              "image": "https://www.anjanipandey.com/og-image.png",
              "name": "Personal OS Build Sprint",
              "description": "Done-with-you installation of a Personal OS. Kickoff, weekly pairing, async support, 30-day post-launch warranty. Scope and price agreed on a free 30-minute call.",
              "provider": {
                "@type": "Person",
                "@id": "https://www.anjanipandey.com/#person",
                "name": "Anjani Pandey",
                "url": "https://www.anjanipandey.com"
              },
              "areaServed": "Worldwide",
              "serviceType": "AI Consulting"
            },
            {
              "@type": ["Service", "ProfessionalService"],
              "@id": "https://www.anjanipandey.com/services#personal-os-care",
              "image": "https://www.anjanipandey.com/og-image.png",
              "name": "Personal OS Care",
              "description": "Ongoing maintenance for a live Personal OS, with periodic subsystem upgrades. Scope and price agreed on a free 30-minute call.",
              "provider": {
                "@type": "Person",
                "@id": "https://www.anjanipandey.com/#person",
                "name": "Anjani Pandey",
                "url": "https://www.anjanipandey.com"
              },
              "areaServed": "Worldwide",
              "serviceType": "AI Consulting"
            },
            {
              "@type": ["Service", "ProfessionalService"],
              "@id": "https://www.anjanipandey.com/services#ai-workshops",
              "image": "https://www.anjanipandey.com/og-image.png",
              "name": "AI Workshops for Teams",
              "description": "A hands-on AI session for a company team: a conversation on what really happens when AI agents join the team, then a guided build where each person makes a working AI helper on their own laptop. Scope and price agreed on a call.",
              "provider": {
                "@type": "Person",
                "@id": "https://www.anjanipandey.com/#person",
                "name": "Anjani Pandey",
                "url": "https://www.anjanipandey.com"
              },
              "areaServed": "Worldwide",
              "serviceType": "AI Training"
            },
            {
              "@type": "FAQPage",
              "@id": "https://www.anjanipandey.com/services#faq",
              "mainEntity": servicesFaqs.map((f) => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a },
              })),
            }
          ]
        }}
      />
      {/* ... header ... */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="mb-6">Work with me</h1>
            <p className="text-xl md:text-2xl text-accent-light leading-relaxed">
              I help owners and leadership teams of small, growing firms start with AI safely. Most firms start with a team workshop, and some go on to a deeper setup through MetMov after it.
            </p>
          </div>
        </div>
      </section>

      {/* AI Workshops for Teams (added 2026-10-12, after the GO DESi talk). Personal-brand offer; no MetMov link. */}
      <section id="ai-workshops" className="border-t border-border/50 py-20 md:py-32">
        <div className="container-custom">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60 bg-primary/5 border border-primary/15 rounded-full px-4 py-2 mb-6">
                <Users size={14} />
                For Companies & Teams
              </div>
              <h2 className="text-3xl md:text-4xl mb-6">AI Workshops for Teams</h2>
              <div className="bg-muted p-8 rounded-sm border border-border/50 mb-8">
                <div className="flex items-start gap-3 text-accent/60 mb-4">
                  <Cpu size={20} className="mt-1 flex-shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-widest">The Situation</span>
                </div>
                <p className="text-lg text-accent-light leading-relaxed italic">
                  "We gave everyone an AI login. A few people use it well. Most opened it once. Nobody knows what is safe to trust."
                </p>
              </div>
              <div id="workshops-so-far">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent/40 mb-4">
                  Workshops so far
                </h3>
                <ol className="border-t border-border">
                  {workshops.map((w) => (
                    <li key={w.date + w.host} className="py-4 border-b border-border grid gap-1">
                      <span className="text-xs font-mono text-accent/50">{formatWorkshopDate(w.date)} &middot; {w.city}</span>
                      <span className="text-base font-bold text-accent">{w.host}: {w.title}</span>
                      <span className="text-sm text-accent-light">{w.format}. {w.audience}.</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-12">
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">
                    <Target size={16} />
                    What Happens in the Room
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'A conversation, not a lecture: real stories from the AI system I run every day',
                      'Where AI gets it wrong, and the simple checks that catch it',
                      'A guided build: each person makes a working AI helper on their own laptop',
                      'Practice data made for the session, so no company data leaves the room',
                      'Shaped to your team, your tools and your language (English or Hindi-English)',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-accent-light">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">
                    <CheckCircle2 size={16} />
                    Your Team Walks Away With
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'One AI helper each person built and saw working',
                      'A one-page step guide to repeat it on their own work',
                      'A plain rule for when to trust an AI answer and when to check it',
                      'A short list of the first jobs worth handing to AI in your company',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-accent-light font-medium">
                        <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-muted/50 rounded-sm p-8 border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <div className="text-2xl font-bold text-accent mb-1">In person or online.</div>
                    <p className="text-sm text-accent-light">Paid engagement. Scope and price agreed on a short call.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                    <a href={`${WHATSAPP_URL}?text=${encodeURIComponent('Hi Anjani, I want to ask about an AI workshop for my team. Company: , Team size: ')}`} target="_blank" rel="noopener noreferrer" data-cta-surface="ai_workshops" className="btn-primary gap-3 px-8">
                      Ask on WhatsApp
                      <ArrowRight size={20} />
                    </a>
                    <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" data-cta-surface="ai_workshops_call" className="btn-outline gap-3 px-8">
                      Book a call
                    </a>
                  </div>
                </div>
                <p className="text-xs text-accent-light/50 mt-4 font-medium">
                  Send two lines: your company, team size, and what you want people to leave with. I reply within 24 hours. Prefer email? Write to <a href={`mailto:${CONTACT_EMAIL}`} className="underline select-all">{CONTACT_EMAIL}</a>
                </p>
              </div>
              <WorkshopForm />
            </div>
          </div>
        </div>
      </section>
      {/* AI Readiness Review (added 2026-11-05, brand kernel v1.6: step 2 next to the workshop). No price on the page. */}
      <section id="ai-readiness-review" className="border-t border-border/50 py-20 md:py-28">
        <div className="container-custom">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60 bg-primary/5 border border-primary/15 rounded-full px-4 py-2 mb-6">
                <Target size={14} />
                For Companies & Teams
              </div>
              <h2 className="text-3xl md:text-4xl mb-0">AI Readiness Review</h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-lg text-accent-light leading-relaxed mb-6">
                This is for a firm that wants a plan before it buys another AI tool. Over 2 to 3 weeks I look at how the team works today and pick the first jobs worth handing to AI. Then I build one of them, so the team sees it working on its own data before anyone spends more.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" data-cta-surface="readiness_review" className="btn-primary gap-3 px-8">
                  Ask about a Readiness Review
                  <ArrowRight size={20} />
                </a>
                <p className="text-sm text-accent-light">Paid engagement. Scope and price agreed on a free 30-minute call.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* AI Setup Sprint */}
      <section id="ai-setup-sprint" className="border-t border-border/50 py-20 md:py-32">
        <div className="container-custom">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
            {/* Left Column */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60 bg-primary/5 border border-primary/15 rounded-full px-4 py-2 mb-6">
                <Sparkles size={14} />
                For Individuals & Professionals
              </div>
              <h2 className="text-3xl md:text-4xl mb-6">AI Setup Sprint</h2>
              <div className="bg-muted p-8 rounded-sm border border-border/50 mb-8">
                <div className="flex items-start gap-3 text-accent/60 mb-4">
                  <Cpu size={20} className="mt-1 flex-shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-widest">The Situation</span>
                </div>
                <p className="text-lg text-accent-light leading-relaxed italic">
                  "I know AI can help me work smarter, but I don't know where to start. I'm not technical. I've tried ChatGPT a few times but it felt underwhelming."
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-accent/40">
                <div className="w-8 h-px bg-accent/20" />
                I built my entire consulting firm on AI without writing a single line of code. <Link to="/resources/ai-consulting-stack" className="text-primary hover:underline ml-1">Read how.</Link>
              </div>
              <p className="text-sm text-accent-light/70 mt-4 leading-relaxed">
                The same architecture I'd install for you is running live as my <a href="/os" className="text-primary font-semibold hover:underline">Personal OS</a> &mdash; nine subsystems, public dashboard, real metrics.
              </p>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7 space-y-12">
              <div className="grid md:grid-cols-2 gap-12">
                {/* What we do */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">
                    <Target size={16} />
                    What You Get
                  </h3>
                  <ul className="space-y-4">
                    {[
                      '2-3 focused 1:1 sessions (virtual)',
                      'Full Claude-based AI system setup tailored to your work',
                      'Custom prompt library for your specific workflows',
                      'Tool recommendations matched to your needs (no code required)',
                      'A working AI-powered operating rhythm by the end',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-accent-light">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outcomes */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">
                    <CheckCircle2 size={16} />
                    You Walk Away With
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'AI integrated into your daily workflow, not just bookmarked',
                      'Confidence to use AI independently going forward',
                      'Hours saved every week on research, writing, and admin',
                      'A system you actually use, built around how you think',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-accent-light font-medium">
                        <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="bg-muted/50 rounded-sm p-8 border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <div className="text-2xl font-bold text-accent mb-1">2-3 sessions. Fixed price.</div>
                    <p className="text-sm text-accent-light">No ongoing commitment. Price shared on a short call.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                    <a href={`${WHATSAPP_URL}?text=${encodeURIComponent('Hi Anjani, I am interested in the AI Setup Sprint. My work: ')}`} target="_blank" rel="noopener noreferrer" data-cta-surface="ai_setup_sprint" className="btn-primary gap-3 px-8">
                      Start on WhatsApp
                      <ArrowRight size={20} />
                    </a>
                    <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" data-cta-surface="ai_setup_sprint_call" className="btn-outline gap-3 px-8">
                      Book a call
                    </a>
                  </div>
                </div>
                <p className="text-xs text-accent-light/50 mt-4 font-medium">
                  Self-serve start, no call needed: send two lines about your work and what you've tried. I reply within 24 hours with a clear yes, no, or a better path. Prefer email? Write to <a href={`mailto:${CONTACT_EMAIL}`} className="underline select-all">{CONTACT_EMAIL}</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Personal OS Build Sprint */}
      <section className="border-t border-border/50 py-20 md:py-32">
        <div className="container-custom">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
            {/* Left Column */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60 bg-primary/5 border border-primary/15 rounded-full px-4 py-2 mb-6">
                <Layers size={14} />
                For Operators & Solopreneurs
              </div>
              <h2 className="text-3xl md:text-4xl mb-6">Personal OS Build Sprint</h2>
              <div className="bg-muted p-8 rounded-sm border border-border/50 mb-8">
                <div className="flex items-start gap-3 text-accent/60 mb-4">
                  <Cpu size={20} className="mt-1 flex-shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-widest">The Situation</span>
                </div>
                <p className="text-lg text-accent-light leading-relaxed italic">
                  "I downloaded the Starter Kit. I get the architecture. I don't have four hours a week for three months to wire it up myself, and I'm not going to learn to code to make this work."
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-accent/40">
                <div className="w-8 h-px bg-accent/20" />
                I run three entities on this architecture. I architect your build, pair with you to install it, and sign off on the result myself.
              </div>
              <p className="text-sm text-accent-light/70 mt-4 leading-relaxed">
                See the live architecture powering this on my <a href="/os" className="text-primary font-semibold hover:underline">Personal OS</a> &mdash; nine subsystems, public dashboard, real metrics.
              </p>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7 space-y-12">
              <div className="grid md:grid-cols-2 gap-12">
                {/* What we do */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">
                    <Target size={16} />
                    What You Get
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'Kickoff + discovery to map your workflow and pick the right 3-5 subsystems',
                      'Weekly 60-minute pairing sessions over 4-6 weeks',
                      'Async support on Slack or WhatsApp between sessions',
                      'The Starter Kit architecture customised to your stack',
                      '30-day post-launch warranty on everything we built',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-accent-light">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outcomes */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">
                    <CheckCircle2 size={16} />
                    You Walk Away With
                  </h3>
                  <ul className="space-y-4">
                    {[
                      '3-5 live subsystems talking to each other in your operating rhythm',
                      'Full ownership of every prompt, config, and SOP. No vendor lock-in.',
                      'A self-improving OS baseline that audits and upgrades itself',
                      'Confidence to add subsystems 6, 7, 8 yourself or stay on Care',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-accent-light font-medium">
                        <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Scope & CTA */}
              <div className="bg-muted/50 rounded-sm p-8 border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <div className="text-2xl font-bold text-accent mb-1">4-6 weeks. One-time.</div>
                    <p className="text-sm text-accent-light">Done-with-you. Scope and price agreed on a scoping call.</p>
                  </div>
                  <a href={BUILD_SPRINT_URL} target="_blank" rel="noopener noreferrer" data-cta-surface="build_sprint" className="btn-primary gap-3 px-10">
                    Book a Scoping Call
                    <ArrowRight size={20} />
                  </a>
                </div>
                <p className="text-xs text-accent-light/50 mt-4 font-medium">
                  We'll scope on a free 30-minute call before anyone commits.
                </p>
              </div>

              {/* Prerequisites */}
              <div className="mt-10 bg-white border border-border rounded-sm p-8">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent/60 bg-accent/5 border border-accent/15 rounded-full px-3 py-1 mb-4">
                  <CheckCircle2 size={12} />
                  Before We Start Building Together
                </div>
                <p className="text-sm text-accent-light leading-relaxed mb-4">
                  A Build Sprint is collaborative. We pair on live Google Meet or Zoom sessions to install subsystems on your actual machine. You own the codebase, credentials, and SOPs at the end. To make that possible, a few baseline requirements:
                </p>
                <ul className="space-y-2 text-sm text-accent-light">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-accent/50 mt-1 flex-shrink-0" />
                    <span><strong className="text-accent">Laptop with admin privileges.</strong> Personal or work. A locked-down corporate machine where you can't install software won't work.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-accent/50 mt-1 flex-shrink-0" />
                    <span><strong className="text-accent">OS.</strong> Windows 10/11 or macOS 12 (Monterey) or later.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-accent/50 mt-1 flex-shrink-0" />
                    <span><strong className="text-accent">Specs.</strong> 8 GB RAM minimum, 16 GB recommended. 20 GB free storage.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-accent/50 mt-1 flex-shrink-0" />
                    <span><strong className="text-accent">Internet.</strong> Stable connection, 10 Mbps+ for screen-share pairing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-accent/50 mt-1 flex-shrink-0" />
                    <span><strong className="text-accent">Installed before we start.</strong> Claude Desktop (for Cowork), a code editor like VS Code, Chrome or Edge.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-accent/50 mt-1 flex-shrink-0" />
                    <span><strong className="text-accent">Time commitment.</strong> 4 to 6 hours per week of live pairing sessions across 4 to 6 weeks. You bring your actual work; we build the subsystems around it.</span>
                  </li>
                </ul>
                <p className="text-xs text-accent-light/60 mt-5 leading-relaxed">
                  We cover all of this on the scoping call before you commit. If you're not sure any of it fits, book the call and we'll figure it out together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal OS Care */}
      <section className="border-t border-border/50 py-20 md:py-32">
        <div className="container-custom">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
            {/* Left Column */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60 bg-primary/5 border border-primary/15 rounded-full px-4 py-2 mb-6">
                <Wrench size={14} />
                After Launch
              </div>
              <h2 className="text-3xl md:text-4xl mb-6">Personal OS Care</h2>
              <p className="text-lg text-accent-light leading-relaxed italic">
                A Personal OS without maintenance becomes dead code in six months. Care keeps yours compounding instead of decaying.
              </p>
              <p className="text-sm text-accent-light/70 mt-6 leading-relaxed">
                Available after a Build Sprint, or if you're already running a Personal OS and want to keep it live.
              </p>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">
                  <Target size={16} />
                  What's Included
                </h3>
                <ul className="space-y-4">
                  {[
                    "Monthly 60-minute audit call. What's decaying, what's upgradable, what's next.",
                    'One new or upgraded subsystem every quarter. You pick the priority.',
                    'Model upgrades, bug fixes, and prompt refresh as kernels evolve.',
                    'Priority async response on Slack or WhatsApp, within one business day.',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-accent-light">
                      <CheckCircle2 size={18} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scope & CTA */}
              <div className="bg-muted/50 rounded-sm p-8 border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <div className="text-2xl font-bold text-accent mb-1">Monthly retainer.</div>
                    <p className="text-sm text-accent-light">Scope and price agreed on a free 30-minute call.</p>
                  </div>
                  <a href={CARE_URL} target="_blank" rel="noopener noreferrer" data-cta-surface="os_care" className="btn-primary gap-3 px-10">
                    Talk About Care
                    <ArrowRight size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Cross-brand ladder (positioning lock 2026-05-31). Firewall: rungs 1-2 are anjanipandey personal; MetMov is cross-linked only at the top rung. */}
      <section className="border-t border-border/50 py-20 md:py-32">
        <div className="container-custom">
          <div className="max-w-3xl mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent/40 mb-4">How it ladders</p>
            <h2 className="text-3xl md:text-4xl mb-6">From a first AI system to a firm that runs without you</h2>
            <p className="text-lg text-accent-light leading-relaxed">
              Each rung stands on its own. Together they run from your first AI setup, to a full Personal OS, to the operating backbone of the business itself.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-4 items-stretch">
            {/* Rung 1 */}
            <div className="bg-white border border-border rounded-sm p-8 flex flex-col">
              <div className="w-12 h-12 bg-muted rounded-sm flex items-center justify-center text-primary mb-6">
                <Sparkles size={22} />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-accent/40 mb-2">For individuals</div>
              <h3 className="text-xl font-bold mb-2">AI Setup Sprint</h3>
              <div className="text-sm font-semibold text-accent mb-4">2-3 sessions</div>
              <p className="text-sm text-accent-light leading-relaxed flex-grow">A working Claude-based AI system built around how you work. The entry rung.</p>
            </div>
            {/* Rung 2 */}
            <div className="bg-white border border-accent/30 rounded-sm p-8 flex flex-col">
              <div className="w-12 h-12 bg-muted rounded-sm flex items-center justify-center text-primary mb-6">
                <Layers size={22} />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-accent/40 mb-2">For operators</div>
              <h3 className="text-xl font-bold mb-2">Build Sprint + Care</h3>
              <div className="text-sm font-semibold text-accent mb-4">4-6 week build, then monthly care</div>
              <p className="text-sm text-accent-light leading-relaxed flex-grow">Install a full Personal OS, then keep it compounding instead of decaying.</p>
            </div>
            {/* Rung 3 — MetMov (the only cross-brand link; firewall held) */}
            <div className="bg-accent text-white rounded-sm p-8 flex flex-col">
              <div className="w-12 h-12 bg-white/10 rounded-sm flex items-center justify-center text-white mb-6">
                <Target size={22} />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">For the business</div>
              <h3 className="text-xl font-bold mb-2">Safe AI Setup, then Diagnose</h3>
              <div className="text-sm font-semibold text-white/70 mb-4">MetMov &middot; after a workshop</div>
              <p className="text-sm text-white/70 leading-relaxed mb-6 flex-grow">When the whole firm is ready, MetMov sets up AI with safety controls first. Diagnose then takes 14 working days and shows what to fix in how the firm runs, and the install after it takes about 90 days.</p>
              <a href="https://www.metmov.com" target="_blank" rel="noopener noreferrer" data-cta-surface="ladder_operating_spine" className="text-sm font-bold flex items-center gap-2 text-white hover:gap-3 transition-all">
                See MetMov <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* W3 AEO FAQ. kernel: anjanipandey v1.2 (2026-06-04). Rungs 1-2 MetMov-free; final question is the rung-3 cross-link. */}
      <section className="border-t border-border/50 py-20 md:py-32">
        <div className="container-custom">
          <div className="max-w-3xl mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent/40 mb-4">Questions</p>
            <h2 className="text-3xl md:text-4xl mb-6">What people ask before they start</h2>
          </div>
          <div className="max-w-3xl space-y-4">
            {servicesFaqs.map((f, idx) => (
              <div key={idx} className="bg-white border border-border rounded-sm p-8">
                <h3 className="text-lg font-bold mb-3">{f.q}</h3>
                <p className="text-accent-light leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-muted border-t border-border/50">
        <div className="container-custom text-center">
          <h2 className="mb-8">Which step fits your team?</h2>
          <p className="text-xl text-accent-light mb-12 max-w-2xl mx-auto leading-relaxed">
            Book a free 30-minute call. Tell me where your team is with AI today, and I'll tell you which step makes sense, including when the answer is to wait.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" data-cta-surface="final_call" className="btn-primary text-lg px-12 py-5">
              Book a free 30-minute call
            </a>
            <a href="#workshop-form" data-cta="workshop-form" className="btn-outline text-lg px-12 py-5">
              Ask about a team workshop
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
