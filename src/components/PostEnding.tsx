import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { OPERATING_SPINE_URL, FIT_CALL_URL } from '../constants';
import type { Chapter } from '../data/chapters';
import { track } from '../lib/track';

/**
 * The ending every essay and chapter shares (2026-10-01). Two parts:
 *  1. the bottleneck calculator: the reader puts their own number on the
 *     problem the essay just described;
 *  2. the door: one offer, chosen by the chapter (Operating Spine through
 *     MetMov for the five diseases, the AI Setup Sprint for chapter six).
 * Fires the same GA4 event names the old bridge used, so the charter metric
 * ("views arriving from anjanipandey.com") keeps counting.
 */
export default function PostEnding({ chapter, compact = false }: { chapter: Chapter; compact?: boolean }) {
  const [hours, setHours] = useState(15);
  const [rate, setRate] = useState(5000);
  const yearly = hours * rate * 52;
  const yearlyLabel = yearly >= 1e7 ? `₹${(yearly / 1e7).toFixed(1)} Cr` : `₹${Math.round(yearly / 1e5)} L`;
  const spine = chapter.door === 'spine';
  // 2026-10-02 measurement: one calculator_used per page view, on the first move.
  const usedRef = useRef(false);
  const markUsed = () => {
    if (usedRef.current) return;
    usedRef.current = true;
    track('calculator_used', { where: 'post_ending', chapter: chapter.slug });
  };
  const door = (button: string) => () =>
    track('door_click', { chapter: chapter.slug, door: chapter.door, button });

  return (
    <div className="grid gap-10">
      {!compact && (
        <div className="grid gap-3">
          <span className="label-mono">Before you go · what is this costing you?</span>
          <div className="border-[1.5px] border-accent grid md:grid-cols-[1.1fr_1fr]">
            <div className="p-6 md:p-7 grid gap-5 md:border-r border-b md:border-b-0 border-border">
              <h3 className="text-xl md:text-2xl font-bold tracking-[-0.02em] mb-0">
                If this sounded like your week, put a number on it.
              </h3>
              <label htmlFor="pe-hours" className="flex justify-between gap-4 text-sm text-accent-light">
                Hours a week on approvals and firefighting
                <output className="font-bold text-accent tabular-nums">{hours}</output>
              </label>
              <input id="pe-hours" type="range" min={2} max={40} value={hours} onChange={(e) => { setHours(+e.target.value); markUsed(); }} className="w-full accent-primary" />
              <label htmlFor="pe-rate" className="flex justify-between gap-4 text-sm text-accent-light">
                Value of one hour of your time (₹)
                <output className="font-bold text-accent tabular-nums">{rate.toLocaleString('en-IN')}</output>
              </label>
              <input id="pe-rate" type="range" min={1000} max={20000} step={500} value={rate} onChange={(e) => { setRate(+e.target.value); markUsed(); }} className="w-full accent-primary" />
            </div>
            <div className="p-6 md:p-7 bg-muted grid gap-2 content-center">
              <span className="text-xs text-accent-light">Your yearly cost of being the bottleneck</span>
              <span className="text-4xl md:text-5xl font-extrabold tracking-[-0.04em] tabular-nums leading-none">{yearlyLabel}</span>
              <span className="text-xs text-accent-light">Hours × value × 52 weeks. Your numbers, not ours.</span>
              <Link to="/calculator" className="text-sm font-bold text-primary mt-2 inline-flex items-center gap-1">
                Full calculator <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="door">
        <span className="label-mono">{spine ? 'If this chapter is your company' : 'If you want this running for you'}</span>
        <h3 className="text-2xl md:text-3xl font-bold tracking-[-0.03em] mb-0">
          {spine ? 'The fix is not a better you. It is an operating spine.' : 'Start with one working system built around your week.'}
        </h3>
        <p className="text-accent-light max-w-2xl">
          {spine
            ? 'Clear owners, a steady rhythm, and decision rights that do not need you in the room. I install it in 90 days, through MetMov, for founder-led businesses.'
            : 'The AI Setup Sprint is two or three focused sessions that leave you with a Claude-based system doing real work. Fixed price. No ongoing commitment.'}
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          {spine ? (
            <>
              <a href={OPERATING_SPINE_URL} target="_blank" rel="noopener noreferrer" data-cta="operating-spine" onClick={door('primary')} className="btn-primary gap-2">
                Book an Operating Spine scoping call <ArrowRight size={16} />
              </a>
              <Link to="/services" onClick={door('services')} className="btn-outline">See the three ways to work with me</Link>
            </>
          ) : (
            <>
              <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" data-cta="ai-sprint" onClick={door('primary')} className="btn-primary gap-2">
                Book the AI Setup Sprint call <ArrowRight size={16} />
              </a>
              <Link to="/services" onClick={door('services')} className="btn-outline">Compare all three offers</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
