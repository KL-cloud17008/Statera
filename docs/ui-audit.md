# UI audit — design entropy

**Branch:** `docs/ui-audit` · **Commit audited:** `10a73ff` · **Date:** 2026-08-02

A measurement of how many distinct visual values the application actually
renders. Counts and locations only; no fixes are proposed here.

---

## Method

The app was rendered by the Next.js dev server against the live database (one
user, 44 weight entries, 353 logged sets, 24 sessions, 296 plan rows), driven
by headless Chrome over the DevTools Protocol.

| | |
| --- | --- |
| Routes swept | 12 (every route that renders; 6 more are `redirect()` stubs) |
| Viewports | 1280×900 and 375×812 |
| Elements measured for section A | **8,849** rendered elements |
| Interactive elements measured for sections C/D | **764** (157 distinct shapes) |

Exclusions, and why:

- **Elements with no layout box.** `getClientRects().length === 0` — an element
  hidden at that breakpoint is not something the app renders there. This is what
  makes the two viewports differ (e.g. the desktop rail is absent at 375px, and
  the 10px `MobileNav` label only exists at 375px).
- **SVG internals.** `<path>`, `<g>`, `<circle>` inside an icon or a Recharts
  chart. The `<svg>` roots themselves are measured, and are reported separately
  in section F.
- **`<nextjs-portal>`.** The dev-mode devtools overlay host; not application UI.

Two measurement caveats that materially affected the numbers:

1. **Transitions must be allowed to settle.** Tailwind's `transition-colors`
   includes `outline-color`, so reading a computed style immediately after
   forcing `:focus-visible` returns the *pre-transition* value. A first pass
   done this way reported that 60% of focus rings were the wrong colour. They
   are not. Section C was re-measured with `transition: none !important`
   injected, which is the only way to read a settled state deterministically.
   Numbers below are from that pass, cross-checked against a second pass driven
   by real `Tab` keypresses.
2. **Dev server, not a production build.** Rule text is identical; only
   minification differs. The dev overlay is excluded as noted above.

To reach the routes at all, Supabase auth was bypassed locally for the duration
of the sweep. Both touched files were reverted; `git status` is clean apart
from this report. See "Harness" at the end.

---

## A. Computed style inventory

### Summary


| Property | Distinct values | Used < 3× (one-offs) |
| --- | ---: | ---: |
| `font-family` | 3 | 0 |
| `font-size` | 10 | 0 |
| `font-weight` | 3 | 0 |
| `letter-spacing` | 5 | 0 |
| `line-height` | 22 | 4 |
| `color` | 12 | 0 |
| `background-color` | 15 | 4 |
| `border-width` | 6 | 0 |
| `border-style` | 3 | 1 |
| `border-color` | 10 | 2 |
| `border-radius` | 7 | 0 |
| `box-shadow` | 2 | 0 |
| `padding` | 41 | 7 |
| `margin` | 22 | 4 |
| `gap` | 20 | 3 |
| `transition-duration` | 4 | 0 |
| `transition-timing-function` | 3 | 0 |
| `opacity` | 4 | 1 |

**Total distinct values across all 18 properties: 192** — of which **26** are used fewer than three times.

The 26 values used fewer than three times are marked ⚠️ in the tables below.
They are concentrated in `padding` (7), `line-height` (4), `margin` (4) and
`background-color` (4).

Two properties carry the entropy. Everything else is tight:

- **`padding` — 41 distinct 4-tuples**, from 25 distinct individual side
  lengths. The token file defines 11 spacing steps (`--space-1` … `--space-16`),
  of which components use two (see section B).
- **`margin` — 22 distinct 4-tuples / `gap` — 20 distinct pairs.**

Against that, `font-size` resolves to 10 values, `color` to 12, `border-radius`
to 7, and `box-shadow` to 2. The type, colour and radius systems are behaving;
the spacing system is not being consumed from the tokens.

### Per-property tables


#### `font-family` — 3 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `Inter` | 7892 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `JetBrains Mono` | 918 | dashboard, flexibility-balance, mobility, settings, steps, weight, workout, workout-exercise, workout-history, workout-plan | `div > dd.num.num-left.mt-1.5…(+3)`, `p > span.num.num-left`, `div > button.flex.size-touch.items-center…(+21)` |
| `Fraunces` | 39 | all 12 | `a > span.font-display.text-body`, `div > h1.mt-2`, `div > p.font-display.text-body.text-ink-text` |

#### `font-size` — 10 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `14px` | 3163 | all 12 | `html > body.antialiased`, `div.min-h-dvh.bg-canvas`, `div > aside.fixed.inset-y-0.left-0…(+6)` |
| `13px` | 3112 | all 12 | `li > a.relative.flex.min-h-touch…(+10)`, `a > span.absolute.inset-y-1.left-0…(+3)`, `a > svg` |
| `11px` | 1227 | all 12 | `div > p.text-label.uppercase.text-tertiary`, `div > dt.text-label.uppercase.text-tertiary`, `div > h2` |
| `12px` | 800 | dashboard, flexibility-balance, mobility, settings, steps, weight, workout, workout-history, workout-plan | `div > p.mt-1.5.text-caption.text-tertiary`, `p > span.num.num-left`, `div > a.text-caption.text-secondary.underline-offset-2…(+2)` |
| `16px` | 262 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `div > dd.num.num-left.mt-1.5…(+3)` |
| `10px` | 201 | all 11 | `a > span.w-full.truncate.text-center…(+3)`, `div > span.text-[0.625rem].leading-none`, `div > span.num.num-left.whitespace-nowrap…(+2)` |
| `22px` | 30 | dashboard, steps, weight, workout, workout-exercise | `div > dd.num.num-left.mt-1.5…(+3)`, `div > span.tabular.text-data-lg.font-medium…(+2)` |
| `30px` | 26 | all 12 | `div > h1.mt-2`, `div > p.mt-4.font-display.text-page-title…(+3)`, `div > h1` |
| `15px` | 20 | dashboard, flexibility-balance, mobility, settings, steps, weight, weight-import, workout-exercise, workout-history, workout-plan | `div > p.mt-2.text-body-lg.text-secondary` |
| `32px` | 8 | dashboard, steps, weight, workout-plan | `div > dd.num.num-left.mt-1.5…(+3)`, `div > p.num.num-left.text-data-xl…(+2)` |

#### `font-weight` — 3 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `400` | 6060 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `500` | 2765 | all 12 | `div > p.text-label.uppercase.text-tertiary`, `div > a.inline-flex.items-center.justify-center…(+24)`, `a > svg` |
| `450` | 24 | all 12 | `div > h1.mt-2`, `div > h1`, `section > h1.mt-2` |

#### `letter-spacing` — 5 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `normal` | 7507 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `0.77px` | 1225 | all 12 | `div > p.text-label.uppercase.text-tertiary`, `div > dt.text-label.uppercase.text-tertiary`, `div > h2` |
| `-0.25px` | 77 | all 11 | `a > span.w-full.truncate.text-center…(+3)` |
| `-0.6px` | 26 | all 12 | `div > h1.mt-2`, `div > p.mt-4.font-display.text-page-title…(+3)`, `div > h1` |
| `0.98px` | 14 | settings, weight-import | `div > h2.text-body.text-primary` |

#### `line-height` — 22 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `20.3px` | 3123 | all 12 | `html > body.antialiased`, `div.min-h-dvh.bg-canvas`, `div > aside.fixed.inset-y-0.left-0…(+6)` |
| `17.55px` | 3108 | all 12 | `li > a.relative.flex.min-h-touch…(+10)`, `a > span.absolute.inset-y-1.left-0…(+3)`, `a > svg` |
| `14.3px` | 1225 | all 12 | `div > p.text-label.uppercase.text-tertiary`, `div > dt.text-label.uppercase.text-tertiary`, `div > h2` |
| `16.2px` | 784 | dashboard, flexibility-balance, mobility, settings, steps, weight, workout, workout-history, workout-plan | `div > p.mt-1.5.text-caption.text-tertiary`, `p > span.num.num-left`, `div > a.text-caption.text-secondary.underline-offset-2…(+2)` |
| `23.2px` | 238 | dashboard, flexibility-balance, mobility, workout-history, workout-plan | `div > dd.num.num-left.mt-1.5…(+3)` |
| `10px` | 124 | steps | `div > span.text-[0.625rem].leading-none`, `div > span.num.num-left.whitespace-nowrap…(+2)` |
| `12.5px` | 77 | all 11 | `a > span.w-full.truncate.text-center…(+3)` |
| `31.9px` | 28 | dashboard, steps, weight, workout, workout-exercise | `div > dd.num.num-left.mt-1.5…(+3)` |
| `33px` | 26 | all 12 | `div > h1.mt-2`, `div > p.mt-4.font-display.text-page-title…(+3)`, `div > h1` |
| `14px` | 26 | login, settings, steps | `div > label.flex.items-center.gap-2…(+8)` |
| `24px` | 24 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)` |
| `22.5px` | 20 | dashboard, flexibility-balance, mobility, settings, steps, weight, weight-import, workout-exercise, workout-history, workout-plan | `div > p.mt-2.text-body-lg.text-secondary` |
| `16px` | 10 | weight | `div > label.flex.items-center.gap-2…(+7)`, `form > button.flex.items-center.gap-1…(+4)`, `button > svg` |
| `46.4px` | 8 | dashboard, steps, weight, workout-plan | `div > dd.num.num-left.mt-1.5…(+3)`, `div > p.num.num-left.text-data-xl…(+2)` |
| `20px` | 6 | settings | `div > div.p-5.space-y-2.text-sm…(+1)`, `div > p` |
| `normal` | 6 | weight, workout | `div > select`, `div > select#library-select.h-11.w-full.min-w-0…(+17)`, `div > select#custom-exercise-group.h-11.w-full.min-w-0…(+16)` |
| `15px` | 4 | mobility | `div > button.min-h-9.rounded-pill.px-3…(+13)` |
| `18.85px` | 4 | weight | `div > div.recharts-default-tooltip`, `div > p.recharts-tooltip-label` |
| `22.75px` ⚠️ | 2 | settings | `div > p.text-sm.leading-relaxed.text-muted-foreground` |
| `22px` ⚠️ | 2 | steps | `div > span.tabular.text-data-lg.font-medium…(+2)` |
| `17.4px` ⚠️ | 2 | steps | `span#recharts_measurement_span` |
| `15.95px` ⚠️ | 2 | weight | `span#recharts_measurement_span` |

