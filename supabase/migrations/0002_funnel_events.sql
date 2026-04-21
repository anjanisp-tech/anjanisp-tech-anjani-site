-- =============================================================================
-- Migration: 0002_funnel_events
-- Purpose:   Append-only funnel telemetry for /os signup + conversion flow
-- Tables:    funnel_events
-- Views:     funnel_conversion_v1 (rolling 30-day funnel counts by day)
-- =============================================================================
--
-- Event taxonomy (event_type):
--   page_view             client → /os or /os?confirmed=*
--   form_submit           server → POST /functions/v1/subscribe success
--   form_error            server → subscribe failure (captcha, rate limit, etc)
--   subscribed            server → new row inserted into subscribers
--   resent                server → existing pending_opt_in, confirmation resent
--   confirmed             server → confirmation flipped status=confirmed
--   downloaded            client → auto-download iframe fired post-confirm
--   services_cta_click    client → user clicked /book CTA on post-confirm banner
--   share_click           client → user clicked LinkedIn / X / copy-link share
--   nurture_sent          server → nurture email dispatched (Day 0/3/7)
--   unsubscribed          server → unsubscribe action
--
-- Design:
--   - Append-only. Never update. Never delete (except via retention job).
--   - No PII stored directly; subscriber_id FK is the join key.
--   - ip_address kept for bot/fraud analysis, not analytics.
--   - properties jsonb holds event-specific payload (error_code, url, etc).
--   - RLS: insert allowed from anon (for client-side page_view / clicks),
--          select locked to service_role.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- funnel_events
-- ---------------------------------------------------------------------------
create table if not exists public.funnel_events (
  id              uuid         primary key default gen_random_uuid(),
  event_type      text         not null
                  check (event_type in (
                    'page_view','form_submit','form_error','subscribed','resent',
                    'confirmed','downloaded','services_cta_click','share_click',
                    'nurture_sent','unsubscribed'
                  )),
  subscriber_id   uuid         references public.subscribers(id) on delete set null,
  session_id      text,
  anon_id         text,
  source          text,
  medium          text,
  campaign        text,
  path            text,
  referrer        text,
  user_agent      text,
  ip_address      inet,
  properties      jsonb        not null default '{}'::jsonb,
  created_at      timestamptz  not null default now()
);

-- Indexes
create index if not exists funnel_events_created_at_idx    on public.funnel_events (created_at desc);
create index if not exists funnel_events_event_type_idx    on public.funnel_events (event_type, created_at desc);
create index if not exists funnel_events_subscriber_id_idx on public.funnel_events (subscriber_id) where subscriber_id is not null;
create index if not exists funnel_events_session_id_idx    on public.funnel_events (session_id) where session_id is not null;
create index if not exists funnel_events_ip_created_idx    on public.funnel_events (ip_address, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.funnel_events enable row level security;

-- anon can INSERT only (for client-side events), cannot SELECT.
-- service_role bypasses RLS entirely.
drop policy if exists funnel_events_anon_insert on public.funnel_events;
create policy funnel_events_anon_insert
  on public.funnel_events
  for insert
  to anon
  with check (
    -- event_type must be a client-emittable one; never trust server-only types
    event_type in ('page_view','downloaded','services_cta_click','share_click')
  );

-- Defense-in-depth grants
revoke all      on public.funnel_events from anon, authenticated;
grant  insert   on public.funnel_events to anon;
grant  all      on public.funnel_events to service_role;

-- ---------------------------------------------------------------------------
-- funnel_conversion_v1 view (admin-only daily rollup, last 60 days)
-- ---------------------------------------------------------------------------
create or replace view public.funnel_conversion_v1
with (security_invoker = true) as
select
  date_trunc('day', created_at at time zone 'Asia/Kolkata')::date as event_date,
  count(*) filter (where event_type = 'page_view')          as page_views,
  count(*) filter (where event_type = 'form_submit')        as form_submits,
  count(*) filter (where event_type = 'subscribed')         as subscribed,
  count(*) filter (where event_type = 'confirmed')          as confirmed,
  count(*) filter (where event_type = 'downloaded')         as downloaded,
  count(*) filter (where event_type = 'services_cta_click') as services_cta_clicks,
  count(*) filter (where event_type = 'share_click')        as share_clicks
from public.funnel_events
where created_at >= now() - interval '60 days'
group by 1
order by 1 desc;

revoke all on public.funnel_conversion_v1 from anon, authenticated;
grant  all on public.funnel_conversion_v1 to service_role;

-- ---------------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------------
comment on table  public.funnel_events is 'Append-only funnel telemetry for /os signup + conversion. Anon may insert client events; select locked to service_role.';
comment on column public.funnel_events.event_type   is 'Enum of emittable events; client can only emit page_view | downloaded | services_cta_click | share_click.';
comment on column public.funnel_events.properties   is 'Event-specific payload (error_code, share_target, variant, etc).';
comment on column public.funnel_events.session_id   is 'Client-generated session id (rotates per page session).';
comment on column public.funnel_events.anon_id      is 'Client-generated anon id (persists across sessions via localStorage).';
