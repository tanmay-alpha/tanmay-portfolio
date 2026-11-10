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
- [x] Main — `npm run build`, commit, push, verify production deployment (2026-11-10)

## P1 (round 1 corrections: items below were wrongly ticked earlier)
- [x] Design agent — Contact section copy, nav items, metadata/OG copy (done; light mode + mobile nav NOT yet tested)
- [x] GPT — Contact validation/rate-limit tests, tsc fix, CI workflow
- [ ] README/CLAUDE.md refresh (not done)
- [ ] Lighthouse numbers (not done in round 1)

## Round 2
- [ ] **P0 Contact form E2E verification** — BLOCKED on owner: `vercel env ls` (project linked as tanmay-portfolio) still shows NO env vars. Needed names: RESEND_API_KEY, CONTACT_TO_EMAIL, optional CONTACT_FROM_EMAIL, NEXT_PUBLIC_TURNSTILE_SITE_KEY + TURNSTILE_SECRET_KEY (see TURNSTILE_SETUP.md). After set + redeploy: submit test, confirm mail arrives.
- [x] P0 Lighthouse desktop+mobile and fixes — local prod build, desktop 100/100/100/100, mobile 100/100/100/100 (perf/a11y/best-practices/seo) after fixes; before: perf 100/94, a11y 94/94; mobile LCP 3014→907 ms. Lab numbers on localhost, not production.
- [x] P0 Dark/light theme + mobile nav tested at 390/1280 in browser; contrast, focus trap, scroll lock fixed
- [x] P1 Genuine screenshots captured (MAET x2, GatePass login, Crucible demo unused)
- [x] P1 Case studies /work/maet, /work/gatepass (Crucible case study: not written, open)
- [x] P1 Experience audit vs public/resume.pdf — Main. Aligned TradeVed (title "Quantitative Research Intern"), Dynamic Bubble, Shipd to resume wording; removed "live in production", ai-workspace workflow claim, Techfest/ECell numeric claims (not in resume). Education section lines removal assigned to PerfA11y.
- [x] tests (22) + lint + build pass locally; deployment verification: see report
- [x] README layout refreshed (CLAUDE.md untouched)

## P2 (carried)
- [ ] Case-study pages / screenshots → Round 2 above

## Needs owner verification (not publishable as fact)
- Techfest "top 4,000 of 50,000+", "+40% registrations", ECell "ran ops for 2 events": not in resume → removed from site.
- Outlier, Turing, Meera, DataAnnotation: only a general contributor statement is published (no roles/dates); confirm wording or remove.
- Resume itself lists "ML Engineer" in the Shipd title and "$2M+ paid out"; the site omits both.
- TradeVed screener is private: mentioned in experience only.

## Findings
- Resume lists MAET "600+ tests"; site no longer shows test counts (unverified in repo).
- Sandbox Resend sender only delivers to the Resend account owner; verify a domain for real client mail.

## Round 3 (final review vs original brief)
- [x] npm audit --omit=dev: 6 vulns (1 critical next, 5 high) -> 0 after non-breaking `npm audit fix` (next 15.5.29). 7 moderate/high remain in dev-only eslint tooling.
- [x] External/internal links checked: all 200 (leetcode 403 / linkedin www 999 are bot blocks). OG image, resume.pdf, robots, 404 OK.
- [x] Vercel project inspected: Next.js preset, Node 24.x, default build, no custom domains on account (only *.vercel.app), auto-deploy from main works.
- [ ] BLOCKED (owner): Vercel env vars for contact form (still none) -> E2E email test.
- [ ] Not done by choice: Lovable (not needed), Crucible case study, RegimeShift/Code-Review case studies, Plausible analytics not configured.
- [ ] public/Tanmay_CV.pdf is byte-identical to resume.pdf (duplicate; kept in case of external links).
