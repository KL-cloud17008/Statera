import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

const planSource = readFileSync("src/lib/default-workout-plan.ts", "utf8");
const workoutPlanPageSource = readFileSync("src/app/(app)/workout/plan/page.tsx", "utf8");
const workoutPageSource = readFileSync("src/app/(app)/workout/page.tsx", "utf8");
const workoutPageClientSource = readFileSync("src/components/workout/WorkoutPageClient.tsx", "utf8");
const workoutDayPreviewSource = readFileSync("src/components/workout/WorkoutDayPreview.tsx", "utf8");
const workoutSessionActionButtonSource = readFileSync("src/components/workout/WorkoutSessionActionButton.tsx", "utf8");
const workoutActionsSource = readFileSync("src/actions/workout.ts", "utf8");
const workoutPlanSeedSource = readFileSync("src/lib/workout-plan-seed.ts", "utf8");
const workoutSessionStateSource = readFileSync("src/lib/workout-session-state.ts", "utf8");
const dashboardSource = readFileSync("src/components/dashboard/DashboardPageClient.tsx", "utf8");
const mobilityPageSource = readFileSync("src/components/mobility/MobilityPageClient.tsx", "utf8");
const flexibilityBalancePageSource = readFileSync("src/app/(app)/flexibility-balance/page.tsx", "utf8");
const navItemsSource = readFileSync("src/components/layout/nav-items.ts", "utf8");
const appLayoutSource = readFileSync("src/app/(app)/layout.tsx", "utf8");
const desktopSidebarSource = readFileSync("src/components/layout/DesktopSidebar.tsx", "utf8");
const mobileHeaderSource = readFileSync("src/components/layout/MobileHeader.tsx", "utf8");
const trainingPlanSource = readFileSync("training_plan.md", "utf8");
const mobilitySource = readFileSync("src/lib/mobility.ts", "utf8");
const settingsSource = readFileSync("src/components/settings/SettingsPageClient.tsx", "utf8");
const stepsActionsSource = readFileSync("src/actions/steps.ts", "utf8");
const stepsPageClientSource = readFileSync("src/components/steps/StepsPageClient.tsx", "utf8");
const dashboardPageSource = readFileSync("src/app/(app)/page.tsx", "utf8");
const weightPageSource = readFileSync("src/app/(app)/weight/page.tsx", "utf8");
const weightChartSource = readFileSync("src/components/weight/WeightChart.tsx", "utf8");
const exerciseLibrarySource = readFileSync("src/lib/exercise-library.ts", "utf8");
const nutritionRouteSources = [
  "src/app/(app)/nutrition/page.tsx",
  "src/app/(app)/nutrition/foods/page.tsx",
  "src/app/(app)/nutrition/meals/page.tsx",
  "src/app/(app)/nutrition/summary/page.tsx",
  "src/app/(app)/nutrition/import/page.tsx",
].map((path) => readFileSync(path, "utf8"));

const require = createRequire(import.meta.url);
const ts = require("typescript");
const moduleCache = new Map();
const units = loadTypescriptModule("src/lib/units.ts");
const appSettings = loadTypescriptModule("src/lib/app-settings.ts");
const steps = loadTypescriptModule("src/lib/steps.ts");
const weight = loadTypescriptModule("src/lib/weight.ts");
const mobility = loadTypescriptModule("src/lib/mobility.ts");
const workoutPlan = loadTypescriptModule("src/lib/default-workout-plan.ts");
const workoutPlanVersion = loadTypescriptModule("src/lib/workout-plan-version.ts");

