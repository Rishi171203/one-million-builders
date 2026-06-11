# haus — Architecture (Day 5)

Planned on: 2026-06-10
Sources: refined-prd.md, design-spec.md, design-system.md, screens/, seed-data.json
Scope note: Updated from Bangalore-only MVP → **global, multi-currency** product with
accounts and saved data, per founder + CEO direction (build fully, then launch).

> **Reconciliation (Day 14, 2026-06-11):** the app is now **account-first** (the advisor lives
> behind login — see §1/§6), the **AI advisor is built** (Gemini hybrid — see §11), and
> `/api/advice` is auth-gated + rate-limited (§7). Sections below are corrected where marked
> "(updated Day 14)". The module map (§14) is illustrative and has since grown (advisor/owner/
> admin/profile routes, `api/advice`, auth callback, `proxy.ts`, brand/UI components, tests).

## 1. Product Type
Balanced-responsive **web app** (premium, animated). **Account-first (updated Day 14):** a
public marketing homepage at `/`, with the advisor + all features behind login at `/advisor`.
The AI advisor (Gemini) is now built (see §11). Not mobile-native, not a conversational agent.

## 2. Stack
- **Frontend:** Next.js (App Router, TypeScript, React) + MUI + Framer Motion.
- **Backend:** Next.js server actions / route handlers (default path — no separate backend).
- **Database + Auth:** Supabase (PostgreSQL + Supabase Auth).
- **Hosting/Deploy:** Vercel (global edge network), auto-deploy on git push.
- **Rationale for default backend (no FastAPI):** no heavy Python logic, background jobs,
  or long-running workflows. Calculations are light and run client-side or in server
  actions. FastAPI is not justified for this product.

## 3. Backend Path
Default: **Supabase + Next.js route handlers / server actions.** Calculation logic
(`src/lib/haus.ts`) is pure and runs in the browser; persistence goes through Supabase
client + server actions. Revisit only if a real backend reason appears.

## 4. Tenancy Model
**Single-user ownership.** Each user owns their own profile and assessments. No teams,
no organizations, no shared data. (Not a company/clinic/agency product → multi-tenant is
unnecessary.)

## 5. RBAC Model
**Roles added (revised 2026-06-10 per founder direction).** Three roles, stored on
`profiles.role`:
- **buyer** (Homebuyer) — default; advisor + saved advice; routed to `/dashboard`.
- **owner** (Homeowner) — owner tools (prepay/refinance, equity tracker, sell-vs-rent); `/owner`.
- **admin** (Builder = Rishi) — product analytics dashboard; `/admin`.
Role is chosen at registration (buyer/owner) via signup metadata → DB trigger writes it to
`profiles`. **admin is NEVER self-selectable** — it is assigned manually via SQL to a specific
account (security: prevents anyone granting themselves admin). Server pages read the role and
redirect to the correct dashboard; admin/owner pages reject mismatched roles. Going forward,
new account features live behind login.

## 6. Auth Model
- **Supabase Auth.** Methods: **email/password** + **Google OAuth** (one-click).
- Public (no login) **(updated Day 14):** the marketing homepage at `/`, and the login/register page.
- Login required **(updated Day 14):** the advisor at `/advisor`, viewing a result, saving,
  the dashboards (buyer/owner/admin), and profile. After login users land on their role's home.
- Sessions handled by Supabase SSR helpers; auth state available in server and client.

## 7. Security Model
- **Row-Level Security (RLS)** on all user-owned tables: a user can read/write only rows
  where `user_id = auth.uid()`. Enforced in the database, not just the UI.
- Secrets in environment variables; the Supabase **service-role key never reaches the browser**.
- Input validation on both client and server actions.
- AI endpoint `/api/advice` **(updated Day 14):** server-only key, **requires a logged-in
  session**, **per-user rate limit**, and full input validation (+ a cap on the free-text goal).
- Admin role **cannot be self-assigned** — a DB trigger blocks role escalation (Day 9 fix).
- "Guidance, not financial advice" disclaimer shown with every result (trust + liability).

## 8. Data Model (entities & ownership)
| Entity | Owner | Visibility | Key fields |
|---|---|---|---|
| `profiles` | the user | private | id (=auth user id), display_name, country, currency, created_at |
| `assessments` | the user | private (RLS) | id, user_id, country, currency, inputs (jsonb), result (jsonb), status ('ready'/'rent'), helped (bool), created_at |