#### `color` — 12 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `rgb(31, 26, 22)` | 4302 | all 12 | `html > body.antialiased`, `div.min-h-dvh.bg-canvas`, `div > aside.fixed.inset-y-0.left-0…(+6)` |
| `rgb(99, 91, 79)` | 1637 | all 12 | `div > p.mt-2.text-body-lg.text-secondary`, `div > a.text-caption.text-secondary.underline-offset-2…(+2)`, `div > span.truncate.text-secondary` |
| `rgb(115, 106, 91)` | 1558 | all 11 | `div > p.text-label.uppercase.text-tertiary`, `div > dt.text-label.uppercase.text-tertiary`, `div > p.mt-1.5.text-caption.text-tertiary` |
| `rgba(250, 247, 242, 0.52)` | 329 | all 12 | `form > button.flex.min-h-touch.w-full…(+10)`, `button > svg`, `button > span` |
| `rgb(146, 31, 36)` | 312 | settings, steps, weight | `div > div.flex.size-9.shrink-0…(+5)`, `div > svg`, `span > button.inline-flex.items-center.justify-center…(+22)` |
| `rgba(250, 247, 242, 0.64)` | 268 | all 12 | `li > a.relative.flex.min-h-touch…(+11)`, `a > span.absolute.inset-y-1.left-0…(+3)`, `a > svg` |
| `rgb(250, 247, 242)` | 205 | all 12 | `aside > a.flex.h-14.shrink-0…(+6)`, `a > svg`, `a > span.font-display.text-body` |
| `rgb(255, 254, 251)` | 70 | mobility, settings | `div > button.peer.relative.flex…(+25)`, `div > button.inline-flex.items-center.justify-center…(+24)`, `button > svg` |
| `rgb(79, 93, 42)` | 68 | dashboard, steps, weight, workout, workout-exercise, workout-history, workout-plan | `div > span.num.num-left.self-start…(+6)`, `div > span.num.text-accent`, `div > dd.num.num-left.mt-1.5…(+3)` |
| `rgb(169, 69, 31)` | 60 | dashboard, flexibility-balance, mobility, settings, steps, weight | `div > dd.num.num-left.mt-1.5…(+3)`, `p > a.text-ember.underline-offset-2.hover:underline`, `section > p.rounded-control.border-l-2.px-3…(+6)` |
| `rgb(0, 0, 0)` | 24 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)` |
| `rgb(179, 169, 150)` | 16 | flexibility-balance, weight-import, workout | `div > svg` |

#### `background-color` — 15 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `rgba(0, 0, 0, 0)` | 7897 | all 12 | `aside > a.flex.h-14.shrink-0…(+6)`, `a > svg`, `a > span.font-display.text-body` |
| `rgb(255, 254, 251)` | 332 | all 11 | `div > button.flex.size-touch.items-center…(+21)`, `span > button.inline-flex.items-center.justify-center…(+24)`, `div > section.flex.min-h-[28rem].flex-col…(+5)` |
| `rgb(242, 238, 230)` | 298 | dashboard, flexibility-balance, mobility, settings, steps, weight, workout, workout-plan | `div > div.w-full.rounded-t-sm.bg-chart-track`, `div > span.inline-flex.w-fit.items-center…(+10)`, `div > div.relative.h-1.5.w-full…(+6)` |
| `rgb(79, 93, 42)` | 98 | flexibility-balance, weight, workout-plan | `li > span.mt-1.5.size-1.shrink-0…(+2)`, `div > div.h-full.bg-accent` |
| `rgb(250, 247, 242)` | 72 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `rgb(26, 22, 19)` | 65 | all 12 | `div > aside.fixed.inset-y-0.left-0…(+6)`, `div > a.inline-flex.items-center.justify-center…(+24)`, `span > button.inline-flex.items-center.justify-center…(+24)` |
| `rgb(168, 189, 106)` | 22 | all 11 | `a > span.absolute.inset-y-1.left-0…(+3)`, `a > span.absolute.inset-x-3.top-0…(+3)` |
| `rgb(31, 26, 22)` | 16 | dashboard, mobility | `div > div.w-full.rounded-t-sm.bg-chart-ink`, `div > div.h-full.w-full.rounded-full…(+5)` |
| `rgb(241, 243, 232)` | 16 | workout, workout-plan | `div > span.inline-flex.w-fit.items-center…(+10)`, `section > p.rounded-control.border-l-2.px-3…(+6)` |
| `rgb(38, 32, 25)` | 15 | all 12 | `li > a.relative.flex.min-h-touch…(+10)`, `div > span.flex.size-10.items-center…(+6)`, `div > span.rounded-pill.border.border-ink-line…(+6)` |
| `rgb(253, 243, 238)` | 10 | dashboard, flexibility-balance, mobility, settings, weight | `section > p.rounded-control.border-l-2.px-3…(+6)`, `section > p.mt-3.max-w-2xl.rounded-control…(+7)`, `div > p.mt-3.rounded-control.border-l-2…(+6)` |
| `rgb(216, 209, 195)` ⚠️ | 2 | dashboard | `div > div.w-full.rounded-t-sm.bg-chart-ink-muted` |
| `rgb(230, 224, 213)` ⚠️ | 2 | login | `div > div.grid.gap-px.overflow-hidden…(+5)` |
| `rgb(253, 240, 239)` ⚠️ | 2 | settings | `div > div.flex.size-9.shrink-0…(+5)` |
| `rgb(146, 31, 36)` ⚠️ | 2 | settings | `div > button.inline-flex.items-center.justify-center…(+24)` |

#### `border-width` — 6 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `0px 0px 0px 0px` | 7061 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `1px 1px 1px 1px` | 1108 | all 12 | `div > a.inline-flex.items-center.justify-center…(+24)`, `div > button.flex.size-touch.items-center…(+21)`, `span > button.inline-flex.items-center.justify-center…(+24)` |
| `1px 0px 0px 0px` | 631 | all 12 | `aside > form.shrink-0.border-t.border-ink-line`, `div > div.mt-6.border-t.border-rule…(+1)`, `div > div.ledger-row` |
| `0px 0px 1px 0px` | 25 | all 11 | `aside > a.flex.h-14.shrink-0…(+6)`, `div > div.ledger-head`, `section > div.grid.grid-cols-7.gap-1…(+7)` |
| `0px 0px 0px 2px` | 16 | dashboard, flexibility-balance, mobility, settings, weight, workout, workout-plan | `section > p.rounded-control.border-l-2.px-3…(+6)`, `section > p.mt-3.max-w-2xl.rounded-control…(+7)`, `div > p.mt-3.rounded-control.border-l-2…(+6)` |
| `1px 0px 1px 0px` | 8 | mobility | `div > div.grid.gap-4.border-y…(+3)`, `div > div.border-y.border-rule.py-4` |

#### `border-style` — 3 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `solid solid solid solid` | 8841 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `none none none none` | 6 | steps, weight | `span#recharts_measurement_span`, `div > select` |
| `dashed dashed dashed dashed` ⚠️ | 2 | weight-import | `div > div.rounded-panel.border.border-dashed…(+3)` |

#### `border-color` — 10 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `rgb(230, 224, 213) rgb(230, 224, 213) rgb(230, 224, 213) rgb(230, 224, 213)` | 8035 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)` | 420 | dashboard, login, mobility, settings, steps, weight, workout, workout-history, workout-plan | `div > a.inline-flex.items-center.justify-center…(+24)`, `span > button.inline-flex.items-center.justify-center…(+24)`, `form > button.inline-flex.items-center.justify-center…(+25)` |
| `rgb(141, 132, 113) rgb(141, 132, 113) rgb(141, 132, 113) rgb(141, 132, 113)` | 314 | all 11 | `div > button.flex.size-touch.items-center…(+21)`, `span > button.inline-flex.items-center.justify-center…(+24)`, `div > input#email.h-11.w-full.min-w-0…(+24)` |
| `rgba(250, 247, 242, 0.1) rgba(250, 247, 242, 0.1) rgba(250, 247, 242, 0.1) rgba(250, 247, 242, 0.1)` | 32 | all 12 | `aside > a.flex.h-14.shrink-0…(+6)`, `aside > form.shrink-0.border-t.border-ink-line`, `div > span.flex.size-10.items-center…(+6)` |
| `rgb(213, 222, 186) rgb(213, 222, 186) rgb(213, 222, 186) rgb(213, 222, 186)` | 16 | workout, workout-plan | `div > span.inline-flex.w-fit.items-center…(+10)`, `section > p.rounded-control.border-l-2.px-3…(+6)` |
| `rgb(230, 224, 213) rgb(230, 224, 213) rgb(216, 209, 195) rgb(230, 224, 213)` | 12 | dashboard, steps, weight, workout-exercise | `div > div.ledger-head` |
| `rgb(240, 211, 193) rgb(240, 211, 193) rgb(240, 211, 193) rgb(240, 211, 193)` | 10 | dashboard, flexibility-balance, mobility, settings, weight | `section > p.rounded-control.border-l-2.px-3…(+6)`, `section > p.mt-3.max-w-2xl.rounded-control…(+7)`, `div > p.mt-3.rounded-control.border-l-2…(+6)` |
| `rgb(31, 26, 22) rgb(31, 26, 22) rgb(31, 26, 22) rgb(31, 26, 22)` | 6 | steps, weight | `span#recharts_measurement_span`, `div > select` |
| `rgb(242, 201, 197) rgb(242, 201, 197) rgb(242, 201, 197) rgb(242, 201, 197)` ⚠️ | 2 | settings | `div > div.rounded-panel.border.bg-raised…(+1)` |
| `rgb(216, 209, 195) rgb(216, 209, 195) rgb(216, 209, 195) rgb(216, 209, 195)` ⚠️ | 2 | workout-history | `section > div.grid.grid-cols-7.gap-1…(+7)` |

#### `border-radius` — 7 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `0px 0px 0px 0px` | 7177 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `4px 4px 4px 4px` | 1010 | all 12 | `div > a.inline-flex.items-center.justify-center…(+24)`, `div > button.flex.size-touch.items-center…(+21)`, `section > p.rounded-control.border-l-2.px-3…(+6)` |
| `9999px 9999px 9999px 9999px` | 610 | all 12 | `a > span.absolute.inset-y-1.left-0…(+3)`, `a > span.absolute.inset-x-3.top-0…(+3)`, `li > span.mt-1.5.size-1.shrink-0…(+2)` |
| `8px 8px 8px 8px` | 18 | login, settings, weight-import | `div > div.grid.gap-px.overflow-hidden…(+5)`, `div > div.rounded-panel.border.border-rule…(+1)`, `div > div.rounded-panel.border.bg-raised…(+1)` |
| `3.35544e+07px 3.35544e+07px 3.35544e+07px 3.35544e+07px` | 16 | mobility | `div > div.relative.h-1.5.w-full…(+6)`, `div > div.h-full.w-full.rounded-full…(+5)` |
| `4px 4px 0px 0px` | 14 | dashboard | `div > div.w-full.rounded-t-sm.bg-chart-track`, `div > div.w-full.rounded-t-sm.bg-chart-ink`, `div > div.w-full.rounded-t-sm.bg-chart-ink-muted` |
| `16px 16px 16px 16px` | 4 | steps, weight | `div > div.recharts-default-tooltip` |

#### `box-shadow` — 2 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `none` | 8845 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `rgba(31, 26, 22, 0.18) 0px 8px 24px -8px, rgba(31, 26, 22, 0.1) 0px 2px 6px -2px` | 4 | steps, weight | `div > div.recharts-default-tooltip` |

