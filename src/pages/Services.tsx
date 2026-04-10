import { Link } from 'react-router-dom';
import { ArrowRight, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { MINI_DIAGNOSTIC_URL, FIT_CALL_URL } from '../constants';
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
