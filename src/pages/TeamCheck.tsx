import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { TEAM_CHECKS } from '../data/teamChecks';

// Team AI check (plan line D8, built 2026-11-20). One question per screen.
// Private: noindex, not linked, not in the sitemap. Answers go to /api/team-check-response,
// which also places each person in a group (Starting out, Regular, Builders).

type Step =
  | { id: 'team'; kind: 'team'; q: string }
  | { id: string; kind: 'one' | 'many'; q: string; opts: string[]; required: boolean }
  | { id: string; kind: 'text'; q: string; required: boolean; hint?: string };

const STEPS: Step[] = [
  { id: 'team', kind: 'team', q: 'Which team are you in?' },
  { id: 'freq', kind: 'one', required: true, q: 'How often do you use an AI tool (Claude, ChatGPT, Copilot or similar) for work?',
    opts: ['Never, or tried once or twice', 'A few times a month', 'Every week', 'Every day'] },
  { id: 'done', kind: 'many', required: false, q: 'Which of these have you done with AI at work? Pick all that apply.',
    opts: ['Asked it questions or had it rewrite text', 'Summarised documents, emails or meetings', 'Written or fixed code',
      'Worked with spreadsheets or data', 'Set up a saved helper, project or custom instructions that I reuse',
      'Connected it to other tools or built an automated flow', 'None of these yet'] },
  { id: 'self', kind: 'one', required: true, q: 'How would you describe yourself?',
    opts: ["Starting out: I don't really know where to begin", 'Getting there: I use it for simple things',
      'Regular: it is part of my week and I want to do more', 'Builder: I set up helpers or flows that others could use'] },
  { id: 'task', kind: 'text', required: true, q: 'Which one task in your week would you most like AI to help with?' },
  { id: 'blocker', kind: 'text', required: false, q: 'What stops you using AI more today?', hint: 'Optional' },
];

const eyebrow = 'text-xs font-bold uppercase tracking-widest text-accent/50';
const field = 'w-full px-4 py-3 rounded-sm border border-border focus:border-accent bg-white outline-none transition-all text-base';

