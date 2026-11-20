import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
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

// Styled to anjanipandey.com brand rules v2 (2026-11-20): paper background, ink text and buttons,
// mono only for small labels, one blue used small (the step label), blue tint for a selected row.
const label = 'font-mono text-[11px] uppercase tracking-[0.14em] text-accent-light';
const field = 'w-full px-4 py-3 rounded-sm border border-border focus:border-accent bg-white outline-none transition-all text-base';
const LETTERS = 'ABCDEFG';
const COVERS = ['Your team', 'How often you use AI', 'What you have done with it', 'Where you see yourself', 'The one task to start with', 'What holds you back'];

function Frame({ top, right, children }: { top: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-surface min-h-screen">
      <Helmet>
        <title>Team AI check | Anjani Pandey</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <section className="pt-28 md:pt-36 pb-16">
        <div className="container-custom max-w-[720px]">
          <div className="flex items-center justify-between border-b border-accent/80 pb-3 mb-8">
            <p className={label + ' mb-0'}>{top}</p>
            {right && <p className={label + ' mb-0'}>{right}</p>}
          </div>
          {children}
          <p className={label + ' mt-12 mb-0'}>Anjani Pandey · Your answers are used only to plan the sessions</p>
        </div>
      </section>
    </div>
  );
}

function Row({ k, on, onClick, children, box }: { k: string; on: boolean; onClick: () => void; children: React.ReactNode; box?: boolean }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left flex items-start gap-5 px-5 py-4 border-b border-border last:border-b-0 transition-colors ${on ? 'bg-paper-soft' : 'bg-white hover:bg-muted'}`}>
      <span className={`font-mono text-[11px] pt-1 w-5 flex-shrink-0 ${on ? 'text-primary' : 'text-accent-light'}`}>{box ? (on ? '[x]' : '[ ]') : k}</span>
      <span className={`text-base ${on ? 'text-accent font-semibold' : 'text-accent'}`}>{children}</span>
    </button>
  );
}

export default function TeamCheck() {
  const { code = '' } = useParams();
  const cfg = TEAM_CHECKS[code.toLowerCase()];
  const [i, setI] = useState(-1); // -1 = intro
  const [a, setA] = useState<Record<string, any>>({ done: [] });
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');



  if (!cfg || !cfg.open) {
    return (
      <Frame top="Team AI check">
        <h1 className="text-4xl md:text-5xl">This link is not active.</h1>
        <p className="text-lg text-accent-light">Please check the link you were sent, or ask the person who shared it.</p>
      </Frame>
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


  if (state === 'done') {
    return (
      <Frame top="Team AI check" right="Done">
        <h1 className="text-4xl md:text-6xl">Thank you. That's all.</h1>
        <p className="text-lg text-accent-light">Your answers help plan a session at the right level for your group. You can close this page now.</p>
      </Frame>
    );
  }

  if (i === -1) {
    return (
      <Frame top="Team AI check" right="About 2 minutes">
        <h1 className="text-4xl md:text-6xl">Where are you with AI at work?</h1>
        <p className="text-lg text-accent-light mb-8">
          Six short questions. There are no right or wrong answers. Your answers are used only to put you in a session at the right level, so nobody sits through what they already know.
        </p>
        <div className="bg-white border border-border rounded-sm mb-8">
          <p className={label + ' px-5 pt-4 pb-3 mb-0 border-b border-border'}>What the six questions cover</p>
          {COVERS.map((c, n) => (
            <div key={c} className="flex items-baseline gap-5 px-5 py-3 border-b border-border last:border-b-0">
              <span className="font-mono text-[11px] text-accent-light w-5">0{n + 1}</span>
              <span className="text-base text-accent">{c}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setI(0)} className="btn-primary gap-3 px-8">Start the six questions <ArrowRight size={18} /></button>
      </Frame>
    );
  }

  return (
    <Frame top={<span className="text-primary">Question {i + 1} of {STEPS.length}</span>} right={(step as any).hint || (step.kind === 'many' ? 'Pick all that apply' : undefined)}>
      <div className="h-[2px] bg-border w-full -mt-8 mb-10"><div className="h-[2px] bg-accent transition-all" style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} /></div>
      <h2 className="text-3xl md:text-4xl mb-8">{step.q}</h2>

      {step.kind === 'team' && (cfg.teams.length ? (
        <div className="border border-border rounded-sm overflow-hidden">{cfg.teams.map((t, n) => (
          <Row key={t} k={LETTERS[n] || String(n + 1)} on={a.team === t} onClick={() => setA({ ...a, team: t })}>{t}</Row>
        ))}</div>
      ) : (
        <input autoFocus type="text" value={a.team || ''} onChange={e => setA({ ...a, team: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && next()} className={field} placeholder="Your team" />
      ))}

      {step.kind === 'one' && (
        <div className="border border-border rounded-sm overflow-hidden">{(step as any).opts.map((o: string, n: number) => (
          <Row key={o} k={LETTERS[n]} on={a[step.id] === o} onClick={() => setA({ ...a, [step.id]: o })}>{o}</Row>
        ))}</div>
      )}

      {step.kind === 'many' && (
        <div className="border border-border rounded-sm overflow-hidden">{(step as any).opts.map((o: string) => (
          <Row key={o} k="" box on={(a.done || []).includes(o)} onClick={() => toggle(o)}>{o}</Row>
        ))}</div>
      )}

      {step.kind === 'text' && (
        <textarea autoFocus rows={4} value={a[step.id] || ''} onChange={e => setA({ ...a, [step.id]: e.target.value })} className={field} />
      )}

      <input type="text" name="website" value={a.website || ''} onChange={e => setA({ ...a, website: e.target.value })} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div className="flex items-center gap-4 mt-10">
        <button onClick={() => setI(i - 1)} className="btn-outline gap-2 px-5"><ArrowLeft size={18} /> Back</button>
        <button onClick={next} disabled={!ok || state === 'sending'} className="btn-primary gap-3 px-8 disabled:opacity-40">
          {i === STEPS.length - 1 ? (state === 'sending' ? 'Sending' : 'Send my answers') : 'Next'} <ArrowRight size={18} />
        </button>
      </div>
      {state === 'error' && <p className="text-sm text-red-700 mt-4 mb-0">That didn't go through. Please press Send again.</p>}
    </Frame>
  );
}
