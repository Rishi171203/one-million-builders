# haus — Founder's Master Brief
*Your personal "know-everything" guide to explain haus to the CEO with confidence.*

> Read this end-to-end once. It's written so that by the end you can answer almost any question
> about **what** haus is, **why** each feature exists, **who** it's for, **how** it's built, and
> **how it could make money** — in your own words.

---

## 0. The 15-second pitch (memorize this)

> **"haus is a free, unbiased, plain-language advisor that tells first-time homebuyers the two
> things they're most anxious about — *what can I afford?* and *should I buy now or keep
> renting?* — in seconds, in their own currency, with every bit of jargon explained. It's honest
> by design: it makes money from partners and businesses, never by pushing you toward a loan."**

If you only remember one line, remember that.

---

## 1. The problem we're solving

Buying a first home is the **biggest financial decision most people ever make** — and the advice
around it is broken:

- **Bank calculators are biased.** They're designed to get you to take the biggest loan, not to
  tell you honestly whether you *should* buy.
- **Agents and relatives push opinions**, not math tailored to *your* numbers.
- **It's drowning in jargon** — EMI, down payment, tenure, LTV, pre-approval — so people feel
  stupid and freeze.
- **The core question goes unanswered:** *"Can I actually afford this, and is now the right time —
  or am I better off renting a bit longer?"*

The result is **anxiety and paralysis.** People either over-borrow, or stall for years out of fear.

**Evidence it's real:** we validated this on two viral Reddit threads of Bangalore techies arguing
about exactly this ("should I buy now or keep renting?") — hundreds of confused, anxious comments.
That confusion *is* our market.

---

## 2. Who it's for

**Primary audience (the whole product is built around them): first-time homebuyers.** People who
don't own a home yet and are trying to decide if/when to buy. Global — we launch in **5 markets:
India, USA, Germany, UK, UAE** (note: *haus* = "house" in German).

Three personas we design for:
- **Priya, 26** — engineer paying rent, confused by conflicting advice from parents. Wants a clear
  "you can afford ₹X, but renting is smarter for ~2 more years."
- **Arjun, 29** — just got a raise, wonders if he can afford a loan now. Wants to *see* the EMI.
- **Rohan, 23** — lost in a YouTube rabbit hole of jargon. Wants terms explained against his own
  numbers.

**Secondary (bonus, NOT a second business): existing homeowners.** A bonus toolkit (prepay,
refinance, equity, sell-vs-rent). It exists to re-engage buyers *after* they purchase — but it must
never steal focus from the first-time-buyer core. (This was a deliberate decision — "Option B".)

---

## 3. What makes haus different (the moat)

| Others | haus |
|---|---|
| Bank tools push the biggest loan | **Unbiased** — the math is honest; it'll tell you to *keep renting* if that's smarter |
| Full of jargon | **Plain language** — every term explained against your numbers |
| One-size country | **Your country & currency** — local rates, down-payment norms, lakh/crore vs. M/K |
| Generic | **AI-personalized** verdict that speaks to *your* situation |
| Paid / locked | **Free** for the user |

The combination — **free + unbiased + plain-language + AI-personalized + multi-country** — is hard
to copy without giving up the bank's profit motive. That honesty is the brand.

---

## 4. Every feature — what it is, why it exists, what it solves

### The core advisor (the MVP — the heart of haus)
- **Affordability range** — *"You can afford ₹85L–₹1.05Cr."* Answers *"what can I afford?"* using
  a safe lending rule, not the maximum a bank would lend.
- **EMI estimate** — the monthly payment, so the loan feels real and concrete.
- **Buy-now-vs-keep-renting verdict** — the #1 question people actually have.
- **Plain-language jargon explainer** — tap any term (EMI, down payment, tenure…) → a clear
  explanation *using your own numbers*. This is the differentiator.
- **Clear next steps** — turns insight into action ("get a pre-approval", "save ₹X more").
- **"This helped me" button** — our success signal (do users feel genuinely helped?).
- **"Guidance, not financial advice" disclaimer** — trust + legal safety on every result.

*Why it matters:* this loop turns pre-decision confusion into confidence in under a minute. That
felt-value is the entire point.

### AI personalization (Google Gemini — the "hybrid")
- The verdict, next steps, and jargon are **written by AI** so they're warm and personal, not canned.
- **The hybrid principle (KEY talking point):** *our code does ALL the math; the AI only writes the
  language.* We pass the exact numbers into the AI so **it can never invent or change a figure.**
- If the AI is unavailable, it **silently falls back** to reliable built-in text — haus never breaks.

*Why it matters:* you get the warmth of AI with the trustworthiness of deterministic math. (This is
the answer to "but doesn't AI hallucinate?" — see Q&A.)

