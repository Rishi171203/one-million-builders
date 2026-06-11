# Test Results — haus

> Generated: 2026-06-11 · Runner: Vitest v4 · Verdict: **PASS (Tier 5 core logic)**

## Dashboard

| Metric | Value |
|--------|-------|
| Test files | 4 |
| Total tests | 23 |
| Passed | 23 |
| Failed | 0 |
| Skipped | 0 |
| Duration | ~0.8s |

## Command + output

```
cd my-onemillion-build/haus && npm test

 Test Files  4 passed (4)
      Tests  23 passed (23)
```

## What this covers

- **All 4 core math modules** (`markets`, `haus`, `owner`, `rentVsBuy`) — the deterministic
  logic behind every verdict, the homeowner tools, and currency formatting.
- A **regression guard on the unbiased claim**: `rentVsBuy` flips to "rent" under pro-rent
  assumptions, so the engine can never silently become buy-biased.

## Security evidence (from Day 9 review + manual checks)

- RLS enabled + own-row isolation on `profiles` and `assessments` (reviewed).
- Privilege-escalation (self-assigned admin) **fixed** via `supabase/0003_secure_roles.sql`
  (signup clamps role to buyer/owner; BEFORE UPDATE trigger blocks role changes by non-admins).
  Verified by Rishi: admin audit query returns only his account.
- `/api/advice` now **401** for unauthenticated requests (manually verified with curl) +
  per-user rate limit (429). Input validation rejects bad/junk numbers (400); free-text `goal`
  capped at 300 chars (prompt-injection surface reduced).
- Secrets git-ignored + server-only; no XSS sinks; `?next=` open-redirect-safe.

## E2E (Playwright, Chromium) — public flows

`npm run test:e2e` → **4 passed** (`tests/e2e/public.spec.ts`). Real browser, no DB writes:
- homepage loads with the hero + primary CTA
- Register → routes to the login page
- **the advisor is gated** — a logged-out visitor is redirected to `/login`
- login page shows the Log in / Register tabs + email field

Config note: runs serially (`workers: 1`) because the dev server compiles routes on-demand;
parallel runs starved hydration and made the click test flaky.

## CI (GitHub Actions)

`.github/workflows/haus-tests.yml` — on every push to `main` and every PR, runs `npm ci` +
`npm test` (the 23 unit tests) on a fresh Ubuntu runner, with lint as a non-blocking step.
A change that breaks the core math now fails CI automatically.

## Limitations (still deferred)

- **Authenticated E2E** (register → run advisor → save → dashboard) — needs a **separate test
  Supabase project** so test users don't land in the live DB. Public flows covered above;
  authed flows verified manually this session.
- **E2E in CI** — needs the app + browser + Supabase keys configured as GitHub secrets; unit
  tests run in CI today, E2E runs locally.
- **API contract tests** (automated 200/400/401/429 for `/api/advice`) — manual curl so far.
- **Component/RTL tests** — UI components verified via tsc + manual review.

## Verdict

**PASS** — 23 unit tests + 4 E2E (public) green; CI runs the unit suite automatically. The
product's core math is regression-protected and the public surface + login wall are covered in
a real browser. Authenticated E2E + E2E-in-CI to follow once a test Supabase project exists.
