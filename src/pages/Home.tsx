import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Search, Layers, Rocket, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MINI_DIAGNOSTIC_URL, FIT_CALL_URL } from '../constants';

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
              The Founder Trap is the Ceiling of Your Scale
            </h1>
            <p className="text-xl md:text-2xl text-accent-light mb-8 leading-relaxed">
              If you stepped away for 72 hours, what would stall? <br />
              We diagnose structural diseases and install the <strong>Operating Spine</strong> that lets your business run itself.
            </p>
            <p className="text-sm md:text-base font-bold uppercase tracking-widest text-accent/40 mb-12">
              Diagnostic Sprints. Operating Spine Installs. Fractional COO.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={MINI_DIAGNOSTIC_URL} target="_blank" rel="noopener noreferrer" className="btn-primary text-lg px-12 py-5 gap-3 shadow-xl shadow-accent/10">
                Take the Free Diagnostic
                <ArrowRight size={22} />
              </a>
              <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="btn-outline text-lg px-12 py-5 gap-3">
                Or talk to us directly
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 – Problem Recognition */}
      <section className="bg-muted border-y border-border/50">
        <div className="container-custom">
          <div className="max-w-4xl">
            <h2 className="mb-16">Does This Sound Familiar?</h2>
            <div className="grid md:grid-cols-1 gap-y-8">
              {[
                { symptom: "You are the escalation layer. Every decision routes back to you.", disease: "The Founder Trap" },
                { symptom: "Roles exist on paper. Accountability doesn't.", disease: "Structure Without Spine" },
                { symptom: "Targets are set. Rhythms to hit them aren't.", disease: "Execution Breakdown" },
                { symptom: "Revenue is growing but you can't see where margin is leaking.", disease: "Visibility Collapse" },
                { symptom: "Each new market or product line adds chaos faster than capacity.", disease: "Growth Induced Fragility" }
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1.5 text-accent/20">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg text-accent-light font-medium">If {point.symptom.toLowerCase().replace('.', '')},</p>
                    <p className="text-sm font-bold uppercase tracking-widest text-accent">You may be experiencing: {point.disease}</p>
                  </div>
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
                desc: 'We run a structured diagnostic using our 25-disease taxonomy. No assumptions. No copy-paste. We identify exactly which structural diseases are present and how severe they are.'
              },
              {
                title: 'Install',
                icon: Layers,
                desc: 'We design and install the Operating Spine — cadence, accountability, decision rights, KPIs, escalation protocols. Not a report. A working system.'
              },
              {
                title: 'Embed',
                icon: Rocket,
                desc: 'We stay until the system runs without us. Execution rhythms. Review cadence. Structural habits that compound.'
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
          <h2 className="mb-8">Practitioner Credibility</h2>
          <p className="text-xl text-accent-light mb-16 max-w-2xl">
            Before MetMov, we built these systems inside companies. Here's what that looks like at scale.
          </p>
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
          <p className="text-center text-lg font-bold text-accent mb-20">Now we install these systems in yours.</p>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Three Partners. 45+ Years of Operating Experience.</h3>
              <p className="text-lg text-accent-light leading-relaxed">
                We've scaled logistics networks, built financial control systems, and designed execution architecture inside high-growth companies. We didn't learn this from textbooks. We built it under pressure.
              </p>
              <ul className="grid grid-cols-2 gap-4">
                {[
                  'Operating Spine Install',
                  'Diagnostic Sprints',
                  'Execution Architecture',
                  'Supply Chain Transformation',
                  'Governance Frameworks',
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
                "I diagnose structural diseases in founder-led businesses and install the operating spine that lets them scale without the founder being the system."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold">AP</div>
                <div>
                  <div className="font-bold">Anjani Pandey</div>
                  <div className="text-sm text-accent-light">CEO, MetMov LLP | ISB Alumnus</div>
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
              <div className="mb-8">
                <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="text-accent font-bold hover:underline flex items-center gap-2">
                  Want to talk? Book a Fit Call <ArrowRight size={16} />
                </a>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-muted rounded-lg text-sm font-bold text-accent/60 border border-border/50">Y-NOT</div>
                <div className="px-4 py-2 bg-muted rounded-lg text-sm font-bold text-accent/60 border border-border/50">UDAAN</div>
                <div className="px-4 py-2 bg-muted rounded-lg text-sm font-bold text-accent/60 border border-border/50">BHEL</div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="p-8 bg-accent text-white rounded-3xl shadow-2xl">
                <h3 className="text-white mb-4">MetMov Mini Diagnostic</h3>
                <p className="text-white/70 mb-6">
                  15 questions. 5 minutes. Find out which of the 25 structural diseases may be present in your business. Get a score, a severity snapshot, and clarity on what to fix first.
                </p>
                <div className="mb-8">
                  <a href={MINI_DIAGNOSTIC_URL} target="_blank" rel="noopener noreferrer" className="block w-full bg-white text-accent py-4 rounded-xl font-bold hover:bg-muted transition-colors text-center">
                    Start Your Diagnostic
                  </a>
                  <p className="text-white/50 text-[10px] mt-2 text-center uppercase tracking-widest font-bold">
                    Free through March 2026. No email required to start.
                  </p>
                </div>
              </div>
              <div className="p-8 border border-border rounded-3xl">
                <h3 className="mb-4">Core Philosophy</h3>
                <p className="text-accent-light">
                  "Businesses don't fail from lack of vision. They fail from absence of internal structural support. We diagnose before we prescribe. We install, we don't advise. We build genuine value, not billable hours."
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
              Ready to Install Your Operating Spine?
            </h2>
            <p className="text-xl text-white/70 mb-12">
              Stop being the bottleneck. Start leading a high-performance organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={MINI_DIAGNOSTIC_URL} target="_blank" rel="noopener noreferrer" className="bg-white text-accent hover:bg-muted px-14 py-5 rounded-md font-bold text-lg transition-all inline-block shadow-2xl shadow-black/20">
                Start Your Diagnostic
              </a>
              <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="bg-transparent border border-white/30 text-white hover:bg-white/10 px-14 py-5 rounded-md font-bold text-lg transition-all inline-block">
                Talk to Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
