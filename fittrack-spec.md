# FitTrack — Personal Fitness Tracking PWA
## Complete Project Specification for Claude Code

---

## Project Overview

A single-user Progressive Web App (PWA) that consolidates fitness tracking into one installable application:

1. **Weight tracking** (migrating from Google Sheets)
2. **Nutrition logging** (replacing Cronometer)
3. **Workout logging** (new — based on a structured 4-day beginner circuit/superset training plan)
4. **Pre/post-workout mobility checklists**
5. **Unified dashboard with charts and insights**

The app must be installable on Android (Samsung Galaxy S21 Ultra) via "Add to Home Screen" and accessible as a website on Windows 11. Data syncs between devices through a shared Supabase PostgreSQL database.

---

## Tech Stack (exact versions)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14+ (App Router) | Server components + server actions |
| Language | TypeScript (strict) | No .js files |
| Database | PostgreSQL (Supabase free tier) | Cloud sync between devices |
| ORM | Prisma | Schema-first, type-safe |
| Auth | Supabase Auth | Email/password, single user |
| Styling | Tailwind CSS + shadcn/ui | Dark mode default |
| Charts | Recharts | Weight trends, progress graphs |
| PWA | @serwist/next | NOT next-pwa (deprecated) |
| Deployment | Vercel (free tier) | Connected to Supabase |
| State | React hooks + server actions | No Redux |

---

## Critical Schedule Context (affects all date logic)

- Training days: Monday, Tuesday, Thursday, and Friday (4 days/week); Wednesday/Saturday are mobility/recovery and Sunday is complete rest
- Sessions occur between ~2:00 AM and 4:00 AM
- Rest days: Friday and Saturday
- **Training day boundary: 12:00 PM (noon)**
  - Session at 2:30 AM Monday = "Day 1 — Monday" (not Sunday)
  - Any session between 12:01 PM Sunday → 11:59 AM Monday = Monday
- Weekly view: Sunday → Saturday
- **All date logic must be timezone-aware** (user timezone stored in profile)
- Supabase stores UTC; all conversions happen in application code

### Training Day Resolution Function (implement everywhere dates are used)

```typescript
function getTrainingDate(timestamp: Date, userTimezone: string): Date {
  // Convert to user's local time
  const localTime = convertToTimezone(timestamp, userTimezone);
  const hour = localTime.getHours();
  
  // If before noon, this session belongs to "today"
  // If after noon, this session belongs to "tomorrow"
  // (In practice: before noon = current calendar date is the training date)
  // (After noon = current calendar date is the training date for the NEXT day)
  
  if (hour < 12) {
    return startOfDay(localTime); // training date = today's calendar date
  } else {
    return startOfDay(addDays(localTime, 1)); // training date = tomorrow
  }
}
```

---

## User Profile (from intake)

These values should be pre-populated as defaults in the profile setup:

| Field | Value |
|-------|-------|
| Height | 5'9" |
| Starting weight | 326.7 lbs (from Google Sheets baseline 6/23/2025) |
| Current weight | 325.3 lbs (as of 2/14/2026) |
| Goal weight | User-defined (ask on setup) |
| Daily calories target | 2,874 kcal |
| Protein target | 305 g |
| Carbs target | 207 g |
| Fat target | 83 g |
| Timezone | (auto-detect, manually overridable) |
| Training days | Mon, Tue, Wed, Thu, Fri (Sun night → Thu night) |
| Rest days | Sat, Sun |

---

## Google Sheets Weight Data Format (for CSV import)

Based on the actual spreadsheet screenshots, the columns are:

| Column | Header | Type | Import? |
|--------|--------|------|---------|
| A | Status | Text (Baseline/Fasting/Normal) | Yes |
| B | Date | Date (M/D/YYYY) | Yes |
| C | Weight (Scale) | Number (lbs, 1 decimal) | Yes |
| D | Body Fat % (Scale) | Number (%) | Yes (optional field) |
| E | Total Weight Lost (lb) | Calculated | No (recalculate in app) |
| F | Daily Weight Change | Calculated | No |
| G | Daily Weight Loss Moving Average | Calculated | No |
| H+ | Body Fat columns | Calculated | No |

