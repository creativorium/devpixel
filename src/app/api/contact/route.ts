import { createHash } from "node:crypto";
import { contactSchema, emailText } from "@/lib/contact";
import { site } from "@/lib/site";
export const runtime = "nodejs";
export const maxDuration = 20;

// Bounded, per-instance protection. Configure the Vercel Firewall for an edge-wide limit.
const attempts = new Map<string, { count: number; expires: number }>();
const windowMs = 15 * 60 * 1000;
function allowAttempt(ip: string) {
  const now = Date.now();
  for (const [key, value] of attempts)
    if (value.expires < now) attempts.delete(key);
  const key = createHash("sha256").update(ip).digest("hex");
  const current = attempts.get(key);
  if (current) {
    current.count++;
    return current.count <= 5;
  }
  if (attempts.size >= 2000) return false;
  attempts.set(key, { count: 1, expires: now + windowMs });
  return true;
}
function reply(message: string, status: number) {
  return Response.json(
    { message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(status === 429 ? { "Retry-After": "900" } : {}),
      },
    },
  );
}
async function boundedBody(request: Request) {
  const limit = 24_000;
  if (Number(request.headers.get("content-length")) > limit)
    throw new Error("too-large");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > limit) {
        await reader.cancel();
        throw new Error("too-large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export async function POST(request: Request) {
  const origins = new Set([site.url, "https://devnpixel.com"]);
  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL])
    if (host) origins.add(`https://${host}`);
  if (!process.env.VERCEL) {
    const url = new URL(request.url);
    if (["localhost", "127.0.0.1"].includes(url.hostname))
      origins.add(url.origin);
  }
  if (!origins.has(request.headers.get("origin") ?? ""))
    return reply("Please submit the form from our website.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply("Unsupported request format.", 415);
  const ip = (
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for") ||
    "local"
  )
    .split(",")[0]
    .trim();
  if (!allowAttempt(ip))
    return reply(
      "Too many enquiries. Please wait a few minutes or email us directly.",
      429,
    );
  let body: unknown;
  try {
    body = await boundedBody(request);
  } catch (error) {
    return reply(
      "The enquiry could not be read. Please check its length and try again.",
      error instanceof Error && error.message === "too-large" ? 413 : 400,
    );
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success)
    return reply(
      "Please check your name, email, and message, then try again.",
      400,
    );
  if (parsed.data.website)
    return reply(
      "This enquiry could not be submitted. Please email us directly.",
      400,
    );
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !from)
    return reply(
      "The contact form is not connected yet. Please email code@devnpixel.com directly.",
      503,
    );
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [site.email],
        reply_to: parsed.data.email,
        subject: `DevnPixel enquiry: ${parsed.data.service}`,
        text: emailText(parsed.data),
      }),
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });
    if (!response.ok)
      return reply(
        "We could not send your enquiry. Please try again later or email code@devnpixel.com.",
        502,
      );
    const result = await response.json();
    if (typeof result?.id !== "string")
      return reply(
        "We could not confirm submission. Please email code@devnpixel.com.",
        502,
      );
    return reply(
      "Thank you — your enquiry has been submitted. We’ll get back to you by email.",
      200,
    );
  } catch {
    return reply(
      "We could not send your enquiry. Please try again later or email code@devnpixel.com.",
      502,
    );
  }
}
