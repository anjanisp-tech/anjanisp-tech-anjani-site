// =============================================================================
// Edge Function: confirm
// Endpoint: GET /functions/v1/confirm?token=<uuid>
// Purpose:  Double-opt-in confirmation link from confirmation email
// =============================================================================
//
// Flow:
//   1. Validate token (uuid format)
//   2. Lookup subscriber by confirmation_token
//   3. If pending_opt_in   -> flip to confirmed, set confirmed_at, redirect to /os?confirmed=1
//   4. If already confirmed -> redirect to /os?confirmed=already
//   5. If not found / expired -> redirect to /os?confirmed=invalid
//
// Phase B (deferred): generate a signed Supabase Storage URL for the Starter Kit
// zip and return it on the redirect, OR render a thank-you page with the link
// embedded. For now: redirect to /os with a query flag the page can read.
// =============================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { emitFunnelEvent } from "../_shared/funnel.ts";

const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")              ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PUBLIC_SITE_URL           = Deno.env.get("PUBLIC_SITE_URL")           ?? "https://www.anjanipandey.com";

// Phase B env (optional today). When set, confirm will generate a signed URL.
const STARTER_KIT_BUCKET        = Deno.env.get("STARTER_KIT_BUCKET")        ?? "";
const STARTER_KIT_OBJECT        = Deno.env.get("STARTER_KIT_OBJECT")        ?? "";
const SIGNED_URL_TTL_SECONDS    = Number(Deno.env.get("SIGNED_URL_TTL_SECONDS") ?? "604800"); // 7 days

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function redirect(target: string, status = 302): Response {
  return new Response(null, { status, headers: { Location: target } });
}

function landing(status: "ok" | "already" | "invalid", downloadUrl?: string | null): string {
  const params = new URLSearchParams({ confirmed: status });
  if (downloadUrl) params.set("dl", downloadUrl);
  return `${PUBLIC_SITE_URL}/os?${params.toString()}`;
}

Deno.serve(async (req) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url   = new URL(req.url);
  const token = (url.searchParams.get("token") ?? "").trim();

  if (!UUID_RE.test(token)) {
    return redirect(landing("invalid"));
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("confirm: missing Supabase env");
    return new Response("Server misconfigured", { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data: subscriber, error: lookupErr } = await supabase
    .from("subscribers")
    .select("id, email, status")
    .eq("confirmation_token", token)
    .maybeSingle();

  if (lookupErr) {
    console.error("confirm: lookup failed", lookupErr);
    return redirect(landing("invalid"));
  }

  if (!subscriber) {
    return redirect(landing("invalid"));
  }

  if (subscriber.status === "confirmed") {
    const dl = await maybeSignDownload(supabase);
    return redirect(landing("already", dl));
  }

  if (subscriber.status !== "pending_opt_in") {
    // unsubscribed or bounced: treat as invalid for the public flow
    return redirect(landing("invalid"));
  }

  // ---- Flip to confirmed ----
  const { error: updErr } = await supabase
    .from("subscribers")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", subscriber.id);

  if (updErr) {
    console.error("confirm: update failed", updErr);
    return redirect(landing("invalid"));
  }

  const ip  = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;
  const ua  = req.headers.get("user-agent")?.slice(0, 500) ?? null;
  await emitFunnelEvent(supabase, {
    event_type:    "confirmed",
    subscriber_id: subscriber.id as string,
    path:          "/functions/v1/confirm",
    user_agent:    ua,
    ip_address:    ip,
  });

  const dl = await maybeSignDownload(supabase);
  return redirect(landing("ok", dl));
});

// Phase B: generate a signed Storage URL if the bucket/object env is set.
// Returns null today (Phase A) — the /os page will show a "kit shipping shortly" state.
async function maybeSignDownload(
  supabase: ReturnType<typeof createClient>
): Promise<string | null> {
  if (!STARTER_KIT_BUCKET || !STARTER_KIT_OBJECT) return null;
  try {
    const { data, error } = await supabase.storage
      .from(STARTER_KIT_BUCKET)
      .createSignedUrl(STARTER_KIT_OBJECT, SIGNED_URL_TTL_SECONDS);
    if (error || !data) {
      console.error("confirm: signed url failed", error);
      return null;
    }
    return data.signedUrl;
  } catch (e) {
    console.error("confirm: signed url threw", e);
    return null;
  }
}
