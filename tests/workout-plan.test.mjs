import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

const planSource = readFileSync("src/lib/default-workout-plan.ts", "utf8");
const mobilitySource = readFileSync("src/lib/mobility.ts", "utf8");
const mobilityPageSource = readFileSync("src/components/mobility/MobilityPageClient.tsx", "utf8");
const workoutDayPreviewSource = readFileSync("src/components/workout/WorkoutDayPreview.tsx", "utf8");
const workoutPlanPageSource = readFileSync("src/app/(app)/workout/plan/page.tsx", "utf8");
const workoutPageSource = readFileSync("src/app/(app)/workout/page.tsx", "utf8");
const workoutPageClientSource = readFileSync("src/components/workout/WorkoutPageClient.tsx", "utf8");
const sessionLoggerSource = readFileSync("src/components/workout/SessionLogger.tsx", "utf8");
const exerciseCardSource = readFileSync("src/components/workout/ExerciseCard.tsx", "utf8");
const setInputSource = readFileSync("src/components/workout/SetInput.tsx", "utf8");
const workoutActionsSource = readFileSync("src/actions/workout.ts", "utf8");
const trainingSessionSource = readFileSync("src/lib/training-session.ts", "utf8");
const flexibilityBalancePageSource = readFileSync("src/app/(app)/flexibility-balance/page.tsx", "utf8");
const navItemsSource = readFileSync("src/components/layout/nav-items.ts", "utf8");
const desktopSidebarSource = readFileSync("src/components/layout/DesktopSidebar.tsx", "utf8");
const mobileNavSource = readFileSync("src/components/layout/MobileNav.tsx", "utf8");
const mobileHeaderSource = readFileSync("src/components/layout/MobileHeader.tsx", "utf8");
const dashboardSource = readFileSync("src/components/dashboard/DashboardPageClient.tsx", "utf8");
const dashboardPageSource = readFileSync("src/app/(app)/page.tsx", "utf8");
const stepsPageClientSource = readFileSync("src/components/steps/StepsPageClient.tsx", "utf8");
const stepsActionsSource = readFileSync("src/actions/steps.ts", "utf8");
const exerciseLibrarySource = readFileSync("src/lib/exercise-library.ts", "utf8");
const nutritionRouteSources = [
  "src/app/(app)/nutrition/page.tsx",
  "src/app/(app)/nutrition/foods/page.tsx",
  "src/app/(app)/nutrition/meals/page.tsx",
  "src/app/(app)/nutrition/summary/page.tsx",
  "src/app/(app)/nutrition/import/page.tsx",
].map((path) => readFileSync(path, "utf8"));
const settingsSource = readFileSync("src/components/settings/SettingsPageClient.tsx", "utf8");
const mobilityPageRouteSource = readFileSync("src/app/(app)/mobility/page.tsx", "utf8");
const flexibilityBalanceRouteSource = readFileSync("src/app/(app)/flexibility-balance/page.tsx", "utf8");
const stepsPageRouteSource = readFileSync("src/app/(app)/steps/page.tsx", "utf8");
const weightPageRouteSource = readFileSync("src/app/(app)/weight/page.tsx", "utf8");
const settingsPageRouteSource = readFileSync("src/app/(app)/settings/page.tsx", "utf8");
const trainingPlanSource = readFileSync("training_plan.md", "utf8");
const weightChartSource = readFileSync("src/components/weight/WeightChart.tsx", "utf8");
const designTokensSource = readFileSync("src/app/design-tokens.css", "utf8");
const globalsSource = readFileSync("src/app/globals.css", "utf8");
const inputSource = readFileSync("src/components/ui/input.tsx", "utf8");
const require = createRequire(import.meta.url);
const ts = require("typescript");
const moduleCache = new Map();
const units = loadTypescriptModule("src/lib/units.ts");
const appSettings = loadTypescriptModule("src/lib/app-settings.ts");
const backup = loadTypescriptModule("src/lib/backup.ts");
const mobility = loadTypescriptModule("src/lib/mobility.ts");
const nutrition = loadTypescriptModule("src/lib/nutrition.ts");
const steps = loadTypescriptModule("src/lib/steps.ts");
const weight = loadTypescriptModule("src/lib/weight.ts");
const workoutPlan = loadTypescriptModule("src/lib/default-workout-plan.ts");

const requiredExercises = [
  "Incline Dumbbell Press",
  "One-Arm Dumbbell Row",
  "Plate Lateral Raise / Dumbbell Lateral Raise",
  "Neutral-Grip Lat Pulldown",
  "Single-Leg Leg Press",
  "Lunges / Walking Lunges",
  "Leg Extension",
  "Lying Leg Curl",
  "Leg Press",
  "Glute Kickback Machine",
  "Hyperextension / Back Extension Machine",
  "Hip Abduction Machine",
  "Wall Sit",
];

const temporarilyExcludedPlanExercises = [
  "Barbell Overhead Press / Military Press",
  "Barbell Overhead Press",
  "Military Press",
];

const day4MachineSupportedExercises = [
  "Incline Machine Press",
  "Seated Cable Row",
  "Lat Pulldown Variation",
  "Machine Lateral Raise",
  "Reverse Pec Deck",
  "Rope Triceps Pressdown",
  "Cable Curl",
];

const removedExercises = [
  "Incline Push-Up",
  "Box Squat to Bench",
  "Step-Up to Low Box",
  "Pallof Press",
  "Dead Bug",
  "Dumbbell Romanian Deadlift",
  "Machine Hip Thrust",
  "Machine Abdominal Crunch",
  "Hack Squat Machine",
  "Hip Adduction Machine",
];

test("canonical workout plan keeps the selected beginner exercise set", () => {
  for (const exercise of requiredExercises) {
    assert.match(planSource, new RegExp(escapeRegExp(exercise)), `${exercise} should stay in the plan`);
  }

  const lunges = workoutPlan.DEFAULT_WORKOUT_PLAN
    .flatMap((day) => day.exercises)
    .find((exercise) => exercise.exerciseName.includes("Lunges / Walking Lunges"));
  assert.equal(lunges.sets, 2);
});

test("canonical workout plan keeps the four-day circuit rhythm", () => {
  assert.deepEqual(
    Array.from(workoutPlan.DEFAULT_WORKOUT_PLAN, (day) => day.dayOfWeek),
    [1, 2, 4, 5]
  );
  assert.deepEqual(Array.from(workoutPlan.DEFAULT_WEEKLY_RHYTHM), [
    "Monday: Upper A - Free-Weight Push/Pull + Low-Stress Shoulder Circuit",
    "Tuesday: Lower A - Machine Lower Body Foundation",
    "Wednesday: Mobility, Flexibility & Balance - 10,000 steps",
    "Thursday: Upper B - Machine Back/Shoulder Emphasis",
    "Friday: Lower B - Machine Posterior Chain + Hip Stability",
    "Saturday: Mobility, Flexibility & Balance",
    "Sunday: Complete rest",
  ]);
  assert.match(planSource, /optional 2-round mode/i);
  assert.match(planSource, /RPE 6-7/);
  assert.match(planSource, /2-4 reps in reserve/);
});

