# Sprint 1 — Global Advisor + Landing

## Context
Turn the working single-page advisor into a polished, **multi-country** experience with a
proper landing section. Still public, no login. Builds on existing `src/app/page.tsx`,
`src/lib/haus.ts`.

## Entities & Fields
No DB yet. New code config `src/lib/markets.ts`:
- Market: { code, name, currencySymbol, currencyCode, locale, interestPct, downPaymentPct, retirementAge, emiCapPct }
- Markets: India, USA, Germany, UK, UAE (values per architecture.md §9).

## Backend / Server Actions
None. `computeResult()` extended to accept a `Market` so interest/down-payment/tenure/
formatting follow the selected country.

## Frontend Pages / Components
- `CountrySelect` component (flag/name + currency) in the advisor.
- `AdvisorForm` + `ResultView` (refactor current page into components).
- Landing hero section above the advisor: headline, subcopy, trust line, CTA scroll-to-advisor.
- Currency-aware formatting (Indian lakh/crore vs Western).

## Design Notes
Premium indigo theme, Plus Jakarta Sans + Inter, Framer Motion reveals + animated numbers
(already in place). Country selector top-right of the advisor card.

## Acceptance Criteria
- Given a selected country, when the user submits, then results use that country's currency and assumptions.
- Switching country and resubmitting changes the numbers and currency symbol.
- Landing hero renders above the advisor and scrolls to it on CTA click.
- All existing content states (loading, result, jargon, helped) still work.

## Verification Gate
`npm run build` passes; manual check of 2+ countries giving sensible, differing results.

## Expected Commit Message
`Sprint 1: global multi-currency advisor + landing hero`
