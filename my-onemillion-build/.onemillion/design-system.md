# haus — Design System (Day 4)

Seed color: Indigo `#4F46E5` (Material Design 3 tonal palette derives from this seed).
Direction: Premium & polished. Comfortable density.

## Color Tokens

### Light mode (default)
| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#4F46E5` | Primary actions, links, brand |
| `--color-primary-hover` | `#4338CA` | Hover/pressed primary |
| `--color-primary-container` | `#E0E7FF` | Soft primary backgrounds, chips |
| `--color-on-primary` | `#FFFFFF` | Text/icons on primary |
| `--color-bg` | `#F8FAFC` | App background |
| `--color-surface` | `#FFFFFF` | Cards, app bar |
| `--color-surface-muted` | `#F1F5F9` | Subtle panels, assumptions block |
| `--color-text` | `#0F172A` | Primary text |
| `--color-text-secondary` | `#475569` | Secondary text, helper text |
| `--color-border` | `#E2E8F0` | Card borders, dividers |
| `--color-success` | `#16A34A` | "You're ready to buy" / positive |
| `--color-warning` | `#D97706` | "Not yet" / caution |
| `--color-error` | `#DC2626` | Validation errors |

### Dark mode
| Token | Value |
|---|---|
| `--color-primary` | `#818CF8` |
| `--color-bg` | `#0F172A` |
| `--color-surface` | `#1E293B` |
| `--color-surface-muted` | `#334155` |
| `--color-text` | `#F1F5F9` |
| `--color-text-secondary` | `#94A3B8` |
| `--color-border` | `#334155` |

## Typography
- **Heading font:** "Plus Jakarta Sans", sans-serif
- **Body font:** "Inter", sans-serif

| Token | Size / weight | Use |
|---|---|---|
| Display (H1) | 40px / 700 (mobile 30px) | Page hero heading |
| H2 | 28px / 700 | Section / verdict headline |
| H3 | 20px / 600 | Card titles |
| Body | 16px / 400 | Main text |
| Body small | 14px / 400 | Helper text, captions |
| Caption | 12px / 500 | Labels, disclaimer |
| Button | 15px / 600 | Buttons |

Line-height: 1.5 body, 1.2 headings.

## Spacing (4px base scale)
`4, 8, 12, 16, 24, 32, 48, 64` px — tokens `--space-1`…`--space-9`.
Comfortable density: card padding 24–32px; field gap 16–20px; section gap 32–48px.

## Radius
| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 8px | Inputs, chips |
| `--radius-md` | 12px | Buttons |
| `--radius-lg` | 16px | Cards |
| `--radius-pill` | 999px | Status chips |

## Elevation (shadows — subtle for premium feel)
| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)` |
| `--shadow-md` | `0 4px 16px rgba(15,23,42,0.08)` |
| `--shadow-lg` | `0 12px 32px rgba(15,23,42,0.10)` |

## Motion
- Hover/press transitions: 200ms ease.
- Content/result reveal: 300ms ease-out (fade + slight rise).
- Skeleton shimmer: 1.2s loop.
- Respect `prefers-reduced-motion`.

## Dark mode
Supported via the dark tokens above (toggle by `prefers-color-scheme` or a manual switch).
Premium feel preserved: deep slate surfaces, lighter indigo primary for contrast.
