import { useEffect, useState } from 'react';
import { OPERATING_SPINE_URL } from '../constants';
import { track } from '../lib/track';

/**
 * Mobile "Book a call" bar (2026-10-11).
 * On phones the header "Book a call" button sits inside the hamburger menu
 * (the header nav is `hidden md:flex`), so a phone reader had no booking
 * action on screen; only the chat bubble floated. This bar shows below the
 * md breakpoint only and points at the same door as the header button.
 * It slides away while the footer is on screen, because the footer carries
 * its own "Book a call" link and the bar would cover it.
 */
export default function MobileBookBar() {
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    // Re-query the footer on every check: the layout footer node can be
    // replaced after pre-rendered HTML is taken over by React, which left an
    // IntersectionObserver watching a detached node (seen on the preview).
    let raf = 0;
    const check = () => {
      raf = 0;
      const el = document.querySelector('footer');
      setFooterVisible(!!el && el.getBoundingClientRect().top < window.innerHeight);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-4 pt-3 flex items-center gap-3 transition-transform duration-300 ${
        footerVisible ? 'translate-y-full' : 'translate-y-0'
      }`}
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      aria-hidden={footerVisible}
    >
      <p className="flex-1 text-xs leading-snug text-accent/60 mb-0">Pick a time that suits you.</p>
      <a
        href={OPERATING_SPINE_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-cta="operating-spine"
        tabIndex={footerVisible ? -1 : 0}
        onClick={() => track('door_click', { door: 'mobile_bar' })}
        className="btn-primary shrink-0 py-2.5 px-5 text-sm"
      >
        Book a call
      </a>
    </div>
  );
}
