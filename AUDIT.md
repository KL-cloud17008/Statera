# FitTrack Audit

Audit date: 2026-03-08

Scope:
- Source audit across `src/`, `prisma/`, and root config files.
- Local validation via `npm run lint` and `npm run build`.
- Manual route/authenticated feature exercise was only partially possible from this sandbox. The app depends on Supabase auth, Postgres, and remote Google Fonts; those network calls are blocked here, so authenticated flows were audited from source and runtime checks were limited to local build/lint behavior and publicly reachable code paths.

## Executive Summary

The app already has a usable shell for authentication, dashboard, steps, weight tracking, workout logging, mobility tracking, and partial PWA scaffolding. The biggest gaps are:

- Nutrition and settings are mostly placeholders despite schema support.
- PWA support is incomplete: manifest and worker generation exist, but the worker is not registered and offline sync is a placeholder.
- Several critical UX/data bugs exist in active features:
  - existing Supabase users can hit blank pages if no `User` row exists
  - timezone handling is inconsistent and often uses UTC or server-local dates
  - workout logging lacks form validation and has active-session state bugs
  - exercise history routing is effectively broken for hyphenated exercise names and is not linked from the UI
- The codebase has visible technical debt: stale boilerplate docs, unused components/utilities, generated files included in lint scope, and build dependence on Google Fonts network access.

## A. Tech Stack Inventory

### Stack Summary

| Area | Current Implementation | Notes |
|---|---|---|
| Framework | Next.js 16.1.6 App Router | `src/app/` structure, server components + route handlers |
| Language | TypeScript 5 | Strict mode enabled in `tsconfig.json` |
| React | React 19.2.3 / React DOM 19.2.3 | Mix of server and client components |
| Bundler | Webpack via `next dev --webpack` and `next build --webpack` | `next.config.ts` also contains an unused empty `turbopack` object |
| Package manager | npm | `package-lock.json` present |
| Styling | Tailwind CSS v4 + shadcn/ui scaffold + `tw-animate-css` | Tokens live in `src/app/globals.css` |
| Icons | Lucide React | Used consistently across the app |
| Charts | Recharts | Weight and steps charts |
| State management | Local component state + server actions + server component data fetching | No Redux/Zustand/global client store |
| Auth | Supabase Auth | Email/password via server actions and middleware protection |
| Database | PostgreSQL via Prisma + Supabase | Prisma schema covers user, weight, workouts, mobility, nutrition, daily logs |
| Persistence layer | Remote DB only | No `localStorage`, IndexedDB, or offline cache persistence for user data |
| PWA tooling | Serwist | Worker source in `src/app/sw.ts`, output to `public/sw.js` |
| Deployment target | Vercel (inferred from deployed URL) | No `vercel.json`; deploy is standard Next.js build |

### Storage / Data Layer

- Authenticated app data is stored in Postgres through Prisma models in `prisma/schema.prisma`.
- Supabase session state is managed through cookies in `src/middleware.ts` and `src/lib/supabase-server.ts`.
- No browser-side fallback storage exists.

### API Routes / Serverless Functions

| Route | File | Purpose | Status |
|---|---|---|---|
| `/api/auth/callback` | `src/app/api/auth/callback/route.ts` | Exchanges Supabase auth code for a session | Present, but not used by the current email/password login UI |
| `/api/sync` | `src/app/api/sync/route.ts` | Intended offline sync endpoint | Placeholder only |

### Deployment Configuration

