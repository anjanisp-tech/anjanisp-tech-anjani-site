import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  Calculator,
  BookOpen,
  Download,
  X,
  Sparkles,
  ShoppingCart,
  ExternalLink,
  Clock,
  Tag,
  Cpu,
  Lock,
} from 'lucide-react';
import SEO from '../components/SEO';
import { getPublishedGuides } from '../data/guidesData';

/* ─── Existing resource data (unchanged) ─── */

interface Resource {
  title: string;
  description: string;
  format: string;
  formatIcon: React.ReactNode;
  cta: string;
  href?: string;
  downloadUrl?: string;
  gated: boolean;
  available: boolean;
  tag?: string;
}

const freeResources: Resource[] = [
  {
    title: 'Bottleneck Cost Calculator',
    description:
      'Quantify how much founder-dependent bottlenecks are costing your business. Interactive, instant results.',
    format: 'Interactive Tool',
    formatIcon: <Calculator size={16} />,
    cta: 'Try It',
    href: '/calculator',
    gated: false,
    available: true,
    tag: 'LIVE',
  },
  {
    title: 'AI for Consultants: A Practical Starter Guide',
    description:
      'How solo consultants and small firms use AI as infrastructure, not just a tool. Real workflows, real stack.',
    format: 'PDF Guide',
    formatIcon: <FileText size={16} />,
    cta: 'Get Free Access',
    downloadUrl: '/resources/AI_for_Consultants_Starter_Guide.pdf',
    gated: true,
    available: true,
    tag: 'FREE',
  },
  {
    title: 'Structural Health Quick-Check',
    description:
      '7 questions that reveal whether your business has structural gaps holding back growth. Takes 3 minutes.',
    format: 'PDF Checklist',
    formatIcon: <FileText size={16} />,
    cta: 'Get Free Access',
    downloadUrl: '/resources/Structural_Health_Quick_Check.pdf',
    gated: true,
    available: true,
    tag: 'FREE',
  },
  {
    title: "Why Your Rs.50 Cr Business Still Runs on You (Preview)",
    description:
      "Free 3-chapter preview: The Dependency Trap, The Bottleneck Tax, and Why Hiring Doesn't Fix It. Diagnose before you solve.",
    format: 'PDF Preview (12 pages)',
    formatIcon: <BookOpen size={16} />,
    cta: 'Get Free Preview',
    downloadUrl: '/resources/Why_Your_50Cr_Business_Free_Preview.pdf',
    gated: true,
    available: true,
    tag: 'FREE',
  },
];

const paidResources: Resource[] = [
  {
    title: "Why Your Rs.50 Cr Business Still Runs on You",
    description:
      "A founder's guide to building a business that scales without you. Diagnostic frameworks, operating architecture, decision maps, and a 90-day transition playbook.",
    format: 'Ebook (PDF)',
    formatIcon: <BookOpen size={16} />,
    cta: 'Buy on Gumroad',
    href: 'https://anjanipandey.gumroad.com/l/founder-scale',
    gated: false,
    available: true,
    tag: 'Rs.499',
  },
];

/* ─── Component ─── */