#### `padding` — 41 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `0px 0px 0px 0px` | 7237 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `2px 8px 2px 8px` | 274 | flexibility-balance, mobility, weight, workout, workout-plan | `div > span.inline-flex.w-fit.items-center…(+10)`, `div > p.num.whitespace-nowrap.rounded-pill…(+8)`, `span > span.inline-flex.w-fit.items-center…(+10)` |
| `8px 8px 8px 8px` | 180 | dashboard, steps, weight, workout-exercise | `div > div.ledger-row.ledger-row-interactive`, `div > div.ledger-row.ledger-row-interactive.group` |
| `8px 0px 8px 0px` | 134 | dashboard, steps, weight, workout, workout-plan | `div > div.ledger-row`, `div > div.ledger-row.items-start`, `div > div.flex.flex-col.items-start…(+4)` |
| `0px 16px 0px 16px` | 112 | all 12 | `aside > a.flex.h-14.shrink-0…(+6)`, `li > a.relative.flex.min-h-touch…(+10)`, `li > a.relative.flex.min-h-touch…(+11)` |
| `4px 8px 4px 8px` | 88 | weight | `div > div.bg-sunken.px-2.py-1…(+3)` |
| `12px 0px 12px 0px` | 77 | all 11 | `aside > nav.flex-1.overflow-y-auto.py-3`, `div > div.w-full.py-3.text-left` |
| `8px 2px 8px 2px` | 77 | all 11 | `li > a.relative.flex.min-h-touch…(+12)` |
| `4px 10px 4px 10px` | 68 | mobility, weight | `div > button.inline-flex.min-h-8.items-center…(+19)`, `div > span.absolute.bottom-4.right-5…(+11)` |
| `4px 4px 4px 4px` | 62 | steps | `div > div.flex.aspect-square.min-w-0…(+10)` |
| `8px 4px 8px 4px` | 62 | workout-history | `div > button.flex.min-h-touch.flex-col…(+16)` |
| `12px 0px 0px 0px` | 58 | dashboard, flexibility-balance, login, mobility, workout, workout-plan | `div > p.mt-3.border-t.border-rule…(+4)`, `section > div.mt-4.flex.flex-wrap…(+6)`, `section > p.mt-4.max-w-2xl.border-t…(+4)` |
| `16px 0px 16px 0px` | 56 | mobility, workout-history | `div > div.grid.gap-4.border-y…(+3)`, `div > div.border-y.border-rule.py-4`, `div > div.py-4` |
| `0px 12px 0px 12px` | 46 | login, settings, steps, weight, workout | `div > input#email.h-11.w-full.min-w-0…(+24)`, `div > input#password.h-11.w-full.min-w-0…(+24)`, `div > input#heightCm.w-full.min-w-0.rounded-control…(+24)` |
| `0px 14px 0px 14px` | 44 | mobility, settings, steps, weight, weight-import, workout, workout-plan | `div > button.inline-flex.items-center.justify-center…(+24)`, `div > button.inline-flex.items-center.justify-center…(+25)`, `a > button.inline-flex.items-center.justify-center…(+24)` |
| `40px 0px 0px 0px` | 42 | dashboard, flexibility-balance, mobility, steps, weight, workout, workout-exercise, workout-history, workout-plan | `div > section.ledger-section`, `div > section#pain-check-in.ledger-section`, `div > section#session.ledger-section` |
| `32px 0px 0px 0px` | 42 | dashboard, flexibility-balance, mobility, steps, weight, workout, workout-exercise, workout-history, workout-plan | `div > section.ledger-section`, `div > section#pain-check-in.ledger-section`, `div > section#session.ledger-section` |
| `0px 10px 0px 10px` | 36 | dashboard, steps, weight, workout, workout-exercise, workout-plan | `div > a.inline-flex.items-center.justify-center…(+24)`, `span > button.inline-flex.items-center.justify-center…(+24)`, `div > button.inline-flex.items-center.justify-center…(+24)` |
| `8px 12px 8px 12px` | 18 | dashboard, flexibility-balance, mobility, weight, workout, workout-plan | `section > p.rounded-control.border-l-2.px-3…(+6)`, `section > p.mt-3.max-w-2xl.rounded-control…(+7)`, `div > button.min-h-9.rounded-pill.px-3…(+13)` |
| `0px 0px 8px 0px` | 16 | dashboard, steps, weight, workout-exercise, workout-history | `div > div.ledger-head`, `div > div.grid.grid-cols-7.gap-1…(+5)`, `section > div.grid.grid-cols-7.gap-1…(+7)` |
| `20px 20px 0px 20px` | 14 | settings, weight-import | `div > div.flex.items-start.justify-between…(+3)` |
| `20px 20px 20px 20px` | 14 | settings, weight-import | `div > div.p-5`, `div > div.p-5.space-y-4`, `div > div.p-5.space-y-2.text-sm…(+1)` |
| `0px 0px 0px 216px` | 11 | all 11 | `div > main.md:pl-rail` |
| `40px 32px 64px 32px` | 11 | all 11 | `main > div.ledger.py-8.pb-[calc(5.5rem+env(safe-area-inset-bottom))]…(+2)` |
| `32px 16px 88px 16px` | 11 | all 11 | `main > div.ledger.py-8.pb-[calc(5.5rem+env(safe-area-inset-bottom))]…(+2)` |
| `6px 10px 6px 10px` | 8 | mobility | `div > p.rounded-control.bg-sunken.px-2.5…(+3)` |
| `24px 0px 0px 0px` | 8 | workout | `div > div.grid.gap-4.border-t…(+3)`, `div > div.mt-6.grid.gap-4…(+5)`, `div > div.mt-6.border-t.border-rule…(+1)` |
| `2px 0px 0px 0px` | 7 | dashboard | `div > span.num.num-left.self-start…(+6)` |
| `20px 0px 0px 0px` | 6 | dashboard, mobility | `div > div.mt-6.border-t.border-rule…(+1)`, `div > section.grid.gap-4.border-t…(+6)` |
| `10px 12px 10px 12px` | 6 | settings | `div > div.rounded-control.bg-sunken.px-3…(+3)`, `div > div.rounded-control.border-l-2.border-ember-line…(+5)` |
| `2px 2px 2px 2px` | 4 | mobility, steps | `div > div.mt-1.5.grid.grid-cols-2…(+6)`, `div > div.inline-flex.items-center.gap-0.5…(+5)` |
| `10px 10px 10px 10px` | 4 | steps, weight | `div > div.recharts-default-tooltip` |
| `16px 0px 0px 0px` | 4 | workout-plan | `section > p.mt-5.border-t.border-rule…(+3)` |
| `40px 40px 40px 40px` | 3 | login, weight-import | `div > section.flex.min-h-[28rem].flex-col…(+5)`, `div > div.rounded-panel.border.border-dashed…(+3)` |
| `4px 12px 4px 12px` ⚠️ | 2 | login | `div > span.rounded-pill.border.border-ink-line…(+6)` |
| `48px 0px 48px 0px` ⚠️ | 2 | login | `section > div.max-w-xl.py-12` |
| `32px 24px 32px 24px` ⚠️ | 1 | login | `div.flex.min-h-screen.items-center…(+5)` |
| `36px 36px 36px 36px` ⚠️ | 1 | login | `div > section.flex.min-h-[28rem].flex-col…(+4)` |
| `32px 16px 32px 16px` ⚠️ | 1 | login | `div.flex.min-h-screen.items-center…(+5)` |
| `28px 28px 28px 28px` ⚠️ | 1 | login | `div > section.flex.min-h-[28rem].flex-col…(+4)` |
| `24px 24px 24px 24px` ⚠️ | 1 | login | `div > section.flex.min-h-[28rem].flex-col…(+5)` |

#### `margin` — 22 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `0px 0px 0px 0px` | 7082 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `6px 0px 0px 0px` | 416 | dashboard, flexibility-balance, mobility, steps, weight, workout, workout-exercise, workout-history, workout-plan | `div > dd.num.num-left.mt-1.5…(+3)`, `div > p.mt-1.5.text-caption.text-tertiary`, `div > div.mt-1.5.flex.flex-wrap…(+1)` |
| `4px 0px 0px 0px` | 317 | dashboard, flexibility-balance, login, mobility, steps, workout, workout-plan | `div > p.mt-1.text-caption.text-tertiary`, `div > h2.mt-1.normal-case.tracking-normal…(+3)`, `div > p.mt-1.text-row.font-medium…(+1)` |
| `0px -8px 0px -8px` | 180 | dashboard, steps, weight, workout-exercise | `div > div.ledger-row.ledger-row-interactive`, `div > div.ledger-row.ledger-row-interactive.group` |
| `8px 0px 0px 0px` | 144 | all 12 | `div > h1.mt-2`, `div > p.mt-2.text-body-lg.text-secondary`, `div > p.mt-2.text-caption.text-tertiary` |
| `12px 0px 0px 0px` | 128 | dashboard, flexibility-balance, mobility, workout-history, workout-plan | `div > p.mt-3.text-label.uppercase…(+1)`, `div > p.mt-3.border-t.border-rule…(+4)`, `div > div.mt-3.flex.items-end…(+1)` |
| `2px 0px 0px 0px` | 103 | dashboard, flexibility-balance, login, mobility, weight | `span > span.ledger-sub.mt-0.5.block…(+2)`, `div > svg`, `div > p.mt-0.5.text-label.uppercase…(+1)` |
| `0px 0px 6px 0px` | 88 | flexibility-balance, weight, workout, workout-plan | `ul > li.flex.items-start.gap-2…(+2)`, `div > label.flex.items-center.gap-2…(+7)`, `div > button.flex.items-center.justify-between…(+25)` |
| `16px 0px 0px 0px` | 66 | dashboard, flexibility-balance, login, mobility, weight-import, workout, workout-plan | `section > dl.mt-4.flex.gap-8`, `section > div.mt-4`, `div > p.mt-4.text-label.uppercase…(+1)` |
| `0px 0px 12px 0px` | 62 | dashboard, mobility, steps, weight, workout, workout-exercise, workout-history, workout-plan | `section > div.mb-3.flex.items-baseline…(+2)`, `section > p.mb-3.text-caption.text-tertiary`, `div > div.mb-3.flex.items-center…(+2)` |
| `24px 0px 0px 0px` | 48 | dashboard, flexibility-balance, login, mobility, steps, weight, workout, workout-exercise, workout-history, workout-plan | `div > div.mt-6.border-t.border-rule…(+1)`, `div > section.ledger-section.mt-6`, `div > div.mt-6.text-row.text-secondary` |
| `0px 0px 16px 0px` | 46 | login, mobility, settings, steps, weight, weight-import, workout | `form > div.space-y-2`, `div > div.grid.gap-4.border-y…(+3)`, `div > div.border-y.border-rule.py-4` |
| `32px 0px 0px 0px` | 44 | dashboard, flexibility-balance, mobility, steps, weight, workout, workout-exercise, workout-history, workout-plan | `div > section.ledger-section`, `div > section#pain-check-in.ledger-section`, `div > section#session.ledger-section` |
| `40px 0px 0px 0px` | 42 | dashboard, flexibility-balance, mobility, steps, weight, workout, workout-exercise, workout-history, workout-plan | `div > section.ledger-section`, `div > section#pain-check-in.ledger-section`, `div > section#session.ledger-section` |
| `0px 0px 8px 0px` | 32 | login, settings, steps | `div > label.flex.items-center.gap-2…(+8)`, `div > input#startWeight.w-full.min-w-0.rounded-control…(+24)`, `div > input#goalWeight.w-full.min-w-0.rounded-control…(+24)` |
| `20px 0px 0px 0px` | 28 | dashboard, flexibility-balance, weight-import, workout-plan | `section > div.mt-5`, `section > div.mt-5.grid.gap-x-8…(+2)`, `div > button.inline-flex.items-center.justify-center…(+25)` |
| `-1px -1px -1px -1px` | 10 | steps, weight, workout-history | `button > span.sr-only`, `div > select` |
| `0px 0px 24px 0px` | 8 | mobility, settings, weight-import | `div > section.grid.gap-4.border-t…(+6)`, `div > header.flex.flex-wrap.items-end…(+3)` |
| `0px 0px 32px 0px` ⚠️ | 2 | login | `div > div.mb-8` |
| `0px 97.5px 0px 97.5px` ⚠️ | 1 | steps | `div > div.mx-auto.shrink-0.sm:mx-0` |
| `0px 422px 0px 422px` ⚠️ | 1 | weight-import | `div > svg` |
| `0px 93.5px 0px 93.5px` ⚠️ | 1 | weight-import | `div > svg` |

