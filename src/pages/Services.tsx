import { Link } from 'react-router-dom';
import { ArrowRight, Target, CheckCircle2, AlertCircle } from 'lucide-react';

const services = [
  {
    title: 'Founder Dependency Diagnostic',
    problem: 'Your business is growing, but it still requires your constant intervention to function. You are the primary bottleneck for every major decision and daily operation.',
    whatWeDo: [
      'Workflow and decision-making audit',
      'Identification of single points of failure',
      'Mapping of founder-centric bottlenecks',
      'Operational risk assessment'
    ],
    outcomes: [
      'A prioritized roadmap for founder exit from daily ops',
      'Identified "Freedom Milestones" for the next 12 months',
      'Clarity on which roles to hire next to reduce dependency'
    ],
    expertiseSignal: 'Built diagnostic frameworks for MetMov LLP to identify accountability gaps and performance constraints.',
    cta: 'Start with a Diagnostic'
  },
  {
    title: 'Operating Model Design',
    problem: 'Growth has created chaos. Roles are fuzzy, communication is fragmented, and your team lacks a clear "source of truth" for how the business actually runs.',
    whatWeDo: [
      'Custom organizational architecture design',
      'Definition of clear decision rights (RACI)',
      'Establishment of core communication rhythms',
      'Documentation of critical operating procedures'
    ],
    outcomes: [
      'A repeatable, documented operating system',
      'Drastic reduction in internal friction and "re-work"',
      'A business that runs predictably without founder heroics'
    ],
    expertiseSignal: 'Designed operating structures for growth-stage brands like Nori Next and Y-Not Design & Manufacturing.',
    cta: 'Start with a Diagnostic'
  },
  {
    title: 'Execution Discipline Program',
    problem: 'Your team is talented but reactive. You spend more time firefighting than hitting strategic targets, and accountability feels like a moving target.',
    whatWeDo: [
      'Implementation of goal-tracking frameworks (OKRs/KPIs)',
      'Leadership training on execution habits',
      'Design of high-impact weekly/monthly review cycles',
      'Performance management system integration'
    ],
    outcomes: [
      'A high-performance culture of ownership',
      'Consistent hitting of quarterly strategic targets',
      'Proactive management instead of reactive firefighting'
    ],
    expertiseSignal: 'Built central PMO architectures at Udaan enabling expansion into 28 markets in 15 months.',
    cta: 'Start with a Diagnostic'
  }
];

export default function Services() {
  return (
    <div className="bg-white min-h-screen">
      {/* ... header ... */}
      <section className="pt-48 pb-20 md:pt-60 md:pb-32">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="mb-6">Consulting Services</h1>
            <p className="text-xl md:text-2xl text-accent-light leading-relaxed">
              We design and deploy the operating systems that allow founder-led businesses to scale with discipline and clarity.
            </p>
          </div>
        </div>
      </section>

      {/* Services List */}
      <div className="container-custom pb-40">
        <div className="space-y-40">
          {services.map((service, i) => (
            <div key={i} className="relative">
              {/* Subtle separator for all but first */}
              {i !== 0 && <div className="absolute -top-20 left-0 right-0 h-px bg-border/50" />}
              
              <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
                {/* Left Column: Title & Problem */}
                <div className="lg:col-span-5">
                  <h2 className="text-3xl md:text-4xl mb-8">{service.title}</h2>
                  <div className="bg-muted p-8 rounded-2xl border border-border/50 mb-8">
                    <div className="flex items-start gap-3 text-accent/60 mb-4">
                      <AlertCircle size={20} className="mt-1 flex-shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-widest">The Problem</span>
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
                        What We Do
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
                    <Link to="/book" className="btn-primary gap-3 px-10">
                      {service.cta}
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <section className="bg-muted border-t border-border/50">
        <div className="container-custom text-center">
          <h2 className="mb-8">Not sure which program is right for you?</h2>
          <p className="text-xl text-accent-light mb-12 max-w-2xl mx-auto leading-relaxed">
            Every engagement begins with a diagnostic call to understand your specific bottlenecks and scaling goals.
          </p>
          <Link to="/book" className="btn-primary text-lg px-12 py-5">
            Book a Diagnostic Call
          </Link>
        </div>
      </section>
    </div>
  );
}
