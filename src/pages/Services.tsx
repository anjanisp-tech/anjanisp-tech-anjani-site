import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, CheckCircle2, AlertCircle, Sparkles, Cpu, Layers, Wrench } from 'lucide-react';
import { MINI_DIAGNOSTIC_URL, FIT_CALL_URL, BUILD_SPRINT_URL, CARE_URL, LINKEDIN_URL } from '../constants';
import SEO from '../components/SEO';
import { funnel } from '../lib/funnel';

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
    a: 'Two to three focused one-on-one sessions that end with a working Claude-based system shaped to your actual work: projects, prompts, and the first automations. It is the entry rung of the ladder; current pricing is on this page.',
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
    a: 'Yes, through MetMov, the firm I founded. MetMov installs the operating spine for founder-led firms in a senior-led, 90-day engagement; details at metmov.com. The Personal OS line on this page is for individuals and operators; MetMov is the track for the business itself.',
  },
];

const services = [
  {
    title: 'Diagnostic Sprint',
    problem: 'You sense something is structurally wrong but can\'t name it precisely. Growth has created friction that you can\'t pinpoint.',
    whatWeDo: [
      'Deep structural diagnosis using our 25-disease taxonomy',
      'Mapping of disease presence and severity',
      'Identification of structural bottlenecks',
      'Prioritization of intervention roadmap'
    ],
    outcomes: [
      'Diagnostic Report with disease map',
      'Severity scores for each disease cluster',
      'A prioritized intervention roadmap',
      'Clarity on structural risks to scale'
    ],
    expertiseSignal: 'Built diagnostic frameworks for MetMov LLP to identify accountability gaps and performance constraints.',
    cta: 'Start with a Fit Call',
    subtext: 'We\'ll assess if a Diagnostic Sprint is the right entry point.'
  },
  {
    title: 'Operating Spine Install',
    problem: 'You\'ve diagnosed the issues. Now you need the structural backbone installed. You need a system that runs without your constant intervention.',
    whatWeDo: [
      'Custom design and installation of your Operating Spine',
      'Cadence architecture and review rhythms',
      'Definition of clear decision rights (RACI)',
      'KPI systems and escalation protocols',
      'Accountability model design'
    ],
    outcomes: [
      'A functioning operating system embedded in your business',
      'Not a document, a working rhythm',
      'Drastic reduction in internal friction',
      'A business that runs predictably without founder heroics'
    ],
    expertiseSignal: 'Designed operating structures for growth-stage consumer brands.',
    cta: 'Talk to Us',
    subtext: 'This typically follows a Diagnostic Sprint. Let\'s see where you are.'
  },
  {
    title: 'Fractional COO',
    problem: 'You need embedded operating leadership but aren\'t ready for a full-time COO hire. You need someone to run the rhythm while you build internal capability.',
    whatWeDo: [
      'One of our partners sits inside your business',
      'Running the operating rhythm and cadence',
      'Building internal capability and leadership habits',
      'Managing performance systems and escalations',
      'Systematic exit once capability is built'
    ],
    outcomes: [
      'Operating independence',
      'A business that runs without the founder being the system',
      'High-performance culture of ownership',
      'Consistent hitting of strategic targets'
    ],
    expertiseSignal: 'Built central PMO architectures at Udaan enabling rapid expansion across more than two dozen markets.',
    cta: 'Talk to Us',
    subtext: 'For businesses that need embedded operating leadership.'
  }
];

