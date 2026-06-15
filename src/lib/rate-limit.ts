/**
 * Tiny in-memory rate limiter, shared across routes.
 *
 * For a single-server Vercel deployment the in-memory Map is fine — it
 * resets on cold start. A multi-region deploy would swap this for an
 * Upstash Redis client. The interface is identical so callers don't
 * change.
 */

type Bucket = { count: number; resetAt: number };

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

export function createRateLimiter(opts: {
  /** Max requests per window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
}) {
  const buckets = new Map<string, Bucket>();

  return function check(key: string): RateLimitResult {
    const now = Date.now();
    const existing = buckets.get(key);
    if (!existing || existing.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
      return { ok: true };
    }
    if (existing.count >= opts.max) {
      return {
        ok: false,
        retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
      };
    }
    existing.count += 1;
    return { ok: true };
  };
}

/**
 * Extract a stable client IP from common Vercel/proxy headers. Falls back
 * to the literal string "unknown" if nothing is present — callers should
 * treat that as a single shared bucket (more restrictive is safer).
 */
export function getClientIp(req: { headers: Headers }): string {
  const vercelFwd = req.headers.get("x-vercel-forwarded-for");
  if (vercelFwd) return vercelFwd.split(",")[0]?.trim() ?? "unknown";
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}
