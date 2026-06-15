# Security

This document describes the security posture of the
[tanmay-portfolio](https://github.com/tanmay-alpha/tanmay-portfolio)
site and how to report vulnerabilities.

## Reporting a vulnerability

If you find a security issue, **do not open a public GitHub issue.**
Email **mangaltanmay7@gmail.com** with a description, reproduction
steps, and (if possible) a proof-of-concept. Expect an acknowledgement
within 48 hours. There is no paid bug-bounty program; the only
compensation is credit in the fix's commit message.

## Threat model

This is a personal portfolio site. The realistic threats are:

- **Abuse of the contact form** — a public form that emails the
  owner. Mitigated by: origin check, per-IP rate limit, honeypot
  field, and Zod input validation. The form is a low-value target.
- **Burning third-party API quotas** — `/api/commits` proxies GitHub
  (unauthenticated, 60 req/hr cap) and `/api/leetcode` proxies a
  free LeetCode API. Both are per-IP rate limited to prevent one
  client from exhausting the upstream budget.
- **DoS via Vercel function invocations** — every API route costs
  function time. The rate limits above also bound this.
- **Framework CVEs** — pinned to the latest 15.5.x with `npm audit`
  clean. See the [CI / dependency policy](#dependency-policy).

Out of scope (the site does not store anything user-specific):

- AuthN / AuthZ — there is no user account, no session, no cookie.
- Data at rest — no database; `/api/*` are stateless proxies.
- PII — the only PII submitted is via the contact form, which is
  forwarded to Resend and not persisted on the site.

## Headers

The site returns the following security headers on every response
(configured in [`next.config.js`](./next.config.js)):

| Header | Value |
| --- | --- |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' data: blob:; font-src 'self' data:; script-src 'self' 'unsafe-inline' [plausible.io when configured]; connect-src 'self' [plausible.io when configured]; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` |

`frame-ancestors 'none'` and `X-Frame-Options: DENY` together block
clickjacking. CSP `frame-ancestors 'none'` is the modern directive;
the X-Frame-Options header is kept for legacy browser support.

`'unsafe-inline'` is permitted in `script-src` so the inline
`theme-initializer` script (which runs before React hydrates to set
`data-theme` on `<html>` and prevent a flash) keeps working. This is
the standard trade-off for inline bootstrapping scripts in Next.js.

## API hardening

### `POST /api/contact`

1. **CSRF / origin check** — `Origin` must match the `Host` header.
   Falls back to `Referer` for older clients. Non-browser clients
   (no `Origin`, no `Referer`) are rejected as bots.
2. **Honeypot** — a `website` field is rendered off-screen. If it's
   filled, the route silently returns `200 {ok:true}` without
   sending any email.
3. **Per-IP rate limit** — 3 requests per 10 minutes per IP.
4. **Input validation** — Zod schema with length caps. The `name`,
   `email`, and `message` fields are escaped before being inserted
   into the HTML body of the email.

### `GET /api/commits`, `GET /api/leetcode`

- Per-IP rate limit (30/min for commits, 10/min for leetcode).
- Cache-Control headers prevent abuse through CDN-cached responses.
- Both routes **never throw** — failures are caught and returned as
  `{ fallback: true, reason: "..." }` so the UI degrades quietly
  rather than triggering a 5xx alarm.

### Image proxy `/_next/image`

`remotePatterns` is set to an **empty allowlist** because the only
image on the site is `/tanmay.jpg` (self-hosted). If a future change
introduces remote images, the host MUST be added to
`IMAGE_REMOTE_PATTERNS` in `next.config.js`. Leaving the allowlist
unset has historically been an SSRF vector.

## Dependency policy

- `npm audit --omit=dev` is expected to be clean. CI should fail the
  build otherwise.
- Next.js is pinned to the latest 15.5.x release line. The 14.x line
  has unpatched high-severity CVEs (cache poisoning, RSC DoS, image
  optimizer SSRF) and is **not** eligible for new deployments.
- `resend`, `zod`, and other runtime deps are pinned to caret ranges
  so they pick up patch releases. Major-version bumps are reviewed.

## Secrets

- `RESEND_API_KEY` and `CONTACT_TO_EMAIL` live in Vercel environment
  variables. They are **not** in the repo, `.env*` files, or CI logs.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is the only public env var. By
  design, it must be public for the analytics script to load.
- No client-side code reads any non-`NEXT_PUBLIC_*` variable.

## Audit history

- 2026-06-15 — Initial audit and hardening. Next 14.2.35 → 15.5.19,
  security headers added, image allowlist locked, rate limits
  applied to all three API routes, CSRF origin check added to
  `/api/contact`. `npm audit --omit=dev` clean.
