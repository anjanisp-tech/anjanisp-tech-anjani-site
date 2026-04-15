import { useState } from 'react';
import { Linkedin, Mail, ArrowRight, X, Lock } from 'lucide-react';
import { LINKEDIN_URL } from '../constants';

interface GateOverlayProps {
  /** Title of the resource being gated */
  resourceTitle: string;
  /** Called when the user unlocks content via email */
  onUnlock?: () => void;
}

/**
 * Content gate component with dual CTA:
 * 1. Primary: "Connect on LinkedIn" (drives follower growth + content distribution)
 * 2. Secondary: Email capture (captures the lead directly)
 *
 * Unlock persists via localStorage so returning visitors see full content.
 */
export default function GateOverlay({ resourceTitle, onUnlock }: GateOverlayProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleLinkedInClick = () => {
    // Track event
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'guide_linkedin_gate', { resource_name: resourceTitle });
    }
    // Open LinkedIn in new tab
    window.open(LINKEDIN_URL, '_blank', 'noopener,noreferrer');
    // Unlock content after clicking (trust-based, no verification)
    localStorage.setItem('guide_unlocked', 'true');
    onUnlock?.();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;
    setStatus('loading');

    try {
      await fetch('/api/resource-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resource_name: resourceTitle }),
      });
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'guide_email_gate', { resource_name: resourceTitle });
      }
      localStorage.setItem('guide_unlocked', 'true');
      setStatus('success');
      setTimeout(() => onUnlock?.(), 800);
    } catch {
      // Still unlock on error to not block UX
      localStorage.setItem('guide_unlocked', 'true');
      setStatus('success');
      setTimeout(() => onUnlock?.(), 800);
    }
  };

  return (
    <div className="relative -mt-16 z-20">
      {/* Gradient fade from content */}
      <div className="h-24 bg-gradient-to-b from-transparent to-white pointer-events-none" />

      <div className="bg-muted border border-border/60 rounded-2xl p-8 md:p-12 shadow-xl max-w-2xl mx-auto text-center">
        <div className="w-14 h-14 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={22} />
        </div>

        <h3 className="text-2xl md:text-3xl font-bold mb-3">Keep reading?</h3>
        <p className="text-accent-light mb-8 max-w-md mx-auto">
          Connect with me on LinkedIn to unlock the full guide. I share weekly frameworks on AI, operations, and building leverage.
        </p>

        {/* Primary CTA: LinkedIn */}
        <button
          onClick={handleLinkedInClick}
          className="w-full sm:w-auto bg-[#0A66C2] hover:bg-[#004182] text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center justify-center gap-3 transition-all shadow-sm mb-4"
        >
          <Linkedin size={20} />
          Connect on LinkedIn
          <ArrowRight size={16} />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6 max-w-xs mx-auto">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-bold uppercase tracking-widest text-accent/30">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Secondary CTA: Email */}
        {!showEmailForm ? (
          <button
            onClick={() => setShowEmailForm(true)}
            className="text-sm font-semibold text-accent/50 hover:text-accent transition-colors inline-flex items-center gap-2"
          >
            <Mail size={14} />
            Get it via email instead
          </button>
        ) : (
          <form onSubmit={handleEmailSubmit} className="max-w-sm mx-auto space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary px-6 py-3 text-sm rounded-xl"
              >
                {status === 'loading' ? 'Sending...' : 'Send'}
              </button>
            </div>
            {status === 'success' && (
              <p className="text-sm font-bold text-green-700 animate-in fade-in">
                Unlocking the full guide...
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm font-bold text-red-500 animate-in fade-in">
                Something went wrong. Please try again.
              </p>
            )}
            <p className="text-[10px] text-accent/30 uppercase tracking-widest font-bold">
              No spam. No sequences.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