#### `gap` — 20 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `normal / normal` | 6327 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `8px / 8px` | 870 | all 12 | `div > a.inline-flex.items-center.justify-center…(+24)`, `div > div.flex.items-baseline.justify-between…(+1)`, `div > div.mt-3.flex.items-end…(+1)` |
| `4px / 4px` | 515 | all 11 | `li > a.relative.flex.min-h-touch…(+12)`, `div > span.inline-flex.w-fit.items-center…(+10)`, `div > div.flex.items-center.gap-1` |
| `12px / 12px` | 382 | all 12 | `li > a.relative.flex.min-h-touch…(+10)`, `li > a.relative.flex.min-h-touch…(+11)`, `form > button.flex.min-h-touch.w-full…(+10)` |
| `16px / 16px` | 231 | all 12 | `div > header.flex.flex-wrap.items-end…(+2)`, `section > div.mb-3.flex.items-baseline…(+2)`, `section > dl.grid.grid-cols-2.gap-4…(+1)` |
| `8px / 12px` | 155 | dashboard, steps, weight, workout, workout-exercise, workout-plan | `div > div.ledger-row`, `div > div.ledger-row.ledger-row-interactive`, `div > div.ledger-row.ledger-row-interactive.group` |
| `4px / 16px` | 108 | mobility, workout, workout-history | `div > div.flex.flex-wrap.items-baseline…(+3)`, `div > div.mt-3.flex.flex-wrap…(+2)` |
| `6px / 6px` | 98 | dashboard, flexibility-balance, mobility, workout-plan | `div > div.mt-1.5.flex.flex-wrap…(+1)`, `div > a.inline-flex.min-h-touch.items-center…(+9)`, `div > button.inline-flex.min-h-8.items-center…(+19)` |
| `2px / 2px` | 68 | mobility, steps, workout-history | `div > div.mt-1.5.grid.grid-cols-2…(+6)`, `div > div.absolute.inset-0.flex…(+5)`, `div > div.inline-flex.items-center.gap-0.5…(+5)` |
| `8px / 16px` | 18 | flexibility-balance, workout | `section > div.mt-4.flex.flex-wrap…(+6)`, `section > div.mb-4.flex.flex-wrap…(+4)` |
| `32px / 32px` | 14 | dashboard, workout-plan | `section > dl.mt-4.flex.gap-8`, `div > dl.flex.flex-wrap.gap-8`, `div > dl.flex.gap-8` |
| `4px / 12px` | 14 | workout-plan | `section > div.flex.flex-wrap.items-baseline…(+2)` |
| `10px / 10px` | 11 | all 11 | `aside > a.flex.h-14.shrink-0…(+6)` |
| `20px / 32px` | 10 | flexibility-balance | `section > div.mt-5.grid.gap-x-8…(+2)` |
| `24px / 24px` | 8 | dashboard, mobility | `section > div.flex.flex-wrap.items-end…(+2)`, `div > section.grid.gap-4.border-t…(+6)` |
| `16px / 24px` | 8 | mobility, workout, workout-plan | `section > div.grid.gap-x-6.gap-y-4…(+1)`, `section > div.mt-4.grid.gap-x-6…(+3)`, `section > div.grid.gap-x-6.gap-y-4…(+2)` |
| `20px / 24px` | 6 | dashboard, steps, weight | `div > dl.grid.grid-cols-2.gap-x-6…(+2)`, `dl > div.mt-6.grid.grid-cols-2…(+3)` |
| `1px / 1px` ⚠️ | 2 | login | `div > div.grid.gap-px.overflow-hidden…(+5)` |
| `24px / 40px` ⚠️ | 2 | steps | `section > div.flex.flex-wrap.items-center…(+2)` |
| `24px / 32px` ⚠️ | 2 | workout-plan | `section > div.grid.gap-x-8.gap-y-6…(+1)` |

#### `transition-duration` — 4 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `0s` | 7531 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `0.12s` | 1154 | all 12 | `li > a.relative.flex.min-h-touch…(+10)`, `li > a.relative.flex.min-h-touch…(+11)`, `form > button.flex.min-h-touch.w-full…(+10)` |
| `0.15s` | 156 | steps, weight | `div > span.flex.justify-end.gap-1…(+6)`, `form > button.flex.items-center.gap-1…(+4)` |
| `0.18s` | 8 | mobility | `div > div.h-full.w-full.rounded-full…(+5)` |

#### `transition-timing-function` — 3 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `ease` | 7531 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `cubic-bezier(0.2, 0, 0, 1)` | 1083 | all 12 | `li > a.relative.flex.min-h-touch…(+10)`, `li > a.relative.flex.min-h-touch…(+11)`, `form > button.flex.min-h-touch.w-full…(+10)` |
| `cubic-bezier(0.4, 0, 0.2, 1)` | 235 | all 12 | `form > button.flex.size-touch.items-center…(+6)`, `div > button.font-medium.text-primary.underline-offset-4…(+7)`, `button > svg` |

#### `opacity` — 4 distinct

| Value | Elements | Routes | Example selectors |
| --- | ---: | --- | --- |
| `1` | 8726 | all 12 | `html.light.__variable_eb41fe.__variable_f367f3…(+1)`, `html > body.antialiased`, `div.min-h-dvh.bg-canvas` |
| `0` | 77 | steps, weight | `div > span.flex.justify-end.gap-1…(+6)` |
| `0.45` | 44 | dashboard, mobility | `div > button.flex.size-touch.items-center…(+21)` |
| `0.5` ⚠️ | 2 | workout | `div > button.inline-flex.items-center.justify-center…(+24)` |

#### Supplement — distinct individual spacing lengths

`padding-side` — 19 distinct lengths:

| Length | Occurrences |
| --- | ---: |
| `0px` | 30558 |
| `8px` | 2042 |
| `2px` | 725 |
| `4px` | 688 |
| `16px` | 364 |
| `12px` | 356 |
| `10px` | 252 |
| `20px` | 104 |
| `14px` | 88 |
| `32px` | 79 |
| `40px` | 65 |
| `6px` | 16 |
| `24px` | 14 |
| `216px` | 11 |
| `64px` | 11 |
| `88px` | 11 |
| `36px` | 4 |
| `48px` | 4 |
| `28px` | 4 |

`margin-side` — 16 distinct lengths:

| Length | Occurrences |
| --- | ---: |
| `0px` | 33416 |
| `6px` | 504 |
| `-8px` | 360 |
| `4px` | 317 |
| `12px` | 190 |
| `8px` | 176 |
| `16px` | 112 |
| `2px` | 103 |
| `24px` | 56 |
| `32px` | 46 |
| `40px` | 42 |
| `-1px` | 40 |
| `20px` | 28 |
| `97.5px` | 2 |
| `422px` | 2 |
| `93.5px` | 2 |

---

## B. Token leakage

### B1. Raw colour literals outside `src/styles/tokens.css`

Four locations in `.ts`/`.tsx`, plus one static asset.

| File | Line | Literal | Note |
| --- | ---: | --- | --- |
| [src/app/layout.tsx](src/app/layout.tsx:48) | 48 | `themeColor: "#0b0f14"` | The adjacent comment says it "Matches `--obsidian-900` in tokens.css". No `--obsidian-900` exists in `tokens.css` — it is a leftover from the v2 palette. The current chrome token is `--ink-900: #1a1613`. |
| [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx:35) | 35 | `bg-[rgb(26_22_19_/_0.44)]` | The dialog scrim. `rgb(26 22 19)` is `--ink-900`, hardcoded. |
| [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx:39) | 39 | `bg-[rgba(27,6,36,0.34)]` | The sheet scrim. **A purple-black** (hue 285°) with no counterpart in the palette — a v2 survivor. `dialog.tsx` line 33 carries a comment recording that this exact value was removed from the dialog; the sheet was not updated. |
| [src/app/icon.svg](src/app/icon.svg) | 2–8 | `#FFFFFF`, `#F3F2EF`, `#160F0C` (×5) | Static app icon. `#160F0C` is close to but not equal to `--ink-900 #1a1613`. |

The two scrims are also the only two elements in the app that render a
background colour absent from the token file.

### B2. Arbitrary Tailwind bracket values

Expected zero. **Found 41**, in 20 files. Arbitrary *variants* such as
`data-[state=open]:` and `group-has-data-[size=lg]:` are excluded — those are
selector syntax, not values.


| Category | Count |
| --- | ---: |
| raw colour | 2 |
| typography | 5 |
| spacing | 2 |
| dimension | 10 |
| grid template | 15 |
| token reference | 6 |
| content | 1 |
| **total** | **41** |

