import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ----- Validation ---------------------------------------------------------

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
  try {
    body = await req.json();
  } catch {
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

  // 3) Send via Resend. If env vars aren't set, return 503 — the client
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
      return NextResponse.json(
        { ok: false, error: "Email send failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    console.error("[/api/contact] send error:", err);
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