test("primary navigation uses the updated training order and labels", () => {
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
  assert.doesNotMatch(navItemsSource, /label: "Workout"/);
  assert.match(navItemsSource, /label: "Training"/);
  assert.match(navItemsSource, /Flexibility & Balance/);
  assert.doesNotMatch(navItemsSource, /Flexbility/);
  assert.match(navItemsSource, /href: "\/workout"/);
  assert.match(navItemsSource, /href: "\/flexibility-balance"/);
  assert.match(desktopSidebarSource, /NAV_ITEMS\.map/);
  assert.match(mobileNavSource, /NAV_ITEMS\.map/);
  assert.match(mobileHeaderSource, /NAV_ITEMS\.find/);
});

test("nutrition page access is removed from primary and mobile navigation", () => {
  assert.doesNotMatch(navItemsSource, /Nutrition/);
  assert.doesNotMatch(navItemsSource, /\/nutrition/);
  assert.match(navItemsSource, /Mobility/);
  assert.match(navItemsSource, /Steps/);
  assert.match(desktopSidebarSource, /NAV_ITEMS\.map/);
  assert.match(mobileNavSource, /NAV_ITEMS\.map/);
  assert.doesNotMatch(desktopSidebarSource, /\/nutrition|Nutrition/);
  assert.doesNotMatch(mobileNavSource, /\/nutrition|Nutrition/);
});

test("primary app routes stay mounted at the required paths", () => {
  assert.match(dashboardPageSource, /export default async function DashboardPage/);
  assert.match(workoutPageSource, /export default async function WorkoutPage/);
  assert.match(workoutPlanPageSource, /export default async function WorkoutPlanPage/);
  assert.match(mobilityPageRouteSource, /export default async function MobilityPage/);
  assert.match(flexibilityBalanceRouteSource, /export default function FlexibilityBalancePage/);
  assert.match(stepsPageRouteSource, /export default async function StepsPage/);
  assert.match(weightPageRouteSource, /export default async function WeightPage/);
  assert.match(settingsPageRouteSource, /export default async function SettingsPage/);
  assert.match(navItemsSource, /href: "\/workout"/);
  assert.match(navItemsSource, /href: "\/mobility"/);
  assert.match(navItemsSource, /href: "\/flexibility-balance"/);
  assert.match(navItemsSource, /href: "\/steps"/);
  assert.match(navItemsSource, /href: "\/weight"/);
  assert.match(navItemsSource, /href: "\/settings"/);
});

test("nutrition routes redirect without active tracker UI", () => {
  for (const source of nutritionRouteSources) {
    assert.match(source, /redirect\("\/"\)/);
    assert.doesNotMatch(source, /NutritionPageClient|NutritionPlaceholder|prisma\.nutritionDay/);
    assert.doesNotMatch(source, /calorie|macro/i);
  }

  const dashboardCopies = [dashboardSource, dashboardPageSource].join("\n");
  assert.doesNotMatch(dashboardCopies, /href: "\/nutrition"|href="\/nutrition"|nutritionSummary|nutrition ledger|Log the first meal/i);
  assert.match(dashboardSource, /Nutrition is tracked externally in Cronometer/);
});

test("wednesday displays mobility plus a 10000-step day target", () => {
  const wednesday = mobility.getMobilityProgram(3);
  assert.equal(wednesday.trainingRole, "Mobility, Flexibility & Balance");
  assert.equal(wednesday.sessionTitle, "Lower A recovery");
  assert.equal(wednesday.logType, "POST_WORKOUT");
  assert.ok(wednesday.blocks.length >= 3);

  assert.match(planSource, /Wednesday: Mobility, Flexibility & Balance - 10,000 steps/);
  assert.match(workoutPlanPageSource, /title: "Mobility, Flexibility & Balance"/);
  assert.match(dashboardSource, /label: "Mobility, Flexibility & Balance"/);
  assert.match(dashboardSource, /meta: "10,000 steps"/);
  assert.match(trainingPlanSource, /\| Wednesday \| Mobility, Flexibility & Balance \|/);
  assert.match(trainingPlanSource, /Step target: 10,000/);
  assert.match(mobilitySource, /value: "10,000 steps"/);
  assert.equal(
    appSettings.parseAppSettings(JSON.stringify({ stepGoal: 8000 })).stepGoal,
    8000
  );
  assert.equal(appSettings.DEFAULT_APP_SETTINGS.stepGoal, 8000);
});

test("weekly rhythm uses professional protocol labels", () => {
  const dashboardProtocols = Array.from(
    dashboardSource.matchAll(/protocol: "([^"]+)"/g),
    (match) => match[1]
  );
  assert.deepEqual(dashboardProtocols, [
    "Strength Protocol",
    "Strength Protocol",
    "Recovery Protocol",
    "Strength Protocol",
    "Strength Protocol",
    "Recovery Protocol",
    "Full Rest",
  ]);

  assert.match(dashboardSource, /day: "MON"/);
  assert.match(dashboardSource, /day: "TUE"/);
  assert.match(dashboardSource, /day: "WED"[\s\S]*label: "Mobility, Flexibility & Balance"[\s\S]*protocol: "Recovery Protocol"[\s\S]*meta: "10,000 steps"/);
  assert.match(dashboardSource, /day: "SAT"[\s\S]*label: "Mobility, Flexibility & Balance"[\s\S]*protocol: "Recovery Protocol"/);
  assert.match(dashboardSource, /day: "SUN"[\s\S]*label: "Complete rest"[\s\S]*protocol: "Full Rest"/);
  assert.match(workoutPlanPageSource, /protocol: "Strength Protocol"/);
  assert.match(workoutPlanPageSource, /protocol: "Recovery Protocol"/);
  assert.match(workoutPlanPageSource, /protocol: "Full Rest"/);
  assert.doesNotMatch(dashboardSource, /type: "Lift"|type: "Recovery"|type: "Off"/);
  assert.doesNotMatch(workoutPlanPageSource, /role: "Lift"|role: "Recovery"|role: "Off"/);
});

