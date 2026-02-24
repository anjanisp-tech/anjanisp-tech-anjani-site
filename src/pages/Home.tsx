import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Search, Layers, Rocket, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const testimonials = [
    {
      quote: "He thinks in systems. Anjani quickly identifies the real constraints in a situation and focuses effort where it compounds. He brings structure without bureaucracy and momentum without noise.",
      author: "Harsha Athkuri",
      role: "Senior Product Manager, Microsoft",
      initials: "HA"
    },
    {
      quote: "Anjani played a pivotal role in driving large-scale improvement programs and operational rollouts. He brought clarity to complex problems and set up scalable processes.",
      author: "Mrigank Mishra",
      role: "JioHotstar (Ex-Udaan)",
      initials: "MM"
    },
    {
      quote: "Anjani is someone people naturally seek out when decisions are complex and stakes are real. He brings structure to ambiguity, aligns people without friction, and focuses on durable outcomes.",
      author: "Nandu Somaraj",
      role: "Sr. Contract Performance Manager, Baker Hughes",
      initials: "NS"
    },
    {
      quote: "One of the finest management professionals I have worked with. Anjani is a strong taskmaster who works on building processes and capabilities for the good of the organization.",
      author: "Ayush Agarwal",
      role: "ONDC (Ex-Airtel, OYO)",
      initials: "AA"
    },
    {
      quote: "Anjani operates with a level of clarity and judgment that is rare. He has a strong systems mindset and an ability to simplify complex, cross-functional problems.",
      author: "Rahul Kulshrestha",
      role: "Indo-Swiss Innovation",
      initials: "RK"
    },
    {
      quote: "I found him to be a sharp thinker who thought on his feet. He showcased his ability to lead his team by example and keep them motivated at all times.",
      author: "Harindran W S",
      role: "FKCCI Secretariat",
      initials: "HW"
    }
  ];

  useEffect(() => {
    fetch('/api/posts?limit=10')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data);
        }
      })
      .catch(err => console.error('Error fetching posts:', err));
  }, []);

  const nextSlide = () => {
    if (posts.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  const prevSlide = () => {
    if (posts.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <>
      {/* SECTION 1 – Hero */}
      <section className="bg-white pt-32 pb-20 md:pt-40 md:pb-32">
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
            <a href="https://calendly.com/metmovllp/30min" target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-12 py-5 gap-3 shadow-xl shadow-accent/10">
              Book a Diagnostic Call
              <ArrowRight size={22} />
            </a>
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

      {/* Testimonials Section */}
      <section className="bg-white overflow-hidden">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="mb-4">Trusted by Leaders</h2>
              <p className="text-lg text-accent-light">
                What colleagues and partners say about my approach to systems, strategy, and execution.
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={prevTestimonial}
                className="p-3 rounded-full border border-border bg-white hover:bg-accent hover:text-white transition-all shadow-sm"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={nextTestimonial}
                className="p-3 rounded-full border border-border bg-white hover:bg-accent hover:text-white transition-all shadow-sm"
                aria-label="Next testimonial"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div 
                key={testimonialIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-2 gap-8"
              >
                {/* Current Testimonial */}
                <div className="bg-muted p-10 rounded-3xl border border-border/50 flex flex-col h-full relative">
                  <Quote className="absolute top-8 right-8 text-accent/5" size={48} />
                  <p className="text-xl text-accent-light mb-8 italic leading-relaxed flex-grow relative z-10">
                    "{testimonials[testimonialIndex].quote}"
                  </p>
                  <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                    <div className="w-12 h-12 bg-accent text-white flex items-center justify-center rounded-full font-bold text-sm">
                      {testimonials[testimonialIndex].initials}
                    </div>
                    <div>
                      <div className="font-bold text-accent">{testimonials[testimonialIndex].author}</div>
                      <div className="text-xs font-bold uppercase tracking-widest text-accent/40">{testimonials[testimonialIndex].role}</div>
                    </div>
                  </div>
                </div>

                {/* Next Testimonial (Preview) */}
                <div className="bg-muted p-10 rounded-3xl border border-border/50 flex flex-col h-full relative hidden md:flex opacity-40">
                  <Quote className="absolute top-8 right-8 text-accent/5" size={48} />
                  <p className="text-xl text-accent-light mb-8 italic leading-relaxed flex-grow relative z-10">
                    "{testimonials[(testimonialIndex + 1) % testimonials.length].quote}"
                  </p>
                  <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                    <div className="w-12 h-12 bg-accent text-white flex items-center justify-center rounded-full font-bold text-sm">
                      {testimonials[(testimonialIndex + 1) % testimonials.length].initials}
                    </div>
                    <div>
                      <div className="font-bold text-accent">{testimonials[(testimonialIndex + 1) % testimonials.length].author}</div>
                      <div className="text-xs font-bold uppercase tracking-widest text-accent/40">{testimonials[(testimonialIndex + 1) % testimonials.length].role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
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

      {/* Blog Preview Section - Carousel */}
      <section className="bg-muted border-y border-border/50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="mb-4">Latest Insights</h2>
              <p className="text-lg text-accent-light">
                Frameworks and observations on operations, scaling, and leadership.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button 
                  onClick={prevSlide}
                  className="p-3 rounded-full border border-border bg-white hover:bg-accent hover:text-white transition-all shadow-sm"
                  aria-label="Previous post"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={nextSlide}
                  className="p-3 rounded-full border border-border bg-white hover:bg-accent hover:text-white transition-all shadow-sm"
                  aria-label="Next post"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <Link to="/blog" className="btn-outline py-3 px-6 text-sm gap-2">
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden min-h-[320px]">
            <AnimatePresence mode="wait">
              {posts.length > 0 ? (
                <motion.div 
                  key={currentIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="grid md:grid-cols-2 gap-8"
                >
                  {/* Current Post */}
                  <Link 
                    to={`/blog/${posts[currentIndex].id}`} 
                    className="bg-white p-10 rounded-3xl border border-border hover:border-accent transition-all group shadow-sm"
                  >
                    <div className="text-xs font-bold uppercase tracking-widest text-accent/40 mb-4">
                      {posts[currentIndex].date} • {posts[currentIndex].category}
                    </div>
                    <h3 className="text-2xl font-bold mb-6 group-hover:text-accent-light transition-colors line-clamp-2">
                      {posts[currentIndex].title}
                    </h3>
                    <p className="text-accent-light line-clamp-3 mb-8 text-sm leading-relaxed">
                      {posts[currentIndex].excerpt}
                    </p>
                    <span className="text-sm font-bold flex items-center gap-2 text-accent">
                      Read Framework <ArrowRight size={16} />
                    </span>
                  </Link>

                  {/* Next Post (Preview) */}
                  <Link 
                    to={`/blog/${posts[(currentIndex + 1) % posts.length].id}`} 
                    className="bg-white p-10 rounded-3xl border border-border hover:border-accent transition-all group shadow-sm hidden md:block opacity-60 hover:opacity-100"
                  >
                    <div className="text-xs font-bold uppercase tracking-widest text-accent/40 mb-4">
                      {posts[(currentIndex + 1) % posts.length].date} • {posts[(currentIndex + 1) % posts.length].category}
                    </div>
                    <h3 className="text-2xl font-bold mb-6 group-hover:text-accent-light transition-colors line-clamp-2">
                      {posts[(currentIndex + 1) % posts.length].title}
                    </h3>
                    <p className="text-accent-light line-clamp-3 mb-8 text-sm leading-relaxed">
                      {posts[(currentIndex + 1) % posts.length].excerpt}
                    </p>
                    <span className="text-sm font-bold flex items-center gap-2 text-accent">
                      Read Framework <ArrowRight size={16} />
                    </span>
                  </Link>
                </motion.div>
              ) : (
                <div className="text-center py-20 text-accent-light/50 font-medium">
                  Loading latest insights...
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* SECTION 5 – Final CTA */}
      <section className="bg-accent text-white py-24">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl mb-10 text-white">
              Ready to Build a Scalable Operating System?
            </h2>
            <p className="text-xl text-white/70 mb-12">
              Stop being the bottleneck. Start leading a high-performance organization.
            </p>
            <a href="https://calendly.com/metmovllp/30min" target="_blank" rel="noopener noreferrer" className="bg-white text-accent hover:bg-muted px-14 py-5 rounded-md font-bold text-lg transition-all inline-block shadow-2xl shadow-black/20">
              Book Your Diagnostic Call
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
