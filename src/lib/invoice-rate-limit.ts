import { createHash } from "node:crypto";
// Best-effort per-function-instance protection, not a distributed firewall.
const attempts = new Map<string, { count: number; expires: number }>();
export function allowInvoiceRequest(request: Request) {
  const now = Date.now();
  for (const [key, value] of attempts)
    if (value.expires <= now) attempts.delete(key);
  const ip =
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unknown";
  const key = createHash("sha256").update(ip).digest("hex");
  const current = attempts.get(key);
  if (current) return ++current.count <= 20;
  if (attempts.size >= 2000) return false;
  attempts.set(key, { count: 1, expires: now + 60_000 });
  return true;
}
