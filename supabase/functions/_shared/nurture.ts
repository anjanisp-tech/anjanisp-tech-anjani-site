// Nurture sequence templates — Day 0 / Day 3 / Day 7
// Sent by the `nurture-tick` Edge Function to subscribers who confirmed via
// the double-opt-in flow. Each subscriber receives at most one of each.
//
// Voice: sharp, no filler, written as Anjani in first person. Zero marketing
// fluff. Each email opens with a specific value-add and ends with one CTA.

const SITE_URL = "https://www.anjanipandey.com";
const BOOK_URL = `${SITE_URL}/book`;
const OS_URL   = `${SITE_URL}/os`;

export interface NurtureRender {
  subject: string;
  html:    string;
  text:    string;
}

function unsubscribeFooterHtml(email: string): string {
  return `
  <hr style="border:none;border-top:1px solid #e7e5e4;margin:32px 0;">
  <p style="font-size: 12px; color: #a8a29e; line-height: 1.5;">
    You're getting this because you confirmed your email at <a href="${OS_URL}" style="color:#78716c;">${OS_URL.replace("https://", "")}</a>.
    Reply STOP and I'll remove you.
  </p>
  <p style="font-size: 12px; color: #a8a29e;">
    — Anjani Pandey · ${email}
  </p>`;
}

function unsubscribeFooterText(email: string): string {
  return [
    "",
    "—",
    `You're getting this because you confirmed your email at ${OS_URL}.`,
    "Reply STOP and I'll remove you.",
    `— Anjani Pandey (${email})`,
  ].join("\n");
}

// =============================================================================
// Day 0 — Welcome + how to actually use the kit
// =============================================================================
export function renderDay0(params: { email: string }): NurtureRender {
  const subject = "Your Starter Kit — and the one move that makes it work";

  const html = `<!DOCTYPE html>
<html><body style="font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #0c0a09; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    Quick note now that the kit is in your inbox.
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    Most people open the zip, skim the README, and never come back.
    Here is the one move that flips it from "interesting download" to "actual operating system":
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917; padding-left: 16px; border-left: 3px solid #0c0a09; margin: 20px 0;">
    Pick <strong>one</strong> recurring decision you make every week — pipeline review, content batching, vendor triage, weekly planning — and rewrite it as a Claude prompt that lives in <code style="background:#f5f5f4;padding:2px 6px;border-radius:3px;">/01-memory/</code>.
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    That's it. One decision, captured once, replayable forever. The rest of the kit (skills, scheduled tasks, the router) is leverage on top of that single habit.
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    I'll send two more notes — one in three days (a real example of how I use this), one in a week (where most people get stuck and how to push through).
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    If you hit anything, just hit reply. I read every one.
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">— Anjani</p>
  ${unsubscribeFooterHtml(params.email)}
</body></html>`;

  const text = [
    "Quick note now that the kit is in your inbox.",
    "",
    "Most people open the zip, skim the README, and never come back.",
    "Here is the one move that flips it from \"interesting download\" to \"actual operating system\":",
    "",
    "  Pick ONE recurring decision you make every week — pipeline review, content batching, vendor triage, weekly planning — and rewrite it as a Claude prompt that lives in /01-memory/.",
    "",
    "That's it. One decision, captured once, replayable forever. The rest of the kit (skills, scheduled tasks, the router) is leverage on top of that single habit.",
    "",
    "I'll send two more notes — one in three days (a real example of how I use this), one in a week (where most people get stuck and how to push through).",
    "",
    "If you hit anything, just hit reply. I read every one.",
    "",
    "— Anjani",
    unsubscribeFooterText(params.email),
  ].join("\n");

  return { subject, html, text };
}

