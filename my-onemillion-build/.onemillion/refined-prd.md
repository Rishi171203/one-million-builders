# Refined PRD

Spec locked on: 2026-06-09

Source PRD: .onemillion/prd.md

## Scope Update (Day 5, 2026-06-10)
Founder + CEO direction: build haus **fully as a deployable global product** before launch
(no rush). The following items, previously "Out of Scope for MVP", are now **IN SCOPE** and
planned in `architecture.md` + `sprints/`:
- **Global, multi-currency** (launch markets: India, USA, Germany, UK, UAE) — replaces the
  Bangalore-only v1. Bangalore/India remains one of the supported markets.
- **User accounts** (register/login via Supabase Auth — email/password + Google).
- **Saved data in a database** (Supabase/Postgres) + a user **dashboard** to view history.
- **Global deployment** via Vercel.
Still deferred: AI advisor + document upload (course Days 11–12), live price/rate data,
lender integrations, savings-goal reminders. The Day 3 spec below remains the core advisory
logic; this update widens reach and adds accounts/persistence around it.

## Day 3 Locked Spec

### MVP Summary
haus v1 is a single-page web advisor for first-time homebuyers in Bangalore
(INR only). The user enters their income, savings, current rent, age, and goal,
and haus returns: a plain-language verdict on whether to buy now or keep renting
/ what they can realistically afford, an EMI simulation, key jargon explained in
plain words, and clear next steps — turning pre-decision confusion into confidence.

### Feature Inventory
| Feature | Scope | Why |
|---|---|---|
| Input form (income, savings, current rent, age, goal) | MVP | Without inputs there's no advice — this is the entry point |
| Affordability calculation (price range you can afford) | MVP | Core value: answers "what can I afford?" |
| EMI simulation (monthly repayment estimate) | MVP | Core value: makes the loan real and concrete |
| Buy-vs-rent / "is it the right time?" verdict | MVP | The #1 entry question, validated by Day 2 evidence |
| Plain-language jargon explainer | MVP | The key differentiator — why haus beats bank tools |
| Clear next steps | MVP | Turns insight into action; user leaves "ready" |
| "This helped me" feedback signal | MVP | Our success KPI — measures felt value |
| Multiple countries / currencies | POST-MVP | Global is the long-term vision, not v1 |
| City-level price data feeds | POST-MVP | Needs data sources/partnerships; not needed to prove value |
| Document upload (builder agreements) | POST-MVP | Complex; the core decision works without it |
| Saved profiles / login accounts | POST-MVP | v1 can prove value in one anonymous session |
| Re-check reminders / long-term guidance | POST-MVP | Useful later; not needed for the first useful loop |

### Functional Requirements
- haus presents a form that captures the user's monthly income, current savings, current monthly rent, age, and their goal/question.
- haus calculates an affordable home-price range from the user's income and savings using standard affordability rules (down-payment %, EMI-to-income limit).
- haus calculates an estimated monthly EMI from a loan amount, a stated interest rate, and a stated loan tenure.
- haus produces a plain-language verdict on whether the user should buy now or keep renting, based on their inputs.
- haus explains key terms (EMI, down payment, tenure, etc.) in plain language inside the result.
- haus displays clear, concrete next steps matched to the verdict.
- haus shows a "this helped me" control the user can click after seeing their result.
- haus states its assumptions (interest rate, tenure, down-payment norm) so the numbers are transparent and trustworthy.

