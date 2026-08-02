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
const mobilitySource = readFileSync("src/lib/mobility.ts", "utf8");
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

test("canonical workout plan is the next-week progressive overload block", () => {
  assert.equal(workoutPlan.NEXT_WEEK_TAPER_TITLE, "Next Week Progressive Overload Block");
  assert.equal(workoutPlan.DEFAULT_WORKOUT_PLAN_VERSION, "five-day-mon-fri-v3");
  assert.deepEqual(Array.from(workoutPlan.DEFAULT_WORKOUT_PLAN, (day) => day.dayOfWeek), [1, 2, 3, 4, 5]);
  assert.deepEqual(Array.from(workoutPlan.DEFAULT_WEEKLY_RHYTHM), [
    "Monday: Lower A — Leg Press + Quad/Hamstring Strength",
    "Tuesday: Upper A — Incline Push / Row / Trunk Stability",
    "Wednesday: Lower B — Accessory Legs + Hip Stability",
    "Thursday: Upper B — Chest Machine Press / Pull + Shoulders and Arms",
    "Friday: Upper Accessory + Arms + Core",
    "Saturday: Complete Rest",
    "Sunday: Complete Rest",
  ]);
  assert.match(workoutPlanPageSource, /5 \/ 0 \/ 2/);
  assert.match(workoutPlanPageSource, /5 Strength/);
  assert.match(workoutPlanPageSource, /0 Recovery/);
  assert.match(workoutPlanPageSource, /2 Full Rest/);
  assert.match(workoutPlanPageSource, /Monday total working sets: 19/);
  assert.match(workoutPlanPageSource, /Tuesday total working sets: 24/);
  assert.match(workoutPlanPageSource, /Wednesday total working sets: 20/);
  assert.match(workoutPlanPageSource, /Thursday total working sets: 21/);
  assert.match(workoutPlanPageSource, /Friday total working sets: 16/);
  assert.match(trainingPlanSource, /Weekly total: 100 sets/);
  assert.doesNotMatch(workoutPlanPageSource, /Completed \/ View Session|Completed Monday session/i);
  assert.match(planSource, /Five training days with balanced chest, back, legs, hips, arms, and trunk stability/);
});

