-- =============================================================================
-- Migration: 0003_nurture
-- Purpose:   Track 3-over-7 nurture email cadence for confirmed subscribers
-- Tables:    subscribers (alter — adds nurture_day{0,3,7}_sent_at columns)
-- Views:     nurture_due_v1 (subscribers eligible for next nurture send)
-- =============================================================================
--
-- Cadence (relative to subscribers.confirmed_at):
--   Day 0 → welcome + how to use the Starter Kit          (sent ASAP after confirm)
--   Day 3 → proof point + case-study link                  (sent ≥ 72h post-confirm)
--   Day 7 → soft CTA to /book + thread re-engagement        (sent ≥ 168h post-confirm)
--
-- Driver: pg_cron + pg_net hourly tick → invokes Edge Function `nurture-tick`,
-- which reads `nurture_due_v1`, sends via Resend, and timestamps the row.
-- The view + per-day timestamp columns make sends idempotent.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Add nurture cadence timestamps to subscribers
-- ---------------------------------------------------------------------------
alter table public.subscribers
  add column if not exists nurture_day0_sent_at timestamptz,
  add column if not exists nurture_day3_sent_at timestamptz,
  add column if not exists nurture_day7_sent_at timestamptz;

comment on column public.subscribers.nurture_day0_sent_at is 'Day-0 welcome nurture send timestamp. NULL = not sent.';
comment on column public.subscribers.nurture_day3_sent_at is 'Day-3 proof-point nurture send timestamp. NULL = not sent.';
comment on column public.subscribers.nurture_day7_sent_at is 'Day-7 CTA nurture send timestamp. NULL = not sent.';

-- Indexes on nurture-pending lookups (partial — only NULL rows matter)
create index if not exists subscribers_nurture_day0_pending_idx
  on public.subscribers (confirmed_at)
  where status = 'confirmed' and nurture_day0_sent_at is null;
create index if not exists subscribers_nurture_day3_pending_idx
  on public.subscribers (confirmed_at)
  where status = 'confirmed' and nurture_day0_sent_at is not null and nurture_day3_sent_at is null;
create index if not exists subscribers_nurture_day7_pending_idx
  on public.subscribers (confirmed_at)
  where status = 'confirmed' and nurture_day3_sent_at is not null and nurture_day7_sent_at is null;

-- ---------------------------------------------------------------------------
-- nurture_due_v1: which subscribers are eligible for which next send.
-- One row per (subscriber × due_day). Edge function dequeues from this view.
-- security_invoker so service_role enforcement matches base table.
-- ---------------------------------------------------------------------------
create or replace view public.nurture_due_v1
with (security_invoker = true) as
select
  s.id              as subscriber_id,
  s.email           as email,
  s.role            as role,
  s.confirmed_at    as confirmed_at,
  d.due_day         as due_day,
  case d.due_day
    when 0 then s.nurture_day0_sent_at
    when 3 then s.nurture_day3_sent_at
    when 7 then s.nurture_day7_sent_at
  end               as last_send_at
from public.subscribers s
cross join lateral (
  values
    (0, s.confirmed_at,                                  s.nurture_day0_sent_at is null),
    (3, s.confirmed_at + interval '3 days',              s.nurture_day0_sent_at is not null and s.nurture_day3_sent_at is null),
    (7, s.confirmed_at + interval '7 days',              s.nurture_day3_sent_at is not null and s.nurture_day7_sent_at is null)
) as d(due_day, eligible_at, is_pending)
where
  s.status = 'confirmed'
  and s.confirmed_at is not null
  and d.is_pending
  and d.eligible_at <= now()
order by s.confirmed_at asc, d.due_day asc;

revoke all on public.nurture_due_v1 from anon, authenticated;
grant  all on public.nurture_due_v1 to service_role;

comment on view public.nurture_due_v1 is 'Subscribers eligible for next nurture send. Edge fn nurture-tick reads this hourly.';