**Import mapping:**
- Column A → `status` field (enum: BASELINE, FASTING, NORMAL)
- Column B → `date` field
- Column C → `weight` field
- Column D → `bodyFatPercent` field (nullable)

**Sample data (first 10 rows from screenshot):**

```csv
Status,Date,Weight (Scale),Body Fat % (Scale)
Baseline,6/23/2025,326.7,
Fasting,6/24/2025,322.7,
Fasting,6/25/2025,320.5,
Fasting,6/26/2025,321.0,
Fasting,6/27/2025,319.8,
Normal,6/27/2025,320.7,
Fasting,7/1/2025,318.3,
Fasting,7/2/2025,324.0,
Fasting,7/2/2025,319.8,
Fasting,7/3/2025,317.1,
```

**Note:** Multiple entries per date exist (e.g., 6/27 has both Fasting and Normal, 7/2 has two entries). The import should handle this — do NOT deduplicate by date alone. Allow multiple entries per date differentiated by status/time.

---

## Cronometer Data Format (for CSV import)

Cronometer exports in two formats:

**Daily Nutrition Summary (simpler, for daily totals):**
```csv
Date,Energy (kcal),Protein (g),Net Carbs (g),Fat (g),...
2025-01-01,2874,71,485,79,...
```

**Servings Export (itemized, preserves individual foods):**
```csv
Date,Food Name,Amount,Unit,Energy (kcal),Protein (g),Carbs (g),Fat (g),...
2025-01-01,"Fage Total 5% Greek Yogurt, Plain",258,g,242.77,...
```

Based on the Cronometer screenshot, the user tracks:
- Individual food items with gram quantities
- Supplements/vitamins (can be imported but marked as 0 kcal)
- Daily energy summary with target comparison

**Import should support both formats** — detect which one based on headers.

---

## Notion Life Dashboard Integration (Future/Optional)

The user also tracks in Notion:
- Sleep hours
- Exercise minutes
- Deep-Work hours
- Social hours
- Mood (1-10)
- Notes / Triggers
- Steps

**For Phase 1:** Add optional `sleepHours`, `moodRating`, and `steps` fields to a `DailyLog` table. These are manually entered. No Notion API integration needed.

---

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id              String   @id @default(cuid())
  email           String   @unique
  supabaseUserId  String   @unique
  name            String?
  heightInches    Int?     // stored in inches (5'9" = 69)
  startWeight     Float?
  goalWeight      Float?
  caloricTarget   Int?     @default(2874)
  proteinTarget   Int?     @default(305)
  carbTarget      Int?     @default(207)
  fatTarget       Int?     @default(83)
  timezone        String   @default("America/New_York")
  trainingDays    Int[]    @default([1, 2, 3, 4, 5]) // 0=Sun, 1=Mon...
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  weightEntries    WeightEntry[]
  nutritionDays    NutritionDay[]
  savedFoods       SavedFood[]
  savedMeals       SavedMeal[]
  workoutPlans     WorkoutPlan[]
  workoutSessions  WorkoutSession[]
  mobilityLogs     MobilityLog[]
  dailyLogs        DailyLog[]
  progressPhotos   ProgressPhoto[]
}

// ─── WEIGHT TRACKING ───

enum WeighInStatus {
  BASELINE
  FASTING
  NORMAL
}

model WeightEntry {
  id             String        @id @default(cuid())
  userId         String
  date           DateTime      @db.Date
  weight         Float         // lbs, 1 decimal
  bodyFatPercent  Float?       // optional
  status         WeighInStatus @default(NORMAL)
  timeOfDay      String?       // "morning", "evening", etc.
  notes          String?
  createdAt      DateTime      @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
}