test("strength days use the requested exercise selection and set balance", () => {
  const byDay = new Map(workoutPlan.DEFAULT_WORKOUT_PLAN.map((day) => [day.dayOfWeek, day]));

  // Lying Leg Curl now opens the session (warms knees/hamstrings without axial
  // loading); Leg Press carries the pendulum-squat alternate. Volume unchanged.
  assertDay(byDay.get(1), "Lower A", 19, [
    ["A1 Lying Leg Curl", 3, "10-12", "6-7"],
    ["B1 Leg Press or Pendulum Squat (if available)", 3, "8-12 leg press / 6-8 pendulum squat", "5-7"],
    ["B2 Walking Lunges", 4, "12-20 steps total (6-10 per leg)", "5-6"],
    ["C1 Seated Leg Extension", 3, "10-15", "6-7"],
    ["D1 Hip Abduction Machine", 3, "12-20", "6"],
    ["D2 Hip Adduction Machine", 3, "12-20", "5-6"],
  ]);
  // Order matters: the hamstring opener must come before the squat/press slot.
  assert.equal(byDay.get(1).exercises[0].exerciseName, "A1 Lying Leg Curl");
  assert.ok(/first set is deliberately easy/i.test(byDay.get(1).exercises[0].cues));
  assert.ok(/without axial loading/i.test(byDay.get(1).exercises[0].cues));
  assertDay(byDay.get(2), "Upper A", 24, [
    ["A1 Dumbbell Incline Press or Machine Incline Press", 3, "8-12", "6-7"],
    ["A2 Chest-Supported Row or Seated Cable Row", 3, "8-12", "6-7"],
    ["B1 Neutral-Grip Lat Pulldown", 3, "8-12", "6-7"],
    ["B2 Dumbbell / Plate Lateral Raise", 3, "12-20", "6"],
    ["B3 Machine Shoulder Press", 3, "8-12", "5-6"],
    ["C1 Triceps Extension Machine or Triceps Pushdown, bar", 3, "10-15", "6-7"],
    ["C2 Machine Preacher Curl or Cable Lateral Raise", 3, "10-15 curl / 12-20 lateral raise", "6-7"],
    ["C3 Reverse Pec Deck or Dead Hang", 3, "12-15 reps pec deck / 20-40 seconds hold dead hang", "5-6"],
  ]);
  // Wednesday returns to legs and hips only; the arm superset and the triceps
  // drop set moved off this day.
  assertDay(byDay.get(3), "Lower B", 20, [
    ["A1 Lying Leg Curl (warm-up)", 2, "12-15", "4-5"],
    ["B1 Supported Stationary Bulgarian Split Squat", 3, "8-10 per leg", "5-6"],
    ["C1 Seated Leg Extension", 3, "10-15", "6"],
    ["C2 Seated Leg Curl", 4, "10-12", "6"],
    ["D1 Hip Adduction Machine", 4, "12-20", "5-6"],
    ["D2 Hip Abduction Machine", 4, "12-20", "5-6"],
  ]);
  assert.equal(byDay.get(3).exercises.length, 6);
  // The warm-up opens the day and does not replace the working hamstring slot.
  assert.equal(byDay.get(3).exercises[0].exerciseName, "A1 Lying Leg Curl (warm-up)");
  assert.equal(byDay.get(3).exercises[0].exerciseType, "WORKING");
  assert.equal(countMovement(byDay.get(3), /C2 Seated Leg Curl/), 1);
  assert.equal(byDay.get(3).exercises.find((e) => /C2 Seated Leg Curl/.test(e.exerciseName)).sets, 4);
  for (const gone of [
    /Single-Arm Seated Dumbbell Preacher Curl/,
    /Standing Dumbbell Reverse Curl/,
    /Triceps Pushdown, bar (drop set)/,
  ]) {
    assert.equal(countMovement(byDay.get(3), gone), 0);
  }
  assertDay(byDay.get(4), "Upper B", 21, [
    ["A1 Chest Machine Press", 3, "8-12", "6-7"],
    ["A2 Chest-Supported Row or Seated Cable Row", 3, "8-12", "6-7"],
    ["B1 Neutral-Grip Lat Pulldown", 3, "8-12", "6-7"],
    ["B2 Dumbbell / Plate Lateral Raise", 3, "12-20", "6"],
    ["C1 Triceps Pressdown, bar", 3, "15-20", "6-7"],
    ["C2 Reverse Cable Crossover", 3, "15-20", "5-6"],
    ["C3 Face-Away Bayesian Cable Curl", 3, "10-15", "6-7"],
  ]);
  assert.equal(countMovement(byDay.get(1), /Hip Abduction Machine/), 1);
  assert.equal(countMovement(byDay.get(1), /Hip Adduction Machine/), 1);
  assert.equal(countMovement(byDay.get(3), /Hip Abduction Machine/), 1);
  assert.equal(countMovement(byDay.get(3), /Hip Adduction Machine/), 1);

  assertDay(byDay.get(5), "Upper Accessory", 16, [
    ["A1 Pec Deck or High-to-Low Cable Fly", 2, "12-15", "5-6"],
    ["A2 Chest-Supported Row or Seated Cable Row", 3, "10-12", "5-6"],
    ["B1 Cable Curl", 3, "10-15", "6-7"],
    ["B2 Rope Triceps Pressdown", 3, "10-15", "6-7"],
    ["C1 Face Pull", 3, "12-15", "5-6"],
    ["D1 Supported Cable Anti-Rotation Hold", 2, "10-20 seconds per side", "4-5"],
  ]);
  assert.equal(countMovement(byDay.get(5), /Incline Bench Plank/), 0);
  assert.equal(countMovement(byDay.get(5), /Supported Cable Anti-Rotation Hold/), 1);
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
    "Incline Bench Plank",
    "Calf Raise",
    "Calf Raises",
    "Back Hyperextension",
    "Back Extension Machine",
  ]) {
    assert.doesNotMatch(activePlanText, new RegExp(escapeRegExp(prohibited), "i"));
  }

  const monday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 1);
  assert.ok(monday.exercises.some((exercise) => exercise.exerciseName === "B1 Leg Press or Pendulum Squat (if available)"));
  assert.ok(monday.exercises.some((exercise) => exercise.exerciseName === "B2 Walking Lunges"));
  assert.ok(monday.exercises.some((exercise) => exercise.exerciseName === "D1 Hip Abduction Machine"));
  assert.ok(monday.exercises.some((exercise) => exercise.exerciseName === "D2 Hip Adduction Machine"));
  assert.equal(countMovement(monday, /Hip Abduction Machine/), 1);
  assert.equal(countMovement(monday, /Hip Adduction Machine/), 1);

  const tuesday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 2);
  assert.ok(tuesday.exercises.some((exercise) => exercise.exerciseName === "A1 Dumbbell Incline Press or Machine Incline Press"));
  assert.ok(tuesday.exercises.some((exercise) => exercise.exerciseName === "A2 Chest-Supported Row or Seated Cable Row"));
  assert.ok(tuesday.exercises.some((exercise) => exercise.exerciseName === "C2 Machine Preacher Curl or Cable Lateral Raise"));

  const wednesday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 3);
  assert.ok(!wednesday.exercises.some((exercise) => /Leg Press/i.test(exercise.exerciseName)));
  assert.ok(wednesday.exercises.some((exercise) => exercise.exerciseName === "B1 Supported Stationary Bulgarian Split Squat"));
  assert.ok(!wednesday.exercises.some((exercise) => /Back Hyperextension|Back Extension/i.test(exercise.exerciseName)));
  assert.ok(wednesday.exercises.some((exercise) => exercise.exerciseName === "C1 Seated Leg Extension"));
  assert.ok(wednesday.exercises.some((exercise) => exercise.exerciseName === "C2 Seated Leg Curl"));
  assert.equal(countMovement(wednesday, /Hip Abduction Machine/), 1);
  assert.equal(countMovement(wednesday, /Hip Adduction Machine/), 1);
  // Wednesday is legs and hips only — the arm superset and triceps drop set
  // moved off this day; Tuesday, Thursday and Friday carry the arm volume.
  assert.ok(!wednesday.exercises.some((exercise) => /Preacher Curl|Reverse Curl|drop set/i.test(exercise.exerciseName)));

  const thursday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 4);
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "A1 Chest Machine Press"));
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "A2 Chest-Supported Row or Seated Cable Row"));
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "C3 Face-Away Bayesian Cable Curl"));
  // Overhead press is removed from the template under the lower-back rule.
  assert.ok(!thursday.exercises.some((exercise) => /Overhead Press/i.test(exercise.exerciseName)));
  assert.doesNotMatch(workoutPlanPageSource, /Dumbbell Overhead Press/);

  const friday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 5);
  assert.match(friday.sessionName, /Upper Accessory \+ Arms \+ Core/);
  assert.ok(!friday.exercises.some((exercise) => /Incline Machine Press|Leg Extension|Single-Leg Lying Curl|Back Hyperextension|Back Extension Machine/i.test(exercise.exerciseName)));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "A1 Pec Deck or High-to-Low Cable Fly"));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "A2 Chest-Supported Row or Seated Cable Row"));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "B1 Cable Curl"));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "B2 Rope Triceps Pressdown"));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "C1 Face Pull"));
  assert.ok(!friday.exercises.some((exercise) => /Incline Bench Plank/i.test(exercise.exerciseName)));
  assert.ok(friday.exercises.some((exercise) => exercise.exerciseName === "D1 Supported Cable Anti-Rotation Hold"));
  assert.equal(countMovement(friday, /Supported Cable Anti-Rotation Hold/), 1);

  assert.doesNotMatch(
    [planSource, workoutPlanPageSource, trainingPlanSource, mobilitySource].join("\n"),
    /Incline Bench Plank/i
  );

  const inclinePresses = workoutPlan.DEFAULT_WORKOUT_PLAN
    .flatMap((day) => day.exercises)
    .filter((exercise) => /Incline/i.test(exercise.exerciseName) && /Press/i.test(exercise.exerciseName));
  // Still exactly one incline pressing slot — now with an equipment alternate.
  assert.deepEqual(Array.from(inclinePresses, (exercise) => exercise.exerciseName), ["A1 Dumbbell Incline Press or Machine Incline Press"]);
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
    "Week 4 controlled progressive overload",
    "Add reps before load",
    "Increase load only when all sets hit the top of the rep range",
    "Stay 2-3 reps in reserve on main work",
    "Accessories may stay 1-3 reps in reserve",
    "No grinding",
    "If form breaks, keep load the same next session",
    "If feet/ankles rise above 3/10, remove walking lunges first",
    "If lower back rises above 3/10, remove back hyperextensions and overhead press first",
    "Pain 5/10 or higher means stop that movement",
    "No treadmill warm-ups",
    "No bike warm-ups",
    "no running",
    "no jumping",
    "no HIIT",
    "Required later recovery",
    "Walk to gym",
    "Ramp set 1: very easy x 8-10, RPE 3-4",
    "Set 2: easy/moderate x 5-8, RPE 4-5 only if needed",
  ]) {
    assert.match(programCopy, new RegExp(escapeRegExp(expected), "i"));
  }

  assert.doesNotMatch(programCopy, /optional later recovery/i);
  assert.doesNotMatch(programCopy, /Weight\/Reps\/RPE rows[\s\S]*Ramp set/i);

  // The Wednesday drop set has been removed from the template. No drop set may
  // reappear without also restoring its explicit sub-failure copy, and the
  // no-failure rule stays in force regardless.
  assert.equal(
    workoutPlan.DEFAULT_WORKOUT_PLAN.flatMap((day) => day.exercises)
      .filter((exercise) => /drop set/i.test(exercise.exerciseName)).length,
    0
  );
  assert.doesNotMatch(workoutPlanPageSource, /drop set/i);
  assert.ok(workoutPlan.PROGRESSIVE_OVERLOAD_RULES.includes("No failure training."));
  assert.ok(workoutPlan.BACK_PAIN_RULES.includes("No failure training."));

  // Every overhead press variant in the template must be covered by the
  // lower-back gating predicate and carry the removal cue.
  const overheadPresses = workoutPlan.DEFAULT_WORKOUT_PLAN.flatMap((day) =>
    day.exercises.filter((exercise) => /overhead press|shoulder press/i.test(exercise.exerciseName))
  );
  assert.ok(overheadPresses.length > 0);
  for (const exercise of overheadPresses) {
    assert.ok(workoutPlan.isOverheadPressExercise(exercise.exerciseName));
    assert.match(exercise.cues, /Removed while lower-back pain is 3\/10 or higher/i);
  }
  // The gating predicate must not catch chest pressing or rows.
  assert.ok(!workoutPlan.isOverheadPressExercise("A1 Chest Machine Press"));
  assert.ok(!workoutPlan.isOverheadPressExercise("A2 Chest-Supported Row or Seated Cable Row"));
  // Both gated surfaces use the shared predicate rather than a hardcoded name.
  assert.match(workoutPlanPageSource, /isOverheadPressExercise\(exercise\.exerciseName\)/);
  assert.match(workoutDayPreviewSource, /isOverheadPressExercise\(exercise\.exerciseName\)/);
  // No cue may instruct training to failure (the no-failure rule states the negative).
  assert.doesNotMatch(programCopy, /(?<!short of |not training )to failure(?! on every drop)/i);
});

