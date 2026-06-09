# haus — Product Requirements Document

> **Status:** Day 1 created the first-pass PRD. Day 2 (in progress) is
> pressure-testing it with the owner review, real-user evidence, competitors,
> ICP, MVP scope, and a Keep/Refine/Pivot verdict.

---

## Day 2 Learner Review

Reviewed on: 2026-06-08
Status: Needs refinement (narrowing scope; pain confirmed strong in the right market)

What I changed:
- **Narrowed the launch market to Bangalore.** "Global" is a vision, not a v1
  market — loan systems, currencies, and trust levels differ too much by country.
  Global stays as the long-term ambition; v1 ships for one city.
- **Sharpened the pain statement:** the pain is strongest where home prices are
  high relative to salaries AND financial literacy is low. Bangalore fits; a
  generic "global" framing dilutes this.
- **Rewrote user story #2.** "Explain the jargon" was a feature, not a story. It
  is now folded into the whole experience as a plain-language quality.
- **Replaced vanity KPIs.** "User completes a session" does not prove value. New
  KPIs measure felt value (a "this helped me" signal, sharing the result).
- **Made the market claim honest.** Dropped the inflated "hundreds of millions"
  TAM. Honest, still-large anchor: ~10M urban professionals aged 22–32 in
  Bangalore actively thinking about housing.

What I still need to validate (Day 2 outreach):
- Is the confusion painful enough that people would use an advisor vs. just Googling?
- Would target users trust an AI for financial guidance, and what builds that trust?
- Is "is it the right time to buy?" actually the most common entry question?
- Are income/savings/city/goal enough inputs for a genuinely useful first answer?

---

## Day 2 Validation Evidence

### Evidence 1: Anonymous Bengaluru techie (~30), young working professional
Date: 2026-06-09
How: Public forum analysis (viral Reddit thread, via news coverage)

Current workflow:
Posted their financial situation on Reddit and asked anonymous strangers
whether to buy or keep renting. No trusted advisor involved.

Pain evidence:
Stuck on "buy now vs. keep renting" — unsure if it's the right time to buy.
Earning well but still unable to confidently make the decision alone.

Reaction to PRD workflow:
N/A (observed thread, not interviewed) — but the behaviour confirms demand for
a trusted, unbiased advisor for exactly this decision moment.

Missing use cases:
Strengthens the case that rent-vs-buy must be a CORE haus feature, not optional.

Data reality:
Their decision hinged on income, monthly rent, how long they'd stay, and
relocation odds — all inputs haus can realistically capture.

Direct quote or specific observation:
A high-earning professional turned to anonymous Reddit strangers for a major
financial decision — proof that no trusted, plain-language advisor exists for them.

PRD implication: Refine — promote rent-vs-buy to a core feature; the "is it the
right time?" entry question is confirmed.

Source: https://www.business-standard.com/finance/personal-finance/live-on-rent-or-buy-home-for-rs-1-8-cr-loan-bengaluru-techie-asks-reddit-125091000546_1.html

### Evidence 2: Anonymous Bengaluru techie (24), early-career tech professional
Date: 2026-06-09
How: Public forum analysis (viral Reddit thread, via news coverage)

Current workflow:
Bought a ₹1.22cr flat at 24 — financed 65% by loan, 35% cash — but relied on
his parents for the upfront money and guidance on the loan part.

Pain evidence:
A young first-time buyer could not confidently handle the home-loan side alone
and depended on family to bridge the knowledge and money gap.

Reaction to PRD workflow:
N/A (observed thread) — behaviour confirms young buyers need help understanding
loans/EMIs and lean on whoever they trust because no neutral tool exists.

Missing use cases:
Confirms plain-language loan/EMI explanation is essential for the youngest end
of the 22–32 target; "family as advisor" is the workaround haus competes with.

Data reality:
Decision involved loan amount, down-payment split, and parental support — the
affordability inputs haus already plans to capture.

Direct quote or specific observation:
Even a financially capable 24-year-old leaned on parents for the loan part —
showing the knowledge gap haus is built to close.

PRD implication: Keep — confirms plain-language loan/EMI explanation as a core
haus value; "family as advisor" is the workaround haus replaces.

Source: https://www.businesstoday.in/latest/trends/story/bengaluru-techie-24-stuns-reddit-with-rs-122-crore-flat-purchase-shares-how-he-did-it-484726-2025-07-15

