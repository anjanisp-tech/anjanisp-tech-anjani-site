import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

// Workshop enquiry form (growth build step 6, 2026-11-04). Saves to /api/workshop-lead.
// The home page "Ask about a team workshop" button points here (#workshop-form).
const field = 'w-full px-4 py-3 rounded-sm border border-border focus:border-accent bg-white outline-none transition-all text-base';
const label = 'text-xs font-bold uppercase tracking-widest text-accent/50';

export default function WorkshopForm() {
  const [f, setF] = useState({ name: '', email: '', company: '', team_size: '', goal: '', website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    try {
      const res = await fetch('/api/workshop-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, page: typeof window !== 'undefined' ? window.location.pathname : '' }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState('done');
      if (typeof window !== 'undefined' && (window as any).gtag) (window as any).gtag('event', 'workshop_enquiry');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div id="workshop-form" className="border border-border bg-white p-8 rounded-sm flex items-start gap-3">
        <CheckCircle2 size={22} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="mb-0 text-accent">Thanks. I've got your note and I'll reply within 24 hours.</p>
      </div>
    );
  }

  return (
    <form id="workshop-form" onSubmit={submit} className="border border-border bg-white p-8 rounded-sm grid gap-5 scroll-mt-24">
      <div>
        <h3 className="text-xl mb-1">Ask about a workshop for your team</h3>
        <p className="text-sm text-accent-light mb-0">Five short boxes. I reply within 24 hours.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <label className="grid gap-2"><span className={label}>Your name</span>
          <input type="text" required value={f.name} onChange={set('name')} className={field} autoComplete="name" /></label>
        <label className="grid gap-2"><span className={label}>Work email</span>
          <input type="email" required value={f.email} onChange={set('email')} className={field} autoComplete="email" /></label>
        <label className="grid gap-2"><span className={label}>Company</span>
          <input type="text" required value={f.company} onChange={set('company')} className={field} autoComplete="organization" /></label>
        <label className="grid gap-2"><span className={label}>Team size</span>
          <select required value={f.team_size} onChange={set('team_size')} className={field}>
            <option value="">Pick one</option>
            <option>Under 10</option><option>10 to 25</option><option>26 to 50</option><option>51 to 200</option><option>More than 200</option>
          </select></label>
      </div>
      <label className="grid gap-2"><span className={label}>What should people leave with?</span>
        <textarea rows={3} value={f.goal} onChange={set('goal')} className={field} placeholder="For example: each person uses AI safely on one real task" /></label>
      <input type="text" name="website" value={f.website} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button type="submit" disabled={state === 'sending'} data-cta-surface="workshop_form" className="btn-primary gap-3 px-8 justify-self-start">
          {state === 'sending' ? 'Sending' : 'Send'} <ArrowRight size={18} />
        </button>
        {state === 'error' && <p className="text-sm text-red-700 mb-0">That didn't go through. Please try again, or use WhatsApp above.</p>}
      </div>
    </form>
  );
}
