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
const sessionLoggerSource = readFileSync("src/components/workout/SessionLogger.tsx", "utf8");
const workoutSessionActionButtonSource = readFileSync("src/components/workout/WorkoutSessionActionButton.tsx", "utf8");
const workoutPlanResetButtonSource = readFileSync("src/components/workout/WorkoutPlanResetButton.tsx", "utf8");
const workoutActionsSource = readFileSync("src/actions/workout.ts", "utf8");
const workoutPlanSeedSource = readFileSync("src/lib/workout-plan-seed.ts", "utf8");
const trainingSessionSource = readFileSync("src/lib/training-session.ts", "utf8");
const dashboardSource = readFileSync("src/components/dashboard/DashboardPageClient.tsx", "utf8");
const mobilityPageSource = readFileSync("src/components/mobility/MobilityPageClient.tsx", "utf8");
const flexibilityBalancePageSource = readFileSync("src/app/(app)/flexibility-balance/page.tsx", "utf8");
const navItemsSource = readFileSync("src/components/layout/nav-items.ts", "utf8");
const desktopSidebarSource = readFileSync("src/components/layout/DesktopSidebar.tsx", "utf8");
const mobileNavSource = readFileSync("src/components/layout/MobileNav.tsx", "utf8");
const mobileHeaderSource = readFileSync("src/components/layout/MobileHeader.tsx", "utf8");
const trainingPlanSource = readFileSync("training_plan.md", "utf8");
const settingsSource = readFileSync("src/components/settings/SettingsPageClient.tsx", "utf8");
const stepsActionsSource = readFileSync("src/actions/steps.ts", "utf8");
const stepsPageClientSource = readFileSync("src/components/steps/StepsPageClient.tsx", "utf8");
const dashboardPageSource = readFileSync("src/app/(app)/page.tsx", "utf8");
const weightPageSource = readFileSync("src/app/(app)/weight/page.tsx", "utf8");
const weightChartSource = readFileSync("src/components/weight/WeightChart.tsx", "utf8");
const exerciseLibrarySource = readFileSync("src/lib/exercise-library.ts", "utf8");
const constantsSource = readFileSync("src/lib/constants.ts", "utf8");
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

test("canonical workout plan is the next-week 5-day taper microcycle", () => {
  assert.equal(workoutPlan.NEXT_WEEK_TAPER_TITLE, "Next Week 5-Day Taper Microcycle");
  assert.equal(workoutPlan.DEFAULT_WORKOUT_PLAN_VERSION, "next-week-5-day-taper-v1");
  assert.deepEqual(Array.from(workoutPlan.DEFAULT_WORKOUT_PLAN, (day) => day.dayOfWeek), [1, 2, 3, 4, 5]);
  assert.deepEqual(Array.from(workoutPlan.DEFAULT_WEEKLY_RHYTHM), [
    "Monday: Lower A - Leg Strength Peak / Machine-Supported",
    "Tuesday: Upper A - Push/Pull Strength",
    "Wednesday: Posterior Chain + Upper Recovery Strength",
    "Thursday: Lower B - Low-Dose Legs + Hip Stability",
    "Friday: Training Reset - Machine Upper + Arms",
    "Saturday: Mobility, Flexibility & Balance - Recovery Protocol",
    "Sunday: Complete rest",
  ]);
  assert.match(workoutPlanPageSource, /5\/1\/1/);
  assert.match(workoutPlanPageSource, /5 Strength/);
  assert.match(workoutPlanPageSource, /1 Recovery/);
  assert.match(workoutPlanPageSource, /1 full rest/);
  assert.match(workoutPlanPageSource, /Next week uses a 5-day taper/);
});

