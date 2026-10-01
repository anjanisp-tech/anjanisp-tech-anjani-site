import { ArrowRight, Linkedin, Mail, Download, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FIT_CALL_URL, LINKEDIN_URL, OPERATING_SPINE_URL, WHATSAPP_URL } from '../constants';
import SEO from '../components/SEO';

const careerTimeline = [
  {
    period: '2025 – Present',
    role: 'Founder & CEO',
    company: 'MetMov LLP',
    type: 'Consulting',
    highlights: [
      'Founded B2B consulting firm diagnosing structural diseases in founder-led businesses',
      'Designing operating models, governance systems, and KPI architectures for scale',
      'Building AI-augmented consulting workflows for research, proposals, and client intelligence',
    ],
  },
  {
    period: '2023 – 2025',
    role: 'Head of Operations, Global Supply Chain',
    company: 'Y-Not Design & Mfg.',
    type: 'Manufacturing / E-Commerce',
    highlights: [
      'Led 24-member global team across sourcing, manufacturing, compliance, and logistics',
      'Built Global B2B & B2C E-Commerce platform from scratch',
      'Modernized ERP (Odoo), improving process accuracy by 20%',
    ],
  },
  {
    period: '2019 – 2022',
    role: 'Program Manager, Central Operations',
    company: 'Udaan',
    type: 'E-Commerce / Tech',
    highlights: [
      'Introduced 5S/Lean Program across Supply Chain -- over a hundred crore in annual savings',
      'Opened more than two dozen new markets, driving multi-thousand-crore GMV growth',
      'Deployed Asset Tracking across a multi-hundred-crore asset base, sharply reducing losses',
    ],
  },
  {
    period: '2019',
    role: 'City Head, Operations',
    company: 'OYO',
    type: 'Hospitality / Tech',
    highlights: [
      'Directed a large team managing thousands of beds and tens of crore in annual revenue',
      'Turned NPS from deeply negative to strongly positive within months',
    ],
  },
  {
    period: '2011 – 2017',
    role: 'Senior Engineer, Project Management',
    company: 'BHEL',
    type: 'Manufacturing / Energy',
    highlights: [
      'Managed 20+ Captive Power Projects across a multi-hundred-MW portfolio and multi-hundred-crore turnover',
      'Led 200+ cross-functional team members',
    ],
  },
];