// ─── NUTRITION TRACKING ───

model NutritionDay {
  id      String   @id @default(cuid())
  userId  String
  date    DateTime @db.Date

  entries NutritionEntry[]
  user    User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId, date])
}

model NutritionEntry {
  id              String @id @default(cuid())
  nutritionDayId  String
  mealLabel       String // "Meal 1", "Meal 2", "Snack", or custom
  foodName        String
  calories        Float  @default(0)
  protein         Float  @default(0)
  carbs           Float  @default(0)
  fat             Float  @default(0)
  servingSize     String? // "258g", "1 cup", etc.
  sortOrder       Int    @default(0)
  createdAt       DateTime @default(now())

  nutritionDay NutritionDay @relation(fields: [nutritionDayId], references: [id], onDelete: Cascade)

  @@index([nutritionDayId])
}

model SavedFood {
  id          String @id @default(cuid())
  userId      String
  name        String
  calories    Float
  protein     Float
  carbs       Float
  fat         Float
  servingSize String? // "per 100g", "per scoop", etc.
  createdAt   DateTime @default(now())

  user           User @relation(fields: [userId], references: [id], onDelete: Cascade)
  savedMealItems SavedMealItem[]

  @@index([userId])
}

model SavedMeal {
  id     String @id @default(cuid())
  userId String
  name   String // "Standard Breakfast", etc.

  items SavedMealItem[]
  user  User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model SavedMealItem {
  id          String @id @default(cuid())
  savedMealId String
  savedFoodId String
  quantity    Float  @default(1)

  savedMeal SavedMeal @relation(fields: [savedMealId], references: [id], onDelete: Cascade)
  savedFood SavedFood @relation(fields: [savedFoodId], references: [id], onDelete: Cascade)
}

// ─── WORKOUT TRACKING ───

model WorkoutPlan {
  id          String @id @default(cuid())
  userId      String
  dayOfWeek   Int    // 1=Monday, 2=Tuesday, 4=Thursday, 5=Friday
  sessionName String // "Upper A — Push/Pull Foundation"
  weekNumber  Int    @default(1)
  isActive    Boolean @default(true)

  exercises PlanExercise[]
  sessions  WorkoutSession[]
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, dayOfWeek, weekNumber])
}

model PlanExercise {
  id             String  @id @default(cuid())
  workoutPlanId  String
  exerciseName   String
  sets           Int
  reps           String  // "8" or "8-12" or "AMRAP" or "30 sec"
  tempo          String? // "3-1-1" format
  restSeconds    Int?
  targetRPE      String? // "7" or "7-8"
  cues           String? // coaching notes (can be long)
  supersetGroup  String? // "A", "B", "C" — exercises with same letter are superset
  exerciseType   String  @default("WORKING") // WORKING, WARMUP, FINISHER
  sortOrder      Int     @default(0)

  workoutPlan WorkoutPlan @relation(fields: [workoutPlanId], references: [id], onDelete: Cascade)
  sessionSets SessionSet[]

  @@index([workoutPlanId])
}

model WorkoutSession {
  id            String    @id @default(cuid())
  userId        String
  workoutPlanId String?
  date          DateTime  @db.Date
  trainingDate  DateTime  @db.Date // resolved training date (noon boundary)
  startTime     DateTime?
  endTime       DateTime?
  notes         String?
  weekNumber    Int       @default(1)
  completed     Boolean   @default(false)
  createdAt     DateTime  @default(now())

  sets         SessionSet[]
  workoutPlan  WorkoutPlan? @relation(fields: [workoutPlanId], references: [id])
  user         User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, trainingDate])
}