test("weekly set summary covers the required muscle groups", () => {
  assert.deepEqual(Array.from(workoutPlan.WEEKLY_SET_SUMMARY), [
    "Quads: strong but controlled.",
    "Hamstrings: good.",
    "Glutes/hips: good.",
    "Hip abductors/adductors: improved.",
    "Chest: balanced between incline, mid-chest press, and fly/accessory work.",
    "Back/lats: strong.",
    "Rear delts: good.",
    "Side delts: good.",
    "Front delts: enough from pressing; do not add more.",
    "Triceps: good.",
    "Biceps: good — Tuesday, Thursday, and Friday carry the arm volume.",
    "Core/trunk: covered through controlled anti-rotation holds.",
    "Calves/feet: mobility only; no loaded calf raises yet.",
  ]);
  assert.match(workoutPlanPageSource, /WEEKLY_SET_SUMMARY/);
});

test("dashboard and schedule constants reflect the next-week five strength days", () => {
  assert.match(constantsSource, /DEFAULT_TRAINING_DAYS = \[1, 2, 3, 4, 5\]/);
  assert.match(constantsSource, /DEFAULT_RECOVERY_DAYS: number\[\] = \[\]/);
  assert.match(constantsSource, /DEFAULT_REST_DAYS = \[0, 6\]/);
  assert.match(dashboardSource, /5 Strength \/ 2 Full Rest/);
  assert.match(dashboardSource, /day: "MON"[\s\S]*label: "Lower A — Leg Press \+ Quad\/Hamstring Strength"[\s\S]*protocol: "Strength Protocol"/);
  assert.match(dashboardSource, /day: "TUE"[\s\S]*label: "Upper A — Incline Push \/ Row \/ Trunk Stability"[\s\S]*protocol: "Strength Protocol"/);
  assert.match(dashboardSource, /day: "WED"[\s\S]*label: "Lower B — Accessory Legs \+ Hip Stability"[\s\S]*protocol: "Strength Protocol"/);
  assert.match(dashboardSource, /day: "THU"[\s\S]*label: "Upper B — Chest Machine Press \/ Pull \+ Shoulders and Arms"[\s\S]*protocol: "Strength Protocol"/);
  assert.match(dashboardSource, /day: "FRI"[\s\S]*label: "Upper Accessory \+ Arms \+ Core"[\s\S]*protocol: "Strength Protocol"/);
  assert.match(dashboardSource, /day: "SAT"[\s\S]*label: "Complete Rest"[\s\S]*protocol: "Full Rest"/);
  assert.match(dashboardSource, /day: "SUN"[\s\S]*label: "Complete Rest"[\s\S]*protocol: "Full Rest"/);
  assert.match(dashboardSource, /const isStrengthDay = \[1, 2, 3, 4, 5\]/);
  assert.doesNotMatch(dashboardSource, /Recovery Protocol/);
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

test("start-new-plan and stale active snapshots rebuild from the next-week template", () => {
  assert.match(workoutPlanResetButtonSource, /Start new plan/);
  assert.match(workoutPlanResetButtonSource, /next-week progressive overload plan/);
  assert.match(workoutActionsSource, /Start a new next-week plan first/);
  for (const path of ["/", "/workout", "/workout/plan", "/mobility", "/flexibility-balance", "/steps", "/weight", "/settings"]) {
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
  assert.doesNotMatch(workoutActionsSource, /getSessionFamily/);
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

  const currentFriday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 5);
  assert.ok(currentFriday);
  const supportedHold = currentFriday.exercises.find((exercise) =>
    /Supported Cable Anti-Rotation Hold/.test(exercise.exerciseName)
  );
  assert.ok(supportedHold);
  const staleFridayWithPlank = {
    ...currentFriday,
    exercises: [
      ...currentFriday.exercises.filter((exercise) =>
        !/Supported Cable Anti-Rotation Hold/.test(exercise.exerciseName)
      ),
      {
        exerciseName: "D1 Incline Bench Plank",
        sets: 2,
        reps: "15-30 seconds",
        tempo: "steady hold",
        restSeconds: 90,
        targetRPE: "4-5",
        cues: "Old Friday plank.",
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
      {
        ...supportedHold,
        exerciseName: "D2 Supported Cable Anti-Rotation Hold",
      },
    ],
  };

  assert.equal(workoutPlanVersion.isCurrentWorkoutPlanContent(staleFridayWithPlank), false);

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

test("mobility later recovery and rest routines match the next-week block", () => {
  assert.equal(mobility.getMobilityProgram(2).logType, "PRE_WORKOUT");
  assert.equal(mobility.getMobilityProgram(2).sessionTitle, "Upper A primer");
  assert.equal(mobility.getMobilityProgram(3).logType, "PRE_WORKOUT");
  assert.equal(mobility.getMobilityProgram(3).sessionTitle, "Lower B primer");
  assert.equal(mobility.getMobilityProgram(4).sessionTitle, "Upper B primer");
  assert.equal(mobility.getMobilityProgram(5).sessionTitle, "Upper accessory primer");
  assert.equal(mobility.getMobilityProgram(6).sessionTitle, "Complete Rest");
  assert.equal(mobility.getMobilityProgram(6).totalDuration, "0-8 min if stiff");
  assert.equal(mobility.getMobilityProgram(0).sessionTitle, "Complete Rest");
  assert.deepEqual(Array.from(mobility.getMobilityProgram(0).blocks), []);
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
  assert.equal(footFlareBlocks[0].title, "Required foot-flare recovery");
  assert.match(mobilityPageSource, /Required foot-flare recovery/);
  assert.match(mobilityPageSource, /No mobility block is scheduled today/);
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
  assert.equal(stats.streakUnloggedDays, 0);
  assert.equal(stats.streakBackfillDate, null);

  // NEW streak semantics: an unlogged day is missing data, not failure.
  // Short gaps (<=3 consecutive unlogged days) are bridged and surfaced for
  // backfill; a LOGGED below-goal day still breaks the streak.
  const bridged = steps.calculateStepStats([
    stepEntry("2026-07-01", 9953),
    stepEntry("2026-07-02", 9971),
    // 2026-07-03 never logged
  ], 8000, "2026-07-04");
  assert.equal(bridged.currentStreak, 2);
  assert.equal(bridged.streakUnloggedDays, 1);
  assert.equal(bridged.streakBackfillDate, "2026-07-03");

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

function countMovement(day, pattern) {
  assert.ok(day);
  return day.exercises.filter((exercise) => pattern.test(exercise.exerciseName)).length;
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