test("training copy stays compact and removes filler explanations", () => {
  const trainingUiCopy = [
    dashboardSource,
    workoutPageClientSource,
    sessionLoggerSource,
    workoutPlanPageSource,
  ].join("\n");

  for (const removedPhrase of [
    "wall of cards",
    "session reads like one continuous ledger",
    "Your session is already live",
    "Your session is live",
    "Log sets as you go. Previous numbers stay nearby",
    "stack of components",
    "grid of competing widgets",
  ]) {
    assert.doesNotMatch(trainingUiCopy, new RegExp(escapeRegExp(removedPhrase), "i"));
  }

  assert.match(workoutPageClientSource, /Session in progress/);
  assert.match(workoutPageClientSource, /Today's protocol/);
  assert.match(workoutPageClientSource, /Log working sets only/);
  assert.match(sessionLoggerSource, /Live session/);
  assert.match(sessionLoggerSource, /Ramp-up sets stay outside the ledger/);
  assert.match(workoutPlanPageSource, /Current phase/);
  assert.match(workoutPlanPageSource, /Required later recovery remains separate/);
});

test("day 1 upper a restores pulldown with a low-stress lateral raise circuit", () => {
  const day1 = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 1);
  assert.ok(day1, "Day 1 should exist");
  assert.match(day1.sessionName, /Free-Weight Push\/Pull \+ Low-Stress Shoulder Circuit/);

  for (const exercise of ["Incline Dumbbell Press", "One-Arm Dumbbell Row"]) {
    const match = day1.exercises.find((item) => item.exerciseName.includes(exercise));
    assert.ok(match, `Day 1 should include ${exercise}`);
    assert.equal(match.targetRPE, "6-7", `${exercise} should use RPE 6-7`);
    assert.equal(match.sets, 3, `${exercise} should keep 3 sets`);
  }

  assert.equal(day1.exercises.find((item) => item.exerciseName.includes("Incline Dumbbell Press")).sets, 3);
  assert.equal(day1.exercises.find((item) => item.exerciseName.includes("One-Arm Dumbbell Row")).reps, "8-12 per side");

  const pulldown = day1.exercises.find((item) =>
    item.exerciseName.includes("Neutral-Grip Lat Pulldown")
  );
  assert.ok(pulldown, "Day 1 should include Neutral-Grip Lat Pulldown");
  assert.equal(pulldown.supersetGroup, "B");
  assert.ok(pulldown.sets >= 2 && pulldown.sets <= 3);
  assert.equal(pulldown.reps, "8-12");
  assert.equal(pulldown.targetRPE, "5-6");
  assert.match(pulldown.cues, /upper chest/);
  assert.match(pulldown.cues, /ribs down/);
  assert.match(pulldown.cues, /shoulder blades rise/);
  assert.match(pulldown.cues, /breathing spikes/);
  assert.match(pulldown.cues, /Progress to RPE 6-7 only when conditioning improves/);

  const lateralRaise = day1.exercises.find((item) =>
    item.exerciseName.includes("Plate Lateral Raise / Dumbbell Lateral Raise")
  );
  assert.ok(lateralRaise, "Day 1 should include Plate Lateral Raise / Dumbbell Lateral Raise");
  assert.equal(lateralRaise.supersetGroup, "B");
  assert.ok(lateralRaise.sets >= 2 && lateralRaise.sets <= 3);
  assert.equal(lateralRaise.reps, "12-20");
  assert.equal(lateralRaise.targetRPE, "5-6");
  assert.equal(lateralRaise.restSeconds, 180);
  assert.match(lateralRaise.cues, /5 lb plates/);
  assert.match(lateralRaise.cues, /2-2\.5 kg per hand/);
  assert.match(lateralRaise.cues, /3-4 reps in reserve/);
  assert.match(lateralRaise.cues, /90-second minimum/);
  assert.match(lateralRaise.cues, /work capacity is currently low/i);

  for (const exercise of temporarilyExcludedPlanExercises) {
    assert.ok(
      !day1.exercises.some((item) => item.exerciseName.includes(exercise)),
      `Day 1 should not currently include ${exercise}`
    );
  }

  for (const url of [
    "https://www.muscleandstrength.com/exercises/incline-dumbbell-bench-press.html",
    "https://www.muscleandstrength.com/exercises/one-arm-dumbbell-row.html",
  ]) {
    assert.match(planSource, new RegExp(escapeRegExp(url)), `${url} should be stored with the plan cues`);
  }
});

test("overhead press variations are excluded now but left for a future progression", () => {
  const exerciseNames = workoutPlan.DEFAULT_WORKOUT_PLAN
    .flatMap((day) => day.exercises)
    .map((exercise) => exercise.exerciseName);

  for (const exercise of temporarilyExcludedPlanExercises) {
    assert.ok(
      !exerciseNames.some((name) => name.includes(exercise)),
      `${exercise} should be absent from the current active plan`
    );
    assert.ok(!removedExercises.includes(exercise), `${exercise} should not be in the removed exercise list`);
  }

  assert.match(planSource, /Overhead pressing can return later as a progression/);
  assert.match(planSource, /breathing, bracing, and shoulder tolerance improve/);
  assert.doesNotMatch(planSource, /permanently/i);
});

test("day 4 upper b remains machine supported", () => {
  const day4 = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 4);
  assert.ok(day4, "Day 4 should exist");
  assert.match(day4.sessionName, /Machine Back\/Shoulder Emphasis/);

  for (const exercise of day4MachineSupportedExercises) {
    assert.ok(
      day4.exercises.some((item) => item.exerciseName.includes(exercise)),
      `Day 4 should keep ${exercise}`
    );
  }

  for (const day1OnlyExercise of [
    "Incline Dumbbell Press",
    "One-Arm Dumbbell Row",
    "Neutral-Grip Lat Pulldown",
    "Plate Lateral Raise / Dumbbell Lateral Raise",
  ]) {
    assert.ok(
      !day4.exercises.some((item) => item.exerciseName.includes(day1OnlyExercise)),
      `Day 4 should not duplicate ${day1OnlyExercise}`
    );
  }
});

test("canonical workout plan does not restore removed or replaced exercises", () => {
  for (const exercise of removedExercises) {
    assert.doesNotMatch(planSource, new RegExp(escapeRegExp(exercise)), `${exercise} should not return`);
  }
});

test("current phase does not expose prohibited strength defaults", () => {
  const activeProgramCopy = [
    planSource,
    exerciseLibrarySource,
    trainingPlanSource,
  ].join("\n");
  const prohibitedStrengthTerms = [
    ["Conventional ", "Deadlift"].join(""),
    ["Back ", "Squat"].join(""),
    ["Barbell ", "Squat"].join(""),
    ["Hack ", "Squat Machine"].join(""),
    ["Barbell ", "Bench Press"].join(""),
    ["Hip ", "Adduction Machine"].join(""),
  ];

  for (const term of prohibitedStrengthTerms) {
    assert.doesNotMatch(activeProgramCopy, new RegExp(escapeRegExp(term), "i"), `${term} should not appear`);
  }

  assert.match(exerciseLibrarySource, /Machine Chest Press/);
  assert.match(exerciseLibrarySource, /Chest-Supported Row/);
  assert.match(exerciseLibrarySource, /Single-Leg Leg Press/);
  assert.match(exerciseLibrarySource, /Back Extension Machine/);
});

