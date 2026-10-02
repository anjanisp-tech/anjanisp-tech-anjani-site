import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import ChapterFigure from '../components/ChapterFigure';
import { blogPosts as seedPosts, type BlogPost } from '../data/blogData';
import { CHAPTERS, postsInChapter, parseDate } from '../data/chapters';
import { FIT_CALL_URL, OPERATING_SPINE_URL } from '../constants';

/**
 * The Field Manual (2026-10-01). The home page is a table of contents, not a
 * feed. Seven chapters (six method classes + operating in public), each with the one line a founder recognises, the figure
 * of the mechanism, and the essay count. The essays themselves come from the
 * same seed + /api/posts refresh the writing page uses, so every Wednesday
 * post files itself into a chapter without anyone touching this page.
 */
export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>(seedPosts);

  useEffect(() => {
    fetch('/api/posts?limit=200')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list: BlogPost[] | undefined = Array.isArray(d) ? d : d?.posts;
        if (list && list.length) setPosts(list);
      })
      .catch(() => {});
  }, []);

  const total = posts.length;
  const latest = [...posts].sort((a, b) => parseDate(b.date) - parseDate(a.date)).slice(0, 3);

  return (
    <>
      <SEO
        title="Anjani Pandey | A field manual for founder-led businesses"
        description="Every growing company breaks in one of six ways. A field manual on how founder-led businesses break and what to install instead, written weekly by Anjani Pandey, founder of MetMov LLP."
        canonical="https://www.anjanipandey.com/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": "https://www.anjanipandey.com/#person",
          "name": "Anjani Pandey",
          "url": "https://www.anjanipandey.com",
          "image": "https://www.anjanipandey.com/og-image.png",
          "jobTitle": "Founder & CEO",
          "description": "Writes the field manual on how founder-led businesses break. Builds operating systems, including his own multi-subsystem Claude-kernel OS, run in public. Founder, MetMov LLP.",
          "worksFor": { "@type": "Organization", "@id": "https://metmov.com/#organization", "name": "MetMov LLP", "url": "https://www.metmov.com" },
          "alumniOf": { "@type": "EducationalOrganization", "name": "Indian School of Business" },
          "address": { "@type": "PostalAddress", "addressLocality": "Bengaluru", "addressCountry": "IN" },
          "sameAs": ["https://www.linkedin.com/in/anjanispandey/", "https://github.com/anjanisp-tech", "https://www.metmov.com"],
          "knowsAbout": ["AI operating systems", "Operations", "Business Scaling", "Systems Thinking", "B2B Consulting"]
        }}
      />

      {/* Opening */}
      <section className="pt-28 md:pt-36 pb-10 md:pb-14">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[1.25fr_1fr] gap-10 lg:gap-16 items-start">
            <div className="grid gap-6">
              <span className="label-mono">A field manual for founder-led businesses · {total} essays · one added every week</span>
              <h1 className="mb-0">Every growing company breaks in one of six ways.</h1>
              <p className="text-lg md:text-xl text-accent-light max-w-[44ch]">
                Fifteen years inside operating teams, now written down as a manual. Find the chapter that sounds like your week. Each one ends with what to do about it.
              </p>
              <div className="margin-note">
                <span className="label-mono">About the author</span>
                <span>Anjani Pandey. Founder, MetMov LLP. ISB. Bengaluru. Runs his own firm on nine AI systems, in public.</span>
              </div>
            </div>

            <aside className="border border-border bg-white p-6 grid gap-5 self-start">
              <span className="label-mono">Start here if you are</span>
              <div className="grid gap-4">
                <div>
                  <p className="font-bold text-accent mb-0.5">A founder who is the bottleneck</p>
                  <p className="text-sm">Chapter 01, then book an Operating Spine scoping call.</p>
                </div>
                <div>
                  <p className="font-bold text-accent mb-0.5">An operator who wants your own system</p>
                  <p className="text-sm">Chapter 07, then the AI Setup Sprint.</p>
                </div>
              </div>
              <a href={OPERATING_SPINE_URL} target="_blank" rel="noopener noreferrer" data-cta="operating-spine" className="btn-primary justify-self-start gap-2">
                Book a 30-minute call <ArrowRight size={16} />
              </a>
            </aside>
          </div>
        </div>
      </section>

      {/* Contents */}
      <section className="pt-6 pb-16 md:pt-8 md:pb-24">
        <div className="container-custom grid gap-4">
          <span className="label-mono">Contents</span>
          <div className="rule-top grid md:grid-cols-2">
            {CHAPTERS.map((ch, i) => {
              const count = postsInChapter(ch, posts).length;
              const left = i % 2 === 0;
              return (
                <Link
                  key={ch.slug}
                  to={`/manual/${ch.slug}`}
                  className={`group grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 py-6 border-b border-border ${left ? 'md:border-r md:pr-6' : 'md:pl-6'} ${ch.slug === 'operating-in-public' ? 'md:col-span-2 md:border-r-0 md:pl-0 bg-muted mt-4 px-5 border border-border' : ''}`}
                >
                  <span className="label-mono pt-1.5">{ch.number}</span>
                  <div className="grid gap-1">
                    <h3 className="text-xl md:text-2xl mb-0 tracking-[-0.025em] group-hover:text-primary transition-colors">{ch.title}</h3>
                    {ch.method && <span className="label-mono-muted">{ch.method}</span>}
                    <p className="text-accent-light mb-0">{ch.ask}</p>
                    <span className="label-mono-muted mt-1">{count} {count === 1 ? 'essay' : 'essays'}</span>
                  </div>
                  <div className="col-span-2 md:col-start-2 mt-3 text-accent">
                    <ChapterFigure slug={ch.slug} size="thumb" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest + offers */}
      <section className="py-16 md:py-20 border-t border-border bg-white">
        <div className="container-custom grid lg:grid-cols-[1.4fr_1fr] gap-12">
          <div className="grid gap-3 content-start">
            <span className="label-mono">Added most recently</span>
            <div className="rule-top">
              {latest.map((p) => (
                <Link key={p.id} to={`/blog/${p.id}`} className="group grid sm:grid-cols-[120px_1fr] gap-1 sm:gap-5 py-4 border-b border-border">
                  <span className="label-mono-muted pt-1">{p.date}</span>
                  <span className="text-lg font-bold tracking-[-0.02em] text-accent group-hover:text-primary transition-colors">{p.title}</span>
                </Link>
              ))}
            </div>
            <Link to="/writing" className="text-sm font-bold text-primary inline-flex items-center gap-1 mt-2">
              All {total} essays, by date <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-3 content-start">
            <span className="label-mono">Three ways to work with me</span>
            <div className="rule-top">
              {[
                { t: 'AI Setup Sprint', s: 'For individuals. Your first working AI system. ₹25,000, fixed.', href: '/services' },
                { t: 'Build Sprint + Care', s: 'For operators. A full personal OS, kept compounding. From ₹1.5L + ₹25k a month.', href: '/services' },
                { t: 'Operating Spine Install', s: 'For the business, through MetMov. The backbone that lets the firm scale without the founder as the system.', href: OPERATING_SPINE_URL },
              ].map((o) => {
                const inner = (
                  <>
                    <span className="text-lg font-bold tracking-[-0.02em] text-accent group-hover:text-primary transition-colors">{o.t}</span>
                    <span className="text-sm text-accent-light">{o.s}</span>
                  </>
                );
                const cls = 'group grid gap-1 py-4 border-b border-border';
                return o.href.startsWith('http')
                  ? <a key={o.t} href={o.href} target="_blank" rel="noopener noreferrer" data-cta="operating-spine" className={cls}>{inner}</a>
                  : <Link key={o.t} to={o.href} className={cls}>{inner}</Link>;
              })}
            </div>
            <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary inline-flex items-center gap-1 mt-2">
              Not sure which? Book a 30-minute call <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
