import { Link } from 'react-router-dom';
import { ArrowRight, Target, CheckCircle2, AlertCircle, Sparkles, Cpu } from 'lucide-react';
import { MINI_DIAGNOSTIC_URL, FIT_CALL_URL, LINKEDIN_URL } from '../constants';
import SEO from '../components/SEO';

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
      'Not a document—a working rhythm',
      'Drastic reduction in internal friction',
      'A business that runs predictably without founder heroics'
    ],
    expertiseSignal: 'Designed operating structures for growth-stage brands like Nori Next and Y-Not Design & Manufacturing.',
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
    expertiseSignal: 'Built central PMO architectures at Udaan enabling expansion into 28 markets in 15 months.',
    cta: 'Talk to Us',
    subtext: 'For businesses that need embedded operating leadership.'
  }
];

export default function Services() {
  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="Services | Operating Spine & Scaling | Anjani Pandey"
        description="MetMov's operating spine methodology: we diagnose structural bottlenecks, install scalable systems, and embed them into your team. For $1M-$10M ARR businesses."
        canonical="https://www.anjanipandey.com/services"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Operating Spine Consulting",
          "provider": {
            "@type": "Organization",
            "name": "MetMov LLP",
            "url": "https://www.metmov.com"
          },
          "description": "Diagnose structural bottlenecks and install scalable operating systems for $1M-$10M ARR businesses.",
          "areaServed": "Worldwide",
          "serviceType": "Business Consulting"
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
                  <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="btn-primary gap-3 px-10">
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
