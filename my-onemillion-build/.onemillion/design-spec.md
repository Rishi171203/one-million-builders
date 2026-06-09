# haus — Design Spec (Day 4)

Design locked on: 2026-06-09
Source spec: .onemillion/refined-prd.md

## Design Direction (learner decisions)
- **Device strategy:** Balanced responsive (works equally well on phone and desktop).
- **Visual direction:** Premium & polished.
- **Primary/seed color:** Indigo `#4F46E5`.
- **Copy tone:** Calm, refined, reassuring — premium but plain-spoken.
- **Density:** Comfortable / generous spacing.
- **Navigation:** Simple top app bar (logo + minimal).
- **Fonts:** Plus Jakarta Sans (headings) + Inter (body).
- **Component kit:** MUI / Material Design 3.

## Primary User Flow (the one flow we make excellent)
Trigger: An anxious first-time buyer in Bangalore opens haus.
1. They see a calm, single-column input form (income, savings, current rent, age, goal).
2. They fill it in and press "Get my verdict".
3. haus shows a brief loading state while it calculates.
4. The result appears: a plain-language verdict, affordable price range, EMI estimate,
   jargon explained, and clear next steps — with assumptions shown and a guidance disclaimer.
5. They click "This helped me" (or tweak an input and recalculate).
Outcome: They leave feeling ready instead of anxious.

## Screen Inventory
| Screen | Purpose | Priority |
|---|---|---|
| Input screen | Collect the user's situation | MVP (primary) |
| Result screen | Deliver verdict + EMI + jargon + next steps | MVP (primary) |

(For v1 these are two sections of one responsive page — input on top, result below — so the
user never loses context. No login, no other screens.)

## Screen-Level Layout Notes

### Input screen
- Top app bar: "haus" wordmark (left), one-line tagline/trust note (right on desktop, hidden on mobile).
- Centered single-column card (max ~560px wide) with generous padding.
- Heading: "Should you buy a home yet?" + calm subtext.
- Fields (MUI TextField): monthly income (₹), current savings (₹), current rent (₹), age,
  goal (multiline text). Currency-prefixed inputs (₹) with helper text.
- Primary button (full-width on mobile): "Get my verdict".
- Quiet footer note: "Guidance, not financial advice."

### Result screen
- A verdict Card at the top: big plain-language verdict line + a colored status chip
  (e.g. "Rent for now" / "You're ready to buy").
- Affordability Card: affordable price range (₹X–₹Y) shown prominently.
- EMI Card: estimated monthly EMI + the assumptions used (interest %, tenure, down-payment %).
- "Jargon explained" section: each term as a Chip; tapping shows a plain-language Tooltip/Accordion.
- "Next steps" list: 2–4 concrete, numbered actions.
- Assumptions + disclaimer block (muted).
- "This helped me" button (success Snackbar on click) + "Edit my details" (scrolls back to form).

## Responsive Behavior
- **Mobile (<600px):** single column; full-width cards and buttons; app bar tagline hidden;
  comfortable vertical spacing; sticky primary button optional.
- **Tablet (600–900px):** single column, wider card; result cards may sit 1-up still for focus.
- **Desktop (>900px):** centered max-width layout (~720px content column) so lines stay readable;
  result cards can pair 2-up (Affordability + EMI side by side); ample whitespace around content.

## MUI Component Mapping
| UI piece | MUI component |
|---|---|
| Top bar | `AppBar` + `Toolbar` |
| Form container / cards | `Card` / `Paper` |
| Inputs | `TextField` (with `InputAdornment` for ₹) |
| Submit / actions | `Button` (`variant="contained"` / `"text"`) |
| Verdict status | `Chip` |
| Jargon terms | `Chip` + `Tooltip` (or `Accordion` for longer notes) |
| Next steps | `List` / `ListItem` |
| Loading | `Skeleton` + `LinearProgress` |
| Errors / validation | `Alert` + `TextField` error state |
| "This helped me" confirmation | `Snackbar` |

## Content States (every screen, never looks broken)
- **Empty:** fresh form, no result shown yet; gentle prompt "Fill this in to see your verdict."
- **Loading:** submit pressed — button shows spinner; result area shows `Skeleton` placeholders + "Crunching your numbers…".
- **Partial:** some fields filled; "Get my verdict" disabled until required fields are valid; inline helper text.
- **Error:** invalid input (e.g. letters in income) → `TextField` error + `Alert` "Please enter a number in ₹." No result generated.
- **Full:** complete result rendered (verdict, price range, EMI, jargon, next steps, assumptions).
- **Success:** user clicks "This helped me" → `Snackbar` "Glad it helped 💙" and the signal is recorded.