test("strength days use the requested exercise selection and set balance", () => {
  const byDay = new Map(workoutPlan.DEFAULT_WORKOUT_PLAN.map((day) => [day.dayOfWeek, day]));

  assertDay(byDay.get(1), "Lower A", 11, [
    ["A1 Leg Press", 3, "8-10", "6-7"],
    ["B1 Walking Lunges / Stationary Lunges", 2, /6-10 steps per leg/i, "5-6"],
    ["C1 Lying Leg Curl", 3, "10-12", "6"],
    ["D1 Leg Extension", 3, "10-12", "6"],
  ]);
  assertDay(byDay.get(2), "Upper A", 16, [
    ["A1 Incline Dumbbell Press", 3, "8-12", "6-7"],
    ["A2 One-Arm Dumbbell Row", 3, "8-12 per side", "6-7"],
    ["B1 Neutral-Grip Lat Pulldown", 2, "8-12", "5-6"],
    ["B2 Plate Lateral Raise / Dumbbell Lateral Raise", 2, "12-20", "5-6"],
    ["C1 Rope Triceps Pressdown", 2, "10-15", "6"],
    ["C2 Cable Curl", 2, "10-15", "6"],
    ["C3 Face Pull", 2, "12-15", "5-6"],
  ]);
  assertDay(byDay.get(3), "Posterior Chain", 9, [
    ["A1 Seated Cable Row", 2, "10-12", "5"],
    ["A2 Machine Chest Press or Incline Machine Press", 2, "10-12", "5"],
    ["B1 Rope Triceps Pressdown", 2, "10-15", "5-6"],
    ["B2 Cable Curl", 2, "10-15", "5-6"],
    ["C1 Back Hyperextension / Back Extension Machine", 1, /optional second set/i, "4-5"],
  ]);
  assertDay(byDay.get(4), "Lower B", 8, [
    ["A1 Single-Leg Leg Press", 2, "8-10 per leg", "5-6"],
    ["B1 Seated Hamstring Curl", 2, "10-12", "5-6"],
    ["B2 Leg Extension", 2, "10-12", "5-6"],
    ["C1 Hip Abduction Machine", 2, "12-20", "5-6"],
  ]);
  assertDay(byDay.get(5), "Training Reset", 8, [
    ["A1 Lat Pulldown Variation", 2, "10-12", "4-5"],
    ["A2 Incline Machine Press", 2, "10-12", "4-5"],
    ["B1 Reverse Pec Deck or Face Pull", 2, "12-15", "4-5"],
    ["C1 Bicep Curl Machine", 2, "10-15", "4-5"],
  ]);
});

test("active plan excludes prohibited and removed strength work", () => {
  const activePlanText = workoutPlan.DEFAULT_WORKOUT_PLAN
    .flatMap((day) => [day.sessionName, ...day.exercises.map((exercise) => exercise.exerciseName)])
    .join("\n");

  for (const prohibited of [
    "High Wall Sit",
    "Wall Sit",
    "Supported Tandem Balance Hold",
    "Supported Single-Leg Balance with Toe-Touch Kickstand",
    "Barbell Squat",
    "Conventional Deadlift",
    "Barbell Bench Press",
    "Hack Squat",
    "Dumbbell Romanian Deadlift",
    "Machine Abdominal Crunch",
    "Pallof Press",
    "Dead Bug",
    "Calf Raise",
    "Calf Raises",
  ]) {
    assert.doesNotMatch(activePlanText, new RegExp(escapeRegExp(prohibited), "i"));
  }

  const monday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 1);
  assert.ok(!monday.exercises.some((exercise) => /Seated Hamstring Curl|Hip Abduction Machine|High Wall Sit/i.test(exercise.exerciseName)));
  const wednesday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 3);
  assert.ok(wednesday.exercises.some((exercise) => exercise.exerciseName === "C1 Back Hyperextension / Back Extension Machine"));
  const thursday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 4);
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "C1 Hip Abduction Machine"));
  const friday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 5);
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "C1 Bicep Curl Machine"));
});

test("plan copy preserves foot-load, back-pain, prep, and recovery rules", () => {
  const programCopy = [
    planSource,
    trainingSessionSource,
    workoutPlanPageSource,
    workoutDayPreviewSource,
    sessionLoggerSource,
    trainingPlanSource,
  ].join("\n");

  for (const expected of [
    "Work steps count as primary load",
    "Foot pain controls walking volume",
    "Sole/plantar pain 0-2/10",
    "Sole/plantar pain 3-4/10",
    "Sole/plantar pain 5+/10",
    "Sharp pain, limping, swelling, warmth, numbness, or tingling",
    "Pain shooting down the leg",
    "bowel/bladder changes",
    "Leg Press or Back Hyperextension",
    "No loaded spinal flexion",
    "No heavy bracing",
    "No max effort",
    "No failure training",
    "Required later recovery",
    "Ramp set 1: very easy x 8-10, RPE 3-4",
    "Set 2: easy/moderate x 5-8, RPE 4-5 only if needed",
  ]) {
    assert.match(programCopy, new RegExp(escapeRegExp(expected), "i"));
  }

  assert.doesNotMatch(programCopy, /optional later recovery/i);
  assert.doesNotMatch(programCopy, /Weight\/Reps\/RPE rows[\s\S]*Ramp set/i);
});