test("lower body days preserve the recent lower a and machine-focused lower b structure", () => {
  const day2 = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 2);
  const day5 = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 5);
  assert.ok(day2, "Day 2 should exist");
  assert.ok(day5, "Day 5 should exist");

  for (const expected of [
    "Single-Leg Leg Press",
    "Lunges / Walking Lunges",
    "Leg Extension",
    "Lying Leg Curl",
  ]) {
    assert.ok(day2.exercises.some((item) => item.exerciseName.includes(expected)), `Day 2 should include ${expected}`);
  }

  assert.equal(day2.exercises.find((item) => item.exerciseName.includes("Lunges / Walking Lunges")).sets, 2);
  assert.equal(day2.exercises.find((item) => item.exerciseName.includes("Lunges / Walking Lunges")).reps, "6-10 steps per leg");
  assert.equal(day2.exercises.find((item) => item.exerciseName.includes("Lunges / Walking Lunges")).targetRPE, "5-6");
  assert.equal(day2.exercises.find((item) => item.exerciseName.includes("Lunges / Walking Lunges")).restSeconds, 300);
  assert.match(day2.exercises.find((item) => item.exerciseName.includes("Lunges / Walking Lunges")).cues, /not conditioning/i);

  const day2LegExtension = day2.exercises.find((item) => item.exerciseName === "C1 Leg Extension");
  assert.ok(day2LegExtension, "Tuesday / Lower A should keep its existing Leg Extension");
  assert.equal(day2LegExtension.sets, 2);
  assert.equal(day2LegExtension.reps, "10-15");
  assert.equal(day2LegExtension.targetRPE, "6-7");
  assert.equal(day2LegExtension.restSeconds, 120);
  assert.equal(day2LegExtension.supersetGroup, "C");

  const wallSitOccurrences = workoutPlan.DEFAULT_WORKOUT_PLAN
    .flatMap((day) => day.exercises.map((exercise) => ({ ...exercise, dayOfWeek: day.dayOfWeek })))
    .filter((exercise) => exercise.exerciseName.includes("Wall Sit"));
  assert.equal(wallSitOccurrences.length, 1, "Wall Sit should appear once weekly");
  assert.equal(wallSitOccurrences[0].dayOfWeek, 2, "Wall Sit should be on Day 2 / Lower A");
  assert.equal(wallSitOccurrences[0].exerciseType, "ACCESSORY");
  assert.equal(wallSitOccurrences[0].sets, 1);
  assert.match(wallSitOccurrences[0].reps, /10-30 sec/);
  assert.equal(wallSitOccurrences[0].targetRPE, "4-6");
  assert.equal(wallSitOccurrences[0].restSeconds, 180);
  assert.match(wallSitOccurrences[0].cues, /high wall-sit angle/i);
  assert.match(wallSitOccurrences[0].cues, /pain 0-2\/10 maximum/i);
  assert.match(wallSitOccurrences[0].cues, /not conditioning/i);
  assert.doesNotMatch(wallSitOccurrences[0].cues, /loaded wall sit|max wall sit test|failure hold|HIIT|squat challenge/i);

  assert.equal(
    day5.exercises.find((item) => item.exerciseType === "WORKING")?.exerciseName,
    "A1 Leg Press"
  );
  assert.deepEqual(Array.from(day5.exercises, (item) => item.exerciseName), [
    "A1 Leg Press",
    "B1 Lying Hamstring Curl",
    "B2 Hyperextension / Back Extension Machine",
    "C1 Glute Kickback Machine",
    "C2 Hip Abduction Machine",
    "C3 Leg Extension",
  ]);
  assert.match(day5.exercises.find((item) => item.exerciseName === "A1 Leg Press")?.cues ?? "", /straight sets/i);

  const day5LegExtension = day5.exercises.find((item) => item.exerciseName === "C3 Leg Extension");
  assert.ok(day5LegExtension, "Friday / Day 5 / Lower B should include C3 Leg Extension");
  assert.equal(day5LegExtension.supersetGroup, "C");
  assert.equal(day5LegExtension.sets, 2);
  assert.ok(day5LegExtension.sets >= 1 && day5LegExtension.sets <= 2, "Lower B C3 Leg Extension should stay low-volume");
  assert.equal(day5LegExtension.reps, "10-15");
  assert.equal(day5LegExtension.targetRPE, "5-6");
  assert.equal(day5LegExtension.restSeconds, 120);
  assert.match(day5LegExtension.cues, /Low-dose knee-extension accessory work/i);
  assert.match(day5LegExtension.cues, /without adding direct calf load on the final training day/i);
  assert.match(day5LegExtension.cues, /Standard dose is 1-2 sets of 10-15 reps at RPE 5-6/i);
  assert.match(day5LegExtension.cues, /Low-readiness dose is 1 set of 10-12 reps at RPE 5/i);
  assert.match(day5LegExtension.cues, /skip if knees feel irritated or fatigue is high/i);
  assert.match(day5LegExtension.cues, /walking already provides enough calf loading/i);

  const day5TotalSets = day5.exercises.reduce((sum, item) => sum + item.sets, 0);
  assert.equal(day5TotalSets, 13);
  assert.ok(day5TotalSets >= 10 && day5TotalSets <= 13);
  assert.notEqual(day5TotalSets, 15, "Lower B should not hard-default to 15 sets");
  assert.match(trainingPlanSource, /Standard Lower B: 10-13 working sets/);
  assert.match(trainingPlanSource, /Low-readiness Lower B: 8-10 working sets/);
  assert.match(workoutPlanPageSource, /knee-support accessory work/);
  assert.doesNotMatch(workoutPlanPageSource, /calf work/i);

  const c3LegExtensionDays = Array.from(workoutPlan.DEFAULT_WORKOUT_PLAN)
    .filter((day) => day.exercises.some((item) => item.exerciseName === "C3 Leg Extension"))
    .map((day) => day.dayOfWeek);
  assert.deepEqual(c3LegExtensionDays, [5], "The C3 Leg Extension replacement should apply only to Friday / Day 5");

  const lowerBText = day5.exercises
    .map((item) => `${item.exerciseName} ${item.cues ?? ""}`)
    .join("\n");
  for (const removedFromLowerB of [
    "Leg Press Calf Press",
    "Seated Calf Raise",
    "Standing Calf Raise",
    "Donkey Calf Raise",
    "Hip Adduction Machine",
    "Walking Lunges",
    "Barbell Squat",
    "Hack Squat",
    "Goblet Squat",
    "Conventional Deadlift",
    "Squat Machine",
    "Treadmill",
    "Bike",
    "HIIT",
    "Running",
    "Stairmaster",
    "Finisher Cardio",
    "Failure Training",
    "Max Holds",
  ]) {
    assert.ok(
      !new RegExp(escapeRegExp(removedFromLowerB), "i").test(lowerBText),
      `Day 5 should not include ${removedFromLowerB}`
    );
  }
  assert.doesNotMatch(lowerBText, /calf\s+(?:press|raise)|calf\s+raises/i);
  assert.ok(
    !day5.exercises.some((item) => item.exerciseName.includes("Wall Sit")),
    "Day 5 should not include Wall Sit"
  );
  assert.ok(
    !day5.exercises.some((item) => /squat|squatting/i.test(`${item.exerciseName} ${item.cues}`)),
    "Day 5 should not include squat language"
  );
});

test("canonical workout plan uses non-loggable session prep instead of cardio warm-ups", () => {
  const removedCopy = [
    ["Ramp-Up: ", "Tread", "mill Walk"].join(""),
    ["Ramp-Up: Recumbent ", "Bike"].join(""),
    ["Ramp-Up: Arm ", "Bike"].join(""),
    ["5 min ", "bike"].join(""),
    ["5 min arm ", "bike"].join(""),
    ["Nasal-breathing pace on the ", "treadmill"].join(""),
    ["Warm up with easy ", "cycling"].join(""),
  ];

  for (const oldPhrase of removedCopy) {
    assert.doesNotMatch(planSource, new RegExp(escapeRegExp(oldPhrase), "i"), `${oldPhrase} should not remain`);
  }

  assert.match(planSource, /walking to the gym is the general warm-up/i);
  assert.match(planSource, /Session prep is non-loggable/);
  assert.match(planSource, /1-2 easy ramp-up sets/);
  assert.match(planSource, /Walking to and from the gym is the only planned cardio/);
  assert.match(trainingSessionSource, /SESSION_PREP_ITEMS/);
  assert.match(trainingSessionSource, /Walk to gym/);
  assert.match(trainingSessionSource, /label: "Required later recovery"/);
  assert.match(trainingSessionSource, /detail: "Separate block"/);
  assert.doesNotMatch(planSource, /At home - .*Mobility Primer/);
});

