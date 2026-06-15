# Cloudflare Turnstile setup (contact form)

The contact form on `/contact` can be protected by Cloudflare Turnstile
— a privacy-first CAPTCHA that doesn't sell user data and doesn't
present a challenge for most legitimate users. The site is fully
functional **without** these env vars; Turnstile is purely additive
spam defense.

## 1. Create a Turnstile widget

1. Sign up at https://dash.cloudflare.com (free tier is unlimited).
2. Go to **Turnstile → Add widget**.
3. Widget name: `tanmay-portfolio` (or whatever you like).
4. Hostname: `tanmay-portfolio-coral.vercel.app` — and the custom
   domain you'll use, if you bring one.
5. Widget mode: **Managed** (recommended — Cloudflare decides when
   to challenge).
6. Save. Cloudflare gives you a **Site Key** (public) and a **Secret
   Key** (private).

## 2. Add the env vars on Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | The Site Key from step 1 (public — starts with `0x4AAA…`) |
| `TURNSTILE_SECRET` | The Secret Key from step 1 (private) |

Hit **Save**, then redeploy (or push to `main`).

## 3. Local dev

For local development, drop these into a `.env.local` (already in
`.gitignore`):

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAA_xxxxxxxxxxxxxxxxxxxx
TURNSTILE_SECRET=0x4AAA_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## How it works

- When `TURNSTILE_SECRET` is set, `POST /api/contact` requires a
  `turnstileToken` field. The server calls Cloudflare's
  `siteverify` endpoint, bound to the client's IP. A failed
  verification returns 403.
- When `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set, the contact form
  renders the Turnstile widget. The submit button is disabled until
  the user solves the captcha.
- The script is loaded on demand from
  `https://challenges.cloudflare.com/turnstile/v0/api.js`. CSP
  `script-src` and `frame-src` automatically allow that origin when
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set — you don't need to edit
  `next.config.js`.
- If the script fails to load (ad-blocker, network), the server
  fails closed: the submit returns 400 and the user sees "Please
  complete the captcha first."
- When the env vars are **not** set, the form runs without captcha.
  The honeypot field, per-IP rate limit (3 req/10min), and CSRF
  origin check are still in effect.

## Removing Turnstile

Delete the two env vars on Vercel and redeploy. The widget stops
rendering and the server stops requiring the token. No code change
required.
