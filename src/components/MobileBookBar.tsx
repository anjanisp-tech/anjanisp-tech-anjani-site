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
    // Plain scroll check, re-querying the footer each time. One
    // getBoundingClientRect per scroll event is cheap, and it stays correct
    // even if the footer node is replaced after the pre-rendered page loads.
    const check = () => {
      const el = document.querySelector('footer');
      setFooterVisible(!!el && el.getBoundingClientRect().top < window.innerHeight);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    window.addEventListener('load', check);
    // Pages that fetch their content after mount start short, with the footer
    // on screen. Re-check whenever the page grows so the bar appears without
    // waiting for the first scroll.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null;
    ro?.observe(document.body);
    return () => {
      ro?.disconnect();
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      window.removeEventListener('load', check);
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