test("program content does not prescribe excluded cardio or conditioning", () => {
  const programCopy = [
    planSource,
    mobilitySource,
    mobilityPageSource,
    workoutDayPreviewSource,
    workoutPlanPageSource,
    dashboardSource,
    trainingPlanSource,
  ].join("\n");
  const excludedCardioTerms = [
    "HI" + "IT",
    ["tread", "mill"].join(""),
    ["bike ", "intervals"].join(""),
    ["stair", "master"].join(""),
    ["run", "ning"].join(""),
    ["finisher ", "cardio"].join(""),
    ["Norwegian ", "4x4"].join(""),
    ["arm ", "bike"].join(""),
  ];

  for (const term of excludedCardioTerms) {
    assert.doesNotMatch(programCopy, new RegExp(escapeRegExp(term), "i"), `${term} should not appear in program content`);
  }
});

test("workout data remains circuit based without loggable primer rows", () => {
  for (const day of workoutPlan.DEFAULT_WORKOUT_PLAN) {
    const primers = day.exercises.filter((exercise) => exercise.exerciseType === "WARMUP");
    assert.equal(primers.length, 0, `${day.sessionName} should not include warmup primer exercises`);
    assert.ok(
      !day.exercises.some((exercise) => /At home|Mobility Primer/i.test(exercise.exerciseName)),
      `${day.sessionName} should not include at-home primer exercise names`
    );

    const workingExercises = day.exercises.filter((exercise) => exercise.exerciseType === "WORKING");
    assert.ok(workingExercises.length >= 4, `${day.sessionName} should keep working sets`);
    assert.deepEqual(
      Array.from(new Set(workingExercises.map((exercise) => exercise.supersetGroup))).sort(),
      ["A", "B", "C"],
      `${day.sessionName} should keep A/B/C circuit blocks`
    );
  }
});

test("training sessions keep session prep non-loggable", () => {
  const activeWorkoutSources = [
    workoutPageSource,
    workoutDayPreviewSource,
    workoutPageClientSource,
    sessionLoggerSource,
    exerciseCardSource,
    workoutActionsSource,
  ].join("\n");

  assert.doesNotMatch(planSource, /At home - .*Mobility Primer/);
  assert.doesNotMatch(workoutDayPreviewSource, /Workout day sequence/);
  assert.doesNotMatch(sessionLoggerSource, /At-home primer/);
  assert.doesNotMatch(exerciseCardSource, /At-home primer/);
  assert.match(activeWorkoutSources, /isLoggableTrainingExercise/);
  assert.match(workoutActionsSource, /isAtHomePrimerExerciseName/);
  assert.match(workoutDayPreviewSource, /SessionPrepStrip/);
  assert.match(sessionLoggerSource, /SessionPrepStrip/);
  assert.match(trainingSessionSource, /SESSION_PREP_ITEMS/);
  assert.match(sessionLoggerSource, /No Weight\/Reps\/RPE rows/);
  assert.match(setInputSource, /placeholder=.*Weight/);
  assert.match(setInputSource, /placeholder="Reps"/);
  assert.match(setInputSource, /placeholder="RPE"/);
});

test("flexibility and balance route surfaces existing mobility content", () => {
  assert.match(navItemsSource, /Flexibility & Balance/);
  assert.match(flexibilityBalancePageSource, /Daily minimum block/);
  assert.match(flexibilityBalancePageSource, /Balance drills/);
  assert.match(flexibilityBalancePageSource, /Recovery-day block/);
  assert.match(flexibilityBalancePageSource, /Foot\/ankle resilience/);
  assert.match(flexibilityBalancePageSource, /getAllMobilityPrograms/);
  assert.match(flexibilityBalancePageSource, /getRecoverySessionBlocks/);
  assert.match(flexibilityBalancePageSource, /getRequiredLaterRecoveryBlocks/);
  assert.doesNotMatch(flexibilityBalancePageSource, /placeholder|Coming soon|TODO/i);
});

test("mobility program has adaptive content for all 7 days", () => {
  const programs = mobility.getAllMobilityPrograms();
  const weekdays = Array.from(programs, (program) => Number(program.dayOfWeek));
  assert.deepEqual(
    weekdays,
    [0, 1, 2, 3, 4, 5, 6]
  );

  for (const program of programs) {
    assert.ok(program.todayPurpose.length > 24, `${program.dayName} should explain today's purpose`);
    assert.ok(program.previousDayReason.length > 24, `${program.dayName} should explain previous-day recovery`);
    assert.ok(program.adaptationNote.length > 24, `${program.dayName} should explain adaptation`);
    assert.ok(program.completionSummary.length > 24, `${program.dayName} should explain completion`);
    assert.ok(program.blocks.length >= 3, `${program.dayName} should include base, main block, and breathing close`);
  }
});

test("every mobility day includes the daily lower-leg base", () => {
  for (const program of mobility.getAllMobilityPrograms()) {
    const base = program.blocks.find((block) => block.id === "daily-lower-leg-base");
    assert.ok(base, `${program.dayName} should include Daily lower-leg base`);
    assert.equal(base.title, "Daily lower-leg base");
    assert.match(base.purpose, /foot and ankle control/i);
    assert.match(base.purpose, /ankle dorsiflexion/i);
    assert.match(base.purpose, /soleus/i);
    assert.match(base.purpose, /supported balance/i);

    const baseNames = Array.from(base.exercises, (exercise) => exercise.name);
    assert.deepEqual(baseNames, [
      "Seated Ankle Pumps",
      "Ankle Circles",
      "Wall Ankle Rocks",
      "Wall Calf Stretch - Knee Straight",
      "Wall Calf Stretch - Knee Bent",
      "Supported Tandem Balance Hold",
      "Supported Single-Leg Balance with Toe-Touch Kickstand",
    ]);
  }
});

test("removed lower-leg drills are replaced by supported balance drills", () => {
  const runtimeCopy = [
    planSource,
    mobilitySource,
    mobilityPageSource,
    workoutPlanPageSource,
    trainingPlanSource,
  ].join("\n");
  const removedMobilityNames = [
    ["Plantar", "flexion Stretch"].join(""),
    ["Big-toe lift", " / little-toe lift"].join(""),
  ];
  const addedBalanceNames = [
    "Supported Tandem Balance Hold",
    "Supported Single-Leg Balance with Toe-Touch Kickstand",
  ];
  const generatedNames = mobility
    .getAllMobilityPrograms()
    .flatMap((program) => program.blocks)
    .flatMap((block) => block.exercises)
    .map((exercise) => exercise.name);

  for (const removedName of removedMobilityNames) {
    assert.doesNotMatch(runtimeCopy, new RegExp(escapeRegExp(removedName), "i"));
    assert.ok(!generatedNames.includes(removedName), `${removedName} should not be generated`);
  }

  for (const addedName of addedBalanceNames) {
    assert.match(runtimeCopy, new RegExp(escapeRegExp(addedName)));
    assert.ok(generatedNames.includes(addedName), `${addedName} should be generated`);
  }
});