| Value | File | Line | Category |
| --- | --- | ---: | --- |
| `bg-[rgb(26_22_19_/_0.44)]` | [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx:35) | 35 | raw colour |
| `bg-[rgba(27,6,36,0.34)]` | [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx:39) | 39 | raw colour |
| `leading-[1.1]` | [src/components/auth/LoginPageClient.tsx](src/components/auth/LoginPageClient.tsx:61) | 61 | typography |
| `tracking-[-0.02em]` | [src/components/auth/LoginPageClient.tsx](src/components/auth/LoginPageClient.tsx:61) | 61 | typography |
| `text-[0.625rem]` | [src/components/layout/MobileNav.tsx](src/components/layout/MobileNav.tsx:52) | 52 | typography |
| `text-[0.625rem]` | [src/components/steps/StepsHeatmap.tsx](src/components/steps/StepsHeatmap.tsx:85) | 85 | typography |
| `text-[0.625rem]` | [src/components/steps/StepsHeatmap.tsx](src/components/steps/StepsHeatmap.tsx:86) | 86 | typography |
| `pb-[calc(5.5rem+env(safe-area-inset-bottom))]` | [src/app/(app)/layout.tsx](src/app/(app)/layout.tsx:14) | 14 | spacing |
| `mt-[0.65em]` | [src/components/mobility/MobilityChecklist.tsx](src/components/mobility/MobilityChecklist.tsx:455) | 455 | spacing |
| `min-h-[28rem]` | [src/components/auth/LoginPageClient.tsx](src/components/auth/LoginPageClient.tsx:43) | 43 | dimension |
| `min-h-[28rem]` | [src/components/auth/LoginPageClient.tsx](src/components/auth/LoginPageClient.tsx:83) | 83 | dimension |
| `sm:min-w-[19rem]` | [src/components/mobility/MobilityPageClient.tsx](src/components/mobility/MobilityPageClient.tsx:358) | 358 | dimension |
| `h-[280px]` | [src/components/steps/StepsChart.tsx](src/components/steps/StepsChart.tsx:78) | 78 | dimension |
| `w-[calc(100vw_-_1.5rem)]` | [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx:59) | 59 | dimension |
| `min-w-[8rem]` | [src/components/ui/dropdown-menu.tsx](src/components/ui/dropdown-menu.tsx:45) | 45 | dimension |
| `min-w-[8rem]` | [src/components/ui/dropdown-menu.tsx](src/components/ui/dropdown-menu.tsx:233) | 233 | dimension |
| `min-w-[12rem]` | [src/components/ui/select.tsx](src/components/ui/select.tsx:69) | 69 | dimension |
| `min-w-[34rem]` | [src/components/weight/WeightImportClient.tsx](src/components/weight/WeightImportClient.tsx:202) | 202 | dimension |
| `min-w-[3.25rem]` | [src/components/workout/RestTimer.tsx](src/components/workout/RestTimer.tsx:116) | 116 | dimension |
| `lg:grid-cols-[1.08fr_0.92fr]` | [src/components/auth/LoginPageClient.tsx](src/components/auth/LoginPageClient.tsx:41) | 41 | grid template |
| `lg:grid-cols-[13rem_minmax(0,1fr)]` | [src/components/mobility/MobilityChecklist.tsx](src/components/mobility/MobilityChecklist.tsx:109) | 109 | grid template |
| `lg:grid-cols-[minmax(0,1fr)_minmax(13rem,0.72fr)]` | [src/components/mobility/MobilityChecklist.tsx](src/components/mobility/MobilityChecklist.tsx:237) | 237 | grid template |
| `xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]` | [src/components/mobility/MobilityChecklist.tsx](src/components/mobility/MobilityChecklist.tsx:311) | 311 | grid template |
| `grid-cols-[1.5rem_minmax(0,1fr)]` | [src/components/mobility/MobilityChecklist.tsx](src/components/mobility/MobilityChecklist.tsx:425) | 425 | grid template |
| `grid-cols-[0.45rem_minmax(0,1fr)]` | [src/components/mobility/MobilityChecklist.tsx](src/components/mobility/MobilityChecklist.tsx:454) | 454 | grid template |
| `lg:grid-cols-[minmax(0,1fr)_auto]` | [src/components/mobility/MobilityPageClient.tsx](src/components/mobility/MobilityPageClient.tsx:300) | 300 | grid template |
| `sm:grid-cols-[minmax(0,1fr)_auto]` | [src/components/settings/SettingsPageClient.tsx](src/components/settings/SettingsPageClient.tsx:397) | 397 | grid template |
| `sm:grid-cols-[minmax(0,1fr)_auto]` | [src/components/settings/SettingsPageClient.tsx](src/components/settings/SettingsPageClient.tsx:435) | 435 | grid template |
| `xl:grid-cols-[1.1fr_0.9fr]` | [src/components/settings/SettingsPageClient.tsx](src/components/settings/SettingsPageClient.tsx:558) | 558 | grid template |
| `md:grid-cols-[1fr_1fr_auto]` | [src/components/steps/StepsEntryForm.tsx](src/components/steps/StepsEntryForm.tsx:61) | 61 | grid template |
| `xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto]` | [src/components/weight/WeightEntryForm.tsx](src/components/weight/WeightEntryForm.tsx:67) | 67 | grid template |
| `md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto]` | [src/components/workout/CustomWorkoutBuilder.tsx](src/components/workout/CustomWorkoutBuilder.tsx:223) | 223 | grid template |
| `md:grid-cols-[1fr_1.2fr_0.55fr]` | [src/components/workout/SetInput.tsx](src/components/workout/SetInput.tsx:208) | 208 | grid template |
| `md:grid-cols-[1fr_1fr_0.5fr]` | [src/components/workout/SetInput.tsx](src/components/workout/SetInput.tsx:208) | 208 | grid template |
| `shadow-[var(--shadow-overlay)]` | [src/components/ui/dialog.tsx](src/components/ui/dialog.tsx:59) | 59 | token reference |
| `shadow-[var(--shadow-overlay)]` | [src/components/ui/dropdown-menu.tsx](src/components/ui/dropdown-menu.tsx:45) | 45 | token reference |
| `shadow-[var(--shadow-overlay)]` | [src/components/ui/dropdown-menu.tsx](src/components/ui/dropdown-menu.tsx:233) | 233 | token reference |
| `shadow-[var(--shadow-overlay)]` | [src/components/ui/select.tsx](src/components/ui/select.tsx:69) | 69 | token reference |
| `shadow-[var(--shadow-overlay)]` | [src/components/ui/sheet.tsx](src/components/ui/sheet.tsx:63) | 63 | token reference |
| `shadow-[var(--shadow-overlay)]` | [src/components/ui/sonner.tsx](src/components/ui/sonner.tsx:29) | 29 | token reference |
| `before:content-['']` | [src/components/ui/checkbox.tsx](src/components/ui/checkbox.tsx:20) | 20 | content |

Of the 41, **15** are grid templates — a shape a
utility scale genuinely cannot express, and arguably legitimate. The
**6** `shadow-[var(--shadow-overlay)]` uses reference the token layer
correctly but do so through a bracket because no `shadow-overlay` utility is
declared in `globals.css`'s `@theme inline` block. That leaves
**20** genuine one-off literal values.

### B3. Tokens defined but never referenced

`tokens.css` defines **105** custom properties.

**Seven are referenced nowhere at all** — not in `globals.css`, not in any
component:

| Token | Value |
| --- | --- |
| `--font-weight-regular` | `400` |
| `--font-weight-semibold` | `600` |
| `--space-1` | `0.25rem` |
| `--space-5` | `1.25rem` |
| `--space-6` | `1.5rem` |
| `--space-12` | `3rem` |
| `--space-16` | `4rem` |

A further **four spacing tokens** (`--space-4`, `--space-8`, `--space-10`, and
the `--layout-*` values built from them) are referenced only inside
`tokens.css` itself or once in `globals.css`. Only `--space-2` and `--space-3`
reach any rule that components use. **Nine of the eleven spacing steps are
effectively dead**, which is the source-side counterpart to the 41 distinct
rendered `padding` tuples in section A: component spacing comes from Tailwind's
own scale, not from the token scale.

The ten `--paper-*` ramp tokens and `--olive-on` are referenced only within
`tokens.css`, where they are aliased into semantic names. That is the intended
indirection, not leakage.

---

## C. Interaction state coverage

764 interactive elements (`button, a, input, select, textarea, [role=button],
[tabindex]` and the ARIA control roles), 157 distinct shapes. Measured at
1280px with transitions disabled.


| State | Elements with a distinct computed style | Share |
| --- | ---: | ---: |
| `:hover` | 589 / 764 | 77% |
| `:active` | 13 / 764 | 2% |
| `:focus-visible` | 764 / 764 | 100% |
| focus ring matching the token signature exactly | 744 / 764 | 97% |

Distinct rendered focus-ring signatures across the whole app:

| Outline | Elements |
| --- | ---: |
| `2px solid rgb(79, 93, 42) / offset 2px` | 744 |
| `2px solid rgb(79, 93, 42) / offset 0px` | 20 |

Shapes missing `:hover`, `:active` or both — 147 of 157 distinct shapes, 751 elements:

| Element | Class (truncated) | Count | Routes | :hover | :active | :focus-visible |
| --- | --- | ---: | --- | :-: | :-: | :-: |
| `<button type=button>` | `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-` | 179 | dashboard, steps, weight, workout, workout-plan, workout-history, settings | ✓ | ✗ | ✓ |
| `<a>` | `text-caption text-secondary underline-offset-4 hover:text-primary hover:` | 126 | workout-history | ✓ | ✗ | ✓ |
| `<a>` | `relative flex min-h-touch items-center gap-3 px-4 text-row transition-co` | 77 | all 11 | ✗ | ✗ | ✓ |
| `<a>` | `relative flex min-h-touch min-w-touch flex-col items-center justify-cent` | 77 | all 11 | ✗ | ✗ | ✓ |
| `<button type=button>` | `flex size-touch items-center justify-center rounded-control border font-` | 44 | dashboard, mobility | ✓ | ✗ | ✓ |
| `<button type=button role=checkbox>` | `peer relative flex size-4 items-center justify-center rounded-control bo` | 33 | mobility | ✓ | ✗ | ✓ |
| `<button type=button>` | `w-full min-w-0 rounded-control text-left focus-visible:outline-2 focus-v` | 33 | mobility | ✗ | ✗ | ✓ |
| `<button type=button>` | `inline-flex min-h-8 items-center gap-1.5 rounded-pill border border-cont` | 33 | mobility | ✓ | ✗ | ✓ |
| `<button type=button>` | `flex min-h-touch flex-col items-center justify-center gap-1 rounded-cont` | 31 | workout-history | ✓ | ✗ | ✓ |
| `<g>` | `` | 24 | steps, weight | ✗ | ✗ | ✓ |
| `<section>` | `` | 12 | all 12 | ✗ | ✗ | ✓ |
| `<a>` | `flex h-14 shrink-0 items-center gap-2.5 border-b border-ink-line px-4 te` | 11 | all 11 | ✗ | ✗ | ✓ |
| `<button type=submit>` | `flex min-h-touch w-full items-center gap-3 px-4 text-row text-ink-dim tr` | 11 | all 11 | ✓ | ✗ | ✓ |
| `<button type=submit>` | `flex size-touch items-center justify-center text-ink-dim transition-colo` | 11 | all 11 | ✓ | ✗ | ✓ |
| `<input type=number>` | `w-full min-w-0 rounded-control border border-control-border bg-raised px` | 6 | steps, weight, settings | ✓ | ✗ | ✓ |
| `<a>` | `inline-flex min-h-touch items-center gap-1.5 text-row font-medium text-p` | 5 | flexibility-balance | ✓ | ✗ | ✓ |
| `<a>` | `text-caption text-secondary underline-offset-2 hover:text-primary hover:` | 4 | dashboard | ✓ | ✗ | ✓ |
| `<button type=button>` | `min-h-8 rounded-pill px-3 font-mono text-label uppercase transition-colo` | 3 | steps | ✗ | ✗ | ✓ |
| `<input type=date>` | `w-full min-w-0 rounded-control border border-control-border bg-raised px` | 3 | steps, weight, settings | ✓ | ✗ | ✓ |
| `<svg role=application>` | `recharts-surface` | 2 | steps, weight | ✗ | ✗ | ✓ |
| `<a>` | `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-` | 2 | weight, workout-exercise | ✓ | ✗ | ✓ |
| `<button type=button role=combobox>` | `flex items-center justify-between gap-2 rounded-control border border-co` | 2 | weight, settings | ✓ | ✗ | ✓ |
| `<button type=submit>` | `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-` | 2 | weight, settings | ✓ | ✗ | ✓ |
| `<input>` | `h-11 w-full min-w-0 rounded-control border border-control-border bg-rais` | 2 | workout | ✓ | ✗ | ✓ |
| `<select>` | `h-11 w-full min-w-0 rounded-control border border-control-border bg-rais` | 2 | workout | ✓ | ✗ | ✓ |
| `<button type=button>` | `min-h-9 rounded-pill px-3 py-2 text-caption font-medium leading-tight tr` | 2 | mobility | ✗ | ✗ | ✓ |
| `<input>` | `w-full min-w-0 rounded-control border border-control-border bg-raised px` | 2 | settings | ✓ | ✗ | ✓ |
| `<a>` | `text-ember underline-offset-2 hover:underline` | 1 | dashboard | ✓ | ✗ | ✓ |
| `<a>` | `text-ember underline underline-offset-2` | 1 | steps | ✗ | ✗ | ✓ |
| `<select>` | `` | 1 | weight | ✗ | ✗ | ✓ |
| `<button type=button>` | `flex items-center gap-1 text-xs text-muted-foreground transition-colors ` | 1 | weight | ✓ | ✗ | ✓ |
| `<a>` | `` | 1 | weight-import | ✗ | ✗ | ✓ |
| `<button>` | `inline-flex items-center justify-center whitespace-nowrap rounded-contro` | 1 | weight-import | ✓ | ✗ | ✓ |
| `<button>` | `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-` | 1 | weight-import | ✓ | ✗ | ✓ |
| `<button type=button>` | `inline-flex items-center justify-center gap-2 rounded-control border fon` | 1 | workout-plan | ✓ | ✗ | ✓ |
| `<input type=text>` | `w-full min-w-0 rounded-control border border-control-border bg-raised px` | 1 | settings | ✓ | ✗ | ✓ |
| `<input type=email>` | `h-11 w-full min-w-0 rounded-control border border-control-border bg-rais` | 1 | login | ✓ | ✗ | ✓ |
| `<input type=password>` | `h-11 w-full min-w-0 rounded-control border border-control-border bg-rais` | 1 | login | ✓ | ✗ | ✓ |
| `<button type=button>` | `font-medium text-primary underline-offset-4 transition-colors duration-(` | 1 | login | ✓ | ✗ | ✓ |

