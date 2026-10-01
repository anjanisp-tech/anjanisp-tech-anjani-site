import { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { OPERATING_SPINE_URL, LINKEDIN_URL, WHATSAPP_URL, METMOV_URL } from '../constants';
import { caseStudies } from '../data/caseStudyData';
import { CHAPTERS } from '../data/chapters';

// Lazy-load ChatAssistant to keep motion, react-markdown, @google/genai out of the main chunk
const ChatAssistant = lazy(() => import('./ChatAssistant'));

// Case Studies shows in the menus only once 2+ are live (decided at build from synced data).
const SHOW_CASES = caseStudies.length >= 2;

/**
 * The Field Manual chrome (2026-10-01). One wordmark, five links, one button.
 * Charter rank 2 (2026-08-20) still holds: one floating control, the chat
 * launcher. The WhatsApp bubble lives in the footer, not on top of the page.
 */
const NAV = [
  { to: '/', label: 'The Manual' },
  { to: '/writing', label: 'Writing' },
  { to: '/services', label: 'Work with me' },
  { to: '/os', label: 'The OS', external: true },
  { to: '/about', label: 'About' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setIsMenuOpen(false); }, [location]);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  useEffect(() => {
    fetch('/api/admin/session', { credentials: 'same-origin' })
      .then(res => res.ok ? res.json() : { authenticated: false })
      .then(data => setIsAdminAuthenticated(data.authenticated === true))
      .catch(() => setIsAdminAuthenticated(false));
  }, [location.pathname]);

  const linkCls = (to: string) =>
    `text-sm font-semibold transition-colors ${location.pathname === to ? 'text-primary' : 'text-accent/75 hover:text-accent'}`;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="sticky top-0 left-0 right-0 bg-surface/95 backdrop-blur-md z-50 border-b border-border">
        <div className="container-custom h-16 md:h-20 flex items-center justify-between gap-6">
          <Link to="/" className="font-extrabold tracking-[-0.03em] text-lg md:text-xl text-accent">
            Anjani Pandey
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {NAV.map((n) => n.external
              ? <a key={n.to} href={n.to} className={linkCls(n.to)}>{n.label}</a>
              : <Link key={n.to} to={n.to} className={linkCls(n.to)}>{n.label}</Link>)}
            {SHOW_CASES && <Link to="/case-studies" className={linkCls('/case-studies')}>Case studies</Link>}
            {isAdminAuthenticated && <Link to="/admin" className={linkCls('/admin')}>Admin</Link>}
            <a href={OPERATING_SPINE_URL} target="_blank" rel="noopener noreferrer" data-cta="operating-spine" className="btn-outline py-2 px-4 text-sm">Book a call</a>
          </nav>

          <button className="md:hidden p-2 -mr-2" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-surface border-b border-border px-6 py-5 flex flex-col gap-1">
            {NAV.map((n) => n.external
              ? <a key={n.to} href={n.to} className="text-lg font-semibold py-2.5 border-b border-border">{n.label}</a>
              : <Link key={n.to} to={n.to} className="text-lg font-semibold py-2.5 border-b border-border">{n.label}</Link>)}
            {SHOW_CASES && <Link to="/case-studies" className="text-lg font-semibold py-2.5 border-b border-border">Case studies</Link>}
            <a href={OPERATING_SPINE_URL} target="_blank" rel="noopener noreferrer" data-cta="operating-spine" className="btn-primary w-full mt-4">Book a call</a>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <Suspense fallback={null}>
        <ChatAssistant />
      </Suspense>

      <footer className="bg-accent text-surface py-14 md:py-16 mt-auto">
        <div className="container-custom grid md:grid-cols-[1.3fr_1fr_1fr] gap-10">
          <div className="grid gap-4 content-start">
            <span className="font-extrabold tracking-[-0.03em] text-lg">Anjani Pandey</span>
            <p className="text-sm text-surface/70 max-w-xs mb-0">
              A field manual on how founder-led businesses break, and what to install instead. Founder, MetMov LLP. Bengaluru.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white underline underline-offset-4 decoration-surface/30">LinkedIn</a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white underline underline-offset-4 decoration-surface/30">WhatsApp</a>
              <a href={METMOV_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white underline underline-offset-4 decoration-surface/30">metmov.com</a>
            </div>
          </div>
          <div className="grid gap-2 content-start text-sm">
            <span className="font-mono text-[0.7rem] text-surface/50 mb-1">The Manual</span>
            {CHAPTERS.map((c) => (
              <Link key={c.slug} to={`/manual/${c.slug}`} className="text-surface/85 hover:text-white">{c.number} {c.title}</Link>
            ))}
          </div>
          <div className="grid gap-2 content-start text-sm">
            <span className="font-mono text-[0.7rem] text-surface/50 mb-1">Pages</span>
            <Link to="/writing" className="text-surface/85 hover:text-white">All essays</Link>
            <Link to="/services" className="text-surface/85 hover:text-white">Work with me</Link>
            <Link to="/calculator" className="text-surface/85 hover:text-white">Bottleneck cost calculator</Link>
            <Link to="/resources" className="text-surface/85 hover:text-white">Resources</Link>
            <Link to="/about" className="text-surface/85 hover:text-white">About</Link>
            <a href={OPERATING_SPINE_URL} target="_blank" rel="noopener noreferrer" className="text-surface/85 hover:text-white">Book a call</a>
            <span className="font-mono text-[0.7rem] text-surface/50 mt-4 mb-1">Legal</span>
            <Link to="/privacy" className="text-surface/70 hover:text-white">Privacy</Link>
            <Link to="/terms" className="text-surface/70 hover:text-white">Terms</Link>
            <Link to="/sitemap" className="text-surface/70 hover:text-white">Sitemap</Link>
          </div>
        </div>
        <div className="container-custom mt-12 pt-6 border-t border-surface/15 text-xs text-surface/50 flex flex-col md:flex-row justify-between gap-2">
          <span>© 2026 Anjani Pandey. All rights reserved.</span>
          <span>Founder, MetMov LLP · Bengaluru</span>
        </div>
      </footer>
    </div>
  );
}
