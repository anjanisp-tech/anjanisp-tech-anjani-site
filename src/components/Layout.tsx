// Deployment Sync Test: 2026-02-21
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Linkedin, Globe, BookOpen, ArrowLeft, MessageCircle } from 'lucide-react';
import { FIT_CALL_URL, LINKEDIN_URL, WHATSAPP_URL, METMOV_URL } from '../constants';
import ChatAssistant from './ChatAssistant';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Check session cookie validity via API
    fetch('/api/admin/session', { credentials: 'same-origin' })
      .then(res => res.ok ? res.json() : { authenticated: false })
      .then(data => setIsAdminAuthenticated(data.authenticated === true))
      .catch(() => setIsAdminAuthenticated(false));
  }, [location.pathname]);

  const showAdminLink = isAdminAuthenticated;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-border">
        <div className="container-custom h-24 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 bg-accent text-white flex items-center justify-center rounded-lg shadow-sm">AP</div>
            <span>ANJANI PANDEY</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-sm font-semibold text-accent/70 hover:text-accent transition-colors">Home</Link>
            <Link to="/about" className="text-sm font-semibold text-accent/70 hover:text-accent transition-colors">About</Link>
            <Link to="/services" className="text-sm font-semibold text-accent/70 hover:text-accent transition-colors">Work With Me</Link>
            <Link to="/writing" className="text-sm font-semibold text-accent/70 hover:text-accent transition-colors">Writing</Link>
            <Link to="/resources" className="text-sm font-semibold text-accent/70 hover:text-accent transition-colors">Resources</Link>
            <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="btn-primary py-2.5 px-6 text-sm">Book a Call</a>
          </nav>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-border p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-5">
            <Link to="/" className="text-lg font-medium py-2">Home</Link>
            <Link to="/about" className="text-lg font-medium py-2">About</Link>
            <Link to="/services" className="text-lg font-medium py-2">Work With Me</Link>
            <Link to="/writing" className="text-lg font-medium py-2">Writing</Link>
            <Link to="/resources" className="text-lg font-medium py-2">Resources</Link>
            <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">Book a Call</a>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <ChatAssistant />

      {/* Back to Top Button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 p-3 bg-white border border-border rounded-full shadow-lg hover:text-accent transition-all z-40 group"
        title="Back to Top"
      >
        <ArrowLeft className="rotate-90 group-hover:-translate-y-1 transition-transform" size={20} />
      </button>

      <footer className="bg-muted border-t border-border py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="text-xl font-bold tracking-tighter mb-4">ANJANI PANDEY</div>
              <p className="text-sm text-accent-light/70 max-w-xs mb-8">
                Operations leader. Builder. Writing about systems, scale, and what AI changes about both. Co-founder, MetMov LLP.
              </p>
              <div className="mb-8">
                <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="btn-primary py-3 px-8 text-sm inline-block">
                  Book a Call
                </a>
              </div>
              <div className="flex gap-4">
                {/* PERMANENT SOCIAL LINKS - DO NOT CHANGE WITHOUT MANUAL PROMPT */}
                <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-lg border border-border hover:text-accent transition-colors" title="LinkedIn"><Linkedin size={18} /></a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-lg border border-border hover:text-accent transition-colors" title="WhatsApp"><MessageCircle size={18} /></a>
                <a href={METMOV_URL} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-lg border border-border hover:text-accent transition-colors" title="MetMov Website"><Globe size={18} /></a>
                <Link to="/blog" className="p-2 bg-white rounded-lg border border-border hover:text-accent transition-colors" title="Personal Blog"><BookOpen size={18} /></Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-accent/40">Navigation</h4>
                <nav className="flex flex-col gap-2 text-sm font-medium">
                  <Link to="/" className="hover:text-accent transition-colors">Home</Link>
                  <Link to="/about" className="hover:text-accent transition-colors">About</Link>
                  <Link to="/services" className="hover:text-accent transition-colors">Work With Me</Link>
                  <Link to="/writing" className="hover:text-accent transition-colors">Writing</Link>
                  <Link to="/resources" className="hover:text-accent transition-colors">Resources</Link>
                  <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Book a Call</a>
                </nav>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-accent/40">Legal</h4>
                <nav className="flex flex-col gap-2 text-sm font-medium">
                  <Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
                  <Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
                  <Link to="/sitemap" className="hover:text-accent transition-colors">Sitemap</Link>
                </nav>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-border/50 text-xs text-accent-light/50 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p>© 2026 Anjani Pandey. All rights reserved.</p>
            </div>
            <p>Co-founder, MetMov LLP | Bengaluru</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