Shapes that DO define `:active` (the complete list):

| Element | Count | Routes | Change under `:active` |
| --- | ---: | --- | --- |
| `<button>` `inline-flex items-center justify-center gap-2 ` | 11 | dashboard, steps, weight, workout, workout-plan, mobility, login | background-color: rgb(26, 22, 19) → rgb(52, 44, 35) |
| `<a>` `inline-flex items-center justify-center gap-2 ` | 2 | dashboard, steps | background-color: rgb(26, 22, 19) → rgb(52, 44, 35) |

The headline: **`:active` is essentially absent.** 13 of 764 elements change
under `:active`, and every one of them is a `Button` with the `primary` or
`critical` variant — the two variants that declare `active:` classes in
[src/components/ui/button.tsx](src/components/ui/button.tsx:27). The `secondary`,
`ghost` and `link` variants declare none, and neither does any ledger row, nav
item, tab, checkbox or form control.

By contrast, the focus ring is the most disciplined thing measured in this
audit: **two** rendered signatures across the entire app, both the token olive,
differing only in offset. The `0px` offset on the 20 form controls is
deliberate — [src/components/ui/input.tsx](src/components/ui/input.tsx:16)
declares `focus-visible:outline-offset-0`. The base rule at
[src/app/globals.css](src/app/globals.css:204) covers everything else, so there
is no element anywhere without a focus ring.

---

## D. Touch targets at 375px


Interactive controls rendering below 44×44 CSS px at 375px: **415** occurrences across **110** distinct shapes.

| Control | Measured W×H | Failing axis | Count | Routes | Sample label |
| --- | --- | --- | ---: | --- | --- |
| `<button type=button role=checkbox>` | **16×16** | both | 33 | /mobility | Seated Ankle Pumps / Ankle Circles / Wall Ankl |
| `<a>` | **40.6×16.2** | both | 1 | / | History |
| `<a>` | **47×16.2** | height | 1 | / | Full plan |
| `<a>` | **48.3×16.2** | height | 1 | / | All steps |
| `<button type=button>` | **48.7×17.5** | height | 1 | /login | Sign Up |
| `<button type=button>` | **32×32** | both | 158 | /steps, /weight, /workout/history | Previous month / Next month / Edit Fri, Jul 31 |
| `<button type=button>` | **39.3×28** | both | 1 | /weight | 1M |
| `<button type=button>` | **40.4×28** | both | 1 | /weight | 1W |
| `<a>` | **70.9×16.2** | height | 3 | /workout/history | C3 Face Pull |
| `<a>` | **72.3×16.2** | height | 5 | /workout/history | B1 Leg Press / A1 Leg Press |
| `<button type=button>` | **42×28** | both | 1 | /weight | 3M |
| `<button type=button>` | **38.8×32** | both | 1 | /steps | 7D |
| `<a>` | **77.2×16.2** | height | 1 | / | Open session |
| `<a>` | **79.1×16.2** | height | 2 | /workout/history | C2 Cable Curl |
| `<a>` | **79.2×16.2** | height | 1 | /workout/history | C3 Cable Curl |
| `<button type=button>` | **45.9×28** | height | 1 | /weight | ALL |
| `<button type=button>` | **90.7×16** | height | 1 | /weight | More options |
| `<a>` | **95.2×16.2** | height | 2 | /workout/history | A2 Machine Row |
| `<a>` | **96.9×16.2** | height | 1 | /workout/history | D1 Leg Extension |
| `<a>` | **97×16.2** | height | 2 | /workout/history | C1 Leg Extension |
| `<a>` | **98.5×16.2** | height | 4 | /workout/history | C1 Lying Leg Curl / B2 Leg Extension |
| `<a>` | **99.7×16.2** | height | 1 | /workout/history | A1 Machine Press |
| `<a>` | **100.9×16.2** | height | 1 | /workout/history | C2 Lying Leg Curl |
| `<button type=button>` | **53.5×32** | height | 1 | /steps | Week |
| `<a>` | **105.8×16.2** | height | 1 | /workout/history | Machine Pec Deck |
| `<a>` | **106×16.2** | height | 1 | /workout/history | B1 Walking Lunges |
| `<a>` | **108×16.2** | height | 1 | /workout/history | D1 Seated Leg Curl |
| `<a>` | **108.4×16.2** | height | 2 | /workout/history | B2 Walking Lunges |
| `<a>` | **110.5×16.2** | height | 2 | /workout/history | C2 Seated Leg Curl |
| `<a>` | **112.8×16.2** | height | 1 | /workout/history | B1 Single-Leg Press |
| `<a>` | **119.4×16.2** | height | 1 | /workout/history | C2 Seated Calf Raise |
| `<a>` | **120×16.2** | height | 3 | /workout/history | C1 Reverse Pec Deck / Machine Chest Press |
| `<button type=button>` | **60.9×32** | height | 1 | /steps | Month |
| `<a>` | **122.5×16.2** | height | 3 | /workout/history | A2 Seated Cable Row |
| `<a>` | **125.3×16.2** | height | 2 | /workout/history | Cable Face Pull (rope) |
| `<a>` | **136.3×15** | height | 1 | / | At risk — backfill 5 days |
| `<a>` | **129.2×16.2** | height | 2 | /workout/history | Dumbbell Incline Press |
| `<a>` | **136.2×16.2** | height | 2 | /workout/history | A1 Chest Machine Press |
| `<a>` | **137.3×16.2** | height | 1 | /workout/history | A1 Single-Leg Leg Press |
| `<a>` | **140×16.2** | height | 2 | /workout/history | C1 Seated Leg Extension |
| `<a>` | **140.1×16.2** | height | 2 | /workout/history | A1 Incline Machine Press |
| `<a>` | **141.9×16.2** | height | 2 | /workout/history | B1 Lat Pulldown Variation |
| `<a>` | **142.5×16.2** | height | 3 | /workout/history | C2 Seated Leg Extension / D3 Seated Leg Extens |
| `<a>` | **143×16.2** | height | 2 | /workout/history | B2 Machine Lateral Raise |
| `<a>` | **144.5×16.2** | height | 1 | /workout/history | B1 Seated Hamstring Curl |
| `<a>` | **145.4×16.2** | height | 4 | /workout/history | A1 Dumbbell Incline Press / A1 Incline Dumbbel |
| `<a>` | **147.3×16.2** | height | 2 | /workout/history | A2 Seated Hamstring Curl |
| `<a>` | **149.4×16.2** | height | 4 | /workout/history | D1 Hip Adduction Machine / D1 Hip Abduction Ma |
| `<a>` | **149.5×16.2** | height | 1 | /workout/history | C1 Hip Abduction Machine |
| `<a>` | **151×16.2** | height | 2 | /workout/history | C1 Triceps Pressdown, bar |
| `<a>` | **151.8×16.2** | height | 4 | /workout/history | D2 Hip Abduction Machine / D2 Hip Adduction Ma |
| `<a>` | **152×16.2** | height | 1 | /workout/history | C3 Hip Abduction Machine |
| `<a>` | **155.7×16.2** | height | 2 | /workout/history | A2 One-Arm Dumbbell Row |
| `<a>` | **156.4×16.2** | height | 1 | /workout/history | B3 Machine Shoulder Press |
| `<a>` | **157.9×16.2** | height | 3 | /workout/history | C1 Rope Triceps Pressdown |
| `<a>` | **158.7×16.2** | height | 1 | /workout/history | B1 Lunges / Walking Lunges |
| `<a>` | **152.6×17** | height | 1 | /weight/import | Back to weight |
| `<a>` | **160.3×16.2** | height | 1 | /workout/history | C2 Rope Triceps Pressdown |
| `<a>` | **162.6×16.2** | height | 2 | /workout/history | C2 Reverse Cable Crossover |
| `<a>` | **162.7×16.2** | height | 8 | /workout/history | B1 Neutral-Grip Lat Pulldown |
| `<a>` | **82.7×32** | height | 1 | /steps | Log steps |
| `<a>` | **163.9×16.2** | height | 1 | /workout/history | Cable Straight-Arm Pulldown |
| `<a>` | **167.4×16.2** | height | 1 | /workout/history | C3 Dumbbell Overhead Press |
| `<a>` | **173.5×16.2** | height | 2 | /workout/history | Seated Cable Row (close-grip) |
| `<a>` | **183.8×16.2** | height | 2 | /workout/history | Machine Chest Press (warm-up) |
| `<a>` | **187.4×16.2** | height | 7 | /workout/history | B2 Dumbbell / Plate Lateral Raise |
| `<a>` | **194.8×16.2** | height | 1 | /workout/history | At home - Upper B Mobility Primer |
| `<a>` | **200×16.2** | height | 2 | /workout/history | C3 Face-Away Bayesian Cable Curl |
| `<button type=button>` | **81.1×40** | height | 1 | /workout | Add |
| `<a>` | **201.2×16.2** | height | 1 | /workout/history | E2 Standing Dumbbell Reverse Curl |
| `<a>` | **204.3×16.2** | height | 1 | /workout/history | C3 Reverse Pec Deck or Dead Hang |
| `<a>` | **204.7×16.2** | height | 1 | /workout/history | F1 Triceps Pushdown, bar (drop set) |
| `<a>` | **218.5×16.2** | height | 2 | /workout/history | C2 Standing Cable Anti-Rotation Press |
| `<a>` | **219.8×16.2** | height | 1 | /workout/history | B1 Walking Lunges / Stationary Lunges |
| `<a>` | **238.1×16.2** | height | 1 | /workout/history | B1 Bench-Supported Bulgarian Split Squat |
| `<button type=button>` | **128.4×32** | height | 5 | / | Start Session |
| `<button type=button>` | **129.4×32** | height | 33 | /mobility | How to do it |
| `<a>` | **257.8×16.2** | height | 2 | /workout/history | A1 Supported Stationary Bulgarian Split Squa |
| `<a>` | **260.8×16.2** | height | 1 | /workout/history | E1 Single-Arm Seated Dumbbell Preacher Curl |
| `<a>` | **266.7×16.2** | height | 3 | /workout/history | A2 Chest-Supported Row or Seated Cable Row |
| `<button type=submit>` | **109.7×40** | height | 1 | /settings | Save Profile |
| `<a>` | **271×16.2** | height | 1 | /workout/history | 4-Min AMRAP: Chest Press × 8 / Cable Row × 8 |
| `<a>` | **138.7×32** | height | 1 | /workout/exercise/Machine%20Chest%20Press | Back to history |
| `<a>` | **276.6×16.2** | height | 1 | /workout/history | C2 Machine Preacher Curl or Cable Lateral Ra |
| `<a>` | **287.5×16.2** | height | 1 | /workout/history | C1 Back Hyperextension / Back Extension Mach |
| `<a>` | **287.8×16.2** | height | 1 | /workout/history | A1 Dumbbell Incline Press or Machine Incline |
| `<a>` | **153.8×31.2** | height | 1 | /steps | backfill Aug 1 |
| `<a>` | **151.7×32** | height | 1 | / | Open next action |
| `<button type=submit>` | **128×40** | height | 1 | /steps | Save steps |
| `<a>` | **318.8×16.2** | height | 1 | /workout/history | C1 Triceps Extension Machine or Triceps Push |
| `<button type=button>` | **130.8×40** | height | 1 | /weight | Export CSV |
| `<a>` | **130.8×40** | height | 1 | /weight | Import CSV |
| `<button>` | **132.6×40** | height | 1 | /weight/import | Choose File |
| `<button type=button>` | **141.2×40** | height | 1 | /workout | Start session |
| `<button type=button>` | **148.7×40** | height | 1 | /mobility | Log back care |
| `<button type=button>` | **150.3×40** | height | 1 | /workout/plan | Start new plan |
| `<button type=button>` | **167.5×36** | height | 2 | /mobility | Standard / Foot flare recovery |
| `<button>` | **152.6×40** | height | 1 | /weight/import | Back to weight |
| `<button type=button>` | **152.7×40** | height | 1 | /mobility | Log desk reset |
| `<button type=button>` | **165.5×40** | height | 1 | /settings | Export CSV Files |
| `<button type=button>` | **193.8×40** | height | 2 | /settings | Export JSON Backup / Import JSON Backup |
| `<button type=button>` | **199.4×40** | height | 1 | /settings | Clear All Tracker Data |
| `<button type=button>` | **201.7×40** | height | 1 | /mobility | Mark primer complete |
| `<button type=button>` | **217.2×40** | height | 1 | /mobility | Mark recovery complete |
| `<button type=button>` | **343×32** | height | 6 | /workout, /workout/plan | Start Session |
| `<button type=button>` | **315×35.7** | height | 12 | /mobility | Wall Ankle RocksHeel stays down; knee tracks / |
| `<input type=date>` | **343×40** | height | 1 | /weight | — |
| `<input type=number>` | **343×40** | height | 1 | /weight | — |
| `<button type=submit>` | **343×40** | height | 1 | /weight | Log |
| `<button type=button>` | **343×40** | height | 1 | /workout | Save |

