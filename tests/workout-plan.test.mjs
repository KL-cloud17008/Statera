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

test("canonical workout plan is the adjusted current-week progressive overload block", () => {
  assert.equal(workoutPlan.NEXT_WEEK_TAPER_TITLE, "Adjusted Current Week Progressive Overload Block");
  assert.equal(workoutPlan.DEFAULT_WORKOUT_PLAN_VERSION, "adjusted-current-week-overload-v6");
  assert.deepEqual(Array.from(workoutPlan.DEFAULT_WORKOUT_PLAN, (day) => day.dayOfWeek), [1, 3, 4, 5]);
  assert.deepEqual(Array.from(workoutPlan.DEFAULT_WEEKLY_RHYTHM), [
    "Monday: Completed - Lower A",
    "Tuesday: Off Day / Recovery Reset",
    "Wednesday: Upper A - Progressive Push/Pull Circuit Strength",
    "Thursday: Lower B - Split Squat + Posterior Chain / Hip Stability",
    "Friday: Upper Machine Circuit + Shoulders/Arms",
    "Saturday: Recovery Rest",
    "Sunday: Complete Rest",
  ]);
  assert.match(workoutPlanPageSource, /4 \/ 1 \/ 2/);
  assert.match(workoutPlanPageSource, /4 Strength/);
  assert.match(workoutPlanPageSource, /1 Recovery/);
  assert.match(workoutPlanPageSource, /2 Full Rest/);
  assert.match(workoutPlanPageSource, /Thursday total working sets: 15/);
  assert.match(workoutPlanPageSource, /Friday total prescribed sets: 25/);
  assert.doesNotMatch(workoutPlanPageSource, /Lat \/ Rear Delt \/ Back Extension/i);
  assert.match(planSource, /Adjusted current week\. Monday lower body was completed/);
});

test("strength days use the requested exercise selection and set balance", () => {
  const byDay = new Map(workoutPlan.DEFAULT_WORKOUT_PLAN.map((day) => [day.dayOfWeek, day]));

  assertDay(byDay.get(1), "Lower A", 11, [
    ["A1 Leg Press", 3, "8-10", "6-7"],
    ["B1 Walking Lunges / Stationary Lunges", 2, /6-10 steps per leg/i, "5-6"],
    ["C1 Lying Leg Curl", 3, "10-12", "6"],
    ["D1 Leg Extension", 3, "10-12", "6"],
  ]);
  assert.equal(byDay.get(2), undefined);
  assertDay(byDay.get(3), "Upper A", 23, [
    ["A1 Incline Dumbbell Press", 4, "8-12", "6-7"],
    ["A2 One-Arm Dumbbell Row", 4, "8-12 per side", "6-7"],
    ["B1 Neutral-Grip Lat Pulldown", 3, "8-12", "6-7"],
    ["B2 Dumbbell / Plate Lateral Raise", 3, "12-20", "6"],
    ["C1 Rope Triceps Pressdown", 3, "10-15", "6-7"],
    ["C2 Cable Curl", 3, "10-15", "6-7"],
    ["C3 Face Pull", 3, "12-15", "6"],
  ]);
  assertDay(byDay.get(4), "Lower B", 15, [
    ["B1 Bench-Supported Bulgarian Split Squat", 4, "6-8 per leg", "5-6"],
    ["C1 Back Hyperextension / Back Extension Machine", 2, "8-10", "4-5"],
    ["D1 Seated Leg Curl", 3, "10-12", "6-7"],
    ["D2 Hip Abduction Machine", 3, "12-20", "6"],
    ["D3 Seated Leg Extension", 3, "10-15", "6-7"],
  ]);
  assertDay(byDay.get(5), "Upper Machine", 25, [
    ["A1 Machine Press", 3, "8-12", "6-7"],
    ["A2 Seated Cable Row", 3, "8-12", "6-7"],
    ["B1 Wide-Grip Lat Pulldown", 3, "8-12", "6"],
    ["B2 Dumbbell or Plate Lateral Raise", 3, "12-20", "6"],
    ["C1 Reverse Pec Deck", 3, "12-15", "6"],
    ["C2 Hip Adduction Machine", 2, "12-20", "5-6"],
    ["D1 Rope Triceps Pressdown", 3, "10-15", "6-7"],
    ["D2 Seated Dumbbell Overhead Press", 2, "8-12", "5-6"],
    ["D3 Cable Curl", 3, "10-15", "6-7"],
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
  assert.ok(wednesday.exercises.some((exercise) => exercise.exerciseName === "A1 Incline Dumbbell Press"));
  const thursday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 4);
  assert.ok(!thursday.exercises.some((exercise) => /Leg Press/i.test(exercise.exerciseName)));
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "B1 Bench-Supported Bulgarian Split Squat"));
  assert.equal(thursday.exercises.find((exercise) => exercise.exerciseName === "B1 Bench-Supported Bulgarian Split Squat").sets, 4);
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "C1 Back Hyperextension / Back Extension Machine"));
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "D1 Seated Leg Curl"));
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "D2 Hip Abduction Machine"));
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "D3 Seated Leg Extension"));
  const friday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 5);
  assert.match(friday.sessionName, /Upper Machine Circuit \+ Shoulders\/Arms/);
  assert.ok(!friday.exercises.some((exercise) => /Incline Machine Press|Leg Extension|Single-Leg Lying Curl|Back Hyperextension|Back Extension Machine/i.test(exercise.exerciseName)));
  assert.ok(!friday.exercises.some((exercise) => /Back Hyperextension|Back Extension Machine/i.test(exercise.exerciseName)));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "A1 Machine Press"));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "A2 Seated Cable Row"));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "B1 Wide-Grip Lat Pulldown"));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "B2 Dumbbell or Plate Lateral Raise"));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "C1 Reverse Pec Deck"));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "C2 Hip Adduction Machine"));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "D1 Rope Triceps Pressdown"));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "D2 Seated Dumbbell Overhead Press"));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "D3 Cable Curl"));
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
    "lower-body loading",
    "No loaded spinal flexion",
    "No heavy bracing",
    "No max effort",
    "No failure training",
    "Week 3 controlled overload",
    "Add reps before load",
    "Smallest available kg jump preferred",
    "Stay 2-3 reps in reserve on main work",
    "Accessories may stay 1-3 reps in reserve",
    "No grinding",
    "If form breaks, keep load the same next session",
    "No treadmill warm-ups",
    "No bike warm-ups",
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
    "Quads: Monday completed lower session plus Thursday Bulgarian Split Squat 4 and Seated Leg Extension 3 = controlled quad exposure without Friday leg-extension work.",
    "Hamstrings/posterior chain: Thursday Seated Leg Curl 3 and Back Hyperextension 2 plus Monday completed work.",
    "Glutes/hips: Thursday Hip Abduction 3, Bulgarian Split Squat 4, back-extension practice, and Friday light Hip Adduction 2.",
    "Chest: Wednesday Incline Dumbbell Press 4, Friday Machine Press 3.",
    "Back/lats: Wednesday Row 4, Pulldown 3, Friday Row 3, Pulldown 3.",
    "Shoulders: Wednesday Lateral Raise 3, Friday Lateral Raise 3, Seated Dumbbell Overhead Press 2, and Reverse Pec Deck 3.",
    "Rear delts/upper back: Wednesday Face Pull 3, Friday Reverse Pec Deck/Face Pull 3.",
    "Triceps: Wednesday Pressdown 3, Friday Rope Triceps Pressdown 3 plus pressing assistance.",
    "Biceps: Wednesday Cable Curl 3, Friday Cable Curl 3 plus pulling assistance.",
    "Feet/ankles/calves: mobility/recovery only, no direct loaded calf raises.",
  ]);
  assert.match(workoutPlanPageSource, /WEEKLY_SET_SUMMARY/);
});

