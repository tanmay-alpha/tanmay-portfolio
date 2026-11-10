# Portfolio refinement — TODO

Owners: **Main** = Claude Sonnet 5.5, **GPT** = GPT-6.1 Sol (engineering), **Design agent (Gemini unavailable → Sonnet fallback)** = Gemini 3.8 Flash (design/content). If a subagent model is exhausted, Main takes over.
Status: [ ] open · [~] in progress · [x] done

## Baseline (2026-11-10)
- `npm test` 10/10 pass; `npm run lint` clean; `tsc` errors only in tests/ (`.ts` import extension, pre-existing).
- Live URLs for MAET, GatePass, Crucible, FinCalc, portfolio all return 200.

## P0
- [x] Main — Hero rewrite (clear offer, CTAs, availability line, no AuroraOrb) — `hero.tsx`
- [x] Main — Featured work: 4 verified projects (MAET, GatePass, Crucible, Flight Agent Evaluator) — `work-section.tsx`
- [x] Main — New homepage order — `page.tsx`
- [x] Gemini — New `services-section.tsx` (`ServicesSection`) and `markets-section.tsx` (`MarketsSection`)
- [x] Main — Experience: fix Shipd platform-wide claim; separate "AI evaluation & independent contributions"
- [x] Main — More Work: refresh list; About: remove stale/unverified stats (6 repos, 600+ tests, LeetCode)
- [x] GPT — Remove dead code (aurora-orb, commit-feed, mid-page-rail, leetcode route/lib), drop `three`/`@react-three/*` deps
- [x] GPT — Contact API audit + tests; verify Vercel env var names (no values)
- [x] Main — `npm run build`, commit, push, verify Vercel preview/production

## P1
- [x] Gemini — Contact section copy (freelance), nav items, metadata/OG copy, light-mode check, mobile nav
- [x] GPT — Tests for contact validation/rate limit; fix `tsc` on tests; CI workflow check; Lighthouse measurements
- [x] Main — README/CLAUDE.md refresh

## P2
- [ ] Case-study pages for 2 flagship projects (needs real screenshots from deployed apps)
- [ ] Real project screenshots (capture from live deployments)

## Needs owner verification (not publishable as fact)
- Outlier, Turing, Meera, DataAnnotation: exact work/dates unverified. Listed only as independent contributor platforms, no roles/dates.
- Shipd: "10+ challenges" is from the existing resume entry; confirm.
- Techfest "top 4,000 of 50,000+" and "+40% registrations" carried over from existing site; confirm.
- TradeVed screener is private: mentioned in experience only, no links or data.

## Findings
- **Vercel project has NO env vars** (RESEND_API_KEY, CONTACT_TO_EMAIL, Turnstile keys absent): the contact form cannot deliver email in production until they are set. Needs owner action (secrets). Added optional CONTACT_FROM_EMAIL; sandbox sender only delivers to Resend account owner.
- Last production deploy was 146 days old before this push.
- Not done: Lighthouse numbers, case-study pages, real screenshots (P2).