Excluded from the count above (31 matches): zero-area nodes, 
visually-hidden controls, disabled controls, and non-control nodes that
match the selector (Recharts `<g tabindex>`, the Sonner toast region).

| Excluded node | W×H | Count | Reason |
| --- | --- | ---: | --- |
| `<g>`  | 0×0 | 14 | zero area — not hit-testable |
| `<section>` Notifications alt+T | 375×0 | 12 | zero area — not hit-testable |
| `<div>` recharts-tooltip-wrapper | 22×22 | 2 | not an interactive control |
| `<g>`  | 291×0 | 1 | zero area — not hit-testable |
| `<select>` NormalFastingBaseline | 1×1 | 1 | visually hidden behind a styled control |
| `<button>` Save template | 148.8×40 | 1 | disabled |

---

## E. Typography discipline

### E1. Fraunces

Fraunces is confined to 39 elements and **never renders bold**. The heaviest
computed weight is 450, on `<h1>`, which is the value set in
[src/app/globals.css](src/app/globals.css:157). Nothing to flag.


| Computed weight | Size | Tag | Elements | Routes | Example text |
| --- | --- | --- | ---: | --- | --- |
| 450 | 30px | `<h1>` | 24 | all 12 | High step load. Required foot-flare recovery app / Movement quality sy |
| 400 | 14px | `<span>` | 11 | all 11 | Athanor |
| 400 | 14px | `<p>` | 2 | login | Athanor |
| 400 | 30px | `<p>` | 2 | login | Private performance operating system. |

One thing worth recording rather than flagging: system serif fallbacks ship
only 400 and 700, so the 450 on `<h1>` renders as 400 until the Fraunces
webfont loads, then as a genuine 450. Both are under 500, so the rule holds in
both states.

### E2. Numerals


| Category | Elements |
| --- | ---: |
| Numerals rendering as JetBrains Mono **with** `tabular-nums` | 802 |
| **Data numerals rendering without mono + tabular-nums** | 126 |
| Prose containing incidental digits (dates, "3 x 10-12", "Block C:") | 842 |

Data numerals are the flag. Prose is listed second for completeness — body copy is expected to be Inter.

**Data numerals not rendering as mono + tabular:**

| Selector | Font family | font-variant-numeric | Elements | Routes | Sample values |
| --- | --- | --- | ---: | --- | --- |
| `div > span.text-[0.625rem].leading-none` | Inter | normal | 62 | steps | 1 · 2 · 3 |
| `div > span.inline-flex.w-fit.items-center…(+10)` | Inter | normal | 18 | flexibility-balance, workout | 7 · 2 · 11 |
| `div > p.text-label.uppercase.text-tertiary` | Inter | normal | 12 | mobility | 1 · 2 · 3 |
| `div > p.mt-1.5.text-caption.text-tertiary` | Inter | normal | 6 | dashboard, steps | 0 · 5 · 2026-07-29 |
| `div > button.inline-flex.items-center.justify-center…(+24)` | Inter | normal | 6 | weight | 1W · 1M · 3M |
| `span#recharts_measurement_span` | Inter | normal | 4 | steps, weight | 0 · 282 |
| `p > a.text-ember.underline-offset-2.hover:underline` | Inter | normal | 2 | dashboard | 5 |
| `div > span.text-label.uppercase.text-tertiary` | Inter | normal | 2 | dashboard | 8,000 |
| `section > p.rounded-control.border-l-2.px-3…(+6)` | Inter | normal | 2 | dashboard | 0 |
| `div > span.tabular.text-data-lg.font-medium…(+2)` | Inter | normal | 2 | steps | 0 |
| `div > span.text-caption.text-tertiary` | Inter | normal | 2 | steps | 8,000 |
| `div > span.tabular.mt-1.text-label…(+1)` | Inter | normal | 2 | steps | 0 |
| `div > button.min-h-8.rounded-pill.px-3…(+12)` | JetBrains Mono | normal | 2 | steps | 7D |
| `div > span` | Inter | normal | 2 | weight | 154.0 lb |
| `div > span.absolute.bottom-4.right-5…(+11)` | JetBrains Mono | normal | 2 | weight | 154.0 |

**Prose containing incidental digits** (not a numeral-discipline failure):

