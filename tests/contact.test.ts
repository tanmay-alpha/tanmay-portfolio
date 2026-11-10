import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { NextRequest } from "next/server";

import { POST } from "../src/app/api/contact/route.ts";
import { createRateLimiter } from "../src/lib/rate-limit.ts";

const validBody = {
  name: "Portfolio visitor",
  email: "visitor@example.test",
  message: "I would like to discuss a project.",
};
const contactEnvKeys = [
  "RESEND_API_KEY",
  "CONTACT_TO_EMAIL",
  "CONTACT_FROM_EMAIL",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET",
] as const;
let requestNumber = 0;

function request(
  body: unknown = validBody,
  options: { headers?: Record<string, string>; raw?: string; noOrigin?: boolean } = {},
) {
  const headers = new Headers({
    origin: "https://portfolio.test",
    "content-type": "application/json",
    "x-vercel-forwarded-for": `2001:db8::${(++requestNumber).toString(16)}`,
    ...options.headers,
  });
  if (options.noOrigin) headers.delete("origin");
  return new NextRequest("https://portfolio.test/api/contact", {
    method: "POST",
    headers,
    body: options.raw ?? JSON.stringify(body),
  });
}

function configureEmail() {
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.CONTACT_TO_EMAIL = "owner@example.test";
}

function configureTurnstile() {
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";
  process.env.TURNSTILE_SECRET = "test-secret";
}