---

## Day 2 Competitors And Workarounds

| Alternative | What it solves | What it does well | Gap | PRD implication |
|---|---|---|---|---|
| Bank/lender EMI calculators (HDFC, SBI) | Gives loan repayment numbers | Accurate math, free, instant | Biased toward selling loans; no "should you?" guidance; jargon unexplained | Keep accurate EMI math, but add the unbiased plain-language verdict they lack |
| Real-estate portals (MagicBricks, 99acres, NoBroker) | Finding properties to buy | Huge listings inventory | About properties, not financial readiness or rent-vs-buy | haus advises before you shop — complements, doesn't compete |
| YouTube / finance creators | General money education | Free, engaging, lots of it | Generic — not personalised to your numbers | haus personalises to the user's actual situation |
| Asking parents/family (manual) | A trusted gut-check | Emotionally trusted, free | Knowledge often outdated/limited; varies wildly by family | haus = a neutral, finance-literate "family" that's always available |
| Asking Reddit strangers (manual) | Crowd opinions | Real lived experiences, free | Anonymous, conflicting, not personalised, can mislead | haus = trustworthy, personalised alternative to crowd-guessing |

---

## Day 2 ICP And Market Sanity

### Ideal Customer Profile
A 24–30 year old salaried professional in Bangalore (often in tech), earning
enough to consider buying but with no trusted, neutral guidance. Financially
capable but not financially confident about home-buying.

### Painful Workflow
Trying to decide "should I buy now or keep renting?" and "what can I actually
afford?" — by piecing together answers from Reddit, parents, YouTube, and biased
bank calculators, none of which give a clear personalised verdict.

### Current Workaround
Asking Reddit strangers, leaning on parents/family, watching YouTube, and using
bank EMI calculators — fragmented, biased, or impersonal sources.

### Data They Have
Their own income, savings, current rent, and a rough goal/timeline. No
structured way to turn it into a confident decision.

### Why They Care Now
They're at a life stage (mid-20s to early-30s, earning, maybe settling down)
where the buy-vs-rent decision feels urgent and high-stakes — and getting it
wrong costs years or lakhs.

### Why They Are Reachable
They already gather online — Reddit, personal-finance communities, YouTube,
WhatsApp groups — actively discussing this exact decision. haus can reach them
where they already ask these questions.

### TAM / SAM / SOM
- TAM: Urban professionals in India who will consider buying a first home
  (large, treated directionally — not a precise claim).
- SAM: Young urban professionals (22–32) in major Indian metros where home loans
  are common and researched online.
- SOM: ~10M urban professionals aged 22–32 in Bangalore actively thinking about
  housing — reachable via online communities and word-of-mouth.

---

## Day 2 MVP Decision

### Full Product Vision
A multi-city, multi-currency AI home-finance advisor: affordability + EMI math,
rent-vs-buy verdicts, jargon explained, document upload (builder agreements),
city-level price data, saved profiles, and personalised long-term guidance.

### Minimum Viable Product
A single-page web advisor for Bangalore (INR only): the user enters their
situation and gets back a plain-language verdict on buy-vs-rent / affordability,
an EMI simulation, jargon explained, and clear next steps.

### First Build Loop
1. User enters income, savings, current rent, age, and their goal/question.
2. haus calculates affordability + EMI and returns a plain-language verdict
   (buy now vs. keep renting / what you can afford), with jargon explained and
   next steps.
3. User leaves understanding their situation — feeling ready instead of anxious.

### Must Have For MVP
- Simple input form: income, savings, current rent, age, goal.
- Affordability + EMI math (plain code, with stated interest/tenure assumptions).
- A plain-language verdict on buy-vs-rent / "is it the right time?".
- Jargon explained in plain language.
- Clear, concrete next steps.

### Not In MVP
- Multiple countries/currencies (Bangalore + INR only for v1).
- City-level price data feeds.
- Document upload (builder agreements).
- Saved user profiles / login accounts.
- Anything beyond the single advisory conversation.

### MVP Success Criteria
A real Bangalore 22–32 user enters their info, gets a verdict they find clear
and genuinely useful, and feels more confident about their decision.

### KPI / Key Goal For MVP
- A user clicks a "this helped me" signal after getting their result
  (felt-value, not just "session completed").

