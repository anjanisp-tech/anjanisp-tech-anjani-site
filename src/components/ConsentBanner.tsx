import { useEffect, useState } from 'react';

// Google Consent Mode v2 banner. Analytics is denied by default (set in index.html);
// GA4 cookies are written only after the visitor accepts here. Choice persists in localStorage.
const KEY = 'ap-cookie-consent';

export default function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      setShow(v !== 'granted' && v !== 'denied');
    } catch (e) {
      setShow(true);
    }
  }, []);

  const decide = (granted: boolean) => {
    try { localStorage.setItem(KEY, granted ? 'granted' : 'denied'); } catch (e) { /* ignore */ }
    const g = (window as any).gtag;
    if (typeof g === 'function') {
      g('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
        ad_storage: granted ? 'granted' : 'denied',
        ad_user_data: granted ? 'granted' : 'denied',
        ad_personalization: granted ? 'granted' : 'denied',
      });
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-4 sm:p-5">
      <div className="max-w-3xl mx-auto rounded-sm bg-accent text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* text-white set on the <p> itself: the base-layer p colour (grey ink) was winning
            over the parent's text-white, leaving grey on near-black (about 2:1). 2026-10-01 */}
        <p className="text-sm leading-relaxed flex-1 text-white">
          I use cookies for analytics to understand how the site is used. Accept to allow analytics, or decline to keep it off. See the{' '}
          <a href="/privacy" className="underline decoration-white/40 hover:decoration-white underline-offset-4">Privacy Policy</a>.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => decide(false)}
            className="px-4 py-2 rounded-sm text-sm font-semibold border border-white/25 hover:border-white/50 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => decide(true)}
            className="px-4 py-2 rounded-sm text-sm font-semibold bg-primary hover:bg-primary/90 text-white transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}