test("revised programme has exact order, prescriptions and introductory totals", () => {
  const days = workoutPlan.DEFAULT_WORKOUT_PLAN;
  const prescription = loadTypescriptModule("src/lib/workout-prescription.ts");
  assert.equal(workoutPlan.DEFAULT_WORKOUT_PLAN_VERSION, "five-day-mon-fri-v8");
  assert.deepEqual(Array.from(days, d => d.dayOfWeek), [1,2,3,4,5]);
  const expected = [
    [["A1 Lying Leg Curl — Easy Primer",2,"10-15","5-6"],["B1 Walking Lunges",2,"6-10 steps per leg","5-6"],["B2 Seated Straight-Leg Calf Machine or Leg Press Calf Press",1,"12-20","5-6"],["C1 Pendulum Squat",3,"8-12","6-7"],["D1 Seated Leg Extension",2,"10-15","6-7"],["E1 Seated Leg Curl — Working Sets",3,"10-15","7"],["F1 Hip Abduction Machine",3,"12-20","5-6"],["F2 Hip Adduction Machine",3,"12-20","5-6"]],
    [["A1 Incline Machine Chest Press",3,"8-12","6-7"],["A2 Seated Chest-Supported Machine Row",3,"8-12","6-7"],["B1 Neutral-Grip Lat Pulldown",2,"8-12","6-7"],["B2 Close-Grip Lat Pulldown",1,"10-12","5-6"],["C1 Seated Machine Shoulder Press",2,"8-12","6-7"],["D1 Seated Machine Chest Fly",2,"12-15","6-7"],["D2 Reverse Pec Deck / Seated Machine Reverse Fly",2,"12-20","6-7"]],
    [["A1 Lying Leg Curl (warm-up)",2,"12-15","4-5"],["B1 Supported Stationary Bulgarian Split Squat",3,"8-10 per leg","5-6"],["B2 Seated Straight-Leg Calf Machine or Leg Press Calf Press",1,"12-20","5-6"],["B3 Pendulum Squat",3,"8-12","6-7"],["C1 Seated Leg Extension",2,"10-15","6"],["C2 Seated Leg Curl",4,"10-12","7"],["D1 Hip Adduction Machine",3,"12-20","5-6"],["D2 Hip Abduction Machine",3,"12-20","5-6"]],
    null,
    [["A1 Seated Machine Chest Fly",2,"12-15","6"],["A2 Reverse Pec Deck / Seated Machine Reverse Fly",2,"12-20","6"],["B1 Back Extension — Hyperextension Bench",2,"10-15","5-6"],["B2 Seated Dumbbell Lateral Raise",3,"12-20","6-7"],["C1 Seated Barbell Preacher Curl",2,"10-15","6-7"],["C2 Seated Triceps-Extension Machine",2,"10-15","6-7"]],
  ];
  days.forEach((d,i) => { if(expected[i]) assert.deepEqual(JSON.parse(JSON.stringify(d.exercises.map(e => [e.exerciseName,e.sets,e.reps,e.targetRPE]))),expected[i]); });
  assert.deepEqual(JSON.parse(JSON.stringify(days[3])), JSON.parse(readFileSync("tests/fixtures/thursday-programme.json","utf8")));
  const total = (d, intro=false) => d.exercises.filter(e=>e.exerciseType!=="WARMUP").reduce((n,e)=>n+(intro?prescription.getIntroductorySets(e):e.sets),0);
  assert.deepEqual(Array.from(days,d=>total(d)),[19,15,19,20,13]);
  assert.deepEqual(Array.from(days,d=>total(d,true)),[18,15,18,20,13]);
  assert.equal(days.reduce((n,d)=>n+total(d),0),86);
  assert.equal(days.reduce((n,d)=>n+total(d,true),0),84);
  const quads=days.flatMap(d=>d.exercises).filter(e=>/Lunges|Bulgarian|Pendulum|Leg Extension/.test(e.exerciseName));
  assert.equal(quads.reduce((n,e)=>n+e.sets,0),15);
  assert.equal(days[2].exercises[0].exerciseType,"WARMUP");
  assert.equal(days[1].exercises[0].supersetGroup,null);
  assert.equal(days[1].exercises[1].supersetGroup,null);
  for(const d of [days[1],days[4]]) assert.equal(d.exercises.filter(e=>/Reverse Pec Deck/.test(e.exerciseName)).length,1);
  assert.match(workoutPlanPageSource,/DEFAULT_WORKOUT_PLAN.map/);
});

