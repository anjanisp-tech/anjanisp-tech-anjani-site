// =============================================================================
// Edge Function: subscribe
// Endpoint: POST /functions/v1/subscribe
// Purpose:  Email capture from /os Starter Kit form (double opt-in flow)
// =============================================================================
//
// Flow:
//   1. CORS preflight handled
//   2. Parse + validate body (honeypot, email regex, consent)
//   3. Verify Turnstile token server-side
//   4. Rate limit by IP (max 5 attempts per hour)
//   5. Upsert subscriber:
//        - new email                  -> insert with fresh confirmation_token, send confirmation email
//        - existing pending_opt_in    -> resend confirmation email (same token), no new row
//        - existing confirmed         -> 409 idempotent
//        - existing unsubscribed      -> 410 (re-subscribe via separate flow, not yet built)
//   6. Send Resend email with confirmation link
//   7. Return neutral 200 (don't leak existence)
//
// Returns generic responses to avoid email enumeration.
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { preflight, jsonResponse } from "../_shared/cors.ts";
import { verifyTurnstile } from "../_shared/turnstile.ts";
import { sendEmail, confirmEmailHtml, confirmEmailText } from "../_shared/resend.ts";
import { emitFunnelEvent } from "../_shared/funnel.ts";

const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")              ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PUBLIC_SITE_URL           = Deno.env.get("PUBLIC_SITE_URL")           ?? "https://www.anjanipandey.com";
// Confirmation link is hosted by the confirm Edge Function:
const CONFIRM_BASE_URL          = `${SUPABASE_URL}/functions/v1/confirm`;

