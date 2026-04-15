import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEY_FILE = path.join(__dirname, "../.resend_key");
const TMP_KEY_FILE = "/tmp/.resend_key";

let memoryKey: string | null = null;

export function getResendKey() {
  if (memoryKey) return memoryKey;
  for (const f of [KEY_FILE, TMP_KEY_FILE]) {
    if (fs.existsSync(f)) {
      try {
        const k = fs.readFileSync(f, 'utf8').trim();
        if (k.startsWith('re_')) {
          memoryKey = k;
          return k;
        }
      } catch (e) {}
    }
  }
  const envKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  if (envKey && envKey.startsWith('re_')) return envKey;
  const smartKey = Object.values(process.env).find(v => typeof v === 'string' && v.startsWith('re_'));
  if (smartKey) return smartKey;
  return null;
}

// ── Session token helpers ──────────────────────────────────────────
// Signed token = base64({exp}:{random}) + "." + hmac-sha256 signature
// No external dependencies. Secret = ADMIN_PASSWORD env var.
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
export const SESSION_COOKIE_NAME = 'admin_session';

function getSigningSecret(): string {
  return process.env.ADMIN_PASSWORD || '';
}

export function createSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_MAX_AGE_MS, nonce: crypto.randomBytes(16).toString('hex') })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expectedSig = crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof data.exp === 'number' && data.exp > Date.now();
  } catch {
    return false;
  }
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach(pair => {
    const [key, ...rest] = pair.trim().split('=');
    if (key) cookies[key.trim()] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}

// ── Auth middleware ─────────────────────────────────────────────────
// Accepts EITHER a valid session cookie OR legacy Bearer token.
export const adminAuth = (req: any, res: any, next: any) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("[AUTH] ADMIN_PASSWORD env var not set. Admin routes disabled.");
    return res.status(503).json({ error: "Admin not configured" });
  }

  // 1. Check httpOnly session cookie
  const cookieHeader = req.headers.cookie || '';
  const cookies = parseCookies(cookieHeader);
  const sessionToken = cookies[SESSION_COOKIE_NAME];
  if (sessionToken && verifySessionToken(sessionToken)) {
    return next();
  }

  // 2. Fallback: legacy Bearer token (for backward compat during rollout)
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${adminPassword}`) {
    return next();
  }

  console.warn(`[AUTH] Unauthorized access attempt. Cookie: ${sessionToken ? 'Present' : 'Missing'}, Header: ${authHeader ? 'Present' : 'Missing'}`);
  res.status(401).json({ error: "Unauthorized" });
};

export async function sendNotification(subject: string, message: string) {
  const recipient = process.env.RESEND_TO_EMAIL || process.env.VITE_RESEND_TO_EMAIL || "anjanisp@gmail.com";
  const apiKey = getResendKey();
  if (!apiKey) {
    console.error("[NOTIFICATION ERROR] RESEND_API_KEY missing");
    return;
  }
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.VITE_RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: `Anjani Pandey Site <${fromEmail}>`,
        to: [recipient],
        subject: subject,
        text: message
      })
    });
  } catch (err) {
    console.error("[RESEND] Error:", err);
  }
}