---

## Day 2 Validation Update

Verdict: Refine

What the evidence confirmed:
- The core pain is real: young Bangalore professionals face the buy-vs-rent /
  "is it the right time?" decision with no trusted, neutral guidance.
- Current workarounds (Reddit strangers, parents, biased bank tools) are exactly
  as weak as assumed — confirming the gap haus fills.
- Plain-language loan/EMI help is essential, even for capable young earners.

What the evidence challenged:
- "Global from day one" — real evidence is city-specific; a focused Bangalore
  launch is far more credible than a vague global claim.
- Rent-vs-buy as an optional/secondary feature — evidence shows it's the CORE
  entry question, not an add-on.

Missing use cases:
- None that break the concept; rent-vs-buy is now promoted to core rather than
  treated as optional.

PRD changes made:
- Narrowed v1 launch market to Bangalore (global kept as long-term vision).
- Promoted rent-vs-buy to a core MVP feature.
- Added real forum-based validation evidence, competitor table, ICP, and a
  scoped MVP (Bangalore + INR only).

MVP decision:
- First build: a single-page Bangalore web advisor that turns income/savings/
  rent/goal into a plain-language buy-vs-rent verdict + EMI simulation + jargon
  explained + next steps.
- Moved out of MVP: multi-country/currency, price-data feeds, document upload,
  saved profiles/login.

Final decision:
The PRD is ready to continue. Real user behaviour confirmed the core pain and
the rent-vs-buy decision moment, while pushing haus to focus on one credible
launch market (Bangalore) and a tightly-scoped first build. The idea is sound;
the plan is now sharper and more buildable.

---

## Idea Brief

### Raw Idea
An AI-powered home-finance advisor for first-time buyers worldwide. You describe
your situation (salary, savings, city/country, goal), and it breaks down your
options, explains every term, simulates loan repayments (EMI/mortgage) in your
local currency, and gives a personalised recommendation — like a smart, unbiased
financial friend who knows real estate.

### User
**v1 launch market: Bangalore.** A first-time homebuyer or renter in Bangalore —
young, working professional, 22–32 years old, navigating one of the biggest
financial decisions of their life with zero trusted guidance. (Long-term vision:
expand city by city; "global" is the ambition, not the v1 scope.)

### Pain Point / Unmet Need
They don't understand home loans, EMIs, builder agreements, hidden charges, or
whether to rent vs. buy. They Google it, get overwhelmed, ask relatives who give
conflicting advice, and either make a bad decision or delay for years. They need
a trusted, plain-language advisor that looks at *their* situation and tells them
clearly what they can afford and what their best move is.

### Current Workaround
Biased bank agents, random YouTube videos, confused WhatsApp-group advice, or
doing nothing at all.

### Data Sources / Formats
- User-entered text: age, monthly income, current savings, city/country, and
  their main question/goal.
- (v1) Built-in financial logic for affordability and loan-repayment math
  (interest-rate assumptions, loan tenure, down-payment norms), with
  country/currency selectable so the math fits the user's market.
- (Later, not v1) City-level price data, document upload (builder agreements),
  saved user profiles.

### Ideal Solution
A web-based AI advisor: the user describes their situation in plain words, and
haus returns a clear verdict, an affordable price range, an EMI simulation,
jargon explained in plain language, and concrete next steps.

### Usage Moment
A 25-year-old (e.g. in Bangalore earning ₹60k/month with ₹2 lakh saved, or an
equivalent young buyer in any country/currency) opens haus, asks *"Is it the
right time to buy?"*, and closes the app feeling **ready** — confident about
their situation instead of anxious and confused.

### People / Roles
- Primary user: the first-time buyer/renter (single-user product for v1).

### User Stories
1. As a young first-time buyer, I want to enter my income, savings, and city, so
   that I can see what I can realistically afford.
2. As a first-time buyer, I want my results explained in plain language as I go,
   so that I never feel lost or need to Google anything.
3. As an anxious decision-maker, I want a clear verdict on whether it's the right
   time to buy, so that I feel ready to act instead of stuck.

### Success Criteria
A 25-year-old in Bangalore can enter their income, savings, and city, ask "is it
the right time to buy," and get back: a plain verdict, an affordable price range,
an EMI simulation, explained jargon, and clear next steps — and leave feeling
they understand their situation.