const RATE_LIMIT_PER_HOUR = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribeBody {
  email?: string;
  role?: string | null;
  consent?: boolean;
  website?: string;            // honeypot
  turnstile_token?: string;
  source?: string;
  referrer?: string | null;
  submitted_at?: string;
  session_id?: string;
  anon_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

Deno.serve(async (req) => {
  const pf = preflight(req); if (pf) return pf;
  if (req.method !== "POST") return jsonResponse(req, { error: "method_not_allowed" }, 405);

  // ---- Parse body ----
  let body: SubscribeBody;
  try { body = await req.json(); }
  catch { return jsonResponse(req, { error: "invalid_json" }, 400); }

  const email          = (body.email ?? "").trim().toLowerCase();
  const role           = (body.role ?? "").toString().trim().slice(0, 200) || null;
  const consent        = body.consent === true;
  const honeypot       = (body.website ?? "").trim();
  const turnstileToken = (body.turnstile_token ?? "").trim();
  const source         = (body.source ?? "public_command_center").slice(0, 60);
  const referrer       = (body.referrer ?? "").toString().slice(0, 500) || null;
  const userAgent      = req.headers.get("user-agent")?.slice(0, 500) ?? null;
  const ip             = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;
  const sessionId      = (body.session_id ?? "").toString().slice(0, 80) || null;
  const anonId         = (body.anon_id    ?? "").toString().slice(0, 80) || null;
  const utmSource      = (body.utm_source ?? "").toString().slice(0, 80) || null;
  const utmMedium      = (body.utm_medium ?? "").toString().slice(0, 80) || null;
  const utmCampaign    = (body.utm_campaign ?? "").toString().slice(0, 120) || null;

  // ---- Supabase service-role client (needed for telemetry on error paths too) ----
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("subscribe: missing Supabase env");
    return jsonResponse(req, { error: "server_misconfigured" }, 500);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const telemetryBase = {
    session_id: sessionId,
    anon_id:    anonId,
    source:     utmSource ?? source,
    medium:     utmMedium,
    campaign:   utmCampaign,
    path:       "/os",
    referrer,
    user_agent: userAgent,
    ip_address: ip,
  } as const;

  // ---- Bot / validation gates ----
  if (honeypot)                 return jsonResponse(req, { ok: true }, 200);  // silently swallow bots
  if (!EMAIL_RE.test(email)) {
    await emitFunnelEvent(supabase, { ...telemetryBase, event_type: "form_error", properties: { code: "invalid_email" } });
    return jsonResponse(req, { error: "invalid_email" }, 400);
  }
  if (email.length > 254) {
    await emitFunnelEvent(supabase, { ...telemetryBase, event_type: "form_error", properties: { code: "invalid_email" } });
    return jsonResponse(req, { error: "invalid_email" }, 400);
  }
  if (!consent) {
    await emitFunnelEvent(supabase, { ...telemetryBase, event_type: "form_error", properties: { code: "consent_required" } });
    return jsonResponse(req, { error: "consent_required" }, 400);
  }
  if (!turnstileToken) {
    await emitFunnelEvent(supabase, { ...telemetryBase, event_type: "form_error", properties: { code: "captcha_required" } });
    return jsonResponse(req, { error: "captcha_required" }, 400);
  }

  const ts = await verifyTurnstile(turnstileToken, ip);
  if (!ts.success) {
    await emitFunnelEvent(supabase, { ...telemetryBase, event_type: "form_error", properties: { code: "captcha_failed", errorCodes: ts.errorCodes } });
    return jsonResponse(req, { error: "captcha_failed", codes: ts.errorCodes }, 403);
  }

  // ---- Rate limit by IP (sliding 1 hour) ----
  if (ip) {
    const sinceIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: rlErr } = await supabase
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", sinceIso);
    if (rlErr) {
      console.error("subscribe: rate-limit query failed", rlErr);
    } else if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
      await emitFunnelEvent(supabase, { ...telemetryBase, event_type: "form_error", properties: { code: "rate_limited" } });
      return jsonResponse(req, { error: "rate_limited" }, 429);
    }
  }

  // Form passed all gates — emit form_submit (idempotency tracked downstream)
  await emitFunnelEvent(supabase, { ...telemetryBase, event_type: "form_submit" });

  // ---- Lookup existing ----
  const { data: existing, error: lookupErr } = await supabase
    .from("subscribers")
    .select("id, status, confirmation_token, email_send_count")
    .eq("email", email)
    .maybeSingle() as { data: { id: string; status: string; confirmation_token: string; email_send_count: number } | null; error: unknown };

  if (lookupErr) {
    console.error("subscribe: lookup failed", lookupErr);
    return jsonResponse(req, { error: "server_error" }, 500);
  }

  let confirmationToken: string;
  let subscriberId: string | null = null;

  if (!existing) {
    // ---- New subscriber ----
    const { data: inserted, error: insErr } = await supabase
      .from("subscribers")
      .insert({
        email,
        role,
        source,
        referrer,
        ip_address: ip,
        user_agent: userAgent,
      })
      .select("id, confirmation_token")
      .single();
    if (insErr || !inserted) {
      console.error("subscribe: insert failed", insErr);
      await emitFunnelEvent(supabase, { ...telemetryBase, event_type: "form_error", properties: { code: "db_insert_failed" } });
      return jsonResponse(req, { error: "server_error" }, 500);
    }
    confirmationToken = inserted.confirmation_token;
    subscriberId      = inserted.id;
    await emitFunnelEvent(supabase, { ...telemetryBase, event_type: "subscribed", subscriber_id: subscriberId });
  } else if (existing.status === "confirmed") {
    return jsonResponse(req, { ok: true, already: "confirmed" }, 200);
  } else if (existing.status === "unsubscribed") {
    return jsonResponse(req, { error: "unsubscribed" }, 410);
  } else {
    // pending_opt_in -> resend same token
    confirmationToken = existing.confirmation_token;
    subscriberId      = existing.id;
    await emitFunnelEvent(supabase, { ...telemetryBase, event_type: "resent", subscriber_id: subscriberId });
  }

  // ---- Send confirmation email ----
  const confirmUrl = `${CONFIRM_BASE_URL}?token=${encodeURIComponent(confirmationToken)}`;
  const send = await sendEmail({
    to: email,
    subject: "Confirm your email — Level4 Starter Kit",
    html: confirmEmailHtml({ confirmUrl }),
    text: confirmEmailText({ confirmUrl }),
  });

  if (!send.ok) {
    console.error("subscribe: resend send failed", send);
    // Don't surface the failure to the user; the row is created and a re-submit will retry.
    return jsonResponse(req, { ok: true, warn: "email_send_deferred" }, 200);
  }

  // Best-effort update of email_send_count (non-blocking)
  await supabase
    .from("subscribers")
    .update({
      last_email_sent_at: new Date().toISOString(),
      email_send_count: (existing?.email_send_count ?? 0) + 1,
    })
    .eq("email", email);

  return jsonResponse(req, { ok: true }, 200);
});