export default function About() {
  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="About | Anjani Pandey"
        description="Operations and AI transformation leader. 15+ years designing execution systems for global supply chains and high-growth platforms. Founder, MetMov LLP. ISB alumnus. PMP, Six Sigma Black Belt. Based in Bengaluru."
        canonical="https://www.anjanipandey.com/about"
      />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-12 gap-16 items-start">
            <div className="md:col-span-7">
              {/* The letter (2026-10-01). A referred founder wants to know who this is
                  before they call. A note in the first person does that better than a bio. */}
              <span className="label-mono block mb-6">A note from Anjani</span>
              <h1 className="text-4xl md:text-5xl mb-8">If someone sent you here, you are probably the busiest person in your company.</h1>
              <div className="space-y-6 text-lg text-accent-light leading-relaxed">
                <p>
                  I have spent fifteen years inside growing companies, at BHEL, Udaan and Y-NOT among others, building the systems that let them move without waiting on one person. Most founders I meet are not short of ideas or people. They are short of structure, so everything routes back to them.
                </p>
                <p>
                  That is what I fix. Through <a href="https://metmov.com" target="_blank" rel="noopener noreferrer" className="text-accent font-semibold hover:text-primary underline underline-offset-4">MetMov LLP</a>, which I run with my partner Chaitanya Eswarapragada, we diagnose the structural disease and install the operating spine that lets a business run without the founder being the system.
                </p>
                <p>
                  I also run my own firm that way. My <a href="/os" className="text-accent font-semibold hover:text-primary underline underline-offset-4">Personal OS</a> is nine AI subsystems doing the back office every day, in public. Everything I learn doing it goes into <Link to="/" className="text-accent font-semibold hover:text-primary underline underline-offset-4">the manual</Link>, one essay a week, and I install a version of it for operators who want the same.
                </p>
                <p className="font-serif italic text-2xl text-accent pt-2">Anjani</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <a href={OPERATING_SPINE_URL} target="_blank" rel="noopener noreferrer" data-cta="operating-spine" className="btn-primary">Book a 30-minute call</a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-outline">Message on WhatsApp</a>
              </div>
            </div>
            <div className="md:col-span-5 space-y-8">
              {/* Photo from LinkedIn: 800x800 source, cropped 4:5 (640x800 real pixels).
                  Capped at 320px wide so it never shows above its real size on a 2x screen. */}
              <figure className="w-full max-w-[320px] md:max-w-[260px] border border-border">
                <img src="/anjani.jpg" alt="Anjani Pandey" width={640} height={800} className="block w-full aspect-[4/5] object-cover object-center" />
              </figure>
              <div className="bg-muted p-8 rounded-sm border border-border/50">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">Quick Facts</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Based in', value: 'Bengaluru, India' },
                    { label: 'Education', value: 'MBA, Indian School of Business (ISB)' },
                    { label: 'Background', value: 'Manufacturing Engineering' },
                    { label: 'Current', value: 'Founder & CEO, MetMov LLP', href: 'https://metmov.com' },
                    { label: 'Experience', value: '15+ years in operations & transformation' },
                    { label: 'Certifications', value: 'PMP, Six Sigma Black Belt' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-baseline gap-4">
                      <span className="text-sm text-accent/50 font-medium whitespace-nowrap">{item.label}</span>
                      <span className="text-sm font-semibold text-accent text-right">
                        {item.href ? (
                          <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {item.value}
                          </a>
                        ) : (
                          item.value
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-muted p-8 rounded-sm border border-border/50">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">Previously At</h3>
                <div className="flex flex-wrap gap-3">
                  {['Udaan', 'OYO', 'Y-NOT', 'Shopup', 'BHEL', 'Vedanta'].map((company, i) => (
                    <div key={i} className="px-4 py-2 bg-white rounded-sm text-sm font-bold text-accent/60 border border-border/50">
                      {company}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-muted p-8 rounded-sm border border-border/50">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent/40 mb-4">Also Operating</h3>
                <p className="text-sm font-bold text-accent mb-2">Personal OS</p>
                <p className="text-sm text-accent-light leading-relaxed mb-4">
                  A live AI-native operating system. Nine subsystems, Claude as the kernel, public metrics. The architecture I run my own work on, and now install for other operators.
                </p>
                <a
                  href="/os"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline mb-6"
                >
                  Open the OS <ArrowRight size={14} />
                </a>
                <div className="pt-5 border-t border-border/50">
                  <p className="text-sm font-bold text-accent mb-2">MetMov LLP</p>
                  <p className="text-sm text-accent-light leading-relaxed mb-4">
                    B2B consulting firm I founded. We diagnose structural diseases in founder-led businesses and install the operating spine that lets them scale.
                  </p>
                  <a
                    href="https://metmov.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                  >
                    Visit metmov.com <ArrowRight size={14} />
                  </a>
                </div>
              </div>
              <div className="bg-accent/5 p-6 rounded-sm border border-accent/10">
                <div className="flex items-center gap-3 mb-3">
                  <Briefcase size={18} className="text-accent/60" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-accent/40">Open To</h3>
                </div>
                <p className="text-sm text-accent-light leading-relaxed">
                  Select leadership and advisory conversations -- particularly at the intersection of operations, AI, and scale. If you're building something interesting, <a href="mailto:contact@anjanipandey.com" className="text-accent font-semibold hover:underline">let's talk</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Journey */}
      <section className="bg-white border-y border-border/50">
        <div className="container-custom">
          <div className="max-w-4xl">
            <h2 className="mb-4">Career Journey</h2>
            <p className="text-lg text-accent-light mb-12">
              From building power plants to scaling e-commerce supply chains to founding a consulting firm. The thread: designing systems that let organizations execute at scale.
            </p>
            <div className="space-y-0">
              {careerTimeline.map((entry, i) => (
                <div key={i} className="relative pl-8 pb-12 last:pb-0 border-l-2 border-border/30 last:border-l-transparent">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-accent/20 border-2 border-accent/40" />
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mb-2">
                    <h3 className="text-lg font-bold text-accent">{entry.role}</h3>
                    <span className="text-accent/40 hidden sm:inline">--</span>
                    <span className="text-base font-semibold text-accent/70">{entry.company}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm text-accent/40 font-medium">{entry.period}</span>
                    <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium text-accent/50">{entry.type}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {entry.highlights.map((h, j) => (
                      <li key={j} className="text-sm text-accent-light leading-relaxed flex items-start gap-2">
                        <span className="text-accent/30 mt-1.5 flex-shrink-0">-</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What I Think About */}
      <section className="bg-muted border-b border-border/50">
        <div className="container-custom">
          <h2 className="mb-12">What I Think About</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Business Structure & Scale',
                desc: 'Why growing companies break, how to diagnose the structural diseases causing it, and what an operating spine actually looks like when installed.'
              },
              {
                title: 'Personal OS Architecture',
                desc: "What an AI-native operating system looks like for a solo operator. Claude as kernel, subsystems as organs, public metrics as accountability. I run three entities on mine; the design principles are published live at /os."
              },
              {
                title: 'Systems Thinking & Execution',
                desc: 'The gap between strategy and execution. Cadence design, accountability architecture, decision rights, and why most org charts are fiction.'
              }
            ].map((topic, i) => (
              <div key={i} className="bg-white p-8 rounded-sm border border-border">
                <h3 className="text-xl font-bold mb-4">{topic.title}</h3>
                <p className="text-accent-light leading-relaxed">{topic.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link to="/writing" className="text-accent font-bold hover:underline flex items-center gap-2">
              Read my writing <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Core Philosophy */}
      <section className="bg-white">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h2 className="mb-8">Core Beliefs</h2>
            <div className="space-y-8">
              {[
                "Businesses don't fail from lack of vision. They fail from absence of structural support.",
                'Diagnose before prescribing. Most interventions fail because the diagnosis was skipped.',
                "Install, don't advise. A system that runs is worth more than a deck that describes one.",
                "AI won't replace operators. But it will make the gap between structured and unstructured businesses much wider, much faster."
              ].map((belief, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-muted rounded-sm flex items-center justify-center text-accent font-bold text-sm flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-lg text-accent-light leading-relaxed">{belief}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Connect */}
      <section className="bg-muted border-t border-border/50">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h2 className="mb-6">Get in Touch</h2>
            <p className="text-lg text-accent-light mb-8 leading-relaxed">
              Whether it's about structural problems in your business, a leadership role where operations meets AI, something I've written, or just a good conversation -- I'm reachable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="btn-primary gap-3 px-8">
                Book a Call <ArrowRight size={18} />
              </a>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="btn-outline gap-3 px-8">
                <Linkedin size={18} /> LinkedIn
              </a>
              <a href="mailto:contact@anjanipandey.com" className="btn-outline gap-3 px-8">
                <Mail size={18} /> Email
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