### KPIs
- **Felt value:** a user clicks a "this helped me" signal after getting their result.
- **Word of mouth:** a user shares or forwards their result.
- **Return intent:** a user comes back to re-check when their savings or income change.
  (Vanity metric to avoid: "user completed a session" — completion ≠ value.)

---

## 1. Product Summary
haus is an unbiased, plain-language AI home-finance advisor for first-time buyers
worldwide. Users enter their financial situation, country/currency, and a
question; haus replies with a verdict, an affordable price range, a loan-repayment
simulation, explained jargon, and next steps — turning confusion into confidence.

### What the AI actually does (vs. plain code)
- **Plain code (not AI):** loan-repayment / EMI / affordability math from formulas.
- **AI:** understands free-text input, weighs the situation into a plain-language
  verdict, explains jargon in context for this user, and writes personalised next
  steps. The AI does the *human* part; code feeds it accurate numbers.
  *(Deeper AI scoping happens on Day 11.)*

## 2. User and Pain Point
**User (v1):** First-time homebuyers/renters in **Bangalore**, 22–32, young
working professionals. (Global is the long-term vision, not the v1 market.)
**Pain:** Home-buying is overwhelming and jargon-heavy; existing advice is biased
(bank agents) or unreliable (YouTube, WhatsApp, relatives), leading to bad
decisions or years of delay. The pain is sharpest where home prices are high
relative to salaries **and** financial literacy is low — Bangalore fits.

## 3. Unmet Need
A trusted, unbiased, plain-language advisor that looks at the user's *specific*
situation and clearly tells them what they can afford and what their best next
move is.

## 4. Data Sources and Formats
- v1: user-entered income, savings, city, age, and goal; built-in affordability
  and EMI logic with stated interest/tenure assumptions.
- Later: city price benchmarks, document upload, saved profiles.

## 5. Ideal Solution
A web app with an AI advisory core (hybrid). Plain-text input in, structured
plain-language guidance out.

## 6. Usage Moment
Pre-decision confusion: "Should I / can I buy, and is now the time?" User leaves
feeling **ready**.

## 7. User Stories
(See Idea Brief above — 3 core stories.)

## 8. Success Criteria
(See Idea Brief above.)

## 9. KPIs
(See Idea Brief above.)

## 10. Competitive Alternatives and Market Notes  *(FIRST-PASS ASSUMPTIONS — verify Day 2)*
- **Bank/lender EMI calculators** (HDFC, SBI, etc.): do the math but are biased
  toward selling loans and don't give plain-language "should you" guidance.
- **YouTube / personal-finance creators:** general, not personalised.
- **Real-estate portals** (MagicBricks, 99acres, NoBroker): focus on listings,
  not financial-readiness advice.
- **haus.com (US):** a shared-equity *financing product* (co-invests in your
  home) in the USA — a different category and market, **not a direct competitor**,
  but the **name/domain is taken**. Name decision deferred to Day 2.
- **Gap haus fills:** unbiased, personalised, plain-language *advice* for the
  confused pre-decision moment — globally, adapting to the user's country and
  currency, starting with one focused launch market.

## 11. TAM / SAM / SOM  *(refined Day 2 — honest, not inflated)*
- **TAM:** Urban professionals in India who will consider buying a first home
  (large, but not claimed as a precise number — treated directionally).
- **SAM:** Young urban professionals (22–32) in major Indian metros who research
  home-buying online where home loans are common.
- **SOM (what matters now):** ~10M urban professionals aged 22–32 in **Bangalore**
  actively thinking about housing — reachable via online communities and
  word-of-mouth. Honest and still large. Focused first launch beats a vague
  global claim.

## 12. Assumptions to Validate on Day 2
- Is the pain strong enough that people would use an advisor (vs. just Googling)?
- Do target users trust an AI for financial guidance — what builds that trust?
- Are income/savings/city/goal enough inputs for a *useful* first answer?
- Is "is it the right time to buy" the most common entry question?
- Should rent-vs-buy be added back as a core feature?
- What's the right name/domain given haus.com is taken?
- **Global scope:** which *first* market/country do we launch in, and how do we
  keep the loan math accurate per country (currency, interest rates, down-payment
  and tax rules differ)? Global vision vs. focused first launch.
- Are the loan-repayment/affordability assumptions realistic for the chosen
  launch market?