### Core Entities And CRUD
| Entity | Create | Read | Update | Delete / Archive |
|---|---|---|---|---|
| Assessment (user inputs + haus's generated advice) | User fills the form and submits → an assessment is generated | User views the verdict, affordable price range, EMI, explained terms, and next steps | User edits an input (e.g. changes income) and recalculates | User resets the form to start fresh (not persisted beyond the session) |
| Feedback signal ("this helped me") | User clicks the signal after seeing their result | Counted internally as the success KPI | — (single click; not editable in v1) | — (not applicable in v1) |

### Complete Core Flow
Trigger: A first-time buyer in Bangalore, anxious about whether they can/should buy a home, opens haus.
1. User enters their income, savings, current rent, age, and their goal/question.
2. User submits the form.
3. haus calculates affordability + EMI and generates a plain-language verdict (buy now vs. keep renting / what they can afford), with jargon explained and next steps.
4. User reads the result, with key terms explained right where they appear.
5. User clicks "this helped me" (or tweaks an input and recalculates).
Outcome: The user leaves understanding their situation and their best next move — feeling ready instead of anxious.

### Core User Stories
1. As a first-time buyer in Bangalore, I want to enter my income, savings, and rent, so that I can see what home price I can realistically afford.
2. As an anxious first-time buyer, I want a plain-language verdict on whether to buy now or keep renting, so that I feel ready to decide instead of stuck.
3. As someone confused by financial jargon, I want key terms explained as I read my result, so that I understand my situation without Googling.

### Use Cases
- Priya, 26, a software engineer in Bangalore paying ₹35k rent, opens haus on a Sunday evening after another confusing WhatsApp chat with her parents. She enters her details and gets a clear "you can afford up to ₹X, but renting is smarter for ~2 more years" — and finally feels she has an answer.
- Arjun, 29, just got a salary hike and wonders if he can now afford a home loan. He enters his new income and savings, sees the EMI estimate, and realizes exactly what monthly commitment a home would mean for him.
- Rohan, 23, confused after a YouTube rabbit-hole of terms like "EMI" and "down payment," opens haus, reads his result with each term explained in plain words against his own numbers, and finally understands what they actually mean for him.

### Acceptance Criteria
- Given a user has entered income, savings, rent, age, and goal, when they submit the form, then haus displays an affordable home-price range in ₹.
- Given valid inputs, when haus generates a result, then it shows an estimated monthly EMI with the assumed interest rate and tenure clearly stated.
- Given a result is shown, when the user reads it, then a plain-language buy-vs-rent verdict and concrete next steps are visible.
- Given the result contains a financial term (e.g. EMI), when the user views it, then a plain-language explanation of that term appears alongside it.
- Given a result is shown, when the user clicks "this helped me," then the feedback is recorded and the click is acknowledged on screen.
- Given the user changes an input, when they recalculate, then the displayed result updates to reflect the new input.
- Given a required field is empty, when the user submits, then haus shows a clear prompt to fill it instead of producing a result.

### Data Schema
- Assessment:
  - monthly_income: number (₹)
  - current_savings: number (₹)
  - current_rent: number (₹)
  - age: number (years)
  - goal: text (the user's question/goal in their own words)
  - affordable_price_min: number (₹)   [generated]
  - affordable_price_max: number (₹)   [generated]
  - estimated_emi: number (₹ per month)   [generated]
  - verdict: text (plain-language buy-vs-rent answer)   [generated]
  - explained_terms: list of (term: text, explanation: text)   [generated]
  - next_steps: list of text   [generated]
- Feedback:
  - helped: true/false (boolean — true when "this helped me" is clicked)

### Business Rules
- EMI-to-income cap: when calculating affordability, the estimated EMI must never exceed 40% of monthly income (the standard safe-lending limit).
- Down-payment assumption: affordability assumes a minimum 20% down payment of the property price, funded from the user's savings.
- All numbers are transparent: haus must always show its assumptions (interest rate, tenure, down-payment %) alongside any result — never a number with no explanation.
- Currency: all monetary values are in INR (₹) for v1.
- Every term is explained: any financial term shown in a result must have a plain-language explanation available.
- Guidance, not a guarantee: haus provides educational guidance, so every verdict must carry a short "this is guidance, not financial advice" disclaimer.

### KPIs / Success Signals
- "This helped me" rate: the share of users who click "this helped me" after seeing their result (primary felt-value signal).
- Result shares: how many users share or forward their result (word-of-mouth proof of value).
- Re-check / return intent: users who adjust an input and recalculate, or return later when their savings/income change.
  (Vanity metric deliberately avoided: "user completed a session" — finishing is not the same as being helped.)

### Out Of Scope For MVP
- Multiple countries / currencies — Bangalore + INR only in v1.
- User accounts / login / saved profiles — v1 works in a single anonymous session.
- Live city-level property price data — no real listings or price feeds in v1.
- Document upload & analysis (builder agreements, loan papers) — too complex for v1.
- Re-check reminders / notifications / long-term tracking — no follow-up system in v1.
- Specific property recommendations — haus advises on readiness, not which home to buy.
- Connecting to real banks / actual loan applications — guidance only, no transactions.

### Definition Of Done
v1 of haus is done when a first-time buyer in Bangalore can open a single web
page; enter their monthly income, savings, current rent, age, and goal; and
receive a complete result: an affordable home-price range in ₹, an estimated
monthly EMI with stated interest-rate and tenure assumptions, a plain-language
verdict on whether to buy now or keep renting, key financial terms explained in
plain words, and concrete next steps — all shown with a clear "guidance, not
financial advice" note. The user can adjust an input and recalculate, and can
click "this helped me" to signal the result was useful. No login, no stored
data, and no property listings — just the complete advisory loop working
end-to-end for Bangalore in INR.

### Assumptions
- EMI math uses stated default assumptions (~8.5% annual interest, 20-year tenure), shown to the user — not pulled live from banks in v1.
- Affordability uses the 40% EMI-to-income cap and 20% minimum down payment as standard rules.
- v1 is anonymous and single-session (no accounts), per the Day 2 MVP decision.
- "haus" is a working name; the final name/domain is still open (haus.com is taken) and will be decided before launch. This does not block the build.
- AI handles the language part (verdict, jargon, next steps); plain code handles the financial math. Deeper AI scoping happens on Day 11.

### Agent Build Rule
Build agents may implement only the MVP above. If a requested change conflicts with this locked spec, stop and ask before changing scope.
