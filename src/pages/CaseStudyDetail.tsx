import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import SEO from '../components/SEO';

interface CaseStudy {
  slug: string;
  title: string;
  excerpt: string;
  img: string;
  category: string;
  client: string;
  period: string;
  results: string[];
  content: string;
}

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const [cs, setCs] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/casestudies/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (active) setCs(d && d.slug ? d : null); })
      .catch(() => { if (active) setCs(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return <div className="pt-40 pb-24 flex justify-center"><Loader2 className="animate-spin text-accent" size={32} /></div>;
  }

  if (!cs) {
    return (
      <div className="pt-40 pb-24 text-center container-custom">
        <h1 className="text-2xl font-bold mb-4">Case study not found</h1>
        <Link to="/case-studies" className="text-primary font-bold hover:underline">Back to all case studies</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title={`${cs.title} | Case Study | Anjani Pandey`}
        description={cs.excerpt}
        canonical={`https://www.anjanipandey.com/case-studies/${cs.slug}`}
      />
      <article className="pt-32 pb-24 md:pt-40">
        <div className="container-custom max-w-3xl">
          <Link to="/case-studies" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all mb-10">
            <ArrowLeft size={18} /> Back to Case Studies
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-6 text-xs font-bold uppercase tracking-widest text-accent/40">
            {cs.category && <span className="px-3 py-1 bg-muted rounded-full">{cs.category}</span>}
            {cs.client && <span>{cs.client}</span>}
            {cs.period && <span>· {cs.period}</span>}
          </div>

          <h1 className="mb-6">{cs.title}</h1>
          <p className="text-xl text-accent-light leading-relaxed mb-10">{cs.excerpt}</p>

          {cs.img && (
            <div className="aspect-video rounded-3xl overflow-hidden shadow-xl mb-12">
              <img src={cs.img} alt={cs.title} className="w-full h-full object-cover" />
            </div>
          )}

          {cs.results?.length > 0 && (
            <div className="bg-muted rounded-3xl p-8 mb-12">
              <h3 className="text-sm font-bold uppercase tracking-widest text-accent/60 mb-6">Key Results</h3>
              <ul className="space-y-4">
                {cs.results.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
                    <span className="font-bold">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="prose prose-slate prose-lg max-w-none prose-headings:text-accent prose-a:text-accent">
            <Markdown remarkPlugins={[remarkBreaks]}>{cs.content}</Markdown>
          </div>

          <div className="mt-16 bg-muted p-12 rounded-3xl text-center">
            <h3 className="text-2xl font-bold mb-4">Want a similar result?</h3>
            <p className="text-accent-light mb-8 max-w-md mx-auto">Let's talk about installing the right operating system for your business.</p>
            <Link to="/book" className="btn-primary inline-flex">Book a Call</Link>
          </div>
        </div>
      </article>
    </div>
  );
}
