# Plausible setup (privacy-friendly analytics)

The site loads [Plausible](https://plausible.io) analytics when
`NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set. **No script loads without that
env var**, so the default deployment is zero-analytics.

## 1. Create a Plausible account

1. Sign up at https://plausible.io (free for sites with < 10k
   monthly pageviews).
2. Add a site with the domain you plan to use — e.g. `tanmaymangal.in`
   if you bring a custom domain, or
   `tanmay-portfolio-coral.vercel.app` for the default Vercel alias.
3. Plausible will give you a one-line script tag with `data-domain`
   set to your domain. The relevant value is just the domain string.

## 2. Add the env var on Vercel

In your Vercel project → **Settings → Environment Variables**, add:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | The exact domain you registered with Plausible |

Hit **Save**, then redeploy (or push to `main`).

## 3. Local dev

For local development, drop this into `.env.local`:

```
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=tanmay-portfolio-coral.vercel.app
```

## What it does

- The script tag in `app/layout.tsx` only renders when the env var is
  set.
- Strategy is `afterInteractive`, so it never blocks rendering.
- The footer shows a small **"N views this month"** badge that pulls
  from Plausible's public stats API. If the API is unreachable, the
  badge just doesn't appear — no error UI.

## Privacy

Plausible is cookieless, GDPR-compliant, and doesn't track personal
data. There's no consent banner needed.
