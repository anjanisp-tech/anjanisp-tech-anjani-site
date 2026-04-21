# Phase A — Form Backend Deploy Runbook

Run after you have:
- Supabase project `anjanipandey-public` created (Singapore)
- Cloudflare Turnstile site for `anjanipandey.com`
- Resend account with `anjanipandey.com` domain verified
- All 6 keys captured

## 0. One-time install (skip if already installed)

```powershell
# Supabase CLI (Windows, via scoop — preferred over npm)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
supabase --version
```

If scoop is missing: `winget install supabase.cli`

## 1. Login + link

```powershell
cd C:\Users\anjan\anjanisp-tech-anjani-site
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
```

`<YOUR_PROJECT_REF>` is the alphanumeric ID in your Supabase URL: `https://<ref>.supabase.co`.

## 2. Push schema

```powershell
supabase db push
```

Expected: `0001_subscribers.sql` applied. Verifies table + RLS exist.

## 3. Set Edge Function secrets

Copy this block, replace the 5 KEY values, paste in PowerShell:

```powershell
supabase secrets set `
  SUPABASE_URL="https://<ref>.supabase.co" `
  SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" `
  TURNSTILE_SECRET_KEY="<turnstile-secret>" `
  RESEND_API_KEY="<resend-api-key>" `
  PUBLIC_SITE_URL="https://www.anjanipandey.com" `
  RESEND_FROM_EMAIL="Anjani Pandey <hello@anjanipandey.com>" `
  RESEND_REPLY_TO="contact@anjanipandey.com"
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by Supabase Edge Runtime,
but setting them explicitly makes local testing identical to prod. Safe to include.

## 4. Deploy functions

```powershell
supabase functions deploy subscribe
supabase functions deploy confirm
```

## 5. Smoke test (no real email needed)

```powershell
# Should return 400 invalid_email
curl.exe -X POST `
  "https://<ref>.supabase.co/functions/v1/subscribe" `
  -H "apikey: <anon-key>" `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"\",\"consent\":true,\"turnstile_token\":\"x\"}'

# Should return 403 captcha_failed (real Turnstile token required from browser)
curl.exe -X POST `
  "https://<ref>.supabase.co/functions/v1/subscribe" `
  -H "apikey: <anon-key>" `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"smoke@example.com\",\"consent\":true,\"turnstile_token\":\"fake\"}'
```

Both responses confirm the function is live and the validators fire in order.

## 6. End-to-end test (real email)

After patching the 4 placeholders in `public/os/index.html` and re-deploying Vercel:

1. Open `https://www.anjanipandey.com/os` in a clean browser
2. Click Starter Kit tab
3. Enter your real email + tick consent + complete Turnstile
4. Submit -> expect "Check your inbox" success message
5. Receive Resend confirmation email at the inbox
6. Click the confirm link -> redirected to `/os?confirmed=ok`
7. Check Supabase Table Editor: row should now show `status = confirmed`, `confirmed_at` set

## 7. If something breaks

```powershell
# Tail function logs
supabase functions logs subscribe --tail
supabase functions logs confirm --tail
```

Common issues:
- `RESEND_API_KEY not configured` -> step 3 not run, or wrong key
- `captcha_failed` from real form -> Turnstile site key in HTML doesn't match secret
- Email sent but stuck in pending -> Resend domain not verified yet, check Resend dashboard
- 500 errors -> check the logs; likely RLS policy or env issue