test("weekly set summary covers the required muscle groups", () => {
  assert.deepEqual(Array.from(workoutPlan.WEEKLY_SET_SUMMARY), [
    "Quads: Leg Press 3, Walking Lunges 2, Leg Extension 5, Single-Leg Leg Press 2 = 12 direct/primary sets.",
    "Hamstrings: Lying Leg Curl 3, Seated Hamstring Curl 2 = 5 direct sets, plus lunges/leg press assistance.",
    "Glutes/hips: Walking Lunges 2, Hip Abduction 2, Leg Press assistance = 4 direct/primary sets plus assistance.",
    "Chest: Incline Dumbbell Press 3, Machine Chest Press 2, Incline Machine Press 2 = 7 direct sets.",
    "Back/lats: One-Arm Row 3, Lat Pulldown 4, Seated Cable Row 2 = 9 direct sets.",
    "Delts/rear delts: Lateral Raise 2, Face Pull 2, Reverse Pec Deck/Face Pull 2 = 6 direct sets.",
    "Triceps: Pressdown 4 plus chest pressing assistance.",
    "Biceps: Cable Curl 4, Bicep Curl Machine 2 plus pulling assistance = 6 direct sets.",
    "Lower back: Back Hyperextension 1-2 very low-dose sets only if tolerated.",
    "Calves/feet/ankles: mobility/recovery only, no direct loaded calf raise.",
  ]);
  assert.match(workoutPlanPageSource, /WEEKLY_SET_SUMMARY/);
});

test("dashboard and schedule constants reflect five strength days", () => {
  assert.match(constantsSource, /DEFAULT_TRAINING_DAYS = \[1, 2, 3, 4, 5\]/);
  assert.match(constantsSource, /DEFAULT_REST_DAYS = \[0, 6\]/);
  assert.match(dashboardSource, /5 Strength \/ 1 Recovery \/ 1 Full Rest/);
  assert.match(dashboardSource, /day: "WED"[\s\S]*label: "Posterior Chain \+ Upper Recovery Strength"[\s\S]*protocol: "Strength Protocol"/);
  assert.match(dashboardSource, /day: "SAT"[\s\S]*label: "Mobility, Flexibility & Balance"[\s\S]*protocol: "Recovery Protocol"/);
  assert.match(dashboardSource, /day: "SUN"[\s\S]*label: "Complete Rest"[\s\S]*protocol: "Full Rest"/);
  assert.match(dashboardSource, /const isStrengthDay = \[1, 2, 3, 4, 5\]/);
});

test("session actions remain prominent and stateful", () => {
  for (const label of ["Start Session", "Resume Session", "View Session"]) {
    assert.match(workoutSessionActionButtonSource, new RegExp(escapeRegExp(label)));
  }
  assert.match(workoutDayPreviewSource, /WorkoutSessionActionButton/);
  assert.match(workoutPlanPageSource, /WorkoutSessionActionButton/);
  assert.match(dashboardSource, /WorkoutSessionActionButton/);
  assert.match(workoutPageClientSource, /Full plan/);
  assert.match(workoutPageSource, /title: "Training \| Athanor"/);
});

test("start-new-plan and stale active snapshots rebuild from the taper template", () => {
  assert.match(workoutPlanResetButtonSource, /Start new taper plan/);
  assert.match(workoutPlanResetButtonSource, /next-week 5-day taper plan/);
  assert.match(workoutActionsSource, /Start a new 5-day taper plan first/);
  assert.match(workoutActionsSource, /revalidatePath\("\/"\)/);
  for (const path of ["/workout", "/workout/plan", "/mobility", "/flexibility-balance", "/steps", "/weight", "/settings"]) {
    assert.match(workoutActionsSource, new RegExp(`"${escapeRegExp(path)}"`));
  }
  assert.match(workoutPlanSeedSource, /isCurrentWorkoutPlanContent/);
  assert.match(workoutPlanSeedSource, /workoutPlanId: \{ not: null \}/);
  assert.match(workoutPlanSeedSource, /data: \{ isActive: false \}/);
  assert.match(workoutPlanSeedSource, /createDefaultWorkoutPlans\(tx, userId\)/);
});

test("workout plan hashes reject old active plan snapshots", () => {
  const day1 = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 1);
  assert.ok(day1);
  assert.equal(
    workoutPlanVersion.getWorkoutPlanContentHash(day1),
    workoutPlanVersion.getCanonicalWorkoutPlanContentHash(1)
  );
  assert.equal(workoutPlanVersion.isCurrentWorkoutPlanContent(day1), true);

  const oldSnapshot = {
    dayOfWeek: 1,
    sessionName: "Upper A - Free-Weight Push/Pull + Low-Stress Shoulder Circuit",
    exercises: [
      {
        exerciseName: "A1 Incline Dumbbell Press",
        sets: 3,
        reps: "8-12",
        tempo: "3-1-1",
        restSeconds: 120,
        targetRPE: "6-7",
        cues: "Old upper day.",
        supersetGroup: "A",
        exerciseType: "WORKING",
        sortOrder: 0,
      },
    ],
  };

  assert.equal(workoutPlanVersion.isCurrentWorkoutPlanContent(oldSnapshot), false);
});

