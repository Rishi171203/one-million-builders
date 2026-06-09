# Screen: Input

Purpose: Collect the user's situation in a calm, low-stress form.

## Layout
- Top `AppBar`: "haus" wordmark left; tagline "Plain-language home-buying advice" right (hidden on mobile).
- Centered `Card` (max-width 560px), comfortable padding (24–32px).
- H1: "Should you buy a home yet?"
- Subtext (secondary): "Tell us your situation. We'll give you a clear, jargon-free answer in seconds."

## Fields (MUI `TextField`)
| Field | Type | Notes |
|---|---|---|
| Monthly income | number | ₹ `InputAdornment`; helper "Your take-home pay per month" |
| Current savings | number | ₹ prefix; helper "What you have set aside today" |
| Current rent | number | ₹ prefix; helper "What you pay in rent now (0 if none)" |
| Age | number | helper "Used to estimate loan tenure" |
| Goal / question | text (multiline) | placeholder "e.g. Should I buy now or keep renting?" |

- Primary `Button` (contained, full-width on mobile): "Get my verdict".
- Footer caption (muted): "Guidance, not financial advice."

## States
- **Empty:** all fields blank; button enabled but validates on press.
- **Partial:** required fields incomplete → inline helper text; button shows gentle nudge.
- **Error:** non-numeric in a number field → `TextField` error + `Alert`: "Please enter an amount in ₹."
- **Loading:** on submit, button shows spinner + label "Crunching your numbers…".

## Responsive
- Mobile: single column, full-width fields and button; app bar tagline hidden.
- Desktop: same card centered with more vertical breathing room.