export default function TeamCheck() {
  const { code = '' } = useParams();
  const cfg = TEAM_CHECKS[code.toLowerCase()];
  const [i, setI] = useState(-1); // -1 = intro
  const [a, setA] = useState<Record<string, any>>({ done: [] });
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const head = (
    <Helmet>
      <title>Team AI check | Anjani Pandey</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );

  if (!cfg || !cfg.open) {
    return (
      <div className="bg-white min-h-screen">{head}
        <section className="pt-40"><div className="container-custom max-w-[640px]">
          <p className={eyebrow}>Team AI check</p>
          <h1 className="text-4xl md:text-5xl">This link is not active.</h1>
          <p className="text-lg text-accent-light">Please check the link you were sent, or ask the person who shared it.</p>
        </div></section>
      </div>
    );
  }

  const step = STEPS[i];
  const val = step ? a[step.id] : undefined;
  const ok = !step ? true
    : step.kind === 'team' ? !!(val && String(val).trim())
    : step.kind === 'many' ? true
    : (step as any).required ? !!(val && String(val).trim()) : true;

  const toggle = (o: string) => {
    let cur: string[] = a.done || [];
    if (o === 'None of these yet') cur = cur.includes(o) ? [] : [o];
    else cur = cur.includes(o) ? cur.filter(x => x !== o) : [...cur.filter(x => x !== 'None of these yet'), o];
    setA({ ...a, done: cur });
  };

  async function submit() {
    setState('sending');
    try {
      const r = await fetch('/api/team-check-response', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toLowerCase(), ...a, website: a.website || '' }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setState('done');
    } catch { setState('error'); }
  }

  const next = () => { if (!ok) return; if (i === STEPS.length - 1) submit(); else setI(i + 1); };

  return (
    <div className="bg-white min-h-screen">{head}
      <section className="pt-32 md:pt-40">
        <div className="container-custom max-w-[680px]">
          {state === 'done' ? (
            <div className="grid gap-4">
              <CheckCircle2 size={28} className="text-primary" />
              <p className={eyebrow}>Team AI check</p>
              <h1 className="text-4xl md:text-5xl">Thank you. That's all.</h1>
              <p className="text-lg text-accent-light">Your answers help plan a session at the right level for your group. You can close this page now.</p>
            </div>
          ) : i === -1 ? (
            <div className="grid gap-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <p className={eyebrow + ' mb-0'}>Team AI check</p>
                <p className={eyebrow + ' mb-0'}>About 2 minutes</p>
              </div>
              <h1 className="text-4xl md:text-6xl">Where are you with AI at work?</h1>
              <p className="text-lg text-accent-light">
                Six short questions. There are no right or wrong answers. Your answers are used only to put you in a session at the right level, so nobody sits through what they already know.
              </p>
              <button onClick={() => setI(0)} className="btn-primary gap-3 px-8 justify-self-start">Start <ArrowRight size={18} /></button>
            </div>
          ) : (
            <div className="grid gap-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className={eyebrow + ' mb-0'}>Question {i + 1} of {STEPS.length}</p>
                  {(step as any).hint && <p className={eyebrow + ' mb-0'}>{(step as any).hint}</p>}
                </div>
                <div className="h-[3px] bg-border w-full"><div className="h-[3px] bg-accent transition-all" style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} /></div>
              </div>
              <h2 className="text-3xl md:text-4xl mb-0">{step.q}</h2>

              {step.kind === 'team' && (cfg.teams.length ? (
                <div className="grid gap-3">{cfg.teams.map(t => (
                  <button key={t} onClick={() => setA({ ...a, team: t })}
                    className={`text-left border rounded-sm px-5 py-4 transition-colors ${a.team === t ? 'border-accent bg-surface font-semibold' : 'border-border hover:border-accent/50'}`}>{t}</button>
                ))}</div>
              ) : (
                <input autoFocus type="text" value={a.team || ''} onChange={e => setA({ ...a, team: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && next()} className={field} placeholder="Your team" />
              ))}

              {step.kind === 'one' && (
                <div className="grid gap-3">{(step as any).opts.map((o: string) => (
                  <button key={o} onClick={() => setA({ ...a, [step.id]: o })}
                    className={`text-left border rounded-sm px-5 py-4 transition-colors ${a[step.id] === o ? 'border-accent bg-surface font-semibold' : 'border-border hover:border-accent/50'}`}>{o}</button>
                ))}</div>
              )}

              {step.kind === 'many' && (
                <div className="grid gap-3">{(step as any).opts.map((o: string) => {
                  const on = (a.done || []).includes(o);
                  return (
                    <button key={o} onClick={() => toggle(o)}
                      className={`text-left border rounded-sm px-5 py-4 flex items-start gap-3 transition-colors ${on ? 'border-accent bg-surface font-semibold' : 'border-border hover:border-accent/50'}`}>
                      <span className={`mt-1 w-4 h-4 border flex-shrink-0 ${on ? 'bg-accent border-accent' : 'border-accent/40'}`} />{o}
                    </button>);
                })}</div>
              )}

              {step.kind === 'text' && (
                <textarea autoFocus rows={4} value={a[step.id] || ''} onChange={e => setA({ ...a, [step.id]: e.target.value })} className={field} />
              )}

              <input type="text" name="website" value={a.website || ''} onChange={e => setA({ ...a, website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

              <div className="flex items-center gap-4">
                <button onClick={() => setI(i - 1)} className="btn-outline gap-2 px-5"><ArrowLeft size={18} /> Back</button>
                <button onClick={next} disabled={!ok || state === 'sending'} className="btn-primary gap-3 px-8 disabled:opacity-40">
                  {i === STEPS.length - 1 ? (state === 'sending' ? 'Sending' : 'Send my answers') : 'Next'} <ArrowRight size={18} />
                </button>
              </div>
              {state === 'error' && <p className="text-sm text-red-700 mb-0">That didn't go through. Please press Send again.</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
