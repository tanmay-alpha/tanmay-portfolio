import assert from "node:assert/strict";
import { test } from "node:test";

import { summarizeCspReport } from "../src/lib/csp-report.ts";
import { mapPushEvent } from "../src/lib/github-commits.ts";
import { getClientIp } from "../src/lib/rate-limit.ts";
import { RequestBodyTooLargeError, readTextWithinLimit } from "../src/lib/request-body.ts";

test("readTextWithinLimit returns small request bodies", async () => {
  const req = new Request("https://example.test/api", {
    method: "POST",
    body: "hello",
  });

  await assert.doesNotReject(async () => {
    const body = await readTextWithinLimit(req, 5);
    assert.equal(body, "hello");
  });
});

test("readTextWithinLimit rejects streamed bodies after the byte limit", async () => {
  const req = new Request("https://example.test/api", {
    method: "POST",
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("12345"));
        controller.enqueue(new TextEncoder().encode("6"));
        controller.close();
      },
    }),
    duplex: "half",
  } as RequestInit);

  await assert.rejects(
    () => readTextWithinLimit(req, 5),
    (err) => err instanceof RequestBodyTooLargeError,
  );
});

test("getClientIp ignores invalid forwarded header values", () => {
  const headers = new Headers({
    "x-forwarded-for": "not-an-ip, 203.0.113.9",
  });

  assert.equal(getClientIp({ headers }), "unknown");
});

test("getClientIp prefers the trusted Vercel forwarded address", () => {
  const headers = new Headers({
    "x-vercel-forwarded-for": "203.0.113.10, 198.51.100.20",
    "x-forwarded-for": "198.51.100.30",
  });

  assert.equal(getClientIp({ headers }), "203.0.113.10");
});

test("getClientIp does not fall back to spoofable headers when Vercel header is invalid", () => {
  const headers = new Headers({
    "x-vercel-forwarded-for": "not-an-ip",
    "x-forwarded-for": "203.0.113.99",
  });

  assert.equal(getClientIp({ headers }), "unknown");
});

test("summarizeCspReport strips sensitive URL query strings", () => {
  const summary = summarizeCspReport([
    {
      type: "csp-violation",
      body: {
        "document-uri": "https://example.test/account?token=secret#frag",
        "blocked-uri": "https://evil.test/pixel?email=a@example.test",
        "violated-directive": "img-src",
        "source-file": "https://example.test/app.js?session=secret",
        "line-number": 12,
      },
    },
  ]);

  assert.match(summary, /https:\/\/example\.test\/account/);
  assert.match(summary, /https:\/\/evil\.test\/pixel/);
  assert.doesNotMatch(summary, /secret|email=|session=/);
});

test("summarizeCspReport strips Reporting API URL query strings", () => {
  const summary = summarizeCspReport([
    {
      type: "csp-violation",
      url: "https://example.test/page?token=secret",
      body: {
        documentURL: "https://example.test/account?token=secret#frag",
        blockedURL: "https://evil.test/pixel?email=a@example.test",
        sourceFile: "https://example.test/app.js?session=secret",
      },
    },
  ]);

  assert.match(summary, /https:\/\/example\.test\/page/);
  assert.match(summary, /https:\/\/example\.test\/account/);
  assert.match(summary, /https:\/\/evil\.test\/pixel/);
  assert.doesNotMatch(summary, /secret|email=|session=/);
});

test("summarizeCspReport does not echo unstructured report bodies", () => {
  const summary = summarizeCspReport("token=secret&email=a@example.test");

  assert.equal(summary, "[non-json report: 33 bytes]");
});

test("mapPushEvent builds browser commit URLs from event payloads", () => {
  const commits = mapPushEvent({
    created_at: "2026-06-17T00:00:00Z",
    repo: { name: "tanmay-alpha/tanmay-portfolio" },
    payload: {
      commits: [
        {
          sha: "abcdef1234567890",
          url: "https://api.github.com/repos/tanmay-alpha/tanmay-portfolio/commits/abcdef1234567890",
          commit: {
            message: "fix: harden route",
            author: { name: "Tanmay", email: "tanmay@example.test", date: "2026-06-17T00:00:01Z" },
          },
        },
      ],
    },
  });

  assert.equal(commits[0]?.url, "https://github.com/tanmay-alpha/tanmay-portfolio/commit/abcdef1234567890");
});

test("mapPushEvent tolerates missing commit author metadata", () => {
  const commits = mapPushEvent({
    created_at: "2026-06-17T00:00:00Z",
    repo: { name: "tanmay-alpha/tanmay-portfolio" },
    payload: {
      commits: [
        {
          sha: "1234567890abcdef",
          url: "https://api.github.com/repos/tanmay-alpha/tanmay-portfolio/commits/1234567890abcdef",
          commit: { message: "docs: update", author: null },
        },
      ],
    },
  });

  assert.equal(commits.length, 1);
  assert.equal(commits[0]?.timestamp, "2026-06-17T00:00:00Z");
});
