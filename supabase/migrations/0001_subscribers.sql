-- =============================================================================
-- Migration: 0001_subscribers
-- Purpose:   Email capture for /os Public Command Center Starter Kit form
-- Tables:    subscribers (double opt-in, RLS gated, service-role only)
-- =============================================================================

-- Required extensions
create extension if not exists "pgcrypto";    -- gen_random_uuid()
create extension if not exists "citext";      -- case-insensitive email column

-- ---------------------------------------------------------------------------
-- subscribers: one row per email captured from the public site
-- ---------------------------------------------------------------------------
create table if not exists public.subscribers (
  id                    uuid          primary key default gen_random_uuid(),
  email                 citext        not null unique,
  role                  text,
  status                text          not null default 'pending_opt_in'
                        check (status in ('pending_opt_in', 'confirmed', 'unsubscribed', 'bounced')),
  confirmation_token    uuid          not null unique default gen_random_uuid(),
  source                text          not null default 'public_command_center',
  referrer              text,
  ip_address            inet,
  user_agent            text,
  created_at            timestamptz   not null default now(),
  confirmed_at          timestamptz,
  unsubscribed_at       timestamptz,
  last_email_sent_at    timestamptz,
  email_send_count      integer       not null default 0
);

-- Indexes for common lookups
create index if not exists subscribers_email_idx              on public.subscribers (email);
create index if not exists subscribers_status_idx             on public.subscribers (status);
create index if not exists subscribers_confirmation_token_idx on public.subscribers (confirmation_token);
create index if not exists subscribers_created_at_idx         on public.subscribers (created_at desc);
create index if not exists subscribers_ip_address_created_idx on public.subscribers (ip_address, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security: lock down to service_role only
-- The Edge Functions use SUPABASE_SERVICE_ROLE_KEY; the public anon key
-- never touches this table directly.
-- ---------------------------------------------------------------------------
alter table public.subscribers enable row level security;

-- Default deny: no policies for anon or authenticated roles.
-- service_role bypasses RLS, so Edge Functions retain full access.

-- Explicit revoke for anon (defense in depth — RLS already denies)
revoke all on public.subscribers from anon, authenticated;
grant  all on public.subscribers to service_role;

-- ---------------------------------------------------------------------------
-- Helper view (admin-only): aggregate counts for the Outcomes panel
-- ---------------------------------------------------------------------------
create or replace view public.subscribers_summary
with (security_invoker = true) as
select
  count(*)                                   filter (where status = 'confirmed')      as confirmed_count,
  count(*)                                   filter (where status = 'pending_opt_in') as pending_count,
  count(*)                                   filter (where status = 'unsubscribed')   as unsubscribed_count,
  count(*)                                                                            as total_count,
  max(created_at)                                                                     as last_signup_at,
  max(confirmed_at)                                                                   as last_confirmation_at
from public.subscribers;

revoke all on public.subscribers_summary from anon, authenticated;
grant  all on public.subscribers_summary to service_role;

-- ---------------------------------------------------------------------------
-- Comments (self-documentation)
-- ---------------------------------------------------------------------------
comment on table  public.subscribers                    is 'Email subscribers from /os Starter Kit form. Double opt-in. RLS service-role only.';
comment on column public.subscribers.status             is 'pending_opt_in | confirmed | unsubscribed | bounced';
comment on column public.subscribers.confirmation_token is 'Random uuid embedded in the double-opt-in confirmation link.';
comment on column public.subscribers.ip_address         is 'Captured from x-forwarded-for at /functions/v1/subscribe. Used for rate limiting only.';
