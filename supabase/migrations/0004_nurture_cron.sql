-- =============================================================================
-- Migration: 0004_nurture_cron
-- Purpose:   Hourly pg_cron job that invokes nurture-tick via pg_net
-- =============================================================================
--
-- IMPORTANT — two-step enable:
--   Step 1: Apply this migration. It creates the extensions + the scheduled
--           job in a *disabled* state (so nothing sends until vault values
--           are set). The job calls pg_net.http_post to the Edge Function
--           endpoint with the x-nurture-key auth header pulled from vault.
--   Step 2: Populate Supabase Vault with:
--             - nurture_tick_url          e.g. https://<ref>.supabase.co/functions/v1/nurture-tick
--             - nurture_tick_key          value of NURTURE_TICK_KEY env var
--           Then `alter extension pg_cron set schema extensions;` if needed,
--           and `select cron.alter_job(<jobid>, active := true);` to start.
--
-- The job runs at :05 every hour, IST-offset-agnostic (UTC internal).
-- pg_cron is ideal because the send logic is idempotent (nurture_due_v1 only
-- surfaces eligible rows), so a missed tick is harmless.
-- =============================================================================

create extension if not exists pg_cron   with schema extensions;
create extension if not exists pg_net    with schema extensions;
create extension if not exists supabase_vault;

-- ---------------------------------------------------------------------------
-- Seed empty vault secrets if they don't exist yet.  Populate via the
-- Supabase Studio → Vault UI or via SQL:
--   select vault.create_secret('<full https url>', 'nurture_tick_url');
--   select vault.create_secret('<NURTURE_TICK_KEY value>', 'nurture_tick_key');
-- ---------------------------------------------------------------------------
do $$
begin
  -- Placeholder: do nothing here, Vault secrets are user-managed.
  -- This block exists to document the required secret names.
  perform 1;
end $$;

-- ---------------------------------------------------------------------------
-- Scheduled job: hourly nurture tick
-- Defined inactive by default; caller activates once Vault is populated.
-- ---------------------------------------------------------------------------
do $$
declare
  existing_jobid bigint;
begin
  select jobid into existing_jobid from cron.job where jobname = 'nurture_tick_hourly';
  if existing_jobid is null then
    perform cron.schedule(
      'nurture_tick_hourly',
      '5 * * * *',
      $cmd$
      select net.http_post(
        url     := (select decrypted_secret from vault.decrypted_secrets where name = 'nurture_tick_url'),
        headers := jsonb_build_object(
          'Content-Type',   'application/json',
          'x-nurture-key',  (select decrypted_secret from vault.decrypted_secrets where name = 'nurture_tick_key')
        ),
        body    := '{}'::jsonb,
        timeout_milliseconds := 30000
      );
      $cmd$
    );
    -- Start inactive. Operator flips to active after Vault is seeded.
    perform cron.alter_job(
      (select jobid from cron.job where jobname = 'nurture_tick_hourly'),
      active := false
    );
  end if;
end $$;

comment on extension pg_cron is 'Cron jobs (nurture_tick_hourly schedules nurture-tick edge fn).';
comment on extension pg_net  is 'HTTP client used by pg_cron to invoke Supabase Edge Functions.';
