import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * CSP violation report sink.
 *
 * Browsers POST `application/csp-report` (older) or
 * `application/reports+json` (newer) payloads to this endpoint whenever a
 * Content-Security-Policy directive is violated. The payload is logged
 * to Vercel function logs so you can see what's tripping the policy
 * during development and in production.
 *
 * The endpoint ALWAYS returns 204 No Content — the browser doesn't care
 * about the response, only that the report was accepted. Logging the
 * raw report (not echoing it back) is deliberate: clients can't read
 * the response anyway, and we never want to leak the violation data
 * via Response.
 *
 * If a deployment receives a flood of reports, the rate limit below
 * bounds Vercel function cost. A malicious actor can spam reports to
 * fill logs, so we cap at 30/min/IP and drop everything after that.
 */

type Report = unknown;

const reportLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const existing = reportLimiter.get(ip);
  if (!existing || existing.resetAt < now) {
    reportLimiter.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (existing.count >= RATE_LIMIT_MAX) return false;
  existing.count += 1;
  return true;
}

function getClientIp(req: NextRequest): string {
  const vercelFwd = req.headers.get("x-vercel-forwarded-for");
  if (vercelFwd) return vercelFwd.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

async function readReportBody(req: NextRequest): Promise<Report> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/csp-report")) {
    // Legacy format: a single JSON object.
    return (await req.json()) as Report;
  }
  if (contentType.includes("application/reports+json")) {
    // Reporting API v1: an array of reports.
    return (await req.json()) as Report;
  }
  // Fallback: best-effort text. We don't reject — the browser sent
  // something; logging it is more useful than 4xx-ing.
  return await req.text();
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return new NextResponse(null, { status: 204 });
  }

  let report: Report;
  try {
    report = await readReportBody(req);
  } catch {
    // Body unparseable — log and accept.
    console.warn("[csp-report] unparseable body from", ip);
    return new NextResponse(null, { status: 204 });
  }

  // One log line per violation. Truncate to bound log size if someone
  // spams 1MB reports.
  const summary = JSON.stringify(report).slice(0, 2000);
  console.warn("[csp-report]", ip, summary);

  return new NextResponse(null, { status: 204 });
}
