/**
 * In-memory sliding window. Ready to swap for Redis / Vercel KV later.
 * Per-instance only — sufficient for demo and local development.
 */
type Bucket = { count: number; reset: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (current.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: current.reset - now };
  }
  current.count += 1;
  return { ok: true, remaining: limit - current.count };
}

export function clientKey(headers: Headers, namespace: string) {
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
  return `${namespace}:${ip}`;
}
