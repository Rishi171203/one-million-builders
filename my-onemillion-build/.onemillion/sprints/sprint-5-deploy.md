# Sprint 5 — Deploy to Vercel (Global)

## Context
Put haus live on a global URL so the CEO and real users can open it anywhere.

## Entities & Fields
None.

## Backend / Server Actions
None (configuration only).

## Frontend Pages / Components
None new; production hardening only.

## Design Notes
None.

## Steps (guided, user does account steps in browser)
1. Ensure repo is pushed to GitHub (done — Rishi171203/one-million-builders).
2. Create free Vercel account; "Import Project" → select the repo; set **root directory** to
   `my-onemillion-build/haus`.
3. Add environment variables in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (and any server-only keys).
4. Add the Vercel production URL to Supabase Auth → redirect URLs (for Google + email).
5. Deploy; verify the live site end-to-end.

## Acceptance Criteria
- Production build succeeds on Vercel.
- Advisor works on the live URL for multiple countries.
- Register/login/Google works on the live URL.
- Saving + dashboard works against Supabase from production.

## Verification Gate
Live URL opens on phone + laptop; full flow (advise → register → save → see dashboard) works in production.

## Expected Commit Message
`Sprint 5: production config for Vercel deploy`