describe("contact route", { concurrency: false }, () => {
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    originalEnv = Object.fromEntries(contactEnvKeys.map((key) => [key, process.env[key]]));
    for (const key of contactEnvKeys) delete process.env[key];
  });

  afterEach(() => {
    for (const key of contactEnvKeys) {
      const value = originalEnv[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  test("rejects foreign, downgraded, malformed, null and absent origins", async () => {
    for (const origin of [
      "https://elsewhere.test",
      "http://portfolio.test",
      "https://portfolio.test:444",
      "not a URL",
      "null",
    ]) {
      const response = await POST(request(validBody, { headers: { origin } }));
      assert.equal(response.status, 403, origin);
      assert.deepEqual(await response.json(), { ok: false, error: "Forbidden" });
    }
    assert.equal((await POST(request(validBody, { noOrigin: true }))).status, 403);
  });

  test("accepts only same-origin Referer fallback and never overrides a bad Origin", async () => {
    const referer = "https://portfolio.test/projects?source=contact";
    assert.equal((await POST(request(validBody, { noOrigin: true, headers: { referer } }))).status, 503);
    assert.equal((await POST(request(validBody, {
      noOrigin: true,
      headers: { referer: "http://portfolio.test/" },
    }))).status, 403);
    assert.equal((await POST(request(validBody, {
      headers: { origin: "https://elsewhere.test", referer },
    }))).status, 403);
  });

  test("rejects malformed JSON and oversized bodies with or without Content-Length", async () => {
    assert.equal((await POST(request(null, { raw: "{" }))).status, 400);
    for (const contentLength of ["-1", "invalid"]) {
      assert.equal((await POST(request(validBody, {
        headers: { "content-length": contentLength },
      }))).status, 400);
    }
    assert.equal((await POST(request(validBody, {
      headers: { "content-length": String(32 * 1024 + 1) },
    }))).status, 413);
    assert.equal((await POST(request(null, { raw: "x".repeat(32 * 1024 + 1) }))).status, 413);
  });

  test("rejects missing, blank, incorrectly typed and out-of-range fields", async () => {
    const invalidBodies = [
      null,
      [],
      {},
      { ...validBody, name: "   " },
      { ...validBody, name: "n".repeat(121) },
      { ...validBody, email: "not-an-email" },
      { ...validBody, email: 42 },
      { ...validBody, email: `${"a".repeat(190)}@example.test` },
      { ...validBody, message: "   short   " },
      { ...validBody, message: "m".repeat(5001) },
      { ...validBody, turnstileToken: "t".repeat(2049) },
      { ...validBody, website: { toString: null } },
    ];
    for (const body of invalidBodies) {
      const response = await POST(request(body));
      assert.equal(response.status, 400);
      assert.equal((await response.json()).ok, false);
    }
  });

  test("silently accepts honeypots before schema validation without calling upstream", async (t) => {
    const fetchMock = t.mock.method(globalThis, "fetch", async () => {
      throw new Error("Unexpected upstream request");
    });
    const response = await POST(request({ website: "https://spam.test" }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  test("returns a mailto fallback when email configuration is missing", async () => {
    const response = await POST(request());
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.match(body.fallbackMailto, /^mailto:/);
  });

  test("limits validated submissions to three per IP and sends Retry-After", async () => {
    const headers = { "x-vercel-forwarded-for": "198.51.100.40" };
    for (let i = 0; i < 4; i++) {
      assert.equal((await POST(request({ ...validBody, message: "short" }, { headers }))).status, 400);
    }
    for (let i = 0; i < 3; i++) {
      assert.equal((await POST(request(validBody, { headers }))).status, 503);
    }
    const blocked = await POST(request(validBody, { headers }));
    assert.equal(blocked.status, 429);
    assert.equal((await blocked.json()).ok, false);
    const retryAfter = Number(blocked.headers.get("retry-after"));
    assert.ok(retryAfter >= 1 && retryAfter <= 600);
    assert.equal((await POST(request())).status, 503);
  });

  test("fails closed for partial captcha configuration and missing tokens", async () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";
    assert.equal((await POST(request())).status, 503);
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    process.env.TURNSTILE_SECRET = "test-secret";
    assert.equal((await POST(request())).status, 503);
    configureTurnstile();
    assert.equal((await POST(request())).status, 400);
  });

  test("rejects unsuccessful and unavailable captcha verification without sending email", async (t) => {
    configureEmail();
    configureTurnstile();
    t.mock.method(console, "warn", () => {});
    t.mock.method(console, "error", () => {});
    const fetchMock = t.mock.method(globalThis, "fetch", async () =>
      Response.json({ success: false, "error-codes": ["invalid-input-response"] }),
    );
    const body = { ...validBody, turnstileToken: "test-token" };
    assert.equal((await POST(request(body))).status, 403);
    assert.equal(fetchMock.mock.callCount(), 1);
    const call = fetchMock.mock.calls[0];
    assert.equal(call?.arguments[0], "https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const form = new URLSearchParams(String(call?.arguments[1]?.body));
    assert.equal(form.get("response"), "test-token");
    assert.equal(form.get("secret"), "test-secret");
    assert.match(form.get("remoteip") ?? "", /^2001:db8::/);
    fetchMock.mock.mockImplementation(async () => { throw new TypeError("Network failure"); });
    assert.equal((await POST(request(body))).status, 403);
    assert.equal(fetchMock.mock.callCount(), 2);
  });

  test("sends trimmed, escaped fields with configured sender after successful captcha", async (t) => {
    configureEmail();
    configureTurnstile();
    process.env.CONTACT_FROM_EMAIL = "Portfolio <contact@example.test>";
    let emailPayload: Record<string, unknown> | undefined;
    t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
      if (String(input).includes("siteverify")) return Response.json({ success: true });
      assert.equal(String(input), "https://api.resend.com/emails");
      emailPayload = JSON.parse(String(init?.body));
      return Response.json({ id: "test-message-id" });
    });
    const response = await POST(request({
      name: "  <Visitor> & friend  ",
      email: "  visitor@example.test  ",
      message: "  A message with <script>markup</script> & details.  ",
      turnstileToken: "test-token",
    }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, id: "test-message-id" });
    assert.equal(emailPayload?.from, process.env.CONTACT_FROM_EMAIL);
    assert.deepEqual(emailPayload?.to, ["owner@example.test"]);
    assert.equal(emailPayload?.reply_to, "visitor@example.test");
    assert.match(String(emailPayload?.text), /^Name: <Visitor> & friend\n/);
    assert.match(String(emailPayload?.html), /&lt;Visitor&gt; &amp; friend/);
    assert.doesNotMatch(String(emailPayload?.html), /<script>/);
  });

  test("preserves sandbox sender default and returns a safe error when Resend fails", async (t) => {
    configureEmail();
    const log = t.mock.method(console, "error", () => {});
    t.mock.method(globalThis, "fetch", async (_input: string | URL | Request, init?: RequestInit) => {
      assert.equal(JSON.parse(String(init?.body)).from, "Portfolio Contact <onboarding@resend.dev>");
      return Response.json({ name: "validation_error", message: "private-address@example.test" }, { status: 422 });
    });
    const response = await POST(request());
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { ok: false, error: "Email send failed" });
    assert.doesNotMatch(JSON.stringify(log.mock.calls), /private-address/);
  });
});

test("rate limiter isolates keys, rounds Retry-After and resets at the exact window boundary", (t) => {
  let now = 10_000;
  t.mock.method(Date, "now", () => now);
  const limit = createRateLimiter({ max: 3, windowMs: 10_000 });
  assert.deepEqual(limit("visitor"), { ok: true });
  assert.deepEqual(limit("visitor"), { ok: true });
  assert.deepEqual(limit("visitor"), { ok: true });
  assert.deepEqual(limit("visitor"), { ok: false, retryAfterSec: 10 });
  assert.deepEqual(limit("other-visitor"), { ok: true });
  now = 19_001;
  assert.deepEqual(limit("visitor"), { ok: false, retryAfterSec: 1 });
  now = 20_000;
  assert.deepEqual(limit("visitor"), { ok: true });
  assert.deepEqual(limit("visitor"), { ok: true });
  assert.deepEqual(limit("visitor"), { ok: true });
  assert.deepEqual(limit("visitor"), { ok: false, retryAfterSec: 10 });
});
