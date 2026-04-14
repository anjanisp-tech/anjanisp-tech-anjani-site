import { ArrowRight, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FIT_CALL_URL, LINKEDIN_URL } from '../constants';
import SEO from '../components/SEO';

export default function About() {
  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="About | Anjani Pandey"
        description="Operations leader, builder, and writer. 14+ years designing execution systems inside high-growth companies. Co-founder, MetMov LLP. ISB alumnus. Based in Bengaluru."
        canonical="https://www.anjanipandey.com/about"
      />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-12 gap-16 items-start">
            <div className="md:col-span-7">
              <h1 className="text-4xl md:text-6xl mb-8">About</h1>
              <div className="space-y-6 text-lg text-accent-light leading-relaxed">
                <p>
                  I'm an operations and transformation leader with 14+ years of experience designing execution systems for global supply chains, manufacturing companies, and high-growth platforms.
                </p>
                <p>
                  I've spent most of my career inside companies -- at BHEL, Udaan, Y-NOT -- building the structural backbone that lets organizations scale without breaking. The pattern I kept seeing: businesses don't fail from lack of vision. They fail from absence of internal structural support.
                </p>
                <p>
                  That conviction is why I co-founded <a href="https://metmov.com" target="_blank" rel="noopener noreferrer" className="text-accent font-semibold hover:underline">MetMov LLP</a> with Chaitanya Eswarapragada and Antriksh Kumar. We help founder-led businesses diagnose structural diseases and install the operating spine that lets them run without the founder being the system.
                </p>
                <p>
                  More recently, I've been thinking about what happens when AI enters this picture. Not as a tool bolted on, but as something that changes what businesses need to make explicit, structured, and usable. I'm writing about that intersection as I figure it out -- systems, scale, and what AI changes about both.
                </p>
              </div>
            </div>
            <div className="md:col-span-5 space-y-8">
              <div className="bg-muted p-8 rounded-3xl border border-border/50">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">Quick Facts</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Based in', value: 'Bengaluru, India' },
                    { label: 'Education', value: 'MBA, Indian School of Business (ISB)' },
                    { label: 'Background', value: 'Manufacturing Engineering' },
                    { label: 'Current', value: 'Co-founder & CEO, MetMov LLP' },
                    { label: 'Experience', value: '14+ years in operations & transformation' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-baseline gap-4">
                      <span className="text-sm text-accent/50 font-medium whitespace-nowrap">{item.label}</span>
                      <span className="text-sm font-semibold text-accent text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-muted p-8 rounded-3xl border border-border/50">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">Previously At</h3>
                <div className="flex flex-wrap gap-3">
                  {['Udaan', 'Y-NOT', 'BHEL'].map((company, i) => (
                    <div key={i} className="px-4 py-2 bg-white rounded-lg text-sm font-bold text-accent/60 border border-border/50">
                      {company}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What I Think About */}
      <section className="bg-muted border-y border-border/50">
        <div className="container-custom">
          <h2 className="mb-12">What I Think About</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Business Structure & Scale',
                desc: 'Why growing companies break, how to diagnose the structural diseases causing it, and what an operating spine actually looks like when installed.'
              },
              {
                title: 'AI & Business Legibility',
                desc: 'What happens when machines need to read your business -- from the outside (AI search, retrieval) and the inside (workflows, operations). Still forming this thesis.'
              },
              {
                title: 'Systems Thinking & Execution',
                desc: 'The gap between strategy and execution. Cadence design, accountability architecture, decision rights, and why most org charts are fiction.'
              }
            ].map((topic, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-border shadow-sm">
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
                'Businesses don\'t fail from lack of vision. They fail from absence of structural support.',
                'Diagnose before prescribing. Most interventions fail because the diagnosis was skipped.',
                'Install, don\'t advise. A system that runs is worth more than a deck that describes one.',
                'AI won\'t replace operators. But it will make the gap between structured and unstructured businesses much wider, much faster.'
              ].map((belief, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-accent font-bold text-sm flex-shrink-0 mt-0.5">
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
              If you want to talk about structural problems in your business, something I've written, or just want to connect -- I'm reachable.
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
