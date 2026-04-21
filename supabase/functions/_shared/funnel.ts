// Funnel telemetry emitter (server-side, service-role).
// Never throws — telemetry failures must not break the user flow.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type SupabaseServiceClient = ReturnType<typeof createClient>;

export type ServerFunnelEvent =
  | "form_submit"
  | "form_error"
  | "subscribed"
  | "resent"
  | "confirmed"
  | "nurture_sent"
  | "unsubscribed";

export interface EmitFunnelParams {
  event_type: ServerFunnelEvent;
  subscriber_id?: string | null;
  session_id?: string | null;
  anon_id?: string | null;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  path?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  properties?: Record<string, unknown>;
}

export async function emitFunnelEvent(
  supabase: SupabaseServiceClient,
  params: EmitFunnelParams,
): Promise<void> {
  try {
    const { error } = await supabase.from("funnel_events").insert({
      event_type:    params.event_type,
      subscriber_id: params.subscriber_id ?? null,
      session_id:    params.session_id    ?? null,
      anon_id:       params.anon_id       ?? null,
      source:        params.source        ?? null,
      medium:        params.medium        ?? null,
      campaign:      params.campaign      ?? null,
      path:          params.path          ?? null,
      referrer:      params.referrer      ?? null,
      user_agent:    params.user_agent    ?? null,
      ip_address:    params.ip_address    ?? null,
      properties:    params.properties    ?? {},
    });
    if (error) {
      console.error("funnel.emit failed", params.event_type, error);
    }
  } catch (e) {
    console.error("funnel.emit threw", params.event_type, e);
  }
}