### Rent-vs-buy over time (+ chart + "what-if" sliders)
- Goes beyond *affordability* to the deeper question: *over the next N years, am I richer buying, or
  renting and investing the difference?* Shows a chart of both paths and where they cross.
- Sliders let users test their *own* assumptions (home growth, rent rise, investment return).

*Why it matters:* it **proves we're unbiased** — for India's high price-to-rent it often says
*rent + invest wins*; for the US it often favors buying. A biased tool would never say "don't buy."

### Compare scenarios (buy now vs. wait & save)
- Shows how waiting a couple of years and saving more changes your budget. Helps the anxious "should
  I wait?" user see the trade-off, not just guess.

### Accounts, save & history, dashboard
- Save a verdict → it appears on your **dashboard** as history; **edit & re-run** as your numbers
  change. People's situations change; haus becomes a tool they return to.

### Share / export
- Copy a shareable link or save a clean PDF — for word-of-mouth and for showing family/a lender.

### Homeowner tools (secondary bonus)
- For people who already own: **prepay** (interest saved + loan-free sooner), **refinance** (switch
  to a lower rate), **equity tracker** (how much you truly own), **sell-vs-rent-out** (cash now vs.
  rental income). Re-engages users after they buy.

### Roles + the Builder (admin) dashboard
- Three account types: **Homebuyer**, **Homeowner**, **Builder/Admin (you)**. Each lands on its own
  dashboard. The **Builder dashboard** is your internal cockpit — live user counts, saved
  assessments, recent activity — so you can see the product working. (Not customer-facing.)

### Multi-currency / global
- Five markets, each with its own currency, interest rate, down-payment norm, and number formatting
  (Indian lakh/crore vs. Western M/K). Same honest engine, localized.

### Design & brand
- Premium, animated, dark-mode UI and a real **logo** (the "h-roof" mark — the letter *h* whose
  shoulder is a house roof). *Why it matters for a CEO:* it signals this is a **product**, not a
  prototype — and trust is the brand, so it has to *look* trustworthy.

---

## 5. How it works — the architecture, in plain language

Think of haus as **five Lego pieces** that snap together:

1. **Next.js** — the website framework (the pages, the routing, the server bits). React under the hood.
2. **MUI + Framer Motion** — the *look* (polished components) and the *motion* (animations).
3. **Supabase** — two things in one: the **database** (stores users + saved advice) and **login**
   (email/password + Google sign-in). It's a managed Postgres database in the cloud.
4. **Google Gemini** — the **AI** that writes the language (only on our server, never in the browser).
5. **Vercel** — where the website will be **hosted** (deployed) so it has a public URL.

**The journey of one verdict (data flow):**
1. A logged-in user fills the advisor form (income, savings, rent, age, goal).
2. **The math runs instantly in their browser** (`computeResult` — a pure function): affordable
   price range, EMI, buy-vs-rent status. This is fast and free.
3. The browser asks **our server** (`/api/advice`) to make it personal; the server calls **Gemini**
   with the numbers and gets back warm language; if Gemini's down, it uses the built-in text.
4. If the user clicks **Save**, the verdict is written to **Supabase** (their private row).
5. Their **dashboard** reads back only *their* saved rows and shows the history.

**The two ideas that make it trustworthy (great talking points):**
- **Hybrid (math in code, language in AI)** — accuracy you can stand behind + warmth users love.
- **Security by the database, not just the screen (RLS)** — see next section.

---

## 6. Security & trust (a CEO *will* ask)

- **Row-Level Security (RLS):** the database itself enforces that a user can only ever read/write
  **their own** data — even if someone tampered with the app, the database blocks it.
- **Roles can't be faked:** we found and fixed a hole where a user could make themselves an admin;
  now the admin role can only be granted by you, in the database. (We caught this in our own code
  review — a sign of a careful build.)
- **The AI endpoint is protected:** it requires login and is rate-limited, so nobody can abuse it.
- **Secrets stay on the server** (the AI key, etc.) — never shipped to the browser.
- **Inputs are validated** and the app is safe against common web attacks (no script injection,
  no open redirects).
- **"Guidance, not financial advice"** on every result — honest positioning + liability safety.
- **Tested:** 23 automated tests on the core math + 4 browser tests on the key flows + a robot (CI)
  that re-runs the tests on every change.

---

## 7. The numbers behind the advice (so you can explain the math)

haus uses **transparent, standard lending rules** (shown to the user — never a black box):
- **EMI ≤ 40% of monthly income** (the safe-lending cap).
- **20% minimum down payment** (15% in the UK), funded from savings.
- **Loan tenure** = years to retirement, capped between 5 and 20.
- **Affordable price** = the *lower* of what your income supports (via the EMI cap) and what your
  savings can cover (the down payment). If **savings** is the limit → verdict leans "keep renting &
  save"; if income supports it → "ready to buy."

