# Test Plan — haus

> Generated: 2026-06-11 · Scope: MVP core logic (Tier 5 unit tests) · Runner: Vitest

## Summary

Day 10 focus: lock down haus's **core business logic** — the deterministic math that is the
product's brain — with fast, reliable unit tests, so future UI/feature changes can't silently
break a verdict. Browser E2E, CI, and API-integration tiers are planned next (see Limitations
in `test-results.md`).

| Tier | Tests | Target | Status |
|------|-------|--------|--------|
| 5. Unit (core logic) | 23 | the 4 `src/lib` math modules | ✅ done |
| 1. API contracts (`/api/advice`) | — | happy/401/400/429 | planned |
| 2. Security (auth, IDOR, RLS) | — | OWASP risks | partly via Day 9 review + manual 401 check |
| 4. E2E flows (Playwright) | — | register→advisor→save | planned |
| 7. CI pipeline | — | GitHub Actions | planned |

## Per-module detail (Tier 5)

### `src/lib/markets.ts` — markets + currency formatting
- TC-M1: MARKETS has 5 launch markets, each with positive interest/down-payment/EMI-cap.
- TC-M2: `getMarket` returns the matching market by code.
- TC-M3: `getMarket` falls back to India (default) for unknown/empty codes.
- TC-M4: `fmtFull` adds the currency symbol and rounds.
- TC-M5: `fmtCompact` uses Indian Cr/L styling for India.
- TC-M6: `fmtCompact` uses western M/K styling elsewhere.

### `src/lib/haus.ts` — affordability verdict (MVP core)
- TC-H1: status = "rent" when **savings** is the limiting factor (India sample).
- TC-H2: status = "ready" with ample savings; EMI > 0.
- TC-H3: loan tenure clamps between 5 and 20 years (by age).
- TC-H4: returns 5 jargon terms (incl. "EMI") + ≥3 next steps.
- TC-H5: exposes the market assumptions used (interest/down/EMI-cap).
- TC-H6: more income never lowers the affordable price (monotonic).

### `src/lib/owner.ts` — homeowner tools
- TC-O1: `emiForLoan` = 0 for zero principal; a real loan repays more than it borrows.
- TC-O2: `prepayResult` saves interest and shortens the loan.
- TC-O3: `refinanceResult` — lower rate saves, higher rate costs.
- TC-O4: `equityResult` — equity, equity %, LTV %.
- TC-O5: equity never negative; LTV caps at 100% when underwater.
- TC-O6: `sellVsRent` verdict tracks rental yield (rent / sell / balanced thresholds).
- TC-O7: `monthsToYrMo` formats durations (incl. ∞ → "—").

### `src/lib/rentVsBuy.ts` — rent-vs-buy over time
- TC-R1: not-ok for non-positive price or years.
- TC-R2: one series point per year, a winner, non-negative gap.
- TC-R3: **unbiased** — extreme pro-rent assumptions flip the winner to "rent".
- TC-R4: winner matches whichever net worth is higher at the horizon.

## How to run

```bash
cd my-onemillion-build/haus
npm test          # one-shot (vitest run)
npm run test:watch  # watch mode while developing
```
