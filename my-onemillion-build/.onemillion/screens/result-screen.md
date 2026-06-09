# Screen: Result

Purpose: Deliver a clear verdict and the supporting numbers, with jargon explained.

## Layout (stacked cards below the form)
1. **Verdict Card**
   - H2 verdict line, e.g. "Renting is the smarter move — for now."
   - Status `Chip`: "Rent for now" (warning) or "You're ready to buy" (success).
   - One-paragraph plain-language explanation.
2. **Affordability Card**
   - Big number: affordable price range "₹38L – ₹46L".
   - Short note on how it was derived.
3. **EMI Card**
   - Estimated monthly EMI "₹32,500/mo".
   - Assumptions line: "Assumes 8.5% interest, 20-year tenure, 20% down payment."
4. **Jargon explained**
   - Each term a `Chip` (EMI, Down payment, Tenure, Pre-approval). Tap → `Tooltip`/`Accordion`
     with a plain-language definition tied to the user's numbers.
5. **Next steps** (`List`, numbered): 2–4 concrete actions.
6. **Assumptions + disclaimer** (muted `Paper`): full assumptions + "Guidance, not financial advice."
7. **Actions:** "This helped me" `Button` (→ success `Snackbar`); "Edit my details" (scrolls to form).

## States
- **Loading:** `Skeleton` placeholders for each card + `LinearProgress`.
- **Full:** all cards populated.
- **Success:** "This helped me" clicked → `Snackbar` "Glad it helped 💙"; feedback recorded.

## Responsive
- Mobile: cards stack 1-up, full width.
- Desktop (>900px): Affordability + EMI cards can sit side-by-side (2-up); verdict full-width on top.
