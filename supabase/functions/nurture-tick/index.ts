// =============================================================================
// Edge Function: nurture-tick
// Endpoint:      POST /functions/v1/nurture-tick
// Purpose:       Send the next eligible nurture email (Day 0/3/7) to each
//                subscriber listed in nurture_due_v1.
// =============================================================================
//
// Driver:    pg_cron + pg_net invokes this hourly (see migration 0004).
// Auth:      Requires header x-nurture-key matching env NURTURE_TICK_KEY.
//            Service-role client used internally; endpoint is NOT public.
// Idempotent: each row's nurture_dayN_sent_at is timestamped after a
//            successful Resend dispatch, so duplicate calls are no-ops.
//
// Body (optional JSON):
//   { dry_run?: boolean, max?: number }
//   - dry_run=true reports what WOULD send without sending.
//   - max caps how many emails to send in a single tick (default 50).
//
// Response: { ok: true, attempted, sent, skipped, errors[] }
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { sendEmail } from "../_shared/resend.ts";
import { renderNurture } from "../_shared/nurture.ts";
import { emitFunnelEvent } from "../_shared/funnel.ts";

const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")              ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const NURTURE_TICK_KEY          = Deno.env.get("NURTURE_TICK_KEY")          ?? "";

const DEFAULT_MAX_PER_TICK = 50;

interface DueRow {
  subscriber_id: string;
  email:         string;
  role:          string | null;
  confirmed_at:  string;
  due_day:       number;
  last_send_at:  string | null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status:  405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ---- Auth ----
  const presentedKey = req.headers.get("x-nurture-key") ?? "";
  if (!NURTURE_TICK_KEY || presentedKey !== NURTURE_TICK_KEY) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status:  401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("nurture-tick: missing Supabase env");
    return new Response(JSON.stringify({ error: "server_misconfigured" }), {
      status:  500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ---- Parse body ----
  let dryRun = false;
  let max    = DEFAULT_MAX_PER_TICK;
  try {
    if (req.headers.get("content-length") && Number(req.headers.get("content-length")) > 0) {
      const body = await req.json().catch(() => ({}));
      dryRun = body.dry_run === true;
      if (typeof body.max === "number" && body.max > 0 && body.max <= 500) {
        max = Math.floor(body.max);
      }
    }
  } catch (_) { /* ignore body parse */ }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // ---- Pull due cohort ----
  const { data: due, error: dueErr } = await supabase
    .from("nurture_due_v1")
    .select("subscriber_id, email, role, confirmed_at, due_day, last_send_at")
    .limit(max) as { data: DueRow[] | null; error: unknown };

  if (dueErr) {
    console.error("nurture-tick: due query failed", dueErr);
    return new Response(JSON.stringify({ error: "due_query_failed" }), {
      status:  500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const queue = due ?? [];
  const errors: Array<{ subscriber_id: string; due_day: number; error: string }> = [];
  let sent    = 0;
  let skipped = 0;

  if (dryRun) {
    return new Response(JSON.stringify({
      ok:        true,
      dry_run:   true,
      attempted: queue.length,
      sent:      0,
      skipped:   queue.length,
      preview:   queue.map(r => ({ subscriber_id: r.subscriber_id, due_day: r.due_day })),
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  // ---- Send loop (sequential to keep Resend rate sane) ----
  for (const row of queue) {
    const day = row.due_day as 0 | 3 | 7;
    if (day !== 0 && day !== 3 && day !== 7) {
      skipped++;
      continue;
    }

    const tpl = renderNurture(day, { email: row.email });
    const send = await sendEmail({
      to:      row.email,
      subject: tpl.subject,
      html:    tpl.html,
      text:    tpl.text,
    });

    if (!send.ok) {
      errors.push({
        subscriber_id: row.subscriber_id,
        due_day:       day,
        error:         send.error ?? `status_${send.status ?? "unknown"}`,
      });
      continue;
    }

    // Timestamp the per-day column so this row drops from nurture_due_v1.
    const updateField = day === 0 ? "nurture_day0_sent_at"
                      : day === 3 ? "nurture_day3_sent_at"
                                  : "nurture_day7_sent_at";

    const { error: updErr } = await supabase
      .from("subscribers")
      .update({
        [updateField]:        new Date().toISOString(),
        last_email_sent_at:   new Date().toISOString(),
      })
      .eq("id", row.subscriber_id);

    if (updErr) {
      // Email sent but timestamp didn't update — log loudly. Next tick may
      // re-send. Acceptable trade vs. lost-send risk.
      console.error("nurture-tick: timestamp update failed", row.subscriber_id, day, updErr);
      errors.push({
        subscriber_id: row.subscriber_id,
        due_day:       day,
        error:         "timestamp_update_failed",
      });
    }

    await emitFunnelEvent(supabase, {
      event_type:    "nurture_sent",
      subscriber_id: row.subscriber_id,
      path:          "/functions/v1/nurture-tick",
      properties:    { day, resend_id: send.id ?? null },
    });

    sent++;
  }

  return new Response(JSON.stringify({
    ok:        true,
    dry_run:   false,
    attempted: queue.length,
    sent,
    skipped,
    errors,
  }), { status: 200, headers: { "Content-Type": "application/json" } });
});