- `next.config.ts` wraps the app with `@serwist/next` and emits `public/sw.js`.
- `src/app/layout.tsx` sets app-level metadata, viewport, and `manifest: "/manifest.json"`.
- No repo-level Vercel config file exists.
- Required env vars are documented in `.env.example`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL`
  - `DIRECT_URL`
- Production build is currently network-sensitive because `next/font/google` fetches Geist and Geist Mono at build time.

### Dependency Inventory

| Package | Type | Observed Purpose | Notes |
|---|---|---|---|
| `@prisma/client` | dependency | Prisma runtime client for DB reads/writes | Used across server actions and pages |
| `@serwist/next` | dependency | Next.js integration for service worker build output | Used in `next.config.ts` |
| `@supabase/ssr` | dependency | Supabase server/browser client helpers for SSR and middleware | Used for auth session handling |
| `@supabase/supabase-js` | dependency | Supabase REST/auth client | Used in `prisma/seed-via-api.ts` |
| `class-variance-authority` | dependency | Variant-based class composition for UI primitives | Used in `button.tsx`, `tabs.tsx` |
| `clsx` | dependency | Conditional class joining | Wrapped by `src/lib/utils.ts` |
| `lucide-react` | dependency | App icon set | Consistently used |
| `next` | dependency | Framework runtime | Core app framework |
| `next-themes` | dependency | Light/dark theme switching | Used by theme provider/toggle and toaster |
| `prisma` | dependency | Prisma CLI and schema tooling | Used by DB scripts and schema generation |
| `radix-ui` | dependency | UI primitives for dialog/select/tabs/slot | Used by shadcn-style UI wrappers |
| `react` | dependency | UI runtime | Core runtime |
| `react-dom` | dependency | React DOM runtime | Required by Next/React |
| `recharts` | dependency | Chart rendering | Steps and weight charts |
| `serwist` | dependency | Service worker runtime | Used in `src/app/sw.ts` |
| `sonner` | dependency | Toast notifications | Used across form interactions |
| `tailwind-merge` | dependency | Tailwind class deduplication | Used in `src/lib/utils.ts` |
| `@tailwindcss/postcss` | devDependency | Tailwind v4 PostCSS plugin | Used in `postcss.config.mjs` |
| `@types/node` | devDependency | Node typings | TS support |
| `@types/react` | devDependency | React typings | TS support |
| `@types/react-dom` | devDependency | React DOM typings | TS support |
| `dotenv` | devDependency | Env loading for seed scripts | Used in `prisma/seed-*.ts` |
| `eslint` | devDependency | Lint runner | `npm run lint` |
| `eslint-config-next` | devDependency | Next.js lint rules | Used in `eslint.config.mjs` |
| `shadcn` | devDependency | Component scaffold CLI | Project contains generated shadcn-style components |
| `sharp` | devDependency | Image processing | No direct app import; likely only optional Next image/build tooling |
| `tailwindcss` | devDependency | Styling framework | Imported in `globals.css` |
| `tw-animate-css` | devDependency | Animation utility classes | Imported in `globals.css` |
| `typescript` | devDependency | TS compiler/tooling | Project language tooling |

### Library Changes

- None in Phase 1.

## B. Route Inventory

| Route | File | Auth | Purpose | Current Status |
|---|---|---|---|---|
| `/` | `src/app/(app)/page.tsx` | Required | Dashboard / landing page | Implemented, partial |
| `/login` | `src/app/login/page.tsx` | Public | Sign in / sign up | Implemented |
| `/steps` | `src/app/(app)/steps/page.tsx` | Required | Steps tracking | Implemented, partial |
| `/weight` | `src/app/(app)/weight/page.tsx` | Required | Weight tracking | Implemented, partial |
| `/weight/import` | `src/app/(app)/weight/import/page.tsx` | Required | CSV weight import | Implemented |
| `/workout` | `src/app/(app)/workout/page.tsx` | Required | Active workout / day view | Implemented, partial |
| `/workout/plan` | `src/app/(app)/workout/plan/page.tsx` | Required | Full training plan | Implemented |
| `/workout/history` | `src/app/(app)/workout/history/page.tsx` | Required | Completed session history | Implemented, limited |
| `/workout/exercise/[name]` | `src/app/(app)/workout/exercise/[name]/page.tsx` | Required | Exercise-specific history | Present but effectively unreachable and slug handling is faulty |
| `/mobility` | `src/app/(app)/mobility/page.tsx` | Required | Pre/post workout and undo-sitting routines | Implemented |
| `/nutrition` | `src/app/(app)/nutrition/page.tsx` | Required | Nutrition logging dashboard | Placeholder |
| `/nutrition/foods` | `src/app/(app)/nutrition/foods/page.tsx` | Required | Saved foods | Placeholder |
| `/nutrition/meals` | `src/app/(app)/nutrition/meals/page.tsx` | Required | Saved meals | Placeholder |
| `/nutrition/summary` | `src/app/(app)/nutrition/summary/page.tsx` | Required | Nutrition analytics | Placeholder |
| `/nutrition/import` | `src/app/(app)/nutrition/import/page.tsx` | Required | Nutrition CSV import | Placeholder |
| `/settings` | `src/app/(app)/settings/page.tsx` | Required | Profile/preferences/data settings | Placeholder |
| `/api/auth/callback` | `src/app/api/auth/callback/route.ts` | Public | Supabase code exchange | Present, not used by current UI |
| `/api/sync` | `src/app/api/sync/route.ts` | Unknown | Offline sync | Placeholder |

## B. Feature Map

| # | Feature | Location (file path) | Current Status | UX Issues | Bugs Found |
|---|---|---|---|---|---|
| 1 | Email/password sign-in and sign-up form | `src/app/login/page.tsx`, `src/actions/auth.ts` | Implemented | No password reset, no auth provider choice, no success/loading differentiation beyond button spinner | `signIn` does not ensure a matching Prisma `User` row exists, so existing auth users can land on blank pages elsewhere |
| 2 | Auth route protection middleware | `src/middleware.ts` | Implemented | Redirect-only flow; no in-app session recovery/offline fallback | Next 16 deprecates `middleware` in favor of `proxy`; warning appears during build |
| 3 | Dashboard summary cards | `src/app/(app)/page.tsx` | Partial | Cards are visually inconsistent and only some are clickable | “Today’s Calories” is a dead placeholder even though shown as a primary dashboard metric |
| 4 | Dashboard weight summary and weekly delta | `src/app/(app)/page.tsx`, `src/lib/weight.ts` | Implemented | Not linked as a card; no goal marker, BMI, or target date context | Date math uses server time/UTC patterns inconsistently |
| 5 | Dashboard workout status | `src/app/(app)/page.tsx` | Implemented | Rest-day vs training-day UI is basic; no last workout quick-view | Training-day calculation ignores stored user timezone |
| 6 | Dashboard steps card | `src/app/(app)/page.tsx`, `src/actions/steps.ts` | Implemented | No goal/progress ring; binary “Logged today / Not logged” copy is too thin | “Today” lookup uses server-local date logic, not user timezone |
| 7 | Dashboard weight trend chart | `src/components/dashboard/DashboardWeightChart.tsx` | Implemented | No empty-state CTA, goal line, or direct chart controls | 7-day average is based on logged days, not a true calendar moving average |
| 8 | Dashboard quick actions | `src/app/(app)/page.tsx` | Partial | “Log Meal” routes into a placeholder area, which breaks expectation | One of three CTAs is non-functional because nutrition is not implemented |
| 9 | Step entry form | `src/components/steps/StepsEntryForm.tsx`, `src/actions/steps.ts` | Implemented | Single-row form only; no inline validation text or quick-add presets | Default date uses `toISOString()` on the client, which can shift the displayed day relative to the user’s timezone |
| 10 | Steps weekly chart | `src/components/steps/StepsChart.tsx` | Partial | No daily/weekly/monthly toggle, no goal line, no highlighted today state | Last-7-day calculations treat missing days as zero but average only logged days; date comparisons use local `Date` objects with inconsistent boundaries |
| 11 | Steps history list with delete | `src/components/steps/StepsHistoryList.tsx` | Partial | Delete-only history, no edit, no confirmation dialog | Icon-only delete button has no accessible label; no way to correct an entry except delete and recreate |
| 12 | Weight stats cards | `src/components/weight/WeightStatsCards.tsx`, `src/lib/weight.ts` | Implemented | Metrics are helpful but fixed to lbs and lack goal/BMI context | Trend and averages rely on sparse-entry logic rather than calendar windows |
| 13 | Weight chart with zoom and trend line | `src/components/weight/WeightChart.tsx` | Implemented | Good baseline chart, but no goal marker, BMI overlay, or rate-of-change callout | 7-day trend is not a true 7-calendar-day average; no annotation for missing periods |
| 14 | Weight add entry form | `src/components/weight/WeightEntryForm.tsx`, `src/actions/weight.ts` | Implemented | Optional fields are hidden behind “More options”; no unit switching | New-user defaults are misleading because signup hard-codes `heightInches: 69` and `startWeight: 326.7` |
| 15 | Weight history edit/delete | `src/components/weight/WeightHistoryList.tsx` | Implemented | Inline edit is functional but visually heavy; no swipe/delete affordance on mobile | None found in core edit/delete flow; accessibility is weaker than it should be for icon-only actions |
| 16 | Weight CSV export | `src/components/weight/WeightPageActions.tsx`, `src/actions/weight.ts` | Implemented | CSV-only; filename uses old branding (`metabolic-rw`) | No JSON export; no escaping/metadata beyond raw rows |
| 17 | Weight CSV import preview/import | `src/app/(app)/weight/import/page.tsx`, `src/actions/weight.ts` | Implemented | Upload screen claims drag/drop but only click-select is wired; preview table is dense on mobile | Re-importing the same CSV creates duplicates; no dedupe or duplicate warning |
| 18 | Workout day tabs and plan selection | `src/components/workout/WorkoutPageClient.tsx` | Implemented | History is not discoverable from the main workout page; only “Full Plan” is exposed | `todayPlanId` prop is unused |
| 19 | Start workout session | `src/components/workout/WorkoutDayPreview.tsx`, `src/actions/workout.ts` | Implemented | Start action only refreshes current view; no transition into a dedicated “active session” shell | Day lookup ignores user timezone despite the schema storing one |
| 20 | Active workout session header/progress | `src/components/workout/SessionLogger.tsx` | Partial | Progress is useful, but elapsed time is static and set-count can drift upward | `Date.now()` is called during render, triggering lint purity errors; `setCount` increments on every save, including updates to existing sets |
| 21 | Exercise cards, cues, completion toggles | `src/components/workout/ExerciseCard.tsx` | Implemented | Dense information layout on mobile; cue reveal pattern is okay but not polished | Completed state is not initialized from existing logged sets when returning to an in-progress session |
| 22 | Set logging rows | `src/components/workout/SetInput.tsx`, `src/actions/workout.ts` | Partial | Inputs are compact but unlabeled for screen readers; uses raw HTML inputs instead of shared form primitives | Server action does not validate negative/NaN/huge values; finisher UI says “Notes” but stores a numeric reps field instead |
| 23 | Rest timer | `src/components/workout/RestTimer.tsx` | Implemented | Good concept, but tiny controls and icon-only stop button reduce usability | Timer stays “running” at 0 until manually stopped; stop button has no accessible label |
| 24 | Complete workout session flow | `src/components/workout/SessionLogger.tsx`, `src/actions/workout.ts` | Implemented | Completion redirects to history without a summary modal or PR feedback | No guard against finishing an empty session |
| 25 | Workout history list | `src/app/(app)/workout/history/page.tsx` | Partial | List view only; no calendar and no session detail drill-in | Page is not linked from nav, so discoverability is poor |
| 26 | Exercise-specific history page | `src/app/(app)/workout/exercise/[name]/page.tsx` | Present but effectively dead | No route entry point from the UI | Slug decoding replaces every hyphen with a space, so many real exercise names cannot resolve correctly |
| 27 | Workout plan page | `src/app/(app)/workout/plan/page.tsx` | Implemented | Useful read-only overview, but not editable and not template-based | Empty-state instructions tell the user to run `npx tsx prisma/seed.ts`, but `tsx` is not declared in `package.json` |
| 28 | Mobility pre-workout routine | `src/components/mobility/MobilityPageClient.tsx`, `src/components/mobility/MobilityChecklist.tsx` | Implemented | Good checklist concept; version toggle is clear | Auto-log on completing all items plus manual “Mark Complete” button can create duplicate logs |
| 29 | Mobility post-workout routine | `src/components/mobility/MobilityPageClient.tsx` | Implemented | Similar to pre-workout; no history or edit/delete | Duplicate completion risk remains because logs are not deduped |
| 30 | Mobility undo-sitting routine | `src/components/mobility/MobilityPageClient.tsx` | Implemented | Useful and intentionally repeatable | No daily trend/history visualization |
| 31 | Nutrition daily log | `src/app/(app)/nutrition/page.tsx` | Placeholder | Dead-end page in primary app area | No logging functionality despite DB schema support |
| 32 | Saved foods management | `src/app/(app)/nutrition/foods/page.tsx` | Placeholder | Not reachable from primary nav | No CRUD functionality |
| 33 | Saved meals management | `src/app/(app)/nutrition/meals/page.tsx` | Placeholder | Not reachable from primary nav | No CRUD functionality |
| 34 | Nutrition summary analytics | `src/app/(app)/nutrition/summary/page.tsx` | Placeholder | Not reachable from primary nav | No analytics functionality |
| 35 | Nutrition import | `src/app/(app)/nutrition/import/page.tsx` | Placeholder | Not reachable from primary nav | No import implementation |
| 36 | Settings/preferences | `src/app/(app)/settings/page.tsx` | Placeholder | Core user preferences have no UI even though the schema supports them | Height, goal weight, units, theme preference persistence, export/import, and clear-data controls are all missing |
| 37 | Theme toggle | `src/components/layout/ThemeToggle.tsx`, `src/components/layout/ThemeProvider.tsx` | Implemented | Theme toggles only visual class state; no settings-page persistence | None found in the core toggle itself |
| 38 | Desktop sidebar navigation | `src/components/layout/DesktopSidebar.tsx` | Implemented | Clean enough, but nutrition subroutes/history are undiscoverable | Uses a locally duplicated nav config instead of shared constants |
| 39 | Mobile header and bottom nav | `src/components/layout/MobileHeader.tsx`, `src/components/layout/MobileNav.tsx` | Implemented | Seven tabs in a 375px bottom bar are cramped and visually noisy | Discoverability suffers because several secondary routes are unreachable from mobile nav |
| 40 | PWA manifest and worker generation | `public/manifest.json`, `src/app/sw.ts`, `next.config.ts` | Partial | Installability/offline capability is implied but not actually delivered | Worker is generated but not registered anywhere in app code |
| 41 | Offline sync endpoint | `src/app/api/sync/route.ts` | Placeholder | Not connected to any client or worker flow | Pure placeholder response only |

## B. Shared Component Inventory

### Actively Used Shared Components

- Layout: `DesktopSidebar`, `MobileHeader`, `MobileNav`, `ThemeProvider`, `ThemeToggle`
- Steps: `StepsEntryForm`, `StepsChart`, `StepsHistoryList`
- Weight: `WeightStatsCards`, `WeightChart`, `WeightEntryForm`, `WeightHistoryList`, `WeightPageActions`, `DashboardWeightChart`
- Workout: `WorkoutPageClient`, `WorkoutDayPreview`, `SessionLogger`, `ExerciseCard`, `SetInput`, `RestTimer`
- Mobility: `MobilityPageClient`, `MobilityChecklist`
- UI primitives in active use: `button`, `card`, `checkbox`, `dialog`, `input`, `label`, `progress`, `select`, `tabs`, `textarea`, `sonner`

### Shared Components Present but Currently Unused

- `src/components/ui/avatar.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/skeleton.tsx`

## C. Code Quality Assessment

### Dead Code / Unused / Redundant

| Item | Location | Finding |
|---|---|---|
| Empty stray directory | `New folder/` | Artifact with no contents |
| Unused shared UI components | `src/components/ui/avatar.tsx`, `dropdown-menu.tsx`, `separator.tsx`, `sheet.tsx`, `skeleton.tsx` | Present but not imported by the app |
| Unused browser Supabase helper | `src/lib/supabase-browser.ts` | No imports found |
| Unused types file | `src/types/index.ts` | No imports found |
| Unused constants | `src/lib/constants.ts` | `APP_NAME`, `DEFAULT_*`, `NAV_ITEMS`, and `TRAINING_DAY_BOUNDARY_HOUR` are largely unused |
| Unused/dead route | `src/app/(app)/workout/exercise/[name]/page.tsx` | No inbound links from the UI |
| Unused callback flow | `src/app/api/auth/callback/route.ts` | Current login UX is email/password only |
| Generated file inside lint scope | `public/sw.js` | Ignored by Git but still linted, producing large noise in `npm run lint` |
| Stale docs | `README.md` | Still default `create-next-app` boilerplate |

### Accessibility Findings

| Severity | Location | Finding |
|---|---|---|
| High | `src/components/workout/SetInput.tsx` | Active workout inputs have no explicit labels/`aria-label`s, making the highest-frequency workflow weak for screen readers |
| Medium | `src/components/steps/StepsHistoryList.tsx` | Delete button is icon-only with no accessible name |
| Medium | `src/components/workout/RestTimer.tsx` | Stop button is icon-only with no accessible name |
| Medium | `src/components/workout/SetInput.tsx` | Copy-previous control relies on `title`, not a proper accessible label |
| Medium | `src/components/weight/WeightChart.tsx`, `src/components/steps/StepsChart.tsx`, `src/components/dashboard/DashboardWeightChart.tsx` | Charts have no textual summary or data table alternative |
| Medium | Multiple files with direct `text-green-500`, `text-red-500`, `text-orange-400` usage | Semantic text colors are not fully tokenized and may fail contrast in light mode |
| Low | `src/components/weight/WeightEntryForm.tsx` | Radix select is visually labeled, but the label is not programmatically tied the way native inputs are |

### Performance / Reliability Findings

| Severity | Location | Finding |
|---|---|---|
| High | `src/app/layout.tsx` | Build depends on live Google Font downloads for Geist/Geist Mono; local production build fails without network access |
| Medium | `src/components/workout/SessionLogger.tsx` | Elapsed time is computed during render with `Date.now()`, violating React purity and not updating live |
| Medium | `src/components/workout/SessionLogger.tsx` | Logged set counter over-increments on repeated saves |
| Medium | `src/components/steps/StepsChart.tsx` | Last-7-days chart uses repeated `entries.find(...)` lookups in a loop; acceptable now, but unnecessarily quadratic |
| Medium | `src/middleware.ts` + SSR pages | Every authenticated page depends on live auth and DB access, which weakens offline/PWA expectations |
| Low | `src/app/api/sync/route.ts` | Offline sync endpoint is a placeholder, so service worker/runtime bytes currently deliver no sync benefit |

### Mobile Responsiveness Notes

| Area | Finding |
|---|---|
| Bottom navigation | Seven-tab mobile nav is crowded at 375px and gives each destination very little tap/label space |
| Weight import preview | Four-column preview grid is dense on mobile and truncates content without horizontal affordances |
| Workout set logger | High-density fixed-column grid is usable but visually cramped on narrow widths |
| Dashboard | Works structurally on mobile, but information density is high and the quick-action section points to unfinished areas |

## D. Testing

### Validation Performed

| Check | Result | Notes |
|---|---|---|
| `npm run lint` | Failed | 110 total problems: seed scripts violate TS lint rules, generated `public/sw.js` is linted, and `SessionLogger` fails React purity rules |
| `npm run build` | Failed in sandbox | Build reaches Serwist bundling, then fails on Google Font fetch (`Geist`, `Geist Mono`) because network access is blocked |
| Authenticated manual route exercise | Blocked from sandbox | App requires Supabase auth + Postgres; those network calls are unavailable here |
| Static/manual feature verification from source | Completed | Used to assess add/edit/delete/persistence/validation behavior below |

### Functional Test Matrix

This table captures what the current code supports and the gaps found. End-to-end browser execution of authenticated flows was blocked by sandbox networking, so statuses below reflect source-backed behavior rather than live DB mutation tests.

| Feature Area | Add | Edit | Delete | Persistence | Edge-Case Handling | Result |
|---|---|---|---|---|---|---|
| Steps | Yes | No | Yes | DB-backed via `DailyLog` | Rejects negative and `>200000`, but has timezone/date-boundary issues | Partial |
| Weight | Yes | Yes | Yes | DB-backed via `WeightEntry` | Validates range/body-fat presence, but no goal/BMI/target-date support | Partial |
| Weight import/export | CSV import/export only | N/A | N/A | DB-backed | No dedupe, no JSON backup | Partial |
| Workout sessions | Yes | Existing sets can be updated | No delete/reset path | DB-backed via `WorkoutSession`/`SessionSet` | Missing validation; state bugs in active session UI | Partial |
| Mobility logs | Yes | No | No | DB-backed via `MobilityLog` | Duplicate pre/post completions possible | Partial |
| Nutrition | No | No | No | Schema exists but no UI flow | Placeholder only | Not implemented |
| Settings/preferences | No | No | No | Schema supports some fields but UI does not | Placeholder only | Not implemented |
| PWA/offline | Manifest + generated worker only | N/A | N/A | Worker not registered | No offline auth/data behavior | Partial/incomplete |

### Notable Failures to Carry into Phase 2

1. Existing authenticated users can reach blank pages because sign-in does not upsert a `User` record.
2. User profile defaults are hard-coded to a specific height and starting weight during signup.
3. Steps and dashboard “today” calculations use inconsistent UTC/server-local date logic.
4. Workout set logging lacks validation and contains active-session counting/completion bugs.
5. Exercise-history routing is broken for hyphenated names and not discoverable.
6. Nutrition, settings, JSON backup, and offline sync are not implemented.
7. PWA scaffolding exists, but install/offline behavior is not actually wired up.