model SessionSet {
  id                String  @id @default(cuid())
  workoutSessionId  String
  planExerciseId    String?
  exerciseName      String  // denormalized for history queries
  setNumber         Int
  weightUsed        Float?  // kg for current workout sessions
  repsCompleted     Int?
  actualRPE         Int?    // 5-10
  duration          Int?    // seconds (for timed sets)
  isAMRAP           Boolean @default(false)
  notes             String?
  createdAt         DateTime @default(now())

  workoutSession WorkoutSession @relation(fields: [workoutSessionId], references: [id], onDelete: Cascade)
  planExercise   PlanExercise?  @relation(fields: [planExerciseId], references: [id])

  @@index([workoutSessionId])
  @@index([exerciseName])
}

// ─── MOBILITY TRACKING ───

model MobilityLog {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime @db.Date
  type      String   // "PRE_WORKOUT" or "POST_WORKOUT"
  version   String   // "A" (normal) or "B" (sore/stiff)
  completed Boolean  @default(false)
  notes     String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
}

// ─── DAILY LOG (sleep, mood, steps) ───

model DailyLog {
  id         String   @id @default(cuid())
  userId     String
  date       DateTime @db.Date
  sleepHours Float?
  moodRating Int?     // 1-10
  steps      Int?
  notes      String?
  createdAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId, date])
}

// ─── PROGRESS PHOTOS ───

model ProgressPhoto {
  id       String   @id @default(cuid())
  userId   String
  date     DateTime @db.Date
  imageUrl String
  notes    String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
}
```

---

## UI/UX Requirements

### Design Philosophy
- **Mobile-first** (primary usage: phone at gym at 2 AM)
- **Dark mode default** (2 AM usage; bright screens are painful)
- **Light mode toggle** available
- Large tap targets (minimum 44px) — sweaty hands during workouts
- Fast data entry is the #1 UX priority

### Navigation
- **Mobile:** Bottom tab bar — Dashboard | Workout | Nutrition | Weight | Settings
- **Desktop:** Left sidebar with same items

### Color System (Dark Mode)
- Background: `#0a0a0a` (near-black)
- Surface: `#1a1a1a` (cards, inputs)
- Border: `#2a2a2a`
- Primary accent: `#3b82f6` (blue — for interactive elements)
- Success: `#22c55e` (green — on track, PRs)
- Warning: `#eab308` (yellow — close to target)
- Danger: `#ef4444` (red — over/under target, missed)
- Text primary: `#fafafa`
- Text secondary: `#a1a1aa`

### Data Entry Patterns
- Logging a set: tap weight → tap reps → tap RPE → done (<5 seconds)
- Number inputs must trigger numeric keypad on mobile (`inputMode="numeric"`)
- "Copy previous" button on every set input (auto-fill from last session)
- Inline editing (no modal popups for simple entries)

### Loading & Error States
- Skeleton loaders (not blank screens)
- Toast notifications for saves, errors, sync status
- Clear "offline" indicator when connection is lost

---

## PWA Configuration

| Field | Value |
|-------|-------|
| App name | FitTrack |
| Short name | FitTrack |
| Theme color | `#0a0a0a` |
| Background color | `#0a0a0a` |
| Display | standalone |
| Orientation | portrait |
| Start URL | / |
| Icons | Generate simple placeholder (F logo on dark bg) |

**Offline strategy:**
- Cache app shell (HTML, CSS, JS)
- Cache workout plan data for offline session logging
- Queue offline writes with timestamps
- Sync to Supabase on reconnection
- Last-write-wins with timestamp comparison for conflict resolution

---

## File Structure

