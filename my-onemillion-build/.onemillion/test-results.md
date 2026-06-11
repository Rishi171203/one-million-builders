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

## Limitations (planned, not yet automated)

- **E2E (Playwright)** — register → login → run advisor → save → dashboard, at 375px + 1280px.
  Not yet written; core flows verified manually this session.
- **API contract tests** — automated 200/400/401/429 cases for `/api/advice` (only manual curl
  so far).
- **CI pipeline** — `.github/workflows/test.yml` to run `npm test` (+ build/lint) on push/PR.
- **Component/RTL tests** — UI components are currently verified via tsc + manual review.

These are the recommended next testing steps before/around deploy; none block the current
core-logic guarantee.

## Verdict

**PASS** for the MVP core-logic suite (Tier 5). The product's math is now regression-protected.
E2E + CI to follow as the final pre-ship testing layer.
