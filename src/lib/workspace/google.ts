import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// Direct Google sign-in: Google returns to devnpixel.com (so its account picker says
// "continue to devnpixel.com"), then the verified ID token is handed to Supabase.

export const GOOGLE_COOKIE = "ws_google";
export const GOOGLE_CALLBACK_PATH = "/teams/auth/google/callback";

export function googleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export type GoogleAttempt = { state: string; nonce: string; next: string };

export function newAttempt(next: string): GoogleAttempt {
  return {
    state: randomBytes(24).toString("base64url"),
    nonce: randomBytes(24).toString("base64url"),
    next,
  };
}

/** Google receives the hashed nonce; Supabase gets the raw one and compares. */
export function hashNonce(nonce: string) {
  return createHash("sha256").update(nonce).digest("hex");
}

export function googleAuthUrl(
  clientId: string,
  redirectUri: string,
  attempt: GoogleAttempt,
) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: attempt.state,
    nonce: hashNonce(attempt.nonce),
    prompt: "select_account",
  }).toString();
  return url;
}

export function parseAttempt(value: string | undefined): GoogleAttempt | null {
  if (!value) return null;
  try {
    const data = JSON.parse(value) as Partial<GoogleAttempt>;
    return typeof data.state === "string" &&
      typeof data.nonce === "string" &&
      typeof data.next === "string"
      ? (data as GoogleAttempt)
      : null;
  } catch {
    return null;
  }
}

export function sameState(expected: string, received: string | null) {
  if (!received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function exchangeCode(
  code: string,
  redirectUri: string,
  config: { clientId: string; clientSecret: string },
) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { id_token?: unknown };
  return typeof data.id_token === "string" ? data.id_token : null;
}
