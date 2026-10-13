import { site } from "@/lib/site";

// On Netlify, route handlers see the internal deploy URL (main--devnpixel.netlify.app)
// in request.url. Auth redirects must use the address the visitor actually used, but
// only for hosts we own, so a forged Host header cannot send people elsewhere.
const allowedHost =
  /^(www\.devnpixel\.com|devnpixel\.com|localhost(:\d+)?|127\.0\.0\.1(:\d+)?|[a-z0-9-]+--devnpixel\.netlify\.app)$/;

export function publicOrigin(request: Request) {
  const headers = request.headers;
  const host = (headers.get("x-forwarded-host") ?? headers.get("host") ?? "")
    .split(",")[0]!
    .trim()
    .toLowerCase();
  if (!allowedHost.test(host)) return site.url;
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  const proto = local
    ? (headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "http")
    : "https";
  return `${proto === "https" ? "https" : "http"}://${host}`;
}

/** An absolute URL on the visitor's public origin. */
export function publicUrl(path: string, request: Request) {
  return new URL(path, publicOrigin(request));
}