test("revised safety, exclusions and working curl identities remain explicit",()=>{
  const days=workoutPlan.DEFAULT_WORKOUT_PLAN;
  const names=days.flatMap(d=>d.exercises.map(e=>e.exerciseName)).join("\n");
  assert.doesNotMatch(names,/Cable Crunch|Standing Barbell Curl|Face Pull|Incline Dumbbell Press|Standing Cable Lateral Raise|Conventional Deadlift|Barbell Squat|Barbell Bench Press/);
  assert.doesNotMatch(days[1].exercises.map(e=>e.exerciseName).join("\n"),/Curl|Triceps|Lateral Raise|Back Extension|Reverse Cable/);
  assert.doesNotMatch(days[4].exercises.map(e=>e.exerciseName).join("\n"),/Row|Pressdown/);
  for(const d of [days[0],days[2]]) {
    const calf=d.exercises.find(e=>/Calf/.test(e.exerciseName));
    assert.equal(calf.sets,1);assert.match(calf.cues,/3\/10 or higher/);assert.match(calf.cues,/following morning/);
  }
  const copy=workoutPlan.PROGRESSIVE_OVERLOAD_RULES.join(" ")+workoutPlan.FOOT_LOAD_RULES.join(" ");
  assert.match(copy,/three clean repetitions in reserve/);assert.match(copy,/normal gait and stable performance/);assert.match(copy,/No calendar-based increase/);
  assert.ok(workoutPlan.isOverheadPressExercise("Seated Machine Shoulder Press"));
  assert.ok(!workoutPlan.isOverheadPressExercise("Overhead Cable Triceps Extension"));
  assert.match(workoutPlan.WEEKLY_SET_SUMMARY.join(" "),/replacing overlapping work/);
});

test("session actions remain prominent and stateful", () => {
  for (const label of ["Start Session", "Resume Session", "View Session"]) {
    assert.match(workoutSessionActionButtonSource, new RegExp(escapeRegExp(label), "i"));
  }
  assert.match(workoutDayPreviewSource, /WorkoutSessionActionButton/);
  assert.match(workoutPlanPageSource, /WorkoutSessionActionButton/);
  assert.match(dashboardSource, /WorkoutSessionActionButton/);
  assert.match(workoutPageClientSource, /Full plan/);
  assert.match(workoutPageSource, /title: "Training \| Athanor"/);
});

test("workout changes invalidate the affected destinations", () => {
  for (const path of ["/", "/workout", "/workout/plan", "/workout/history", "/mobility", "/flexibility-balance", "/steps", "/weight", "/settings"]) {
    assert.ok(workoutActionsSource.includes('"' + path + '"'));
  }
});

test("plan hashes reject stale prescriptions and metadata",()=>{
 for(const day of workoutPlan.DEFAULT_WORKOUT_PLAN){
  assert.equal(workoutPlanVersion.isCurrentWorkoutPlanContent(day),true);
  assert.equal(workoutPlanVersion.isCurrentWorkoutPlanContent({...day,exercises:day.exercises.map((e,i)=>i?e:{...e,sets:e.sets+1})}),false);
 }
});

test("mobility later recovery and rest routines match the next-week block", () => {
  assert.equal(mobility.getMobilityProgram(2).logType, "PRE_WORKOUT");
  assert.equal(mobility.getMobilityProgram(2).sessionTitle, "Upper A primer");
  assert.equal(mobility.getMobilityProgram(3).logType, "PRE_WORKOUT");
  assert.equal(mobility.getMobilityProgram(3).sessionTitle, "Lower B primer");
  assert.equal(mobility.getMobilityProgram(4).sessionTitle, "Upper B primer");
  assert.equal(mobility.getMobilityProgram(5).sessionTitle, "Upper C primer");
  assert.equal(mobility.getTrainingSessionKeyForPlanDay(5), "UPPER_ACCESSORY");
  assert.equal(
    mobility.getTrainingSessionKey("Upper C — Chest Isolation + Upper Back / Arms + Core"),
    "UPPER_ACCESSORY"
  );
  assert.equal(mobility.getMobilityProgram(6).sessionTitle, "Complete Rest");
  assert.equal(mobility.getMobilityProgram(6).totalDuration, "0-8 min if stiff");
  assert.equal(mobility.getMobilityProgram(0).sessionTitle, "Complete Rest");
  assert.equal(mobility.getMobilityProgram(0).totalDuration, "10-15 min");
  assert.ok(mobility.getMobilityProgram(0).blocks.length > 0);
  assert.deepEqual(
    [1, 2, 3, 4, 5].map((day) => mobility.getRequiredLaterRecoveryTitle("standard", day)),
    [
      "Lower-Body Flush + Sole Care",
      "Upper-Body Downshift + Foot/Ankle Base",
      "Lower-Body Flush + Back Care",
      "Shoulder / Upper-Back Reset + Foot Base",
      "Weekly Downshift / Foot-Flare Recovery",
    ]
  );

  const saturdayExercises = Array.from(
    mobility.getMobilityProgram(6).blocks[0].exercises,
    (exercise) => exercise.name
  );
  assert.deepEqual(saturdayExercises, [
    "Supported Breathing Reset",
    "Seated Ankle Pumps",
    "Ankle Circles",
    "Wall Calf Stretch - Knee Straight",
    "Wall Calf Stretch - Knee Bent",
  ]);

  const footFlareBlocks = mobility.getRequiredLaterRecoveryBlocks("footFlare", 4);
  assert.equal(footFlareBlocks[0].title, "Foot comfort routine");
  assert.match(mobilityPageSource, /Foot comfort routine/);
  assert.match(mobilityPageSource, /RIGHT_SOLE_PACE_RULE/);
  assert.match(mobilitySource, /fastest pace that keeps gait normal/);
  assert.match(mobilitySource, /calfCapacityIsometric/);
  assert.match(mobilitySource, /getAnkleCapacityBlock/);
  assert.match(flexibilityBalancePageSource, /Weekday recovery blocks/);
});