Per-market assumptions (verify before launch — they're reasonable defaults, shown to users):

| Market | Currency | Interest (assumed) | Down payment | EMI cap |
|---|---|---|---|---|
| India | ₹ | 8.5% | 20% | 40% |
| USA | $ | 7.0% | 20% | 40% |
| Germany | € | 3.8% | 20% | 40% |
| UK | £ | 5.0% | 15% | 40% |
| UAE | AED | 4.5% | 20% | 40% |

---

## 8. How haus could make money (honest)

The constraint: **free for users + unbiased.** Within that, the realistic paths (best-first for us):

1. **B2B / white-label (most realistic now):** license haus to a **bank, broker, real-estate, or
   fintech** company to embed as a branded lead-magnet → recurring license fee. *Your CEO demo is
   literally this pitch.* It needs **one** company to say yes, not millions of users.
2. **Lead-gen / referral partnerships:** when a user is "ready to buy", connect them to a vetted
   partner lender/broker for a referral fee — *shown only after the unbiased verdict, and disclosed.*
   (Regulated; a later, bigger step.)
3. **Freemium:** core advice stays free; charge for extras (detailed reports, "talk to an advisor",
   homeowner portfolio tools).
4. **Affiliates:** credit-score, home insurance, listings.
5. **Ads:** ❌ skip — low value, cheapens the trustworthy brand.

**Honest caveats:** no users yet = no B2C revenue yet (B2B works without users); the free AI tier
costs money at scale; financial referrals are regulated. The fastest real money is **selling it to
a business.**

---

## 9. What's built vs. what's next

**Built, reviewed, and tested:** the full advisor, AI personalization, rent-vs-buy + what-if +
compare, save/history/dashboard, accounts (email + Google), roles, homeowner tools, multi-currency,
premium UI + brand logo, security hardening, automated tests + CI, and reconciled PRD/architecture.

**Next:** **Deploy** to Vercel (public URL) → production QA → get it in front of users → grow.

**Future roadmap (say "later, deliberately deferred"):** document upload (loan papers), live
interest-rate/price feeds, lender integrations, savings-goal reminders, a custom domain.

---

## 10. Q&A prep — the questions a CEO will ask (and your answers)

**Q: If it's free, how does it make money?**
A: We don't charge the user — that's the trust moat. Revenue comes from businesses: licensing it as
a branded lead-gen tool (B2B), and later vetted, disclosed lender referrals. The demo today *is* the
B2B pitch.

**Q: Doesn't AI make up numbers / give wrong advice?**
A: No — and this is by design. Our **code** does 100% of the math; the AI only writes the *wording*,
and we feed it the exact figures so it can't change them. If the AI fails, we fall back to reliable
built-in text. Plus every result says "guidance, not financial advice."

**Q: How is this different from a bank's calculator?**
A: Banks optimize for the biggest loan. We optimize for the *honest* answer — we'll literally tell
someone to keep renting if that's smarter (our rent-vs-buy proves it). That honesty is the brand.

**Q: Why must users log in?**
A: It makes every user a real, known account — so we can save their history, let them return, and
(later) connect them to partners. It also keeps the AI from being abused. The homepage still sells
the value before they sign up.

**Q: Is the data safe?**
A: Yes — the database itself (not just the screen) enforces that users only see their own data
(Row-Level Security), secrets stay server-side, and we ran a security review that *found and fixed*
a real issue before launch.

**Q: Can it scale / what does it cost?**
A: It runs on free tiers to start (Vercel + Supabase). The math runs in the browser, so server load
stays low. The main scaling cost is the AI as usage grows — which the revenue model covers.

**Q: What's the moat — can't anyone copy it?**
A: The honest, free, unbiased positioning is hard for incumbents to copy without hurting their loan
profits. Combined with multi-country localization and the plain-language UX, it's a trust brand,
not just a calculator.

**Q: What's the one metric you watch?**
A: The **"this helped me"** rate — did the user feel genuinely helped? Finishing a session isn't
success; *feeling helped* is.

---

## 11. Suggested 3-minute live demo flow

1. Open the **homepage** — "here's the pitch: unbiased home advice, free, in your currency." Show the
   brand + motion (signals it's a real product).
2. **Register / log in** — "every user gets an account so we can save their journey."
3. **Run the advisor** — enter real numbers → show the **AI verdict**, the **affordable range +
   EMI**, and **tap a jargon term** to show plain-language explanations.
4. Scroll to **rent-vs-buy** — drag a slider → "see, it's honest: it'll say *rent* when renting wins."
5. **Save** it → open the **dashboard** → "they come back as life changes."
6. (If asked) show **homeowner tools** and the **Builder dashboard** (your analytics cockpit).
7. Close with the **business line:** "free for users, monetized via B2B + partners — and you could
   be the first to use/own it."

---

*You built this. You understand every layer. Walk in and own it. 🙌*