```
/fittrack
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
│       ├── icon-192.png
│       ├── icon-512.png
│       └── apple-touch-icon.png
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx           (root layout: auth check, nav, theme)
│   │   ├── page.tsx             (dashboard / home)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── weight/
│   │   │   ├── page.tsx         (weight dashboard + chart)
│   │   │   └── import/
│   │   │       └── page.tsx     (CSV import)
│   │   ├── nutrition/
│   │   │   ├── page.tsx         (daily log)
│   │   │   ├── foods/
│   │   │   │   └── page.tsx     (saved foods CRUD)
│   │   │   ├── meals/
│   │   │   │   └── page.tsx     (saved meals CRUD)
│   │   │   ├── import/
│   │   │   │   └── page.tsx     (Cronometer CSV import)
│   │   │   └── summary/
│   │   │       └── page.tsx     (weekly/monthly summary)
│   │   ├── workout/
│   │   │   ├── page.tsx         (today's workout / active session)
│   │   │   ├── plan/
│   │   │   │   └── page.tsx     (view/edit workout plan)
│   │   │   ├── history/
│   │   │   │   └── page.tsx     (past sessions)
│   │   │   └── exercise/
│   │   │       └── [name]/
│   │   │           └── page.tsx (exercise history)
│   │   ├── mobility/
│   │   │   └── page.tsx         (pre/post checklists)
│   │   ├── settings/
│   │   │   └── page.tsx         (profile, preferences)
│   │   └── api/
│   │       ├── auth/
│   │       │   └── callback/
│   │       │       └── route.ts
│   │       └── sync/
│   │           └── route.ts     (offline sync endpoint)
│   ├── components/
│   │   ├── ui/                  (shadcn components)
│   │   ├── layout/
│   │   │   ├── MobileNav.tsx
│   │   │   ├── DesktopSidebar.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── weight/
│   │   │   ├── WeightEntryForm.tsx
│   │   │   ├── WeightChart.tsx
│   │   │   ├── WeightStats.tsx
│   │   │   └── WeightCSVImport.tsx
│   │   ├── nutrition/
│   │   │   ├── NutritionDayView.tsx
│   │   │   ├── MealEntryForm.tsx
│   │   │   ├── MacroProgressBars.tsx
│   │   │   ├── SavedFoodPicker.tsx
│   │   │   └── CronometerImport.tsx
│   │   ├── workout/
│   │   │   ├── SessionLogger.tsx
│   │   │   ├── SetInput.tsx
│   │   │   ├── RestTimer.tsx
│   │   │   ├── ExerciseCard.tsx
│   │   │   ├── SessionSummary.tsx
│   │   │   └── PlanEditor.tsx
│   │   ├── mobility/
│   │   │   └── MobilityChecklist.tsx
│   │   ├── dashboard/
│   │   │   ├── TodaySnapshot.tsx
│   │   │   ├── WeeklyOverview.tsx
│   │   │   └── TrendCharts.tsx
│   │   └── shared/
│   │       ├── DatePicker.tsx
│   │       ├── NumberInput.tsx
│   │       ├── OfflineIndicator.tsx
│   │       └── CSVImporter.tsx
│   ├── lib/
│   │   ├── db.ts               (Prisma client singleton)
│   │   ├── supabase-server.ts  (server-side Supabase client)
│   │   ├── supabase-browser.ts (browser-side Supabase client)
│   │   ├── utils.ts            (general utilities)
│   │   ├── dates.ts            (training day boundary logic)
│   │   ├── constants.ts        (app-wide constants)
│   │   └── csv.ts              (CSV parsing utilities)
│   ├── actions/
│   │   ├── weight.ts           (server actions for weight)
│   │   ├── nutrition.ts        (server actions for nutrition)
│   │   ├── workout.ts          (server actions for workouts)
│   │   └── auth.ts             (server actions for auth)
│   └── types/
│       └── index.ts            (shared TypeScript types)
├── .env.local
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── package.json
```

---

## Session-by-Session Build Instructions

### Session 1: Project Setup + Auth + Navigation

**Goal:** Go from zero to a deployed skeleton app with working auth and navigation.