test("nutrition remains removed from navigation and tracker routes", () => {
  const navLabels = Array.from(navItemsSource.matchAll(/label: "([^"]+)"/g), (match) => match[1]);
  assert.deepEqual(navLabels, [
    "Dashboard",
    "Mobility",
    "Flexibility & Balance",
    "Training",
    "Steps",
    "Weight",
    "Settings",
  ]);
  assert.doesNotMatch(navItemsSource, /Nutrition|\/nutrition/);
  assert.match(desktopSidebarSource, /NAV_ITEMS\.map/);
  assert.match(mobileHeaderSource, /NAV_ITEMS\.find/);
  assert.match(mobileHeaderSource, /NAV_ITEMS\.map/);
  assert.match(mobileHeaderSource, /SheetContent/);
  assert.doesNotMatch(appLayoutSource, /MobileNav/);
  for (const source of nutritionRouteSources) {
    assert.match(source, /redirect\("\/"\)/);
    assert.doesNotMatch(source, /NutritionPageClient|NutritionPlaceholder|prisma\.nutritionDay/);
  }
});

test("bodyweight formatting keeps pounds canonical and adds consistent kg and stone conversions", () => {
  assert.equal(units.WORKOUT_LOAD_UNIT, "kg");
  assert.equal(units.BODYWEIGHT_UNIT, "lb");
  assert.equal(units.formatWorkoutLoad(42.5), "42.5 kg");
  assert.equal(units.formatWorkoutVolume(1234.4), "1,234 kg");
  assert.equal(
    units.formatBodyweightConversion(271.5),
    "271.5 lb · 123.2 kg · 19 st 5.5 lb"
  );
  assert.equal(units.formatBodyweightSecondary(271.5), "123.2 kg · 19 st 5.5 lb");
  assert.equal(
    units.formatBodyweightDelta(-55.2),
    "-55.2 lb · -25.0 kg · -3 st 13.2 lb"
  );
  assert.equal(
    units.formatBodyweightDelta(14.5),
    "+14.5 lb · +6.6 kg · +1 st 0.5 lb"
  );
  assert.equal(units.formatBodyweightRate(-3.2), "-3.2 lb/wk · -1.45 kg/wk");
  assert.equal(
    units.formatBodyweightConversion(27.96),
    "28.0 lb · 12.7 kg · 2 st 0.0 lb"
  );
  assert.equal(units.formatBodyweightConversion("not-a-weight"), "");
  assert.match(settingsSource, /Training load unit/i);
  assert.match(weightPageSource, /formatBodyweightSecondary/);
  assert.match(weightChartSource, /formatBodyweightWithConversions/);
});

