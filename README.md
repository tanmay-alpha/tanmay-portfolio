# tanmay-portfolio

Personal portfolio site — Tanmay Mangal.

Stack: **Next.js 14** (App Router) · **TypeScript** (strict) · **Tailwind CSS** · **Framer Motion** · **lucide-react**
Deploy: Vercel

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint         # ESLint
```

## Theme

Dark is the default. Theme is stored in `localStorage` under the `theme` key and resolved in a blocking inline script (`src/app/layout.tsx`) before React hydrates, so there is no flash of wrong theme on first paint.

Toggle with the sun/moon button in the nav.

## Project layout

```
src/
├── app/
│   ├── favicon.ico       # "TM" monogram
│   ├── globals.css       # Tailwind base + theme tokens
│   ├── layout.tsx        # Fonts, metadata, theme init script
│   └── page.tsx          # Home (nav + hero + section placeholders)
├── components/
│   └── ui/
│       ├── aurora-orb.tsx
│       ├── hero.tsx
│       ├── navigation.tsx
│       └── theme-toggle.tsx
└── lib/
    └── hooks.ts          # useMediaQuery
```
