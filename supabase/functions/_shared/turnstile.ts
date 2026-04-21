// Cloudflare Turnstile server-side verification.
// https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

const TURNSTILE_SECRET_KEY = Deno.env.get("TURNSTILE_SECRET_KEY") ?? "";

export interface TurnstileResult {
  success: boolean;
  errorCodes?: string[];
  hostname?: string;
}

export async function verifyTurnstile(token: string, remoteIp?: string | null): Promise<TurnstileResult> {
  if (!TURNSTILE_SECRET_KEY) {
    return { success: false, errorCodes: ["secret-key-missing"] };
  }
  if (!token) {
    return { success: false, errorCodes: ["token-missing"] };
  }

  const body = new FormData();
  body.append("secret", TURNSTILE_SECRET_KEY);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });

  if (!res.ok) {
    return { success: false, errorCodes: [`http-${res.status}`] };
  }

  const data = await res.json() as { success: boolean; "error-codes"?: string[]; hostname?: string };
  return {
    success: data.success === true,
    errorCodes: data["error-codes"] ?? [],
    hostname: data.hostname,
  };
}