test("mobility later recovery and Saturday routine match the taper", () => {
  assert.equal(mobility.getMobilityProgram(3).logType, "PRE_WORKOUT");
  assert.equal(mobility.getMobilityProgram(6).sessionTitle, "Mobility, Flexibility & Balance — Recovery Protocol");
  assert.equal(mobility.getMobilityProgram(6).totalDuration, "15-20 min");
  assert.deepEqual(
    [1, 2, 3, 4, 5].map((day) => mobility.getRequiredLaterRecoveryTitle("standard", day)),
    [
      "Lower Body Downshift + Foot-Flare Care",
      "Post-Leg Fatigue + Shoulder Reset",
      "Foot Load Control + Lower Back Relief",
      "Lower-Body Flush + Sole Care",
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
    "Wall Ankle Rocks",
    "Wall Calf Stretch - Knee Straight",
    "Wall Calf Stretch - Knee Bent",
    "Supported Tandem Balance Hold",
    "Supported Single-Leg Balance with Toe-Touch Kickstand",
    "Pelvic Tilts",
    "Cat-Cow",
    "Supported Hip-Hinge Rock-Back",
    "Open Book Thoracic Rotation",
    "Supported Hip Flexor Stretch",
  ]);

  const footFlareBlocks = mobility.getRequiredLaterRecoveryBlocks("footFlare", 4);
  assert.equal(footFlareBlocks[0].title, "Required foot-flare recovery");
  assert.match(mobilityPageSource, /Required foot-flare recovery/);
  assert.match(flexibilityBalancePageSource, /Saturday dedicated recovery/);
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
  assert.match(mobileNavSource, /NAV_ITEMS\.map/);
  assert.match(mobileHeaderSource, /NAV_ITEMS\.find/);
  for (const source of nutritionRouteSources) {
    assert.match(source, /redirect\("\/"\)/);
    assert.doesNotMatch(source, /NutritionPageClient|NutritionPlaceholder|prisma\.nutritionDay/);
  }
  assert.match(dashboardSource, /Nutrition is tracked externally in Cronometer/);
});

test("units and bodyweight conversion remain unchanged", () => {
  assert.equal(units.WORKOUT_LOAD_UNIT, "kg");
  assert.equal(units.BODYWEIGHT_UNIT, "lb");
  assert.equal(units.formatWorkoutLoad(42.5), "42.5 kg");
  assert.equal(units.formatWorkoutVolume(1234.4), "1,234 kg");
  assert.equal(units.formatBodyweightConversion(310.3), "310.3 lb = 140.75 kg = 22 st 2.3 lb");
  assert.match(settingsSource, /Training Load Unit/);
  assert.match(weightPageSource, /formatBodyweightConversion/);
});

test("daily step goal still supports 8000 and step streak behavior is stable", () => {
  assert.equal(appSettings.DEFAULT_APP_SETTINGS.stepGoal, 8000);
  assert.equal(appSettings.parseAppSettings(JSON.stringify({ stepGoal: 8000 })).stepGoal, 8000);
  assert.match(stepsPageClientSource, /calculateStepStats\(entries, settings\.stepGoal/);
  assert.match(dashboardSource, /calculateStepStats\(stepsEntries, settings\.stepGoal/);
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
  assert.doesNotMatch([planSource, workoutPlanPageSource, trainingPlanSource].join("\n"), /\b\d+\s*mg\b|prescription|take .* medication/i);
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

test("custom exercise library stays available without changing active taper constraints", () => {
  assert.match(exerciseLibrarySource, /Machine Chest Press/);
  assert.match(exerciseLibrarySource, /Single-Leg Leg Press/);
  assert.match(exerciseLibrarySource, /Back Extension Machine/);
  const activeNames = workoutPlan.DEFAULT_WORKOUT_PLAN
    .flatMap((day) => day.exercises)
    .map((exercise) => exercise.exerciseName)
    .join("\n");
  assert.doesNotMatch(activeNames, /Standing Calf Raise|Seated Calf Raise|Calf Raises/i);
});

function assertDay(day, nameFragment, totalSets, expectedExercises) {
  assert.ok(day, `${nameFragment} should exist`);
  assert.match(day.sessionName, new RegExp(escapeRegExp(nameFragment), "i"));
  assert.equal(day.exercises.reduce((sum, exercise) => sum + exercise.sets, 0), totalSets);

  for (const [exerciseName, sets, reps, rpe] of expectedExercises) {
    const exercise = day.exercises.find((item) => item.exerciseName === exerciseName);
    assert.ok(exercise, `${day.sessionName} should include ${exerciseName}`);
    assert.equal(exercise.sets, sets, `${exerciseName} set count`);
    if (reps instanceof RegExp) {
      assert.match(exercise.reps, reps, `${exerciseName} reps`);
    } else {
      assert.equal(exercise.reps, reps, `${exerciseName} reps`);
    }
    assert.equal(exercise.targetRPE, rpe, `${exerciseName} RPE`);
    assert.equal(exercise.exerciseType, "WORKING");
  }
}

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