**Steps:**
1. Initialize Next.js 14 with TypeScript, Tailwind, App Router
2. Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `prisma`, `@prisma/client`, `@serwist/next`, `recharts`, `lucide-react`
3. Set up shadcn/ui with dark theme defaults
4. Create Prisma schema (full schema above) and run migration against Supabase
5. Set up Supabase Auth (email/password)
6. Create auth middleware (protect all routes except /login)
7. Build root layout with:
   - Mobile bottom nav (Dashboard | Workout | Nutrition | Weight | Settings)
   - Desktop left sidebar
   - Dark mode default + light mode toggle
   - Auth state management
8. Create placeholder pages for all routes
9. Set up PWA manifest + basic service worker
10. Deploy to Vercel

**Environment variables needed:**
```
DATABASE_URL=          # Supabase pooled connection string
DIRECT_URL=            # Supabase direct connection string
NEXT_PUBLIC_SUPABASE_URL=     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=    # For server-side operations
```

**Test criteria:**
- App loads at deployed URL
- Login/signup works
- Navigation works on mobile and desktop
- Dark mode displays correctly
- PWA installable on Android
- Prisma can connect to Supabase database

---

### Session 2: Weight Tracker

**Goal:** Fully functional weight tracking with chart, import, and export.

**Build:**
1. Weight entry form (date, weight, status, bodyFatPercent, notes)
2. Weight history list (scrollable, editable, deletable)
3. Weight dashboard with stats:
   - Current weight, starting weight, total change
   - 7-day and 30-day moving averages
   - Trend arrow (up/down/stable)
4. Weight chart (Recharts):
   - Daily dots + 7-day moving average line
   - Zoom: 1 week / 1 month / 3 months / all time
   - Responsive, touch-friendly
5. CSV import from Google Sheets:
   - Parse columns: Status, Date, Weight (Scale), Body Fat % (Scale)
   - Handle multiple entries per date
   - Preview before confirming import
   - Validate data types
6. CSV export button

**Test criteria:**
- Can add/edit/delete weight entries
- Chart renders with smooth 7-day average line
- CSV import correctly parses the Google Sheets format
- Imported data matches screenshot values
- Export produces valid CSV

---

### Session 3: Nutrition Tracker

**Goal:** Daily nutrition logging with macro tracking, saved foods/meals, and Cronometer import.

**Build:**
1. Daily nutrition log page:
   - Date selector (defaults to today using training-day boundary)
   - Add food entries grouped by meal (Meal 1, 2, 3, Snack, custom)
   - Each entry: food name, calories, protein, carbs, fat, serving note
   - Daily totals auto-calculated
2. Macro progress bars:
   - Consumed vs. target for each macro
   - Color coded: green (within 10%), yellow (10-15%), red (>15% off)
   - Remaining amount displayed
3. Saved Foods CRUD:
   - Add/edit/delete saved foods
   - Search when adding entries
   - Quick-add from saved foods
4. Saved Meals CRUD:
   - Create meal templates (group of saved foods)
   - One-tap log entire meal
5. Cronometer CSV import:
   - Auto-detect format (Daily Summary vs. Servings)
   - Column mapping preview
   - Import as daily totals or individual entries
6. Weekly/monthly summary:
   - Average daily intake for period
   - Adherence % (days within ±10% of targets)

**Test criteria:**
- Can log a full day of food in under 2 minutes
- Saved foods appear in search
- Saved meal adds all foods in one tap
- Macro bars update in real-time
- Cronometer CSV imports correctly

---

### Session 4: Workout Plan + Logger

**Goal:** Display the training plan, log sets in real-time at the gym, track history.

**Build:**
1. Workout plan data structure:
   - Pre-populate with the 4-day beginner circuit/superset plan from the training plan document
   - Monday: Upper A — Push/Pull Foundation
   - Tuesday: Lower A — Stable Lower Body
   - Wednesday: Mobility / Recovery
   - Thursday: Upper B — Back/Shoulder Emphasis
   - Friday: Lower B — Hips/Posterior Chain
   - Saturday: Mobility / Recovery
   - Sunday: Complete Rest
