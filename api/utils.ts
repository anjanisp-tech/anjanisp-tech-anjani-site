import fs from "fs";
import path from "path";
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

export const adminAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("[AUTH] ADMIN_PASSWORD env var not set. Admin routes disabled.");
    return res.status(503).json({ error: "Admin not configured" });
  }
  
  if (authHeader === `Bearer ${adminPassword}`) {
    next();
  } else {
    console.warn(`[AUTH] Unauthorized access attempt. Header: ${authHeader ? 'Present' : 'Missing'}`);
    res.status(401).json({ error: "Unauthorized" });
  }
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
