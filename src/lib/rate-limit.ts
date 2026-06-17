import { isIP } from "node:net";

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

const MAX_BUCKETS = 2048;

function pruneExpiredBuckets(buckets: Map<string, Bucket>, now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

function capBucketCount(buckets: Map<string, Bucket>): void {
  while (buckets.size > MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey === undefined) return;
    buckets.delete(oldestKey);
  }
}


export function createRateLimiter(opts: {
  /** Max requests per window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
}) {
  const buckets = new Map<string, Bucket>();

  return function check(key: string): RateLimitResult {
    const now = Date.now();
    if (buckets.size > MAX_BUCKETS) {
      pruneExpiredBuckets(buckets, now);
      capBucketCount(buckets);
    }

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

function firstForwardedIp(value: string | null): string | null {
  const candidate = value?.split(",")[0]?.trim();
  if (!candidate) return null;
  return isIP(candidate) ? candidate : null;
}

export function getClientIp(req: { headers: Headers }): string {
  const vercelForwardedFor = req.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor !== null) {
    return firstForwardedIp(vercelForwardedFor) ?? "unknown";
  }

  return (
    firstForwardedIp(req.headers.get("x-forwarded-for")) ??
    firstForwardedIp(req.headers.get("x-real-ip")) ??
    "unknown"
  );
}