export default function Resources() {
  const guides = getPublishedGuides();

  const [emailModal, setEmailModal] = useState<{
    open: boolean;
    resourceName: string;
    downloadUrl: string;
  }>({
    open: false,
    resourceName: '',
    downloadUrl: '',
  });
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGatedClick = (resource: Resource) => {
    if (!resource.available) return;
    setEmailModal({
      open: true,
      resourceName: resource.title,
      downloadUrl: resource.downloadUrl || '',
    });
    setEmail('');
    setSubmitted(false);
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/resource-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resource_name: emailModal.resourceName }),
      });
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'resource_lead', { resource_name: emailModal.resourceName });
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="Guides & Playbooks | Anjani Pandey"
        description="Practical guides on AI-native consulting, operations, and scaling. Built from 14 years of operating experience. Free frameworks, tools, and deep-dive playbooks."
        canonical="https://www.anjanipandey.com/resources"
      />

      {/* ─── Hero ─── */}
      <section className="pt-32 pb-8 md:pt-40 md:pb-12">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="mb-6">Guides & Playbooks</h1>
            <p className="text-xl md:text-2xl text-accent-light leading-relaxed">
              Deep-dive frameworks on AI, operations, and building leverage. Written from the
              trenches, not the theory.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Guides Card Grid ─── */}
      <section className="pb-20">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                to={`/resources/${guide.slug}`}
                className="group relative bg-white border border-border rounded-2xl p-8 flex flex-col transition-all hover:border-accent/30 hover:shadow-lg"
              >
                {/* Gated badge */}
                {guide.gated && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/15">
                    <Lock size={10} />
                    Gated
                  </div>
                )}

                {/* Category */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent/40 mb-4">
                  <Tag size={14} />
                  {guide.category}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 pr-16 group-hover:text-primary transition-colors">
                  {guide.title}
                </h3>

                {/* Description */}
                <p className="text-accent-light text-sm leading-relaxed flex-grow mb-6 line-clamp-3">
                  {guide.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-accent/30">
                    <Clock size={12} />
                    {guide.readTime}
                  </div>
                  <div className="text-sm font-bold text-primary flex items-center gap-1.5 group-hover:gap-3 transition-all">
                    Read Guide <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}

            {/* Coming Soon placeholder if only one guide */}
            {guides.length < 3 &&
              Array.from({ length: 3 - guides.length }).map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className="border-2 border-dashed border-border/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[280px]"
                >
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                    <BookOpen size={20} className="text-accent/20" />
                  </div>
                  <p className="text-sm font-bold text-accent/25 uppercase tracking-widest">
                    Coming Soon
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="container-custom">
        <div className="h-px bg-border" />
      </div>

      {/* ─── Tools & Downloads ─── */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="text-sm font-bold uppercase tracking-widest text-accent/40 mb-10 flex items-center gap-2">
            <Sparkles size={16} />
            Tools & Downloads
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {freeResources.map((resource, i) => (
              <div
                key={i}
                className={`relative bg-white border border-border rounded-2xl p-8 flex flex-col transition-all ${
                  resource.available ? 'hover:border-accent/30 hover:shadow-lg' : 'opacity-70'
                }`}
              >
                {resource.tag && (
                  <div
                    className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      resource.tag === 'LIVE'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : resource.tag === 'FREE'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {resource.tag}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent/40 mb-4">
                  {resource.formatIcon}
                  {resource.format}
                </div>

                <h3 className="text-xl font-bold mb-3 pr-16">{resource.title}</h3>
                <p className="text-accent-light text-sm leading-relaxed flex-grow mb-6">
                  {resource.description}
                </p>

                {resource.available ? (
                  resource.href ? (
                    <Link
                      to={resource.href}
                      className="btn-primary gap-2 w-full justify-center text-sm py-3"
                    >
                      {resource.cta}
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleGatedClick(resource)}
                      className="btn-primary gap-2 w-full justify-center text-sm py-3"
                    >
                      {resource.cta}
                      <Download size={16} />
                    </button>
                  )
                ) : (
                  <div className="text-center py-3 text-sm font-medium text-accent/30 border border-border/50 rounded-xl">
                    Coming Soon
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Premium ─── */}
      <section className="pb-20">
        <div className="container-custom">
          <h2 className="text-sm font-bold uppercase tracking-widest text-accent/40 mb-10 flex items-center gap-2">
            <ShoppingCart size={16} />
            Premium
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {paidResources.map((resource, i) => (
              <div
                key={i}
                className="relative bg-white border-2 border-accent/10 rounded-2xl p-8 flex flex-col transition-all hover:border-accent/30 hover:shadow-lg"
              >
                {resource.tag && (
                  <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-accent/5 text-accent border border-accent/15">
                    {resource.tag}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent/40 mb-4">
                  {resource.formatIcon}
                  {resource.format}
                </div>

                <h3 className="text-xl font-bold mb-3 pr-16">{resource.title}</h3>
                <p className="text-accent-light text-sm leading-relaxed flex-grow mb-6">
                  {resource.description}
                </p>

                <a
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (typeof window.gtag === 'function') {
                      window.gtag('event', 'ebook_cta_click', {
                        resource_name: resource.title,
                      });
                    }
                  }}
                  className="btn-primary gap-2 w-full justify-center text-sm py-3"
                >
                  {resource.cta}
                  <ExternalLink size={16} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What I'm Building ─── */}
      <section className="bg-muted border-t border-border/50 py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-accent/40 mb-6 flex items-center justify-center gap-2">
              <Cpu size={16} />
              What I'm Building
            </h2>
            <p className="text-xl md:text-2xl text-accent-light leading-relaxed mb-8">
              I'm building two things in public: a consulting firm (
              <a
                href="https://metmov.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent font-semibold hover:underline"
              >
                MetMov
              </a>
              ) and an AI-powered personal operating system. I write about what's working, what's
              not, and what I'm learning along the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/writing" className="btn-primary gap-2 px-8">
                <BookOpen size={18} />
                Read the Blog
              </Link>
              <a
                href="https://www.linkedin.com/in/anjanispandey/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline gap-2 px-8"
              >
                Follow on LinkedIn
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Email Gate Modal (for PDF downloads) ─── */}
      {emailModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setEmailModal({ open: false, resourceName: '', downloadUrl: '' })}
              className="absolute top-4 right-4 p-2 text-accent/40 hover:text-accent transition-colors"
            >
              <X size={20} />
            </button>

            {!submitted ? (
              <>
                <h3 className="text-xl font-bold mb-2">Get {emailModal.resourceName}</h3>
                <p className="text-sm text-accent-light mb-6">
                  Enter your email and I'll send it right over. No spam, no sequences.
                </p>
                <form onSubmit={handleSubmitEmail} className="space-y-4">
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full justify-center py-3 text-sm"
                  >
                    {submitting ? 'Sending...' : 'Send Me the Resource'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Your download is ready</h3>
                <p className="text-sm text-accent-light mb-6">
                  Click below to download {emailModal.resourceName}.
                </p>
                <a
                  href={emailModal.downloadUrl}
                  download
                  onClick={() => {
                    if (typeof window.gtag === 'function') {
                      window.gtag('event', 'resource_download', {
                        resource_name: emailModal.resourceName,
                      });
                    }
                  }}
                  className="btn-primary w-full justify-center py-3 text-sm gap-2 inline-flex"
                >
                  <Download size={16} />
                  Download PDF
                </a>
                <button
                  onClick={() => setEmailModal({ open: false, resourceName: '', downloadUrl: '' })}
                  className="mt-4 text-sm font-semibold text-accent/50 hover:text-accent hover:underline"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