test("dashboard and schedule constants reflect the adjusted four strength days", () => {
  assert.match(constantsSource, /DEFAULT_TRAINING_DAYS = \[1, 3, 4, 5\]/);
  assert.match(constantsSource, /DEFAULT_RECOVERY_DAYS = \[2\]/);
  assert.match(constantsSource, /DEFAULT_REST_DAYS = \[0, 6\]/);
  assert.match(dashboardSource, /4 Strength \/ 1 Recovery \/ 2 Full Rest/);
  assert.match(dashboardSource, /day: "TUE"[\s\S]*label: "Off Day \/ Recovery Reset"[\s\S]*protocol: "Recovery Protocol"/);
  assert.match(dashboardSource, /day: "WED"[\s\S]*label: "Upper A"[\s\S]*protocol: "Strength Protocol"/);
  assert.match(dashboardSource, /day: "THU"[\s\S]*label: "Lower B — Split Squat \+ Posterior Chain \/ Hip Stability"[\s\S]*protocol: "Strength Protocol"/);
  assert.match(dashboardSource, /day: "FRI"[\s\S]*label: "Upper Machine Circuit \+ Shoulders\/Arms"[\s\S]*protocol: "Strength Protocol"/);
  assert.match(dashboardSource, /"Lower B — Split Squat \+ Posterior Chain \/ Hip Stability"/);
  assert.match(dashboardSource, /"Upper Machine Circuit \+ Shoulders\/Arms"/);
  assert.match(dashboardSource, /day: "SAT"[\s\S]*label: "Recovery Rest"[\s\S]*protocol: "Full Rest"/);
  assert.match(dashboardSource, /day: "SUN"[\s\S]*label: "Complete Rest"[\s\S]*protocol: "Full Rest"/);
  assert.match(dashboardSource, /const isStrengthDay = \[1, 3, 4, 5\]/);
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

test("start-new-plan and stale active snapshots rebuild from the adjusted current-week template", () => {
  assert.match(workoutPlanResetButtonSource, /Start adjusted plan/);
  assert.match(workoutPlanResetButtonSource, /adjusted current-week plan/);
  assert.match(workoutActionsSource, /Start a new adjusted current-week plan first/);
  assert.match(workoutActionsSource, /revalidatePath\("\/"\)/);
  for (const path of ["/workout", "/workout/plan", "/mobility", "/flexibility-balance", "/steps", "/weight", "/settings"]) {
    assert.match(workoutActionsSource, new RegExp(`"${escapeRegExp(path)}"`));
  }
  assert.match(workoutPlanSeedSource, /isCurrentWorkoutPlanContent/);
  assert.match(workoutPlanSeedSource, /workoutPlanId: \{ not: null \}/);
  assert.match(workoutPlanSeedSource, /preservableOpenSessions/);
  assert.match(workoutPlanSeedSource, /staleOpenSessionIds/);
  assert.match(workoutPlanSeedSource, /workoutSession\.update/);
  assert.match(workoutPlanSeedSource, /buildCurrentPlanSessionNotes/);
  assert.match(workoutPlanSeedSource, /data: \{ isActive: false \}/);
  assert.match(workoutPlanSeedSource, /createDefaultWorkoutPlans\(tx, userId\)/);
  assert.match(workoutActionsSource, /completedSessionMatchesCurrentPlan/);
  assert.match(workoutActionsSource, /getSessionFamily/);
  assert.match(workoutActionsSource, /workoutPlanId: \{ not: null \}/);
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

  const oldThursdaySnapshot = {
    dayOfWeek: 4,
    sessionName: "Lower B - Single-Leg Strength + Posterior Chain / Hip Stability",
    exercises: [
      {
        exerciseName: "A1 Single-Leg Leg Press",
        sets: 2,
        reps: "8-10 per leg",
        tempo: "3-1-1",
        restSeconds: 180,
        targetRPE: "5-6",
        cues: "Old Thursday leg press placement.",
        supersetGroup: "A",
        exerciseType: "WORKING",
        sortOrder: 0,
      },
      {
        exerciseName: "B1 Bench-Supported Bulgarian Split Squat",
        sets: 3,
        reps: "6-8 per leg",
        tempo: "controlled",
        restSeconds: 180,
        targetRPE: "5-6",
        cues: "Old Thursday split squat volume.",
        supersetGroup: "B",
        exerciseType: "WORKING",
        sortOrder: 1,
      },
    ],
  };

  assert.equal(workoutPlanVersion.isCurrentWorkoutPlanContent(oldThursdaySnapshot), false);

  const oldFridaySnapshot = {
    dayOfWeek: 5,
    sessionName: "Upper Machine Circuit + Shoulders/Arms",
    exercises: [
      {
        exerciseName: "B3 Back Hyperextension / Back Extension Machine",
        sets: 2,
        reps: "8-10",
        tempo: "slow",
        restSeconds: 120,
        targetRPE: "4-5",
        cues: "Old Friday back extension placement.",
        supersetGroup: "B",
        exerciseType: "WORKING",
        sortOrder: 0,
      },
    ],
  };

  assert.equal(workoutPlanVersion.isCurrentWorkoutPlanContent(oldFridaySnapshot), false);
});

test("mobility later recovery and rest routines match the adjusted current week", () => {
  assert.equal(mobility.getMobilityProgram(2).logType, "POST_WORKOUT");
  assert.equal(mobility.getMobilityProgram(2).sessionTitle, "Off Day — Recovery Reset");
  assert.equal(mobility.getMobilityProgram(3).logType, "PRE_WORKOUT");
  assert.equal(mobility.getMobilityProgram(3).sessionTitle, "Upper A primer");
  assert.equal(mobility.getMobilityProgram(5).sessionTitle, "Upper machine circuit primer");
  assert.equal(mobility.getMobilityProgram(6).sessionTitle, "Recovery Rest");
  assert.equal(mobility.getMobilityProgram(6).totalDuration, "0-12 min if stiff");
  assert.equal(mobility.getMobilityProgram(0).sessionTitle, "Complete Rest");
  assert.deepEqual(Array.from(mobility.getMobilityProgram(0).blocks), []);
  assert.deepEqual(
    [1, 2, 3, 4, 5].map((day) => mobility.getRequiredLaterRecoveryTitle("standard", day)),
    [
      "Lower Body Downshift + Foot-Flare Care",
      "Off Day — Recovery Reset",
      "Upper-Body Downshift + Foot/Ankle Base",
      "Lower-Body Flush + Sole / Back Care",
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
    "Pelvic Tilts",
    "Open Book Thoracic Rotation",
  ]);

  const footFlareBlocks = mobility.getRequiredLaterRecoveryBlocks("footFlare", 4);
  assert.equal(footFlareBlocks[0].title, "Required foot-flare recovery");
  assert.match(mobilityPageSource, /Required foot-flare recovery/);
  assert.match(mobilityPageSource, /No mobility block is scheduled today/);
  assert.match(flexibilityBalancePageSource, /Tuesday recovery reset/);
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

test("custom exercise library stays available without changing active plan constraints", () => {
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