export default function Services() {
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
        title="Services | Operating Spine & Personal OS | Anjani Pandey"
        description="Two tracks. For businesses: MetMov's Operating Spine methodology. For operators: Personal OS Build Sprint and Care. AI setup sprints for individuals."
        canonical="https://www.anjanipandey.com/services"
        jsonLd={{
          // kernel: anjanipandey v1.2 (2026-06-04). All offers price-free in schema
          // (Anjani decision 2026-06-04, extends the 2026-06-01 from-anchored rule to AI Setup Sprint).
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Service",
              "@id": "https://www.anjanipandey.com/services#operating-spine",
              "name": "Operating Spine Consulting",
              "description": "Diagnose structural bottlenecks and install scalable operating systems for $1M-$10M ARR businesses. Includes Diagnostic Sprint, Operating Spine Install, and Fractional COO engagements.",
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
              "description": "2-3 focused 1:1 sessions to set up a Claude-based AI system tailored to the individual's work. Fixed-price entry engagement; current price on this page.",
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
              "description": "Done-with-you installation of a Personal OS. Kickoff, weekly pairing, async support, 30-day post-launch warranty. Pricing from-anchored; scope agreed on a fit call.",
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
              "description": "Ongoing maintenance for a live Personal OS, with periodic subsystem upgrades. Scope and pricing agreed on a fit call.",
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
            <h1 className="mb-6">Consulting Interventions</h1>
            <p className="text-xl md:text-2xl text-accent-light leading-relaxed">
              We diagnose structural diseases and install the <strong>Operating Spine</strong> that lets founder-led businesses scale with discipline.
            </p>
          </div>
        </div>
      </section>

      {/* Services List */}
      <div className="container-custom pb-20">
        <div className="space-y-40">
          {services.map((service, i) => (
            <div key={i} className="relative">
              {/* Subtle separator for all but first */}
              {i !== 0 && <div className="absolute -top-20 left-0 right-0 h-px bg-border/50" />}
              
              <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
                {/* Left Column: Title & Problem */}
                <div className="lg:col-span-5">
                  <div className="mb-4">
                    <h2 className="text-3xl md:text-4xl mb-0">{service.title}</h2>
                  </div>
                  <div className="bg-muted p-8 rounded-2xl border border-border/50 mb-8">
                    <div className="flex items-start gap-3 text-accent/60 mb-4">
                      <AlertCircle size={20} className="mt-1 flex-shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-widest">The Symptom</span>
                    </div>
                    <p className="text-lg text-accent-light leading-relaxed italic">
                      "{service.problem}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-accent/40">
                    <div className="w-8 h-px bg-accent/20" />
                    {service.expertiseSignal}
                  </div>
                </div>

                {/* Right Column: What we do & Outcomes */}
                <div className="lg:col-span-7 space-y-12">
                  <div className="grid md:grid-cols-2 gap-12">
                    {/* What we do */}
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">
                        <Target size={16} />
                        The Intervention
                      </h3>
                      <ul className="space-y-4">
                        {service.whatWeDo.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-accent-light">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Outcomes */}
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">
                        <CheckCircle2 size={16} />
                        Expected Outcomes
                      </h3>
                      <ul className="space-y-4">
                        {service.outcomes.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-accent-light font-medium">
                            <CheckCircle2 size={18} className="text-accent mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="btn-primary gap-3 px-10">
                      {service.cta}
                      <ArrowRight size={20} />
                    </a>
                    <p className="text-xs text-accent-light/50 mt-3 font-medium">
                      {service.subtext}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* AI Setup Sprint */}
      <section className="border-t border-border/50 py-20 md:py-32">
        <div className="container-custom">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
            {/* Left Column */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary/60 bg-primary/5 border border-primary/15 rounded-full px-4 py-2 mb-6">
                <Sparkles size={14} />
                For Individuals & Professionals
              </div>
              <h2 className="text-3xl md:text-4xl mb-6">AI Setup Sprint</h2>
              <div className="bg-muted p-8 rounded-2xl border border-border/50 mb-8">
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
              <div className="bg-muted/50 rounded-2xl p-8 border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <div className="text-3xl font-bold text-accent mb-1">&#8377;25,000</div>
                    <p className="text-sm text-accent-light">Fixed price. 2-3 sessions. No ongoing commitment.</p>
                  </div>
                  <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" data-cta-surface="ai_setup_sprint" className="btn-primary gap-3 px-10">
                    Book a Free Intro Call
                    <ArrowRight size={20} />
                  </a>
                </div>
                <p className="text-xs text-accent-light/50 mt-4 font-medium">
                  We'll start with a free 20-minute call to understand your workflow and see if this is the right fit.
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
              <div className="bg-muted p-8 rounded-2xl border border-border/50 mb-8">
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
              <div className="bg-muted/50 rounded-2xl p-8 border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <div className="text-3xl font-bold text-accent mb-1">From &#8377;1.5L</div>
                    <p className="text-sm text-accent-light">One-time, done-with-you. Final scope and price agreed on a scoping call.</p>
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
              <div className="mt-10 bg-white border border-border rounded-2xl p-8">
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
              <div className="bg-muted/50 rounded-2xl p-8 border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <div className="text-3xl font-bold text-accent mb-1">&#8377;25k<span className="text-lg font-semibold">/mo</span></div>
                    <p className="text-sm text-accent-light">Monthly retainer. Final scope agreed on a fit call.</p>
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
            <div className="bg-white border border-border rounded-2xl p-8 flex flex-col">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-primary mb-6">
                <Sparkles size={22} />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-accent/40 mb-2">For individuals</div>
              <h3 className="text-xl font-bold mb-2">AI Setup Sprint</h3>
              <div className="text-sm font-semibold text-accent mb-4">&#8377;25,000</div>
              <p className="text-sm text-accent-light leading-relaxed flex-grow">A working Claude-based AI system built around how you work. The entry rung.</p>
            </div>
            {/* Rung 2 */}
            <div className="bg-white border border-accent/30 rounded-2xl p-8 flex flex-col shadow-md">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-primary mb-6">
                <Layers size={22} />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-accent/40 mb-2">For operators</div>
              <h3 className="text-xl font-bold mb-2">Build Sprint + Care</h3>
              <div className="text-sm font-semibold text-accent mb-4">from &#8377;1.5L + &#8377;25k/mo</div>
              <p className="text-sm text-accent-light leading-relaxed flex-grow">Install a full Personal OS, then keep it compounding instead of decaying.</p>
            </div>
            {/* Rung 3 — MetMov (the only cross-brand link; firewall held) */}
            <div className="bg-accent text-white rounded-2xl p-8 flex flex-col">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white mb-6">
                <Target size={22} />
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">For the business</div>
              <h3 className="text-xl font-bold mb-2">Operating Spine Install</h3>
              <div className="text-sm font-semibold text-white/70 mb-4">MetMov &middot; senior tier</div>
              <p className="text-sm text-white/70 leading-relaxed mb-6 flex-grow">When the firm, not just the operator, needs the structural backbone to scale without the founder as the system.</p>
              <a href="https://metmov.com/operating-spine" target="_blank" rel="noopener noreferrer" data-cta-surface="ladder_operating_spine" className="text-sm font-bold flex items-center gap-2 text-white hover:gap-3 transition-all">
                See Operating Spine Install <ArrowRight size={16} />
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
              <div key={idx} className="bg-white border border-border rounded-2xl p-8">
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
          <h2 className="mb-8">Not sure which intervention is right for you?</h2>
          <p className="text-xl text-accent-light mb-12 max-w-2xl mx-auto leading-relaxed">
            Every engagement begins with a diagnostic call to understand your specific structural diseases and scaling goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={MINI_DIAGNOSTIC_URL} target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-12 py-5">
              Take the Free Diagnostic
            </a>
            <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="btn-outline text-lg px-12 py-5">
              Talk to Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