test("training-day mobility primers use the requested at-home sequences", () => {
  const expectedByDay = new Map([
    [1, [
      "Seated Ankle Pumps",
      "Ankle Circles",
      "Wall Ankle Rocks",
      "Wall Calf Stretch - Knee Straight",
      "Wall Calf Stretch - Knee Bent",
      "Supported Tandem Balance Hold",
      "Supported Single-Leg Balance with Toe-Touch Kickstand",
      "Wall thoracic rotations",
      "Wall slides",
      "Doorway pec stretch",
      "Wall lat stretch",
      "Seated bracing breaths",
    ]],
    [2, [
      "Seated Ankle Pumps",
      "Ankle Circles",
      "Wall Ankle Rocks",
      "Wall Calf Stretch - Knee Straight",
      "Wall Calf Stretch - Knee Bent",
      "Supported Tandem Balance Hold",
      "Supported Single-Leg Balance with Toe-Touch Kickstand",
      "90/90 hip switches",
      "Half-kneeling or standing hip flexor stretch",
      "Adductor rock-backs",
      "Bodyweight glute bridge",
      "Seated bracing breaths",
    ]],
    [4, [
      "Seated Ankle Pumps",
      "Ankle Circles",
      "Wall Ankle Rocks",
      "Wall Calf Stretch - Knee Straight",
      "Wall Calf Stretch - Knee Bent",
      "Supported Tandem Balance Hold",
      "Supported Single-Leg Balance with Toe-Touch Kickstand",
      "Wall thoracic rotations",
      "Wall angels or wall slides",
      "Scapular circles",
      "Doorway pec stretch",
      "Wall lat stretch",
      "Seated bracing breaths",
    ]],
    [5, [
      "Seated Ankle Pumps",
      "Ankle Circles",
      "Wall Ankle Rocks",
      "Wall Calf Stretch - Knee Straight",
      "Wall Calf Stretch - Knee Bent",
      "Supported Tandem Balance Hold",
      "Supported Single-Leg Balance with Toe-Touch Kickstand",
      "Hip hinge patterning against wall",
      "Hamstring floss, seated or standing",
      "90/90 hip switches",
      "Half-kneeling or standing hip flexor stretch",
      "Bodyweight glute bridge",
      "Seated bracing breaths",
    ]],
  ]);

  for (const [dayOfWeek, expectedNames] of expectedByDay) {
    const program = mobility.getMobilityProgram(dayOfWeek);
    assert.equal(program.logType, "PRE_WORKOUT");
    assert.equal(program.totalDuration, "6-10 min");

    const actualNames = Array.from(program.blocks.flatMap((block) => block.exercises.map((exercise) => exercise.name)));
    assert.deepEqual(actualNames, expectedNames, `${program.dayName} should match the set primer sequence`);
  }
});

test("each mobility movement includes beginner coaching details", () => {
  const dayExercises = mobility
    .getAllMobilityPrograms()
    .flatMap((program) => program.blocks)
    .flatMap((block) => block.exercises);
  const deskResetExercises = mobility.UNDO_SITTING.exercises;

  for (const exercise of [...dayExercises, ...deskResetExercises]) {
    assert.ok(exercise.goal.length > 12, `${exercise.name} needs a goal`);
    assert.ok(exercise.howTo.length >= 3, `${exercise.name} needs step-by-step instructions`);
    assert.ok(exercise.beginnerPointers.length >= 2, `${exercise.name} needs beginner pointers`);
    assert.ok(exercise.commonMistakes.length >= 2, `${exercise.name} needs common mistakes`);
    assert.ok(exercise.scaleDown.length >= 2, `${exercise.name} needs scale-down options`);
    assert.ok(exercise.completionTarget.length > 12, `${exercise.name} needs a completion target`);
    assert.match(exercise.intensity.effort, /Effort: /, `${exercise.name} needs effort guidance`);
    assert.match(exercise.intensity.pain, /Pain: 0-2\/10 maximum/, `${exercise.name} needs pain guidance`);
    assert.match(exercise.intensity.breathing, /Breathing: /, `${exercise.name} needs breathing guidance`);
    assert.match(exercise.intensity.goal, /Goal: /, `${exercise.name} needs intensity goal guidance`);
  }
});

