# Resend setup (contact form)

The contact form on `/contact` POSTs to `/api/contact`, which forwards
submissions to your email via [Resend](https://resend.com). The site
works **without** these env vars — submissions fall back to a `mailto:`
link — but you'll want to configure them for a real working form.

## 1. Create a Resend account

1. Sign up at https://resend.com (free tier: 100 emails/day, 3,000/month).
2. Verify your sending domain (or use the `onboarding@resend.dev`
   sandbox sender that ships with every account).
3. Grab an API key from https://resend.com/api-keys.

## 2. Add the env vars on Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | `re_…` (the API key from step 1) |
| `CONTACT_TO_EMAIL` | `mangaltanmay7@gmail.com` (where submissions go) |

Hit **Save**, then redeploy (or push to `main`).

## 3. Local dev

For local development, drop these into a `.env.local` (already in
`.gitignore`):

```
RESEND_API_KEY=re_xxx
CONTACT_TO_EMAIL=mangaltanmay7@gmail.com
```

## How it works

- `POST /api/contact` accepts `{ name, email, message, website }`.
- `website` is a honeypot — if filled, the route silently returns 200
  without sending.
- Rate-limited to **3 requests per IP per 10 minutes** (in-memory;
  resets on cold start).
- If either env var is missing, the route returns **503** and the
  client falls back to a `mailto:` link so the form never silently
  fails.
- All inputs are validated with Zod.

## Quotas & limits

- Resend free tier: 100 emails/day, 3,000/month.
- The route's rate limit is **per IP**, in-memory, per server instance.
  A multi-region Vercel deploy would need Upstash or similar — out of
  scope for this session.
