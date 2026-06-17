# tanmay-portfolio

Personal portfolio site — Tanmay Mangal.

Stack: **Next.js 15.5** (App Router) · **TypeScript** (strict) · **Tailwind CSS** · **Framer Motion** · **lucide-react**
Deploy: Vercel · Node.js **>=20.9**

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # unit/security regression tests
npm run lint         # ESLint
npm run build        # production build
```

## Theme

Dark is the default. Theme is stored in `localStorage` under the `tanmay-portfolio-theme` key and resolved in a blocking inline script (`src/app/layout.tsx`) before React hydrates, so there is no flash of wrong theme on first paint.

Toggle with the sun/moon button in the nav.

## Project layout

```
src/
├── app/
│   ├── api/               # contact, CSP report, GitHub, LeetCode routes
│   ├── globals.css        # Tailwind base + theme tokens
│   ├── layout.tsx         # Fonts, metadata, CSP-compatible scripts
│   └── page.tsx           # Home page composition
├── components/
│   └── ui/                # Portfolio sections and shared UI
├── data/
│   └── now.json
└── lib/
    ├── csp-report.ts      # CSP report log sanitization
    ├── github-commits.ts  # GitHub event commit mapping
    ├── hooks.ts
    ├── rate-limit.ts
    └── request-body.ts    # bounded request body reader
```