| Selector | Elements | Routes | Sample text |
| --- | ---: | --- | --- |
| `div > a.text-caption.text-secondary.underline-offset-4…(+5)` | 226 | workout-history | A1 Chest Machine Press |
| `div > p.mt-1.text-caption.text-tertiary` | 102 | dashboard, mobility, workout, workout-plan | Feet / soles and lower back, 0-10. One t |
| `div > span.text-row.font-medium.text-primary` | 94 | workout, workout-plan | A1 Lying Leg Curl |
| `div > div.bg-sunken.px-2.py-1…(+3)` | 88 | weight | Sunday, Aug 2, 2026 |
| `div > span.truncate.text-secondary` | 66 | steps | Fri, Jul 31 |
| `ul > li.text-caption.text-tertiary` | 48 | workout-plan | Block B: Leg Press or Pendulum Squat (if |
| `div > span.hidden.text-row.text-secondary…(+2)` | 47 | workout, workout-plan | 3 x 10-12, tempo 2-1-2, RPE 6-7, rest 12 |
| `div > span.ledger-sub.mt-1.block…(+1)` | 47 | workout, workout-plan | 3 x 10-12, tempo 2-1-2, RPE 6-7, rest 12 |
| `ul > li.flex.items-start.gap-2…(+2)` | 22 | flexibility-balance, workout-plan | Time budget: 6-8 min. |
| `div > p.text-row.text-secondary` | 16 | steps, workout-plan | August 2026 |
| `div > p.mt-1.5.text-caption.text-tertiary` | 10 | dashboard, steps, weight | Step goal suspended · 0 steps logged |
| `section > p.mt-2.max-w-2xl.text-row…(+1)` | 10 | workout-plan | Lower-Body Flush + Sole Care, 10-14 minu |
| `section > p.rounded-control.border-l-2.px-3…(+6)` | 8 | weight, workout, workout-plan | Pace above ~1% of bodyweight/wk — consid |
| `div > h2` | 6 | workout-exercise, workout-history | Mon, Apr 13 |
| `div > span.inline-flex.w-fit.items-center…(+10)` | 6 | workout-plan | 5 Strength |
| `div > p.mt-2.text-body-lg.text-secondary` | 4 | dashboard, workout-exercise | The recent step average is 11,544, so co |
| `div > p.mt-3.border-t.border-rule…(+4)` | 4 | dashboard, mobility | Last logged Jul 31 — feet 1/10, lower ba |
| `div > p.rounded-control.bg-sunken.px-2.5…(+3)` | 4 | mobility | Effort: 1-3/10 |

(33 prose shapes total; the 18 largest are listed.)

Two specific defects are visible in that table:

- **`.tabular` is not a real class.** [src/components/steps/StepsProgressRing.tsx](src/components/steps/StepsProgressRing.tsx:49)
  lines 49 and 53 apply `className="tabular …"`. No `.tabular` utility is
  defined in `globals.css` or generated by Tailwind — the utility that exists
  is `.num`. Both spans render in Inter with proportional figures.
- **Two elements compute JetBrains Mono but `font-variant-numeric: normal`** —
  the `.num` class sets `tabular-nums`, so these get the font from somewhere
  else (`font-mono`) without the figure setting: the period toggle on `/steps`
  and the chart end-label on `/weight`.

The 62-element block is the steps heatmap: [src/components/steps/StepsHeatmap.tsx](src/components/steps/StepsHeatmap.tsx:85)
renders the day-of-month number in a bare `<span className="text-[0.625rem] leading-none">`,
while the step count on the very next line (86) correctly uses `num num-left`.

### E3. Number formatting call sites

**54 call sites** across 15 files. Three formatting families are in use.

| Formatter | Call sites | Produces | Where |
| --- | ---: | --- | --- |
| `toFixed(1)` (direct, not via `units.ts`) | 14 | `154.0` — 1 dp, no unit, no separator | `WeightChart` ×3, `SetInput` ×4, `WeightStatsCards` ×3, `DashboardWeightChart`, `WeightEntryForm` |
| `toLocaleString()` (direct) | 27 | `11,544` — 0 dp, locale separator, no unit | `DashboardPageClient` ×11, `StepsPageClient` ×7, `StepsProgressRing` ×4, `SettingsPageClient` ×3, others |
| `src/lib/units.ts` formatters | 13 | value **+ space + unit** | `formatBodyweight`, `formatWorkoutLoad`, `formatDistance`, `formatWeight`, … |

Inconsistencies, with locations:

1. **Thousands separators are applied to steps but not to weights.**
   `toLocaleString()` is used for every step count; `toFixed(1)` for every
   bodyweight. A 4-digit weight would render `1234.5`, a 4-digit step count
   `1,234`.
2. **Volume alone rounds before separating.** [src/lib/units.ts](src/lib/units.ts:121)
   `formatWorkoutVolume` is the only formatter combining both:
   `Math.round(kg).toLocaleString()` → `12,480 kg`. Every other kg value keeps
   1 dp and no separator (`formatWorkoutLoad` → `52.5 kg`).
3. **Three decimal precisions coexist for the same physical quantity.**
   [src/lib/units.ts](src/lib/units.ts:95) `formatBodyweightConversion`
   emits `326.7 lb = 148.19 kg = 23 st 4.7 lb` — 1 dp, 2 dp and 1 dp in a
   single string. [src/actions/user.ts](src/actions/user.ts:398) uses
   `toFixed(2)`.
4. **`toLocaleString()` is called with no locale argument** at all 27 direct
   sites, so separator style follows the visitor's browser locale while the
   date formatting elsewhere pins `"en-US"` explicitly (e.g.
   [src/app/(app)/mobility/page.tsx](src/app/(app)/mobility/page.tsx:48)).
   Steps read `11,544` in en-US and `11.544` in de-DE on the same data.
5. **Two null placeholders.** `"--"` (two hyphens) at 18 sites; `"—"` (em dash)
   at 1.

---

## F. Iconography

### Rendered


| Icon set | Rendered size | stroke-width | Instances | Routes | Example icons |
| --- | --- | --- | ---: | --- | --- |
| lucide | 14px×14px | 2 | 382 | dashboard, mobility, steps, weight | circle-check, chevron-down, pencil, trash2 |
| lucide | 16px×16px | 1.75 | 176 | all 11 | layout-dashboard, person-standing, activity, dumbbell, footprints |
| lucide | 20px×20px | 1.75 | 132 | all 11 | person-standing, activity, dumbbell, footprints, scale |
| lucide | 16px×16px | 2 | 102 | all 11 | log-out, arrow-right, play, circle-check, chevron-down |
| other | 16px×16px | 1px | 44 | all 11 | — |
| lucide | 20px×20px | 2.25 | 22 | all 11 | layout-dashboard, activity, person-standing, settings, footprints |
| lucide | 16px×16px | 1.5 | 10 | flexibility-balance | circle-dot, shield-check, rotate-ccw, footprints, spline |
| lucide | 20px×20px | 2 | 8 | settings | user-round, paintbrush, palette, shield-alert |
| lucide | 20px×20px | 1.5 | 4 | workout | plus, save |
| other | 20px×20px | 1px | 2 | login | — |
| other | 148px×148px | 1px | 2 | steps | — |
| lucide | 32px×32px | 2 | 2 | weight-import | file-text |
| lucide | 12px×12px | 2 | 2 | weight | chevron-down |

`other` = the four hand-authored SVGs, which report `stroke-width: 1px`
because they set stroke on child paths rather than the root: `BrandMark`
(2.2), the login mark, and the `StepsProgressRing` track (12).

### Flags

- **One icon set** — `lucide-react`, imported in 37 files. No mixing. Good.
- **Six rendered icon sizes**: 12, 14, 16, 20, 32 and 148 px.
- **Five stroke widths on lucide icons alone**: 1.5, 1.75, 2 (the library
  default, i.e. unspecified), 2.25 and 3. Plus 2.2 on `BrandMark` and 12 on the
  progress ring.
- **The same size renders at three different stroke widths.** 16px icons appear
  at 1.5 (`/flexibility-balance`), 1.75 (nav) and 2 (everywhere else); 20px
  icons at 1.5, 1.75, 2 and 2.25.
- **Stroke width is used to encode state in one place only**:
  [src/components/layout/MobileNav.tsx](src/components/layout/MobileNav.tsx:51)
  sets `strokeWidth={isActive ? 2.25 : 1.75}`. The desktop sidebar
  ([DesktopSidebar.tsx:56](src/components/layout/DesktopSidebar.tsx:56)) uses a
  flat 1.75 for both states.
- **The largest group — 382 icons at 14px / stroke 2 — is unstyled**: no
  `strokeWidth` prop, so it takes the lucide default.

Source-level stroke widths: `1.5` (2 sites), `1.75` (2), `2` (3, all Recharts),
`2.2` (4, BrandMark paths), `2.25` (1), `3` (1), `12` (2).

---

## G. State coverage per route

### Structural

| | |
| --- | --- |
| `loading.tsx` files | 2 — [src/app/(app)/loading.tsx](src/app/(app)/loading.tsx) and [src/app/login/loading.tsx](src/app/login/loading.tsx) |
| `error.tsx` files | **0** |
| `global-error.tsx` | **0** |
| `not-found.tsx` | **0** |
| `<Suspense>` boundaries in `src/` | **0** |

**No route in the application has an error boundary.** A throw in any server
component, action or client render escapes to the framework default: the dev
overlay locally, and Next's built-in "Application error: a client-side
exception has occurred" screen in production. This applies to all 12 routes.

### Per route

| Route | Loading | Empty | Error |
| --- | --- | --- | --- |
| `/` | `PageSkeleton` | **Ad-hoc** — `<p>No completed training sessions yet.</p>` ([DashboardPageClient.tsx:470](src/components/dashboard/DashboardPageClient.tsx:470)); `<p>No weight data yet</p>` ([DashboardWeightChart.tsx:34](src/components/dashboard/DashboardWeightChart.tsx:34)) | none |
| `/steps` | `PageSkeleton` | `EmptyState` ×2 ([StepsChart.tsx:54](src/components/steps/StepsChart.tsx:54), [StepsHistoryList.tsx:51](src/components/steps/StepsHistoryList.tsx:51)) | none |
| `/weight` | `PageSkeleton` | `EmptyState` ([WeightHistoryList.tsx:90](src/components/weight/WeightHistoryList.tsx:90)) **+ a dashed box** ([WeightChart.tsx:150](src/components/weight/WeightChart.tsx:150)) | none |
| `/weight/import` | `PageSkeleton` | none — form-driven | none |
| `/workout` | `PageSkeleton` | **Ad-hoc** ([WorkoutPageClient.tsx:215](src/components/workout/WorkoutPageClient.tsx:215)) | none |
| `/workout/plan` | `PageSkeleton` | `EmptyState` | none |
| `/workout/history` | `PageSkeleton` | `EmptyState` ([WorkoutHistoryClient.tsx:62](src/components/workout/WorkoutHistoryClient.tsx:62)) **+ ad-hoc** `<p>` for the filtered view (line 151) | none |
| `/workout/exercise/[name]` | `PageSkeleton` | `EmptyState` | none |
| `/mobility` | `PageSkeleton` | **Ad-hoc** ([MobilityPageClient.tsx:188](src/components/mobility/MobilityPageClient.tsx:188)) | none |
| `/flexibility-balance` | `PageSkeleton` | n/a — static reference content | none |
| `/settings` | `PageSkeleton` | none — form | none |
| `/login` | dedicated skeleton card | n/a | none |

Six further paths render nothing of their own — `/dashboard`,
`/nutrition`, `/nutrition/foods`, `/nutrition/meals`, `/nutrition/summary`,
`/nutrition/import` are all bare `redirect()` calls to `/`.

### Flags

- **Three different empty-state treatments** coexist: the `EmptyState`
  component (6 sites), a bare `<p>` (5 sites), and a **dashed bordered box**
  at [WeightChart.tsx:150](src/components/weight/WeightChart.tsx:150). The
  dashed box directly contradicts the contract written into
  [empty-state.tsx](src/components/ui/empty-state.tsx:8), whose comment reads
  "a dashed box would be the only floating container in the ledger".
- **No route shows a bare spinner as its page-level loading state** —
  `PageSkeleton` mirrors the real layout. The 22 `animate-spin` instances are
  all inline pending indicators inside buttons, which is appropriate.
- **No blank screens found.** Every route rendered content at both widths.

---

## H. Motion

### Rendered


| Transition / animation | Duration | Easing | Elements | Routes | Example selectors |
| --- | --- | --- | ---: | --- | --- |
| `color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to` | 0.12s | `cubic-bezier(0.2, 0, 0, 1)` | 895 | all 12 | `li > a.relative.flex.min-h-touch…(+10)`, `li > a.relative.flex.min-h-touch…(+11)`, `div > a.inline-flex.items-center.justify-center…(+24)` |
| `background-color` | 0.12s | `cubic-bezier(0.2, 0, 0, 1)` | 180 | dashboard, steps, weight, workout-exercise | `div > div.ledger-row.ledger-row-interactive`, `div > div.ledger-row.ledger-row-interactive.group` |
| `opacity` | 0.15s | `cubic-bezier(0.4, 0, 0.2, 1)` | 154 | steps, weight | `div > span.flex.justify-end.gap-1…(+6)` |
| `transform, translate, scale, rotate` | 0.12s | `cubic-bezier(0.4, 0, 0.2, 1)` | 66 | mobility | `button > svg` |
| `color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to` | 0.12s | `cubic-bezier(0.4, 0, 0.2, 1)` | 13 | all 12 | `form > button.flex.size-touch.items-center…(+6)`, `div > button.font-medium.text-primary.underline-offset-4…(+7)` |
| `transform, translate, scale, rotate` | 0.18s | `cubic-bezier(0.2, 0, 0, 1)` | 8 | mobility | `div > div.h-full.w-full.rounded-full…(+5)` |
| `color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to` | 0.15s | `cubic-bezier(0.4, 0, 0.2, 1)` | 2 | weight | `form > button.flex.items-center.gap-1…(+4)` |

### Distinct values

| | Rendered | Defined in `tokens.css` |
| --- | --- | --- |
| Durations | **4** — 0.12s, 0.15s, 0.18s, plus `0s` | 2 — `--duration-fast: 120ms`, `--duration-base: 180ms` |
| Easings | **3** — `cubic-bezier(0.2, 0, 0, 1)`, `cubic-bezier(0.4, 0, 0.2, 1)`, `linear` | 1 — `--ease-out: cubic-bezier(0.2, 0, 0, 1)` |

`cubic-bezier(0.4, 0, 0.2, 1)` and `0.15s` are Tailwind's built-in defaults,
reached wherever `transition-*` is written without an accompanying
`duration-(--duration-fast) ease-(--ease-out)` pair. That happens on 169
elements: the 154 opacity transitions on `/steps` and `/weight`, the 13
colour transitions, and 2 on `/weight`.

Source-level: `duration-(--duration-fast)` ×22, `ease-(--ease-out)` ×20,
`duration-(--duration-base)` ×1, and three off-token values —
`duration-300`, `duration-500` and `ease-in-out`, all on one line,
[src/components/ui/sheet.tsx:63](src/components/ui/sheet.tsx:63).

Animations: `animate-spin` ×22, `animate-in`/`animate-out` ×6 each,
`animate-pulse` ×1 ([skeleton.tsx:16](src/components/ui/skeleton.tsx:16)).

### Reduced-motion guards

| Mechanism | Coverage |
| --- | --- |
| Blanket `@media (prefers-reduced-motion: reduce)` in [globals.css:210](src/app/globals.css:210) | **All** transitions and animations — forces `animation-duration` and `transition-duration` to `0.01ms !important` |
| Scoped guard for `.ledger-row-interactive` at [globals.css:328](src/app/globals.css:328) | 1 rule |
| `motion-reduce:transition-none` utility | 25 sites across 22 files |

**Every transition and animation in the app is guarded**, by the blanket rule
if nothing else. The 25 `motion-reduce:` utilities and the scoped
`.ledger-row-interactive` block are redundant with it — they suppress the same
motion the global rule already reduces to 0.01ms. That is duplication, not a
gap. No unguarded motion was found.

---

## Harness

Reaching the routes required getting past Supabase auth, which the audit must
not do by signing in. Two files were temporarily gated behind an
`AUDIT_BYPASS_AUTH=1` environment variable for the duration of the sweep:

- `src/proxy.ts` — return `NextResponse.next()` instead of redirecting to `/login`
- `src/lib/current-user.ts` — return `prisma.user.findFirst()` instead of resolving the Supabase session

Both were reverted after the sweep. `git status` shows only this file added.

Measurement scripts (CDP client, probe, aggregators) were written to the
session scratchpad, outside the repository, and are not part of this branch.