test("plan rotation does not rewrite completed historical sessions", () => {
  // Stale-session cleanup and template rotation are scoped to open sessions;
  // completed WorkoutSession and SessionSet rows remain historical records.
  assert.match(workoutPlanSeedSource, /where:\s*\{[\s\S]*completed:\s*false/);
  assert.doesNotMatch(workoutPlanSeedSource, /completed:\s*true/);
  assert.match(workoutActionsSource, /completed:\s*true/);
  assert.match(workoutSessionStateSource, /isCurrentPlanBackedWorkoutSession/);
  assert.match(workoutPlanSeedSource, /workoutPlan\.updateMany/);
  assert.doesNotMatch(workoutPlanSeedSource, /sessionSet\.(update|delete|deleteMany)/);
});

test("daily step goal still supports 8000 and step streak behavior is stable", () => {
  assert.equal(appSettings.DEFAULT_APP_SETTINGS.stepGoal, 8000);
  assert.equal(appSettings.parseAppSettings(JSON.stringify({ stepGoal: 8000 })).stepGoal, 8000);
  assert.match(stepsPageClientSource, /calculateStepStats\(entries, settings\.stepGoal/);
  assert.match(dashboardSource, /calculateStepStats\(stepsEntries, settings\.stepGoal/);
  assert.doesNotMatch(dashboardSource, /At risk|streakUnloggedDays|streakBackfillDate/);
  assert.doesNotMatch(
    stepsPageClientSource,
    /streakAtRisk|streakUnloggedDays|streakBackfillDate|formatBackfillDate/
  );
  assert.match(stepsPageClientSource, /detail="Consecutive goal days"/);
  assert.match(stepsActionsSource, /revalidatePath\("\/steps"\)/);
  assert.match(stepsActionsSource, /revalidatePath\("\/"\)/);

  const stats = steps.calculateStepStats([
    stepEntry("2026-06-21", 10691),
    stepEntry("2026-06-22", 10611),
    stepEntry("2026-06-23", 11171),
    stepEntry("2026-06-24", 9751),
  ], 8000, "2026-06-25");
  assert.equal(stats.currentStreak, 4);
  assert.equal(stats.goalDaysTotal, 4);
  assert.equal(stats.streakUnloggedDays, 0);
  assert.equal(stats.streakBackfillDate, null);

  // An unlogged day is missing data, not failure. Short gaps (<=3 consecutive
  // unlogged days) are bridged and retained as metadata without a UI warning;
  // a LOGGED below-goal day still breaks the streak.
  const bridged = steps.calculateStepStats([
    stepEntry("2026-07-01", 9953),
    stepEntry("2026-07-02", 9971),
    // 2026-07-03 never logged
  ], 8000, "2026-07-04");
  assert.equal(bridged.currentStreak, 2);
  assert.equal(bridged.streakUnloggedDays, 1);
  assert.equal(bridged.streakBackfillDate, "2026-07-03");

  // An incomplete local calendar day is not treated as a failed goal day.
  const incompleteToday = steps.calculateStepStats([
    stepEntry("2026-07-01", 9953),
    stepEntry("2026-07-02", 9971),
    stepEntry("2026-07-03", 1200),
  ], 8000, { todayLocalDate: "2026-07-03" });
  assert.equal(incompleteToday.currentStreak, 2);
  assert.equal(incompleteToday.goalDaysTotal, 2);

  const brokenByLoggedMiss = steps.calculateStepStats([
    stepEntry("2026-07-01", 9953),
    stepEntry("2026-07-02", 3000),
    stepEntry("2026-07-03", 9000),
  ], 8000, "2026-07-04");
  assert.equal(brokenByLoggedMiss.currentStreak, 1);
  assert.equal(brokenByLoggedMiss.streakUnloggedDays, 0);

  const longGapEndsStreak = steps.calculateStepStats([
    stepEntry("2026-06-24", 9000),
    // 2026-06-25 .. 2026-06-28 unlogged (4-day run exceeds the bridge limit)
    stepEntry("2026-06-29", 9200),
  ], 8000, "2026-06-30");
  assert.equal(longGapEndsStreak.currentStreak, 1);
  assert.equal(longGapEndsStreak.streakUnloggedDays, 0);
});

test("weight goal helpers still support aggressive target copy without medical dosing", () => {
  const entries = [
    {
      id: "weight-1",
      userId: "user-1",
      date: "2026-06-22",
      weight: 315,
      bodyFatPercent: null,
      status: "NORMAL",
      timeOfDay: null,
      notes: null,
      createdAt: "2026-06-22T12:00:00.000Z",
    },
  ];
  const stats = weight.computeWeightStats(entries, {
    startWeight: 315,
    heightInches: null,
    goalWeight: 154,
  });
  assert.equal(stats.currentWeight, 315);
  assert.equal(stats.goalWeight, 154);
  assert.equal(weight.computeRequiredWeeklyLossPace(315, 154, "2026-06-22", "2027-10-22"), 2.3);
  assert.match(weightChartSource, /This is an aggressive target; use the trend as guidance, not medical advice\./);
  assert.doesNotMatch([planSource, workoutPlanPageSource, trainingPlanSource].join("\n"), /\b\d+\s*mg\b|prescription medication|take .* medication/i);
});

test("primary app routes remain mounted", () => {
  assert.match(dashboardPageSource, /export default async function DashboardPage/);
  assert.match(workoutPageSource, /export default async function WorkoutPage/);
  assert.match(workoutPlanPageSource, /export default async function WorkoutPlanPage/);
  assert.match(mobilityPageSource, /export function MobilityPageClient/);
  assert.match(flexibilityBalancePageSource, /export default function FlexibilityBalancePage/);
  for (const href of ["/workout", "/mobility", "/flexibility-balance", "/steps", "/weight", "/settings"]) {
    assert.match(navItemsSource, new RegExp(`href: "${escapeRegExp(href)}"`));
  }
});

test("custom exercise library stays available without changing active plan constraints", () => {
  assert.match(exerciseLibrarySource, /Machine Chest Press/);
  assert.match(exerciseLibrarySource, /Single-Leg Leg Press/);
  assert.match(exerciseLibrarySource, /Back Extension Machine/);
  for (const canonicalMovement of [
    "Walking Lunges",
    "Pendulum Squat",
    "Lying Leg Curl",
    "Machine Row",
    "Neutral-Grip Lat Pulldown",
    "Close-Grip Lat Pulldown",
    "Reverse Cable Crossover",
    "Cable Lateral Raise",
    "High-to-Low Cable Fly",
    "Rope Triceps Pressdown",
    "Face Pull",
    "Cable Crunch",
  ]) {
    assert.match(exerciseLibrarySource, new RegExp(escapeRegExp(canonicalMovement)));
  }
  const activeNames = workoutPlan.DEFAULT_WORKOUT_PLAN
    .flatMap((day) => day.exercises)
    .map((exercise) => exercise.exerciseName)
    .join("\n");
  // Calf work is two seated slots, each with a fallback. The library must
  // offer the same seated machines and fallbacks — and no standing variant,
  // because the gym has no standing calf machine.
  assert.match(activeNames, /Seated Straight-Leg Calf Machine or Leg Press Calf Press/);
  assert.equal(
    activeNames.match(/Seated Straight-Leg Calf Machine or Leg Press Calf Press/g).length,
    2
  );
  assert.doesNotMatch(activeNames, /standing calf/i);
  assert.doesNotMatch(exerciseLibrarySource, /"Standing Calf Raise"/);
  for (const seated of [
    "Seated Straight-Leg Calf Machine",
    "Seated Bent-Leg Calf Raise",
    "Leg Press Calf Press",
    "Seated Dumbbell Calf Raise",
  ]) {
    assert.match(exerciseLibrarySource, new RegExp(escapeRegExp(seated)));
  }
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stepEntry(date, value) {
  return {
    id: `${date}-${value}`,
    date,
    steps: value,
  };
}

function loadTypescriptModule(path) {
  const filename = resolve(path);
  if (moduleCache.has(filename)) {
    return moduleCache.get(filename).exports;
  }

  const source = readFileSync(path, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: path,
  }).outputText;
  const compiledModule = { exports: {} };
  moduleCache.set(filename, compiledModule);
  const contextRequire = (specifier) => {
    if (specifier.startsWith("@/")) {
      const resolvedPath = resolve(specifier.replace("@/", "src/"));
      try {
        return loadTypescriptModule(`${resolvedPath}.ts`);
      } catch {
        try {
          return loadTypescriptModule(`${resolvedPath}.tsx`);
        } catch {
          return require(resolvedPath);
        }
      }
    }
    if (specifier.startsWith(".")) {
      const resolvedPath = resolve(dirname(filename), specifier);
      try {
        return loadTypescriptModule(`${resolvedPath}.ts`);
      } catch {
        try {
          return loadTypescriptModule(`${resolvedPath}.tsx`);
        } catch {
          return require(resolvedPath);
        }
      }
    }
    return require(specifier);
  };

  vm.runInNewContext(output, {
    exports: compiledModule.exports,
    module: compiledModule,
    require: contextRequire,
    __filename: filename,
    __dirname: dirname(filename),
  }, {
    filename,
  });
  return compiledModule.exports;
}