// =============================================================================
// Day 3 — Concrete worked example (proof point)
// =============================================================================
export function renderDay3(params: { email: string }): NurtureRender {
  const subject = "How I cut my Monday planning from 90 minutes to 12";

  const html = `<!DOCTYPE html>
<html><body style="font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #0c0a09; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    Concrete example, since you have the kit.
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    Every Monday I used to spend ~90 minutes triaging the week — calendar, MetMov pipeline, NityaVerde commitments, content backlog, personal stuff. It bled into Tuesday because I was tired by the end.
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    Here's what replaced it:
  </p>
  <ol style="font-size: 16px; line-height: 1.8; color: #1c1917; padding-left: 24px;">
    <li>A <code style="background:#f5f5f4;padding:2px 6px;border-radius:3px;">weekly-prep</code> skill in the kit reads my calendar, my CRM, and my open commitments.</li>
    <li>It produces a single prioritized brief — what's load-bearing, what can slip, what to cancel.</li>
    <li>I spend 12 minutes editing the brief instead of 90 minutes assembling it.</li>
  </ol>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    The math: I get ~78 minutes back every Monday. That's ~65 hours a year. The skill took 40 minutes to write.
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    The lesson isn't "build the same skill." It's that <strong>the highest-leverage prompts are the ones you re-run weekly without thinking</strong>. Look at your calendar. The next 30 minutes of recurring work — that's the prompt to write.
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    One more note coming on Day 7.
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">— Anjani</p>
  ${unsubscribeFooterHtml(params.email)}
</body></html>`;

  const text = [
    "Concrete example, since you have the kit.",
    "",
    "Every Monday I used to spend ~90 minutes triaging the week — calendar, MetMov pipeline, NityaVerde commitments, content backlog, personal stuff. It bled into Tuesday because I was tired by the end.",
    "",
    "Here's what replaced it:",
    "",
    "  1. A `weekly-prep` skill in the kit reads my calendar, my CRM, and my open commitments.",
    "  2. It produces a single prioritized brief — what's load-bearing, what can slip, what to cancel.",
    "  3. I spend 12 minutes editing the brief instead of 90 minutes assembling it.",
    "",
    "The math: I get ~78 minutes back every Monday. That's ~65 hours a year. The skill took 40 minutes to write.",
    "",
    "The lesson isn't \"build the same skill.\" It's that the highest-leverage prompts are the ones you re-run weekly without thinking. Look at your calendar. The next 30 minutes of recurring work — that's the prompt to write.",
    "",
    "One more note coming on Day 7.",
    "",
    "— Anjani",
    unsubscribeFooterText(params.email),
  ].join("\n");

  return { subject, html, text };
}

// =============================================================================
// Day 7 — Where people get stuck + soft CTA to /book
// =============================================================================
export function renderDay7(params: { email: string }): NurtureRender {
  const subject = "Last note: where most people stall (and the fix)";

  const html = `<!DOCTYPE html>
<html><body style="font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #0c0a09; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    Last note in this thread.
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    A week in, most people who downloaded the kit are stuck in one of three places:
  </p>
  <ul style="font-size: 16px; line-height: 1.8; color: #1c1917; padding-left: 24px;">
    <li><strong>"I haven't picked the first prompt."</strong> Fix: pick the most boring recurring task on your calendar this week. Boredom is signal — it means the work is structured enough to automate.</li>
    <li><strong>"I built the prompt but it doesn't sound like me."</strong> Fix: paste 3 things you wrote into the system prompt as voice samples. Style transfer beats style instruction every time.</li>
    <li><strong>"I built it and now I forget to use it."</strong> Fix: put the prompt behind a Scheduled Task that runs on Monday at 8am. The kit shows you how.</li>
  </ul>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    If you're past those, you're already operating differently than you were last week. That's the entire point.
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    Two things from here:
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917; padding-left: 16px; border-left: 3px solid #0c0a09; margin: 20px 0;">
    <strong>(1)</strong> Reply with the one prompt or skill you built. I'll send back one specific suggestion to make it sharper. No upsell.<br><br>
    <strong>(2)</strong> If you want this done with you — designed, deployed, and operationalized for your business — <a href="${BOOK_URL}" style="color:#1e3a8a;">book a 30-min call</a>.
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">
    Either way, thanks for taking it seriously.
  </p>
  <p style="font-size: 16px; line-height: 1.7; color: #1c1917;">— Anjani</p>
  ${unsubscribeFooterHtml(params.email)}
</body></html>`;

  const text = [
    "Last note in this thread.",
    "",
    "A week in, most people who downloaded the kit are stuck in one of three places:",
    "",
    "  - \"I haven't picked the first prompt.\"  Fix: pick the most boring recurring task on your calendar this week. Boredom is signal — it means the work is structured enough to automate.",
    "  - \"I built the prompt but it doesn't sound like me.\"  Fix: paste 3 things you wrote into the system prompt as voice samples. Style transfer beats style instruction every time.",
    "  - \"I built it and now I forget to use it.\"  Fix: put the prompt behind a Scheduled Task that runs on Monday at 8am. The kit shows you how.",
    "",
    "If you're past those, you're already operating differently than you were last week. That's the entire point.",
    "",
    "Two things from here:",
    "",
    `  (1) Reply with the one prompt or skill you built. I'll send back one specific suggestion to make it sharper. No upsell.`,
    `  (2) If you want this done with you — designed, deployed, and operationalized for your business — book a 30-min call: ${BOOK_URL}`,
    "",
    "Either way, thanks for taking it seriously.",
    "",
    "— Anjani",
    unsubscribeFooterText(params.email),
  ].join("\n");

  return { subject, html, text };
}

// =============================================================================
// Dispatch by day
// =============================================================================
export function renderNurture(day: 0 | 3 | 7, params: { email: string }): NurtureRender {
  switch (day) {
    case 0: return renderDay0(params);
    case 3: return renderDay3(params);
    case 7: return renderDay7(params);
  }
}
