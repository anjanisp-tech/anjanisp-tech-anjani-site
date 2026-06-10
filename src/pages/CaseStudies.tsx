import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import SEO from '../components/SEO';

interface CaseStudy {
  slug: string;
  title: string;
  excerpt: string;
  img: string;
  category: string;
  client: string;
  period: string;
}

export default function CaseStudies() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/casestudies')
      .then(r => r.ok ? r.json() : [])
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="Case Studies | AI Operations & Systems | Anjani Pandey"
        description="Real engagements: installing operating systems, AI workflows, and structural fixes inside founder-led companies. By Anjani Pandey."
        canonical="https://www.anjanipandey.com/case-studies"
      />
      <section className="pt-32 pb-6 md:pt-40 md:pb-10">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="mb-6">Case Studies</h1>
            <p className="text-xl md:text-2xl text-accent-light leading-relaxed">
              Selected engagements — what was broken, what got installed, and what changed.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-custom">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-accent" size={32} /></div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="text-xl font-bold text-accent/40">Case studies are on the way.</h3>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-10">
              {items.map((c) => (
                <Link key={c.slug} to={`/case-studies/${c.slug}`} className="group block rounded-3xl overflow-hidden border border-border hover:shadow-xl transition-all">
                  {c.img ? (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : null}
                  <div className="p-8 space-y-4">
                    {c.category && (
                      <span className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-bold text-accent/60 uppercase tracking-wider">{c.category}</span>
                    )}
                    <h2 className="text-2xl font-bold group-hover:text-accent-light transition-colors">{c.title}</h2>
                    <p className="text-accent-light leading-relaxed">{c.excerpt}</p>
                    <div className="inline-flex items-center gap-2 font-bold text-primary group-hover:gap-3 transition-all">
                      Read case study <ArrowRight size={18} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
