// Resend transactional email wrapper.
// Sender: hello@anjanipandey.com (must be a verified domain in Resend).

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL     = Deno.env.get("RESEND_FROM_EMAIL") ?? "Anjani Pandey <hello@anjanipandey.com>";
const REPLY_TO       = Deno.env.get("RESEND_REPLY_TO")   ?? "contact@anjanipandey.com";

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
  status?: number;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [params.to],
      reply_to: REPLY_TO,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: body || res.statusText, status: res.status };
  }

  const data = await res.json().catch(() => ({}));
  return { ok: true, id: (data as { id?: string }).id, status: res.status };
}

// ---- Templates ----

export function confirmEmailHtml(params: { confirmUrl: string }) {
  return `<!DOCTYPE html>
<html><body style="font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #0c0a09; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
  <h1 style="font-family: ui-serif, Georgia, serif; font-size: 24px; font-weight: 600; margin: 0 0 16px;">Confirm your email</h1>
  <p style="font-size: 16px; line-height: 1.6; color: #44403c;">
    You requested the Level4 Starter Kit. One click and the download arrives.
  </p>
  <p style="margin: 32px 0;">
    <a href="${params.confirmUrl}"
       style="background:#0c0a09;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:500;display:inline-block;">
      Confirm and unlock the Starter Kit
    </a>
  </p>
  <p style="font-size: 14px; color: #78716c; line-height: 1.6;">
    If the button doesn't work, paste this link into your browser:<br>
    <a href="${params.confirmUrl}" style="color:#1e3a8a;word-break:break-all;">${params.confirmUrl}</a>
  </p>
  <hr style="border:none;border-top:1px solid #e7e5e4;margin:32px 0;">
  <p style="font-size: 13px; color: #78716c;">
    Didn't request this? Ignore this email — no list addition until you click confirm.
  </p>
  <p style="font-size: 13px; color: #78716c;">
    — Anjani Pandey · <a href="https://www.anjanipandey.com" style="color:#1e3a8a;">anjanipandey.com</a>
  </p>
</body></html>`;
}

export function confirmEmailText(params: { confirmUrl: string }) {
  return [
    "Confirm your email",
    "",
    "You requested the Level4 Starter Kit. One click and the download arrives.",
    "",
    "Confirm here:",
    params.confirmUrl,
    "",
    "Didn't request this? Ignore this email — no list addition until you click confirm.",
    "",
    "— Anjani Pandey",
    "https://www.anjanipandey.com",
  ].join("\n");
}
