import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import SEO from '../components/SEO';
import GateOverlay from '../components/GateOverlay';
import { getGuideBySlug, getPublishedGuides } from '../data/guidesData';
import { FIT_CALL_URL, LINKEDIN_URL } from '../constants';

export default function ResourceGuideDetail() {
  const { slug } = useParams<{ slug: string }>();
  const guide = slug ? getGuideBySlug(slug) : undefined;

  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('guide_unlocked') === 'true';
  });

  // Check unlock state on mount (SSR safety)
  useEffect(() => {
    setIsUnlocked(localStorage.getItem('guide_unlocked') === 'true');
  }, []);

  if (!guide) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-4xl font-bold mb-4">Guide Not Found</h1>
        <p className="text-accent-light mb-8">The guide you're looking for doesn't exist or has been moved.</p>
        <Link to="/resources" className="btn-primary flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Resources
        </Link>
      </div>
    );
  }

  const showGate = guide.gated && !isUnlocked;
  const otherGuides = getPublishedGuides().filter((g) => g.slug !== slug).slice(0, 2);

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title={`${guide.title} | Guides | Anjani Pandey`}
        description={guide.description}
        canonical={`https://www.anjanipandey.com/resources/${guide.slug}`}
        ogType="article"
        ogTitle={guide.title}
        ogDescription={guide.description}
        ogImage={guide.ogImage || 'https://www.anjanipandey.com/og-image.png'}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.description,
          author: {
            '@type': 'Person',
            name: 'Anjani Pandey',
            url: 'https://www.anjanipandey.com',
          },
          publisher: {
            '@type': 'Person',
            name: 'Anjani Pandey',
          },
          datePublished: guide.publishedDate,
          url: `https://www.anjanipandey.com/resources/${guide.slug}`,
          mainEntityOfPage: `https://www.anjanipandey.com/resources/${guide.slug}`,
        }}
      />

      <article className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {/* Back Link */}
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 text-sm font-bold text-accent/40 hover:text-accent transition-colors mb-12"
            >
              <ArrowLeft size={16} /> Back to Resources
            </Link>

            {/* Header */}
            <header className="mb-16">
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-sm font-bold text-accent/40">
                  <Tag size={16} />
                  <span className="uppercase tracking-widest">{guide.category}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-accent/40">
                  <Calendar size={16} />
                  {new Date(guide.publishedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-accent/40">
                  <Clock size={16} />
                  {guide.readTime}
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                {guide.title}
              </h1>
              <p className="text-xl md:text-2xl text-accent-light leading-relaxed italic border-l-4 border-accent pl-6">
                {guide.subtitle}
              </p>
            </header>

            {/* Content */}
            <div className="relative">
              {showGate ? (
                <>
                  {/* Teaser content with fade */}
                  <div className="markdown-body prose prose-lg max-w-none prose-accent mask-fade-bottom">
                    <Markdown remarkPlugins={[remarkBreaks]}>{guide.teaserContent}</Markdown>
                  </div>

                  {/* Gate */}
                  <GateOverlay
                    resourceTitle={guide.title}
                    onUnlock={() => setIsUnlocked(true)}
                  />
                </>
              ) : (
                <div className="markdown-body prose prose-lg max-w-none prose-accent">
                  <Markdown remarkPlugins={[remarkBreaks]}>{guide.fullContent}</Markdown>
                </div>
              )}
            </div>

            {/* CTA Bridge (only show when unlocked) */}
            {!showGate && (
              <div className="py-12 border-y border-border/50 mt-16 mb-16">
                <h3 className="text-2xl font-bold mb-4">Want to discuss how this applies to your firm?</h3>
                <p className="text-accent-light mb-8">
                  Book a free 30-minute call. No pitch, just a conversation about your specific situation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={FIT_CALL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-2 px-8"
                  >
                    Book a Call
                    <ArrowRight size={18} />
                  </a>
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline inline-flex items-center gap-2 px-8"
                  >
                    Follow on LinkedIn
                    <ArrowRight size={18} />
                  </a>
                </div>
              </div>
            )}

            {/* Related Guides */}
            {otherGuides.length > 0 && (
              <section className="mt-16 pt-16 border-t border-border">
                <h2 className="text-3xl font-bold mb-12">More Guides</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {otherGuides.map((g) => (
                    <Link
                      key={g.slug}
                      to={`/resources/${g.slug}`}
                      className="group p-8 bg-muted/30 rounded-2xl border border-border hover:border-accent/30 hover:shadow-lg transition-all"
                    >
                      <div className="text-xs font-bold uppercase tracking-widest text-accent/40 mb-4">
                        {g.category}
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {g.title}
                      </h3>
                      <p className="text-sm text-accent-light mb-4 line-clamp-2">{g.description}</p>
                      <div className="text-sm font-bold text-primary flex items-center gap-2">
                        Read Guide <ArrowRight size={14} />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Author Footer */}
            <footer className="mt-24 pt-12 border-t border-border">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                    AP
                  </div>
                  <div>
                    <div className="font-bold text-lg">Anjani Pandey</div>
                    <div className="text-sm text-accent-light">
                      Operations leader. Builder. Co-founder, MetMov LLP.
                    </div>
                  </div>
                </div>
                <a
                  href={FIT_CALL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Book a Call
                </a>
              </div>
            </footer>
          </div>
        </div>
      </article>
    </div>
  );
}
