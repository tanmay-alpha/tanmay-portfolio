import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { RequestBodyTooLargeError, readTextWithinLimit } from "@/lib/request-body";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ----- Validation ---------------------------------------------------------

// Max body size for the contact form. The form is name (≤120) + email
// (≤200) + message (≤5000) + honeypot + JSON wrapping, which is well
// under 8KB. 32KB is a generous ceiling that still blocks trivial DoS
// attempts trying to exhaust function memory or Vercel bandwidth.
const MAX_BODY_BYTES = 32 * 1024;

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email").max(200),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
  // Honeypot — checked before schema validation, but typed as a free string
  // so the schema doesn't reject bots with a 400 (which would give away the
  // trap).
  website: z.string().optional().default(""),
  // Cloudflare Turnstile token. Present only when the widget is
  // configured; the server skips verification when TURNSTILE_SECRET
  // is unset (the form works without captcha in that case, but the
  // honeypot + rate limit + origin check still hold).
  turnstileToken: z.string().max(2048).optional(),
});

// In-memory rate limit. Resets on cold start. For a single-server Vercel
// deployment this is fine; a multi-region deploy would need Upstash.
const contactLimiter = createRateLimiter({
  max: 3,
  windowMs: 10 * 60 * 1000,
});

/**
 * CSRF defense — only same-origin POSTs are accepted. Vercel sets the
 * `host` header from the request URL and `origin` from the browser, so
 * comparing the two is a reliable same-origin check. Bots and curl can't
 * fake Origin easily (browsers always send it for non-GET requests).
 */
function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  if (!host) return false;
  // Origin is the strongest signal when present.
  if (origin) {
    try {
      const u = new URL(origin);
      return u.host === host;
    } catch {
      return false;
    }
  }
  // Fall back to referer for older browsers / form-submit edge cases.
  if (referer) {
    try {
      const u = new URL(referer);
      return u.host === host;
    } catch {
      return false;
    }
  }
  // Neither header present — this is most likely a non-browser client
  // (curl, server-to-server). For a contact form, that is a bot. Reject.
  return false;
}

// ----- Handler ------------------------------------------------------------

export async function POST(req: NextRequest) {
  // CSRF / origin enforcement — runs before any work. Non-browser clients
  // (curl, server-to-server) are rejected because we have no use case for
  // them. This blocks drive-by cross-origin POSTs that would otherwise
  // burn through the Resend quota.
  if (!isSameOrigin(req)) {
    return NextResponse.json(
      { ok: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  let body: unknown;
  // Reject oversized bodies before parsing. Content-Length is client-supplied,
  // so it is only a fast path; readTextWithinLimit enforces the real cap for
  // chunked or missing-length requests.
  const contentLengthHeader = req.headers.get("content-length");
  const contentLength =
    contentLengthHeader === null ? 0 : Number(contentLengthHeader);
  if (!Number.isFinite(contentLength) || contentLength < 0) {
    return NextResponse.json(
      { ok: false, error: "Invalid Content-Length" },
      { status: 400 },
    );
  }
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Request body too large" },
      { status: 413 },
    );
  }
  try {
    const rawBody = await readTextWithinLimit(req, MAX_BODY_BYTES);
    body = JSON.parse(rawBody);
  } catch (err) {
    if (err instanceof RequestBodyTooLargeError) {
      return NextResponse.json(
        { ok: false, error: "Request body too large" },
        { status: 413 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // 1) Honeypot — silently accept and do nothing BEFORE schema validation,
  //    so a bot doesn't get a 400 that gives away the trap.
  const websiteValue =
    typeof body === "object" && body !== null && "website" in body
      ? String((body as { website?: unknown }).website ?? "")
      : "";
  if (websiteValue.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // 2) Rate limit by IP.
  const ip = getClientIp(req);
  const limit = contactLimiter(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec ?? 60) },
      },
    );
  }

  // 3) Cloudflare Turnstile. If either side of the captcha config is present,
  //    both must be present; otherwise the UI can require a captcha the server
  //    cannot verify, or the server can require a token the UI cannot mint.
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileSecret = process.env.TURNSTILE_SECRET;
  if (turnstileSiteKey || turnstileSecret) {
    if (!turnstileSiteKey || !turnstileSecret) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Contact form captcha is not configured correctly. Please use the mailto link instead.",
          fallbackMailto: "mailto:mangaltanmay7@gmail.com",
        },
        { status: 503 },
      );
    }
    const token = parsed.data.turnstileToken;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Captcha token missing" },
        { status: 400 },
      );
    }
    const ok = await verifyTurnstile(token, ip, turnstileSecret);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Captcha verification failed" },
        { status: 403 },
      );
    }
  }

  // 4) Send via Resend. If env vars aren't set, return 503 — the client
  //    falls back to a mailto: link.
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !toEmail) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Contact form is not configured (missing RESEND_API_KEY or CONTACT_TO_EMAIL). Please use the mailto link instead.",
        fallbackMailto: `mailto:${toEmail ?? "mangaltanmay7@gmail.com"}`,
      },
      { status: 503 },
    );
  }

  const resend = new Resend(apiKey);
  try {
    const { name, email, message } = parsed.data;
    const { data, error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: [toEmail],
      replyTo: email,
      subject: `[portfolio] ${name} — ${email}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <hr />
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      `,
    });

    if (error) {
      // Log the upstream error WITHOUT echoing the user's submitted
      // message. Resend error objects are usually just code + message;
      // even so, log name + message only, never the request body.
      console.error(
        "[/api/contact] resend error:",
        error.name ?? "unknown",
        error.message ?? "(no message)",
      );
      return NextResponse.json(
        { ok: false, error: "Email send failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    // Log only the error type, never the err object itself. The user's
    // submitted `name`, `email`, and `message` must never appear in
    // function logs — Vercel persists them and a log viewer could be
    // a low-trust environment.
    const e = err as { name?: string; message?: string; statusCode?: number };
    console.error(
      "[/api/contact] send error:",
      e?.name ?? "unknown",
      e?.message ?? "(no message)",
      "status:",
      e?.statusCode ?? "n/a",
    );
    return NextResponse.json(
      { ok: false, error: "Unexpected error" },
      { status: 500 },
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Cloudflare Turnstile verification. The siteverify endpoint accepts a
 * form-encoded POST and returns { success: boolean, ... }.
 *
 * We bind the verification to the client IP (the `remoteip` field)
 * when we can — this binds the token to the IP that solved it, so a
 * stolen token is harder to reuse from a different origin.
 *
 * Reference: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
async function verifyTurnstile(
  token: string,
  remoteIp: string,
  secret: string,
): Promise<boolean> {
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        signal: ctrl.signal,
      },
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) {
      // Log only the error codes (not the full response, which can
      // include echoed fields). Cloudflare returns a stable set of
      // codes: missing-input-secret, invalid-input-secret,
      // missing-input-response, invalid-input-response, bad-request,
      // timeout-or-duplicate, internal-error.
      console.warn(
        "[/api/contact] turnstile failed:",
        data["error-codes"]?.join(",") ?? "no codes",
      );
      return false;
    }
    return true;
  } catch (err) {
    // Network error to Cloudflare — fail closed (reject the submit) so
    // an outage of the captcha service can't be used to bypass it.
    const e = err as { name?: string; message?: string };
    console.error(
      "[/api/contact] turnstile network error:",
      e?.name ?? "unknown",
      e?.message ?? "(no message)",
    );
    return false;
  } finally {
    clearTimeout(timer);
  }
}
