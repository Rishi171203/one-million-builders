# Sprint 2 — Supabase + Auth

## Context
Add accounts so users can register and log in. Sets up Supabase (DB + Auth) and the
login/register UI. Requires the user to create a free Supabase project (guided).

## Entities & Fields
- `profiles`: id (uuid, = auth.users.id), display_name (text), country (text), currency (text), created_at, updated_at.
- RLS: a user can select/update only their own profile row. Auto-create profile on signup (trigger or first-login upsert).

## Backend / Server Actions
- Supabase clients: `src/lib/supabase/client.ts` (browser) and `server.ts` (SSR, cookies).
- Auth: signUp (email/password), signInWithPassword, signInWithOAuth('google'), signOut.
- Middleware/session refresh per Supabase SSR guide for the installed version.

## Frontend Pages / Components
- `/login` page: tabbed Login / Register (MUI), email+password fields, "Continue with Google" button, error states.
- `AppHeader` updates: show "Log in" when signed out; avatar/menu with "Dashboard" + "Log out" when signed in.

## Design Notes
Match premium theme. Auth card centered, same Paper/rounded style as advisor. Friendly,
reassuring copy (calm tone).

## Acceptance Criteria
- A new user can register with email/password and is logged in.
- A user can log in with Google.
- Logging out clears the session; protected areas redirect to /login.
- A `profiles` row exists for each user and is readable only by that user.

## Verification Gate
Build passes; register + login + logout tested locally against a real Supabase project;
RLS verified (cannot read another user's profile).

## Expected Commit Message
`Sprint 2: Supabase setup + email/Google auth`

## External Setup (guided, user does in browser)
Create free Supabase project → copy Project URL + anon key into `.env.local`; enable Google
provider in Supabase Auth settings. Exact steps provided at sprint start.
