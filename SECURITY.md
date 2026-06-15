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
  field, optional Cloudflare Turnstile, request-size cap, and Zod
  input validation. The form is a low-value target.
- **Burning third-party API quotas** — `/api/commits` proxies GitHub
  (unauthenticated, 60 req/hr cap) and `/api/leetcode` proxies a
  free LeetCode API. Both are per-IP rate limited to prevent one
  client from exhausting the upstream budget.
- **DoS via Vercel function invocations** — every API route costs
  function time. The rate limits above also bound this.
- **Framework CVEs** — pinned to the latest 15.5.x with `npm audit`
  clean. See the [CI / dependency policy](#dependency-policy).
- **CSP bypass / XSS** — mitigated by strict CSP. Scripts and
  styles are limited to `'self'` plus the inline-script runtime
  Next requires; no remote sources by default; report endpoint
  observes violations.

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
| `Content-Security-Policy` | strict — see [Content Security Policy](#content-security-policy) below |

`frame-ancestors 'none'` and `X-Frame-Options: DENY` together block
clickjacking. CSP `frame-ancestors 'none'` is the modern directive;
the X-Frame-Options header is kept for legacy browser support.

### Content Security Policy

The full CSP (with no optional env vars set) is:

```
default-src 'self';
img-src 'self' data: blob:;
font-src 'self' data:;
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
connect-src 'self';
frame-src 'self';
worker-src 'self' blob:;
object-src 'none';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
report-uri /api/csp-report;
```

- **`script-src 'unsafe-inline'` is required for Next.js 15 App
  Router.** Next emits multiple inline `<script>` tags per page
  for React Server Components streaming — `self.__next_f.push(...)`
  chunks and the `self.__next_s.push(...)` wrappers. The chunks
  are content- and route-specific, so a SHA-256 allowlist would
  need to enumerate every page's payload — impractical. The two
  real alternatives (nonces for every script, or Trusted Types)
  both require significant framework integration work.
- The XSS risk is mitigated by the lack of any user-controlled
  HTML rendering: every string that lands in the DOM is
  React-escaped, and there is no CMS or markdown renderer.
- **`style-src 'unsafe-inline'`** is required for Tailwind
  utility classes that emit dynamic inline `style=` attributes
  (Framer Motion's transform/translateY props, the data-reveal
  reveal animations, the aurora orb's WebGL position). Without
  it, ~50 console errors fire on every page load and reveal
  animations stop working.
- **`'unsafe-eval'` is NOT allowed** in any directive. We don't
  use `eval`, `new Function`, or runtime template compilation
  anywhere. (Dev mode's React Refresh injects eval, but that
  only runs on `localhost`, never in production.)
- **No remote script sources by default.** `https://plausible.io`
  and `https://challenges.cloudflare.com` are appended to
  `script-src` / `frame-src` automatically when their env var is
  set.
- **No remote styles, no remote frames, no plugins.** `object-src
  'none'` blocks Flash / Java / PDF embeds.
- **Clickjacking blocked** by `frame-ancestors 'none'` and the
  legacy `X-Frame-Options: DENY` header.
- **`<base>` hijacking blocked** by `base-uri 'self'`.
- **Forms can only POST back to us** by `form-action 'self'`.
- **`report-uri /api/csp-report`** sends violations to a small
  logging endpoint so the policy is observable in production.

### HSTS preload

The HSTS header is `max-age=63072000; includeSubDomains; preload`,
which signals to browsers that the site should **only** be reached
over HTTPS, including all subdomains, for the next two years. To
actually enter Chrome / Firefox / Safari preload lists, the domain
**must be submitted to https://hstspreload.org** — the header alone
is not enough.

Submission requirements (all met by this site):

1. Serve a valid certificate.
2. Redirect from HTTP to HTTPS on the same host, if listening on
   port 80.
3. Serve all subdomains over HTTPS. (Vercel does this for
   `*.vercel.app`; if you bring a custom domain, make sure every
   subdomain has a cert.)
4. Serve the HSTS header on the base domain.
5. `max-age` must be at least 31536000 (1 year). Ours is 2 years.
6. `includeSubDomains` directive must be present.
7. `preload` directive must be present.

To submit: visit https://hstspreload.org, enter the production
domain, click "Check status and eligibility", and submit. Removal
from the preload list is slow and disruptive (months) — only submit
when you're sure the domain and all subdomains will stay on HTTPS
indefinitely.

## API hardening

### `POST /api/contact`

Order of checks (cheapest / most-likely-to-reject first):

1. **CSRF / origin check** — `Origin` must match the `Host` header.
   Falls back to `Referer` for older clients. Non-browser clients
   (no `Origin`, no `Referer`) are rejected as bots with 403.
2. **Request size cap** — `Content-Length` must be ≤ 32 KB. The
   parsed JSON body is also re-checked after parsing, so a
   chunked-transfer client can't bypass the limit. Returns 413.
3. **Honeypot** — a `website` field is rendered off-screen. If it's
   filled, the route silently returns `200 {ok:true}` without
   sending any email.
4. **Zod input validation** — name (≤120), email (≤200, valid
   format), message (10–5000 chars). 400 on failure.
5. **Per-IP rate limit** — 3 requests per 10 minutes per IP.
6. **Cloudflare Turnstile** (only when `TURNSTILE_SECRET` is set) —
   server verifies the `turnstileToken` against
   `challenges.cloudflare.com/turnstile/v0/siteverify`, bound to
   client IP. 403 on failure. 400 if token is missing. Fails
   **closed** on network error to Cloudflare.
7. **Resend** — sends the email via the configured API key.
8. **Log sanitization** — error logs only contain error code,
   name, message, and HTTP status from the upstream provider.
   The user's submitted `name`, `email`, and `message` are never
   written to function logs (Vercel function logs persist).

See [`TURNSTILE_SETUP.md`](./TURNSTILE_SETUP.md) for how to wire
the Turnstile env vars.

### `GET /api/commits`, `GET /api/leetcode`

- Per-IP rate limit (30/min for commits, 10/min for leetcode).
  Returns 429 with `Retry-After`.
- Cache-Control headers prevent abuse through CDN-cached responses.
- Both routes **never throw** — failures are caught and returned as
  `{ fallback: true, reason: "..." }` so the UI degrades quietly
  rather than triggering a 5xx alarm.

### `POST /api/csp-report`

- Per-IP rate limit (30/min).
- Always returns 204 No Content.
- Logs the report to Vercel function logs, truncated to 2 KB per
  report. The browser does not read the response, so there's no
  risk of leaking the report data back to the client.

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
- `package.json` carries a top-level `overrides.postcss` block that
  forces a patched postcss version across the dependency tree,
  closing a moderate XSS advisory that the Next.js 15.5 bundle
  re-introduces transitively.
- `resend`, `zod`, and other runtime deps are pinned to caret ranges
  so they pick up patch releases. Major-version bumps are reviewed.

## Secrets

- `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `TURNSTILE_SECRET`, and
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (the only env vars with
  server-side impact) live in Vercel environment variables. They
  are **not** in the repo, `.env*` files, or CI logs.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` and
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are the only public env vars.
  By design, they must be public for the analytics / captcha
  scripts to load.
- No client-side code reads any non-`NEXT_PUBLIC_*` variable.

## Audit history

- 2026-06-16 — Follow-up hardening. CSP gets explicit
  `style-src` (was falling back to `default-src`, which blocked
  inline styles), `object-src 'none'`, `report-uri` for
  observability, and a `/api/csp-report` route. `/api/contact`
  request size cap (32 KB), sanitized error logging (no user PII
  in function logs), optional Cloudflare Turnstile integration
  with fail-closed behavior. HSTS preload step documented.
  Note: `'unsafe-inline'` for `script-src` is **kept** because
  Next.js 15 App Router RSC streaming requires it; the XSS risk
  is bounded by React's automatic string escaping.
- 2026-06-15 — Initial audit and hardening. Next 14.2.35 → 15.5.19,
  security headers added, image allowlist locked, rate limits
  applied to all three API routes, CSRF origin check added to
  `/api/contact`. `npm audit --omit=dev` clean.
