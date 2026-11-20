import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import { FIT_CALL_URL } from '../constants';
import { track } from '../lib/track';

// AI check (plan line D17, built 2026-11-20). Questions approved by Anjani 2026-11-20.
// Each scored answer is 0, 1 or 2 (higher = more work to do). 11 scored questions, 0 to 22.
// Saves to /api/ai-check-lead. Anjani sends a one-page report within 2 working days.
// LIVE from 2026-11-20 (Anjani's yes).

type Opt = { t: string; s: number };
type Q = { id: string; part: number; q: string; opts: Opt[] };

const PARTS = ['How AI is used today', 'Safety', 'Your work and data', 'People'];

const QS: Q[] = [
  { id: 'q1', part: 0, q: 'How does your team use AI tools today?', opts: [
    { t: 'Most people use one tool the firm chose, every week', s: 0 },
    { t: 'A few people use their own free accounts', s: 1 },
    { t: "Hardly anyone, or I don't know", s: 2 }] },
  { id: 'q2', part: 0, q: 'Have you written down which jobs AI is allowed to do?', opts: [
    { t: 'Yes, a short list', s: 0 },
    { t: "We've talked about it, nothing written", s: 1 },
    { t: 'No', s: 2 }] },
  { id: 'q3', part: 0, q: 'Has AI saved your team hours you can count?', opts: [
    { t: 'Yes, we measured it', s: 0 },
    { t: 'We think so, never measured', s: 1 },
    { t: 'Not yet', s: 2 }] },
  { id: 'q4', part: 1, q: 'Are there written rules on what must never go into an AI tool, like client data, salaries or passwords?', opts: [
    { t: 'Yes, and people know them', s: 0 },
    { t: 'Some rules, nothing written', s: 1 },
    { t: 'No rules', s: 2 }] },
  { id: 'q5', part: 1, q: 'Which accounts do people use for AI?', opts: [
    { t: "A business plan where our data isn't used for training", s: 0 },
    { t: 'A mix of business and personal accounts', s: 1 },
    { t: 'Personal free accounts', s: 2 }] },
  { id: 'q6', part: 1, q: 'Before AI work goes to a client or is used for a decision, does a person check it?', opts: [
    { t: 'Always', s: 0 },
    { t: 'Sometimes', s: 1 },
    { t: 'Rarely or never', s: 2 }] },
  { id: 'q7', part: 2, q: 'How are your repeated jobs written down?', opts: [
    { t: 'Steps are written for most of them', s: 0 },
    { t: "Some are, the rest sit in a few people's heads", s: 1 },
    { t: "Mostly in people's heads", s: 2 }] },
  { id: 'q8', part: 2, q: 'Where does your day-to-day work data live?', opts: [
    { t: 'In shared sheets or software everyone uses', s: 0 },
    { t: 'Spread across sheets, email and WhatsApp', s: 1 },
    { t: 'Mostly in WhatsApp groups and memory', s: 2 }] },
  { id: 'q9', part: 2, q: 'Can you name the 3 weekly jobs that take your team the most hours?', opts: [
    { t: 'Yes, with rough hours', s: 0 },
    { t: 'Roughly', s: 1 },
    { t: 'Not really', s: 2 }] },
  { id: 'q10', part: 3, q: 'Who owns AI in your firm?', opts: [
    { t: 'One named person', s: 0 },
    { t: 'Whoever is interested', s: 1 },
    { t: 'Nobody', s: 2 }] },
  { id: 'q11', part: 3, q: 'How does your team feel about AI?', opts: [
    { t: 'Keen, and some can use it well', s: 0 },
    { t: 'Curious but unsure', s: 1 },
    { t: 'Worried or not interested', s: 2 }] },
];

const TIPS: string[][] = [
  ['Pick one AI tool for the whole firm and pay for the business plan.',
   'Write down three jobs AI is allowed to do this month.',
   'Time one of those jobs before and after AI, so the saving is a number.'],
  ['Write one page on what never goes into an AI tool: client data, salaries, passwords.',
   'Move everyone off personal free accounts and onto the firm plan.',
   'Agree that a named person reads any AI work before it reaches a client.'],
  ['Write the steps for your most repeated job before you hand any of it to AI.',
   'Move the data that job needs out of WhatsApp and into one shared sheet.',
   'List your three biggest weekly jobs with rough hours. That list is where AI starts.'],
  ['Name one person who owns AI, with one hour a week to look after it.',
   'Show the team one real job AI did well, on your own work, not a demo.',
   'Ask the worried people what they fear. Write the answer into your rules.'],
];

function band(score: number) {
  if (score <= 6) return { name: 'Ready to grow', line: 'You have the basics. The next step is more jobs, each with a person watching.' };
  if (score <= 14) return { name: 'Ready for a first safe job', line: 'Pick one job, write its rules, and measure the hours.' };
  return { name: 'Start with the basics', line: 'Rules and one chosen tool come before any new AI job.' };
}

const field = 'w-full px-4 py-3 rounded-sm border border-border focus:border-accent bg-white outline-none transition-all text-base';
const label = 'text-xs font-bold uppercase tracking-widest text-accent/50';

