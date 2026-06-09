# Sprint 3 — Save & View Assessments (Dashboard)

## Context
Let logged-in users save their advisor results and revisit them. This is the "data saved in
a database, and you can see the data" requirement.

## Entities & Fields
- `assessments`: id (uuid), user_id (uuid → auth.users), country, currency, inputs (jsonb),
  result (jsonb), status ('ready'|'rent'), helped (bool, default false), created_at.
- Indexes: (user_id), (user_id, created_at desc).
- RLS: select/insert/delete only where user_id = auth.uid().

## Backend / Server Actions
- `saveAssessment(input, result, market)` → insert row for current user.
- `listAssessments()` → current user's rows, newest first.
- `deleteAssessment(id)` → delete own row.
- `markHelped(id)` → set helped = true.

## Frontend Pages / Components
- On the result view: a "Save to my haus" button (visible when logged in; prompts login if not).
- `/dashboard` (auth-only): list of saved assessments as cards (country, verdict chip, price range, date), open to view full result, delete.
- Empty state ("No saved assessments yet — run the advisor").

## Design Notes
Dashboard uses the same Card style; verdict chip colors (green/amber). Smooth list reveal
(Framer Motion stagger). Confirm-before-delete dialog.

## Acceptance Criteria
- A logged-in user can save a result and see it appear in /dashboard.
- Reloading shows saved data persisted from the database.
- A user can open and delete their own assessment.
- A user cannot see anyone else's assessments (RLS).

## Verification Gate
Build passes; save → reload → still there; second account cannot read first account's rows.

## Expected Commit Message
`Sprint 3: save assessments + user dashboard with RLS`
