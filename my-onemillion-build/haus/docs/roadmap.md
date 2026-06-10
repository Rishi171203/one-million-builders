# haus — Roadmap (what's left to build)

_Last updated: 2026-06-10. Deploy is the **last** step, only after the product is genuinely ready._

haus's core promise: an **unbiased, plain-language home-finance advisor** for first-time buyers, global/multi-currency. Everything below is judged against that promise.

---

## ✅ Already built
- Global advisor (5 markets) with deterministic EMI math + a verdict
- Landing page with animations + **real home photography** in every layer
- Auth (email/password; Google button wired) + roles (buyer / owner / admin)
- Save advice + history; buyer dashboard list; admin stats
- Homeowner tools (a *secondary bonus*, not a second audience)
- Dark mode + design polish

---

## 🧠 1. The AI advice layer — _the core missing piece_
Right now every verdict is **deterministic math**, so the wording repeats. The plan (the "hybrid" approach) is: **code keeps doing the math; AI does the language.**

- [ ] **Prereq:** get an Anthropic API key (Rishi's decision — small cost involved)
- [ ] Add a **server-side route** that calls the Claude API (key stays secret on the server, never in the browser)
- [ ] Design the **prompt**: feed it the user's numbers + the math result, ask for a personalized, jargon-free verdict + reasoning + next steps
- [ ] **Stream** the answer so it types out live (feels premium)
- [ ] Tailor the **"jargon explained"** chips to the user's situation
- [ ] Guardrails: keep "guidance, not financial advice"; handle errors/timeouts gracefully; basic cost control

## 🏠 2. More buyer features
- [ ] **Rent vs. buy** depth (this was promoted to a core feature on Day 2)
- [ ] **Compare scenarios** side by side (buy now vs. wait, or two cities)
- [ ] **Edit & re-run** a saved assessment
- [ ] **Visualize** the result (charts: EMI vs. income, down-payment timeline)
- [ ] **"What if" sliders** — change income/rate and watch numbers update live
- [ ] **Share / export** a result (link or PDF)

## 👤 3. Account & infrastructure
- [ ] Enable **Google sign-in** in Supabase (button exists; provider not turned on yet)
- [ ] Email-confirmation flow polish
- [ ] A simple **profile / settings** page

## 🧹 4. Quality, SEO & housekeeping
- [ ] Rename Next 16 `middleware` → `proxy` (small, touches auth routing)
- [ ] SEO metadata (title/description/Open Graph) so haus looks good when shared
- [ ] Accessibility pass + a few tests

## 🚀 5. Deploy (LAST)
- [ ] Only once the above feels complete: deploy to Vercel (Rishi makes a free account; guided)

---

### Suggested order
1 (AI layer) and 2 (buyer features) are the heart of the product, so we lead with those. 3 and 4 fit in alongside. 5 comes only at the very end.
