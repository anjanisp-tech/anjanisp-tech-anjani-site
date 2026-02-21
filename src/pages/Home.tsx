import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Search, Layers, Rocket } from 'lucide-react';

export default function Home() {
  return (
    <>
      {/* SECTION 1 – Hero */}
      <section className="bg-white pt-48 pb-32 md:pt-60 md:pb-48">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl mb-6">
              Scale Your Founder-Led Business
            </h1>
            <p className="text-xl md:text-2xl text-accent-light mb-4 leading-relaxed">
              We help growing companies move from founder-driven heroics to structured, scalable operating models.
            </p>
            <p className="text-sm md:text-base font-bold uppercase tracking-widest text-accent/40 mb-12">
              Structured systems. Clear ownership. Scalable execution.
            </p>
            <Link to="/book" className="btn-primary text-lg px-12 py-5 gap-3 shadow-xl shadow-accent/10">
              Book a Diagnostic Call
              <ArrowRight size={22} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 – Problem Recognition */}
      <section className="bg-muted border-y border-border/50">
        <div className="container-custom">
          <div className="max-w-4xl">
            <h2 className="mb-16">Does This Sound Familiar?</h2>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
              {[
                'Everything depends on the founder',
                'Growth feels chaotic',
                'Teams lack clear ownership',
                'Firefighting is constant',
                'Revenue is growing but margins are unstable',
                'Decision-making is a bottleneck'
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1.5 text-accent/20">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="text-lg text-accent-light font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 – Approach */}
      <section className="bg-white">
        <div className="container-custom">
          <h2 className="mb-20">Our Approach</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: 'Diagnose',
                icon: Search,
                desc: 'We identify the specific bottlenecks and dependencies that are stalling your growth.'
              },
              {
                title: 'Design',
                icon: Layers,
                desc: 'We build the custom operating systems and frameworks your unique business needs.'
              },
              {
                title: 'Deploy',
                icon: Rocket,
                desc: 'We work with your team to embed new habits and ensure execution discipline.'
              }
            ].map((pillar, i) => (
              <div key={i} className="space-y-6">
                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-accent">
                  <pillar.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold">{pillar.title}</h3>
                <p className="text-accent-light leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 – Proof & Metrics */}
      <section className="bg-muted border-y border-border/50">
        <div className="container-custom">
          <h2 className="mb-20">Proven Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { label: 'Annual Savings Delivered', value: '$15M+' },
              { label: 'Markets Scaled', value: '28' },
              { label: 'Loss Reduction', value: '95%' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-10 rounded-2xl border border-border shadow-sm">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">{stat.value}</div>
                <div className="text-sm font-bold uppercase tracking-widest text-accent/40">{stat.label}</div>
              </div>
            ))}
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Expertise Across Scales</h3>
              <p className="text-lg text-accent-light leading-relaxed">
                From leading global supply chain operations at <strong>Y-Not</strong> to scaling <strong>Udaan.com</strong> into 28 markets and managing 20 concurrent industrial power projects at <strong>BHEL</strong>, I've built the systems that enable rapid growth and operational excellence.
              </p>
              <ul className="grid grid-cols-2 gap-4">
                {[
                  'Operating Model Design',
                  'Execution Architecture',
                  'Supply Chain Transformation',
                  'Governance Frameworks',
                  'Performance Systems',
                  'Scale Readiness'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-semibold text-accent/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
              <p className="text-lg text-accent-light italic mb-6">
                "Anjani specializes in designing operating infrastructure that enables organizations to scale execution without increasing complexity."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold">AP</div>
                <div>
                  <div className="font-bold">Anjani Pandey</div>
                  <div className="text-sm text-accent-light">Fractional COO | ISB Alumnus</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Expert Section */}
      <section className="bg-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="mb-8">Meet Anjani</h2>
              <p className="text-lg text-accent-light mb-6 leading-relaxed">
                With 14+ years of experience, Anjani is an operations and transformation leader who has designed execution systems for global supply chains, manufacturing giants, and high-growth platforms.
              </p>
              <p className="text-lg text-accent-light mb-8 leading-relaxed">
                An MBA from the <strong>Indian School of Business (ISB)</strong> and a Manufacturing Engineer by training, he combines strategic design capability with hands-on implementation discipline. He is the CEO of <strong><a href="https://metmov.com/" target="_blank" rel="noopener noreferrer" className="text-accent font-semibold hover:underline">MetMov LLP</a></strong>, an operations advisory firm dedicated to helping founder-led companies transition from reactive execution to system-driven performance.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-muted rounded-lg text-sm font-bold text-accent/60 border border-border/50">Y-NOT</div>
                <div className="px-4 py-2 bg-muted rounded-lg text-sm font-bold text-accent/60 border border-border/50">UDAAN</div>
                <div className="px-4 py-2 bg-muted rounded-lg text-sm font-bold text-accent/60 border border-border/50">BHEL</div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="p-8 bg-accent text-white rounded-3xl shadow-2xl">
                <h3 className="text-white mb-4">Lead Magnet: The Scale Readiness Checklist</h3>
                <p className="text-white/70 mb-8">
                  Download the exact diagnostic framework I use to identify structural bottlenecks in founder-led businesses.
                </p>
                <button className="w-full bg-white text-accent py-4 rounded-xl font-bold hover:bg-muted transition-colors">
                  Download Free Framework
                </button>
              </div>
              <div className="p-8 border border-border rounded-3xl">
                <h3 className="mb-4">Core Philosophy</h3>
                <p className="text-accent-light">
                  "Complexity is the enemy of scale. My goal is to reduce founder dependency by creating clear ownership and structured operating models that run themselves."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="bg-muted border-y border-border/50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="mb-4">Latest Insights</h2>
              <p className="text-lg text-accent-light">
                Frameworks and observations on operations, scaling, and leadership.
              </p>
            </div>
            <Link to="/blog" className="btn-outline gap-2">
              View All Articles
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "The Founder's Dilemma: Moving from Heroics to Systems",
                date: "Feb 20, 2026",
                category: "Operations"
              },
              {
                title: "Scaling Supply Chains in Volatile Markets",
                date: "Feb 15, 2026",
                category: "Supply Chain"
              }
            ].map((post, i) => (
              <Link key={i} to="/blog" className="bg-white p-10 rounded-2xl border border-border hover:border-accent transition-all group">
                <div className="text-xs font-bold uppercase tracking-widest text-accent/40 mb-4">{post.date} • {post.category}</div>
                <h3 className="text-2xl font-bold mb-6 group-hover:text-accent-light transition-colors">{post.title}</h3>
                <span className="text-sm font-bold flex items-center gap-2">
                  Read More <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 – Final CTA */}
      <section className="bg-accent text-white py-40">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl mb-10 text-white">
              Ready to Build a Scalable Operating System?
            </h2>
            <p className="text-xl text-white/70 mb-12">
              Stop being the bottleneck. Start leading a high-performance organization.
            </p>
            <Link to="/book" className="bg-white text-accent hover:bg-muted px-14 py-5 rounded-md font-bold text-lg transition-all inline-block shadow-2xl shadow-black/20">
              Book Your Diagnostic Call
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