export default function AiCheck() {
  const [ans, setAns] = useState<Record<string, number>>({});
  const [f, setF] = useState({ first_wish: '', team_size: '', name: '', company: '', role: '', email: '', heard_from: '', website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [started, setStarted] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  const pick = (id: string, s: number) => {
    if (!started) { setStarted(true); track('ai_check_start'); }
    setAns({ ...ans, [id]: s });
  };

  const answered = QS.every(q => ans[q.id] !== undefined);
  const score = QS.reduce((n, q) => n + (ans[q.id] ?? 0), 0);
  const partScores = PARTS.map((_, p) => QS.filter(q => q.part === p).reduce((n, q) => n + (ans[q.id] ?? 0), 0));
  const weakest = partScores.indexOf(Math.max(...partScores));
  const b = band(score);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!answered) return;
    setState('sending');
    try {
      const res = await fetch('/api/ai-check-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, answers: ans, score, band: b.name, weakest_part: PARTS[weakest] }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState('done');
      track('ai_check_submit', { score, band: b.name });
    } catch {
      setState('error');
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="AI readiness assessment for small firms | Anjani Pandey"
        description="Eleven questions on how your firm uses AI today, how safe it is, and where to start. Your score shows right away, and I send a one-page report within 2 working days."
        canonical="https://www.anjanipandey.com/ai-check"
      />
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>

      <section className="pt-32 md:pt-40">
        <div className="container-custom max-w-[760px]">
          <p className={label}>AI check</p>
          <h1>An AI readiness assessment for small firms</h1>
          <p className="text-lg text-accent-light">
            Eleven short questions on how your firm uses AI today, how safe that use is, and where to start.
            It takes about 4 minutes. Your score shows as soon as you answer the last question.
            I read every answer myself and send you a one-page report within 2 working days.
          </p>
        </div>
      </section>

      {state === 'done' ? (
        <section className="pt-0">
          <div className="container-custom max-w-[760px]">
            <div className="border border-border p-8 rounded-sm grid gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={22} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className={label}>Your score: {score} of 22</p>
                  <h2 className="mb-2">{b.name}</h2>
                  <p className="text-accent-light mb-0">{b.line}</p>
                </div>
              </div>
              <div>
                <p className="font-bold mb-2">Three things to try first: {PARTS[weakest]}</p>
                <ul className="list-disc pl-6 text-accent-light">
                  {TIPS[weakest].map(t => <li key={t} className="mb-2">{t}</li>)}
                </ul>
              </div>
              <p className="text-accent-light">I will send your one-page report within 2 working days.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={FIT_CALL_URL} target="_blank" rel="noopener noreferrer" data-cta="ai-check-call" className="btn-primary gap-2">
                  Book a call <ArrowRight size={18} />
                </a>
                <Link to="/services#workshop-form" data-cta="workshop-form" className="btn-outline">See the team workshop</Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="pt-0">
          <form onSubmit={submit} className="container-custom max-w-[760px] grid gap-12">
            {PARTS.map((p, pi) => (
              <div key={p} className="grid gap-8">
                <h2 className="mb-0">Part {pi + 1}. {p}</h2>
                {QS.filter(q => q.part === pi).map((q, i) => (
                  <fieldset key={q.id} className="grid gap-3">
                    <legend className="font-semibold text-lg mb-3">{QS.indexOf(q) + 1}. {q.q}</legend>
                    {q.opts.map(o => (
                      <label key={o.t} className={`flex items-start gap-3 border rounded-sm px-4 py-3 cursor-pointer ${ans[q.id] === o.s ? 'border-accent bg-surface' : 'border-border'}`}>
                        <input type="radio" name={q.id} checked={ans[q.id] === o.s} onChange={() => pick(q.id, o.s)} className="mt-1" />
                        <span>{o.t}</span>
                      </label>
                    ))}
                  </fieldset>
                ))}
              </div>
            ))}

            <div className="grid gap-6 border-t border-border pt-10">
              <h2 className="mb-0">About you</h2>
              <label className="grid gap-2"><span className={label}>What would you most like AI to help with first?</span>
                <textarea rows={3} value={f.first_wish} onChange={set('first_wish')} className={field} /></label>
              <div className="grid md:grid-cols-2 gap-5">
                <label className="grid gap-2"><span className={label}>People in your firm</span>
                  <select required value={f.team_size} onChange={set('team_size')} className={field}>
                    <option value="">Pick one</option>
                    <option>1 to 10</option><option>11 to 50</option><option>51 to 200</option><option>More than 200</option>
                  </select></label>
                <label className="grid gap-2"><span className={label}>Your name</span>
                  <input type="text" required value={f.name} onChange={set('name')} className={field} autoComplete="name" /></label>
                <label className="grid gap-2"><span className={label}>Firm</span>
                  <input type="text" required value={f.company} onChange={set('company')} className={field} autoComplete="organization" /></label>
                <label className="grid gap-2"><span className={label}>Your role</span>
                  <input type="text" value={f.role} onChange={set('role')} className={field} autoComplete="organization-title" /></label>
                <label className="grid gap-2"><span className={label}>Work email</span>
                  <input type="email" required value={f.email} onChange={set('email')} className={field} autoComplete="email" /></label>
                <label className="grid gap-2"><span className={label}>How did you hear about this check?</span>
                  <input type="text" value={f.heard_from} onChange={set('heard_from')} className={field} /></label>
              </div>
              <input type="text" name="website" value={f.website} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <p className="text-sm text-accent-light mb-0">I use your answers only to write your report. I don't share them or add you to a mailing list.</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button type="submit" disabled={!answered || state === 'sending'} className="btn-primary gap-3 px-8 justify-self-start disabled:opacity-50">
                  {state === 'sending' ? 'Sending' : 'See my score'} <ArrowRight size={18} />
                </button>
                {!answered && <p className="text-sm text-accent-light mb-0">Answer all 11 questions to see your score.</p>}
                {state === 'error' && <p className="text-sm text-red-700 mb-0">That didn't go through. Please try again.</p>}
              </div>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