- `inputs` jsonb: { income, savings, rent, age, goal }
- `result` jsonb: the computed Result (verdict, priceMin/Max, emi, terms, nextSteps, assumptions…)
- Audit field: `created_at` (and `updated_at` on profiles).
- Filtering/sorting: assessments by `created_at` desc, by `country`, by `status`.

## 9. Market Configuration (multi-currency)
Per-country assumptions live in code config first (`src/lib/markets.ts`); can move to a
DB table later. **Values below are ASSUMPTIONS to verify before launch.**
| Country | Currency | Interest % (assumed) | Down payment % | Retirement age | EMI-to-income cap |
|---|---|---|---|---|---|
| India | INR ₹ | 8.5 | 20 | 60 | 40% |
| USA | USD $ | 7.0 | 20 | 65 | 40% |
| Germany | EUR € | 3.8 | 20 | 67 | 40% |
| UK | GBP £ | 5.0 | 15 | 66 | 40% |
| UAE | AED | 4.5 | 20 | 60 | 40% |

Number/currency formatting adapts per locale (e.g. Indian lakh/crore vs. Western thousands/millions).

## 10. API / Server-Action Boundaries
- `computeResult()` — pure function, runs client-side (no network). Instant advisor.
- `saveAssessment(input, result)` — server action; inserts a row for the logged-in user.
- `listAssessments()` — server action/query; returns the current user's assessments (RLS).
- `deleteAssessment(id)` — server action; deletes own row.
- Auth flows via Supabase client (signUp, signInWithPassword, signInWithOAuth, signOut).

## 11. AI Boundary
**Built (updated Day 14).** Google Gemini (free tier) writes the verdict / next-steps / jargon in
a **hybrid** design — our code does ALL the math and passes the numbers in, so the AI only writes
the language and can't invent figures. It lives only in the server route `/api/advice` (key never
client-side), with **graceful fallback** to the deterministic text, a **login requirement**, and a
**per-user rate limit**. Model overridable via `GEMINI_MODEL` (default `gemini-2.5-flash`).

## 12. Deployment Topology
Browser ⇄ **Vercel** (Next.js app, global edge) ⇄ **Supabase** (Postgres + Auth, cloud).
Git push to `main` → Vercel auto-builds & deploys. Preview deploys per branch.

## 13. Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (public).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key (safe for browser, RLS protects data).
- `SUPABASE_SERVICE_ROLE_KEY` — server-only (never `NEXT_PUBLIC_`); used only in trusted server code if needed.
- `GEMINI_API_KEY` — **server-only** (used only by `/api/advice`); never `NEXT_PUBLIC_`. Optional `GEMINI_MODEL` override.
- Google OAuth configured in the Supabase dashboard (no extra app env var needed).

## 14. Module Map
```
src/
  app/
    layout.tsx          # fonts, providers, MUI cache
    page.tsx            # landing + advisor (public)
    dashboard/page.tsx  # saved assessments (auth-only)
    login/page.tsx      # login / register
    providers.tsx       # ThemeProvider + CssBaseline
    theme.ts            # MUI theme (design tokens)
  lib/
    haus.ts             # calculation + verdict logic (done)
    markets.ts          # per-country currency + assumptions
    supabase/           # client + server helpers
  components/           # AdvisorForm, ResultView, AppHeader, CountrySelect, etc.
```

## 15. Data Flow
1. Visitor uses advisor → `computeResult()` runs in browser → result shown instantly.
2. If logged in, "Save" → server action writes to `assessments` (RLS-scoped).
3. Dashboard reads the user's own `assessments` and renders history.
4. Auth state flows from Supabase through SSR helpers to both server and client components.

## 16. Scalability & Operations
- Expected first users: tens → hundreds. Supabase free tier is ample.
- Fastest-growing table: `assessments` (1 row per saved run). Indexed on `user_id`, `created_at`.
- No files, search engines, webhooks, or scheduled jobs needed yet.
- At 1,000 users: still fine on Supabase/Vercel free–pro tiers; calculations are client-side
  so server load stays low.
- Cost: $0 to start (both free tiers).

## 17. Deferred Decisions (explicit)
- AI advisor + document upload (Days 11–12).
- Real city/locality price data & live interest-rate feeds.
- Savings-goal tracker & re-check reminders/notifications.
- Lender/pre-approval integrations & monetization (Phase 5).
- Custom domain (after first Vercel deploy).
- Multi-tenant / RBAC (only if an admin or team product emerges).
