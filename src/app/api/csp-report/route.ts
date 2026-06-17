import { NextResponse, type NextRequest } from "next/server";
import { summarizeCspReport } from "@/lib/csp-report";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { RequestBodyTooLargeError, readTextWithinLimit } from "@/lib/request-body";

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
 * about the response, only that the report was accepted. We log only a
 * sanitized summary, never the raw report, because report URLs can carry
 * tokens or email addresses in query strings.
 *
 * If a deployment receives a flood of reports, the rate limit and stream
 * cap bound Vercel function cost and memory use. A malicious actor can
 * spam reports to fill logs, so we cap at 30/min/IP, drop everything
 * after that, and stop reading any single report after 8 KB.
 */

type Report = unknown;

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REPORT_BYTES = 8 * 1024;

const reportLimiter = createRateLimiter({
  max: RATE_LIMIT_MAX,
  windowMs: RATE_LIMIT_WINDOW_MS,
});

function parseReportBody(contentType: string, rawBody: string): Report {
  if (
    contentType.includes("application/csp-report") ||
    contentType.includes("application/reports+json")
  ) {
    return JSON.parse(rawBody) as Report;
  }
  // Fallback: best-effort text. We don't reject — the browser sent
  // something; logging that a non-JSON report arrived is more useful
  // than 4xx-ing.
  return rawBody;
}

export async function POST(req: NextRequest) {
  const limit = reportLimiter(getClientIp(req));
  if (!limit.ok) {
    return new NextResponse(null, { status: 204 });
  }

  let report: Report;
  try {
    const rawBody = await readTextWithinLimit(req, MAX_REPORT_BYTES);
    report = parseReportBody(req.headers.get("content-type") ?? "", rawBody);
  } catch (err) {
    // Body oversized or unparseable — accept without echoing client data.
    if (err instanceof RequestBodyTooLargeError) {
      console.warn("[csp-report] oversized body dropped");
    } else {
      console.warn("[csp-report] unparseable body");
    }
    return new NextResponse(null, { status: 204 });
  }

  console.warn("[csp-report]", summarizeCspReport(report));

  return new NextResponse(null, { status: 204 });
}