test("settings do not expose dark or system theme controls", () => {
  assert.doesNotMatch(settingsSource, /<SelectItem[^>]+value=["']dark["']/);
  assert.doesNotMatch(settingsSource, /<SelectItem[^>]+value=["']system["']/);
  assert.doesNotMatch(settingsSource, />\s*Dark\s*</);
  assert.doesNotMatch(settingsSource, />\s*System\s*</);
});

test("visual system uses cool paper inputs and reduced-motion-safe motion", () => {
  assert.match(designTokensSource, /--input-fill: #ffffff/);
  assert.match(designTokensSource, /--electric-blue:/);
  assert.match(designTokensSource, /--glacier:/);
  assert.match(designTokensSource, /--atmosphere-background:/);
  assert.doesNotMatch(designTokensSource, /#eadbc8|#efe4d4|#f3eadc/i);
  assert.match(inputSource, /bg-input/);
  assert.doesNotMatch(inputSource, /var\(--cream-paper\)_16/);
  assert.match(globalsSource, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(globalsSource, /@media \(prefers-reduced-motion: no-preference\)/);
  assert.match(globalsSource, /ledger-enter/);
  assert.match(globalsSource, /command-deck/);
  assert.match(globalsSource, /session-prep-strip/);
  assert.match(settingsSource, /Obsidian command navigation/);
  assert.doesNotMatch(settingsSource, /Warm cream canvas/);
});

test("bodyweight conversion helpers convert pounds to kilograms", () => {
  assert.equal(Number(units.poundsToKg(310.3).toFixed(2)), 140.75);
});

test("workout load helpers keep kilograms as the canonical workout unit", () => {
  assert.equal(units.WORKOUT_LOAD_UNIT, "kg");
  assert.equal(units.formatWorkoutLoad(42.5), "42.5 kg");
  assert.equal(units.formatWorkoutVolume(1234.4), "1,234 kg");
});

test("bodyweight conversion helpers split pounds into stone and remaining pounds", () => {
  const parts = units.poundsToStoneParts(310.3);
  assert.equal(parts.stone, 22);
  assert.equal(parts.pounds.toFixed(1), "2.3");
});

test("bodyweight conversion formatting includes lb, kg, and stone", () => {
  assert.equal(
    units.formatBodyweightConversion(310.3),
    "310.3 lb = 140.75 kg = 22 st 2.3 lb"
  );
  assert.equal(units.formatBodyweightConversion(""), "");
  assert.equal(units.formatBodyweightConversion(Number.NaN), "");
});

test("daily step goal settings accept 8000 and reject unsafe values", () => {
  assert.equal(appSettings.DEFAULT_APP_SETTINGS.stepGoal, 8000);
  assert.equal(
    appSettings.parseAppSettings(JSON.stringify({ stepGoal: 8000 })).stepGoal,
    8000
  );
  assert.equal(
    appSettings.parseAppSettings(JSON.stringify({ stepGoal: 999 })).stepGoal,
    appSettings.DEFAULT_APP_SETTINGS.stepGoal
  );
  assert.equal(
    appSettings.parseAppSettings(JSON.stringify({ stepGoal: 50001 })).stepGoal,
    appSettings.DEFAULT_APP_SETTINGS.stepGoal
  );
});

test("step streak ignores an incomplete today and counts consecutive completed goal days", () => {
  const stats = steps.calculateStepStats([
    stepEntry("2026-06-21", 10691),
    stepEntry("2026-06-22", 10611),
    stepEntry("2026-06-23", 11171),
    stepEntry("2026-06-24", 9751),
  ], 8000, "2026-06-25");

  assert.equal(stats.currentStreak, 4);
  assert.equal(stats.goalDaysTotal, 4);
  assert.equal(stats.todaySteps, 0);
  assert.equal(stats.goalReachedToday, false);
});

test("step streak includes today when today reaches the step goal", () => {
  const stats = steps.calculateStepStats([
    stepEntry("2026-06-21", 10691),
    stepEntry("2026-06-22", 10611),
    stepEntry("2026-06-23", 11171),
    stepEntry("2026-06-24", 9751),
    stepEntry("2026-06-25", 8500),
  ], 8000, "2026-06-25");

  assert.equal(stats.currentStreak, 5);
  assert.equal(stats.goalDaysTotal, 5);
  assert.equal(stats.todaySteps, 8500);
  assert.equal(stats.goalReachedToday, true);
});

test("missing step days break the current streak", () => {
  const stats = steps.calculateStepStats([
    stepEntry("2026-06-21", 10000),
    stepEntry("2026-06-22", 10000),
    stepEntry("2026-06-24", 10000),
  ], 8000, "2026-06-25");

  assert.equal(stats.currentStreak, 1);
  assert.equal(stats.goalDaysTotal, 3);
});

test("below-goal step days break the current streak", () => {
  const stats = steps.calculateStepStats([
    stepEntry("2026-06-22", 10000),
    stepEntry("2026-06-23", 7500),
    stepEntry("2026-06-24", 10000),
  ], 8000, "2026-06-25");

  assert.equal(stats.currentStreak, 1);
  assert.equal(stats.goalDaysTotal, 2);
});

test("dashboard and steps page use the same step stats model", () => {
  const entries = [
    stepEntry("2026-06-21", 10691),
    stepEntry("2026-06-22", 10611),
    stepEntry("2026-06-23", 11171),
    stepEntry("2026-06-24", 9751),
  ];
  const stepsPageStats = steps.calculateStepStats(entries, 8000, "2026-06-25");
  const dashboardStats = steps.calculateStepStats(entries, 8000, "2026-06-25");

  assert.equal(stepsPageStats.currentStreak, dashboardStats.currentStreak);
  assert.equal(stepsPageStats.goalDaysTotal, dashboardStats.goalDaysTotal);
  assert.match(stepsPageClientSource, /calculateStepStats\(entries, settings\.stepGoal/);
  assert.match(dashboardSource, /calculateStepStats\(stepsEntries, settings\.stepGoal/);
  assert.match(stepsPageClientSource, /stats\.currentStreak/);
  assert.match(dashboardSource, /stepStats\.currentStreak/);
});

test("duplicate same-day step entries are summed before streak and goal-day calculations", () => {
  const stats = steps.calculateStepStats([
    stepEntry("2026-06-22", 10000),
    stepEntry("2026-06-23", 4000),
    stepEntry("2026-06-23", 4500),
    stepEntry("2026-06-24", 9000),
  ], 8000, "2026-06-25");

  assert.equal(stats.currentStreak, 3);
  assert.equal(stats.goalDaysTotal, 3);
  assert.equal(stats.recentEntries.find((entry) => entry.date === "2026-06-23")?.steps, 8500);
});

test("step mutations revalidate dashboard and steps routes", () => {
  assert.match(stepsActionsSource, /revalidatePath\("\/steps"\)/);
  assert.match(stepsActionsSource, /revalidatePath\("\/"\)/);

  for (const actionName of ["logSteps", "updateStepsEntry", "deleteStepsEntry"]) {
    const actionStart = stepsActionsSource.indexOf(`export async function ${actionName}`);
    assert.ok(actionStart >= 0, `${actionName} should exist`);
    const nextActionStart = stepsActionsSource.indexOf("export async function", actionStart + 1);
    const actionSource = stepsActionsSource.slice(
      actionStart,
      nextActionStart === -1 ? stepsActionsSource.length : nextActionStart
    );
    assert.match(actionSource, /revalidatePath\("\/steps"\)/, `${actionName} should revalidate /steps`);
    assert.match(actionSource, /revalidatePath\("\/"\)/, `${actionName} should revalidate /`);
  }
});

test("goal target date settings persist stable ISO dates and reject ambiguous dates", () => {
  const parsed = appSettings.parseAppSettings(JSON.stringify({
    weightGoalTargetDate: "2027-10-22",
  }));
  assert.equal(parsed.weightGoalTargetDate, "2027-10-22");
  assert.equal(appSettings.normalizeGoalTargetDate(" 2027-10-22 "), "2027-10-22");
  assert.equal(appSettings.parseAppSettings(JSON.stringify({ weightGoalTargetDate: "10/22/2027" })).weightGoalTargetDate, null);
  assert.equal(appSettings.parseAppSettings(JSON.stringify({ weightGoalTargetDate: "2027-02-29" })).weightGoalTargetDate, null);
  assert.equal(appSettings.parseAppSettings(JSON.stringify({ weightGoalTargetDate: "" })).weightGoalTargetDate, null);
  assert.match(
    appSettings.serializeAppSettings({
      ...appSettings.DEFAULT_APP_SETTINGS,
      weightGoalTargetDate: "10/22/2027",
    }),
    /"weightGoalTargetDate":null/
  );
});

test("weight goal target date supports a 154 lb goal and 16-month pace readout", () => {
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
  assert.equal(units.BODYWEIGHT_UNIT, "lb");
  assert.equal(weight.computeRequiredWeeklyLossPace(315, 154, "2026-06-22", "2027-10-22"), 2.3);
  assert.match(weightChartSource, /Required pace: about/);
  assert.match(weightChartSource, /This is an aggressive target; use the trend as guidance, not medical advice\./);
});

test("nutrition totals calculate daily calories and macros", () => {
  const totals = nutrition.calculateNutritionTotals([
    { calories: 450, protein: 52.5, carbs: 40, fat: 8 },
    { calories: 180, protein: 22, carbs: 12.5, fat: 4.5 },
  ]);

  assert.equal(totals.calories, 630);
  assert.equal(totals.protein, 74.5);
  assert.equal(totals.carbs, 52.5);
  assert.equal(totals.fat, 12.5);
});

test("backup validation rejects invalid shapes and previews nutrition counts", () => {
  const invalid = backup.analyzeBackupPayload({
    version: 1,
    nutritionDays: [
      {
        date: "2026-02-31",
        entries: [{ mealLabel: "Meal 1", foodName: "", calories: -1 }],
      },
    ],
  });

  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((error) => error.includes("nutritionDays[0].date")));
  assert.ok(invalid.errors.some((error) => error.includes("foodName")));

  const valid = backup.analyzeBackupPayload({
    version: 1,
    exportedAt: "2026-06-21T12:00:00.000Z",
    nutritionDays: [
      {
        date: "2026-06-21",
        entries: [{ mealLabel: "Meal 1", foodName: "Greek yogurt", calories: 180, protein: 22, carbs: 12, fat: 4 }],
      },
    ],
  });

  assert.equal(valid.valid, true);
  assert.equal(valid.preview.counts.nutritionDays, 1);
  assert.equal(valid.preview.dateRange.start, "2026-06-21");
  assert.equal(valid.preview.dateRange.end, "2026-06-21");
});

test("training-day mobility requires later recovery", () => {
  assert.equal(mobility.REQUIRED_LATER_RECOVERY.title, "Required later recovery");
  assert.equal(mobility.REQUIRED_LATER_RECOVERY.recoveryIntro, true);
  assert.match(mobility.REQUIRED_LATER_RECOVERY.purpose, /Complete later the same day/);
  assert.match(mobility.REQUIRED_LATER_RECOVERY.adaptationNote, /part of the training system, not extra work/);
  assert.ok(mobility.REQUIRED_LATER_RECOVERY.exercises.length >= 4);

  for (const exercise of mobility.REQUIRED_LATER_RECOVERY.exercises) {
    assert.match(exercise.intensity.effort, /Effort: 1-3\/10/);
    assert.match(exercise.intensity.pain, /Pain: 0-2\/10 maximum/);
    assert.match(exercise.intensity.goal, /no fatigue/);
  }
});

test("supported balance drills include setup, coaching, regressions, progressions, and pain rules", () => {
  const exercises = mobility
    .getAllMobilityPrograms()
    .flatMap((program) => program.blocks)
    .flatMap((block) => block.exercises);
  const byName = new Map(exercises.map((exercise) => [exercise.name, exercise]));

  for (const expected of [
    "Ankle Circles",
    "Supported Tandem Balance Hold",
    "Supported Single-Leg Balance with Toe-Touch Kickstand",
  ]) {
    const exercise = byName.get(expected);
    assert.ok(exercise, `${expected} should be in daily mobility`);
    if (expected !== "Ankle Circles") {
      assert.match(exercise.category, /Balance/);
      assert.ok(exercise.progression.length >= 3, `${expected} should include progression options`);
      assert.match(exercise.cues, /support|tripod|Quiet feet|Do not chase instability/i);
    }
    assert.ok(exercise.setup.length > 20, `${expected} should include setup`);
    assert.ok(exercise.breathingCue.length > 20, `${expected} should include a breathing cue`);
    assert.ok(exercise.painRule.length > 8, `${expected} should include a pain rule`);
    assert.match(exercise.painRule, /0-2\/10/);
  }
});

test("mobility required later recovery supports standard and foot flare modes", () => {
  const standardBlocks = mobility.getRequiredLaterRecoveryBlocks("standard", 1);
  const footFlareBlocks = mobility.getRequiredLaterRecoveryBlocks("footFlare", 1);

  assert.equal(standardBlocks.length, 1);
  assert.equal(standardBlocks[0].title, "Required later recovery");
  assert.equal(mobility.REQUIRED_LATER_RECOVERY_FOOT_FLARE_TITLE, "Required foot-flare recovery");
  assert.ok(footFlareBlocks.length >= 3);
  assert.equal(footFlareBlocks[0].title, "Required foot-flare recovery");
  assert.match(footFlareBlocks[0].purpose, /required when your soles are irritated or recent step load is high/i);
  assert.equal(footFlareBlocks[0].recoveryIntroVariant, "footFlare");
});

test("foot flare recovery includes the supported foot, calf, ankle, and balance base", () => {
  const exerciseNames = Array.from(
    mobility
      .getRequiredLaterRecoveryBlocks("footFlare", 2)
      .flatMap((block) => block.exercises),
    (exercise) => exercise.name
  );
  const mobilityRecoveryCopy = [
    planSource,
    mobilitySource,
    mobilityPageSource,
    trainingPlanSource,
  ].join("\n");

  assert.deepEqual(Array.from(exerciseNames.slice(0, 7)), [
    "Seated Ankle Pumps",
    "Ankle Circles",
    "Wall Ankle Rocks",
    "Wall Calf Stretch - Knee Straight",
    "Wall Calf Stretch - Knee Bent",
    "Supported Tandem Balance Hold",
    "Supported Single-Leg Balance with Toe-Touch Kickstand",
  ]);

  for (const expected of [
    "Supported breathing reset",
  ]) {
    assert.ok(exerciseNames.includes(expected), `${expected} should be in foot flare recovery`);
  }

  for (const removed of [
    ["Foot ", "check-in"].join(""),
    ["Gentle plantar ", "fascia / ", "sole ", "stretch"].join(""),
    ["Soft foot ", "roll"].join(""),
    ["gentle ", "sole ", "stretch"].join(""),
    ["plantar ", "fascia ", "stretch"].join(""),
    ["sole recovery ", "stretch"].join(""),
  ]) {
    assert.ok(!exerciseNames.includes(removed), `${removed} should not be in foot flare recovery`);
    assert.doesNotMatch(mobilityRecoveryCopy, new RegExp(escapeRegExp(removed), "i"));
  }
});

test("rest-day foot flare recovery puts foot and lower-leg work first", () => {
  const wednesdayBlocks = mobility.getRecoverySessionBlocks(3, "footFlare");
  const sundayBlocks = mobility.getRecoverySessionBlocks(0, "footFlare");

  assert.equal(wednesdayBlocks[0].title, "Required foot-flare recovery");
  assert.equal(wednesdayBlocks[1].title, "Lower A recovery block");
  assert.equal(sundayBlocks[0].title, "Required foot-flare recovery");
  assert.equal(sundayBlocks[1].title, "Supported full-body downshift");
});

test("recovery copy no longer frames later recovery as optional", () => {
  const recoveryCopySource = [
    planSource,
    mobilitySource,
    mobilityPageSource,
    workoutDayPreviewSource,
    workoutPlanPageSource,
    trainingPlanSource,
  ].join("\n");

  const oldLaterRecoveryTitle = ["Optional later", " recovery"].join("");
  const oldPostWorkoutPhrase = ["optional post", "-workout"].join("");
  assert.doesNotMatch(recoveryCopySource, new RegExp(escapeRegExp(oldLaterRecoveryTitle), "i"));
  assert.doesNotMatch(recoveryCopySource, new RegExp(escapeRegExp(oldPostWorkoutPhrase), "i"));
  assert.match(recoveryCopySource, /Required later recovery/);
  assert.match(recoveryCopySource, /later the same day/);
  assert.match(recoveryCopySource, /part of the training system, not extra work/);
  assert.match(recoveryCopySource, /Required does not mean push through pain/);
  assert.match(recoveryCopySource, /Required foot-flare recovery/);
  assert.match(recoveryCopySource, /Effort 1-3\/10/);
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