2. Plan display page:
   - Shows today's workout based on training-day boundary
   - Exercise list with sets, reps, tempo, rest, RPE, cues
   - Superset groupings visually connected
   - Collapsible coaching cues
3. Plan editor (settings):
   - Add/edit/reorder/delete exercises
   - Week number progression selector
4. Session logger:
   - Pre-populated from plan
   - Set-by-set input: weight, reps, RPE (numeric keypad)
   - "Copy previous" button (from last session of same plan)
   - "Add Set" for extras
   - Rest timer (auto-starts on set completion, prescribed duration)
   - Audible beep/vibration when timer ends
5. Session summary:
   - Total volume per exercise and session
   - Duration (auto-tracked)
   - PR highlights (green) vs. last same-day session
6. Exercise history:
   - All-time log of any exercise
   - Weight-over-time chart
7. AMRAP / timed set support:
   - AMRAP: log total reps in time window
   - Timed: log duration held

**Test criteria:**
- Today's workout displays correctly at 2 AM based on training-day boundary
- Can log a full session in real-time at speed
- Copy-previous fills from last identical session
- Rest timer works with sound/vibration
- Session summary shows accurate volume and PR detection
- Exercise history chart renders correctly

---

### Session 5: Mobility Checklists

**Goal:** Pre-workout primers and required recovery mobility checklists that match the training plan.

**Build:**
1. Pre-workout mobility checklist:
   - Version A (Normal) and Version B (Sore/Stiff) — toggle
   - Blocks 1-4 with day-specific Block 4
   - Exercise name, dose, brief cue for each item
   - Checkbox to mark complete
   - Completion logged to MobilityLog
2. Required recovery mobility checklist:
   - Training-day later recovery can be completed later the same day after walking home, food, shower, or before bed
   - Rest-day recovery mobility stays low intensity and supports feet, ankles, calves, hips, spine, shoulders, and breathing
   - Foot-flare recovery is required when soles are irritated or recent step load is high
   - Universal closer + day-specific stretches
   - Same checkbox pattern
3. "Undo Sitting" micro-routine:
   - Quick 3-min routine accessible from dashboard
   - Track completions per day

**Data source:** All mobility exercises come from the training plan document (Sections 4, 5, and 6).

**Test criteria:**
- Correct checklist displays for current training day
- Version A/B toggle works
- Block 4 changes based on which gym day it is
- Completion saves to database
- Required later recovery remains visible and independently trackable without blocking workout completion

---

### Session 6: Dashboard + Polish

**Goal:** Unified dashboard, charts, offline support, and final polish.

**Build:**
1. Dashboard (home screen):
   - Today's snapshot: weight, nutrition progress, workout status
   - Weekly overview calendar row with status icons
   - Trend charts (weight, volume, calories)
2. Charts:
   - Weight trend (7-day smoothed) via Recharts
   - Weekly training volume trend
   - Calorie adherence trend
3. Offline support:
   - Service worker caches app shell + plan data
   - Offline writes queued in IndexedDB
   - Sync on reconnection with conflict resolution
   - "Offline" indicator in header
4. Dark/light mode toggle (persistent)
5. Performance optimization:
   - Server components where possible
   - Optimistic updates for set logging
   - Debounced chart rendering
6. Progress photos (if time):
   - Upload to Supabase Storage
   - Date-tagged gallery
   - Side-by-side comparison

**Test criteria:**
- Dashboard loads quickly with all sections populated
- Charts render smoothly with real data
- App works offline (can log sets without internet)
- Data syncs when reconnected
- Mode toggle persists across sessions

---

## Important Constraints

- Everything free tier (Supabase free, Vercel free)
- No external food/nutrition API — all manual entry or CSV import
- No step counter or wearable integration
- Single user (auth protects data, no multi-tenancy)
- All TypeScript, no JavaScript files
- Server components + server actions (Next.js App Router patterns)
- No `next-pwa` — use `@serwist/next` instead
