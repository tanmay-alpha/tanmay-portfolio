import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

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

type RateLimitState = {
  count: number;
  resetAt: number;
};

// In-memory rate limit. Resets on cold start. For a single-server Vercel
// deployment this is fine; a multi-region deploy would need Upstash.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const ipBuckets = new Map<string, RateLimitState>();

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(ip: string): { ok: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const existing = ipBuckets.get(ip);
  if (!existing || existing.resetAt < now) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true };
  }
  if (existing.count >= RATE_LIMIT_MAX) {
    return {
      ok: false,
      retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
    };
  }
  existing.count += 1;
  return { ok: true };
}

// ----- Handler ------------------------------------------------------------

export async function POST(req: NextRequest) {
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
  const limit = checkRateLimit(ip);
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
