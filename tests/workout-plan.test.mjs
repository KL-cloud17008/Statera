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
const activeTrainingSessionSource = readFileSync("src/lib/active-training-session.ts", "utf8");
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
  assert.equal(workoutPlan.DEFAULT_WORKOUT_PLAN_VERSION, "five-day-mon-fri-v6");
  assert.deepEqual(Array.from(workoutPlan.DEFAULT_WORKOUT_PLAN, (day) => day.dayOfWeek), [1, 2, 3, 4, 5]);
  assert.deepEqual(Array.from(workoutPlan.DEFAULT_WEEKLY_RHYTHM), [
    "Monday: Lower A — Lunges + Pendulum Squat / Quad-Hamstring Strength",
    "Tuesday: Upper A — Incline Chest + Row / Dual Pulldown",
    "Wednesday: Lower B — Split Squat + Hamstrings / Hips + Core",
    "Thursday: Upper B — Machine Chest + Dual Pulldown / Arms",
    "Friday — Chest Isolation + Row / Shoulders + Arms",
    "Saturday: Complete Rest",
    "Sunday: Complete Rest",
  ]);
  assert.match(workoutPlanPageSource, /5 \/ 0 \/ 2/);
  assert.match(workoutPlanPageSource, /5 Strength/);
  assert.match(workoutPlanPageSource, /0 Recovery/);
  assert.match(workoutPlanPageSource, /2 Full Rest/);
  assert.match(workoutPlanPageSource, /Monday total working sets: 19/);
  assert.match(workoutPlanPageSource, /Tuesday total working sets: 24/);
  assert.match(workoutPlanPageSource, /Wednesday total working sets: 27/);
  assert.match(workoutPlanPageSource, /Thursday total working sets: 20/);
  assert.match(workoutPlanPageSource, /Friday total working sets: 25/);
  assert.match(trainingPlanSource, /Weekly total: 115 sets/);
  assert.doesNotMatch(workoutPlanPageSource, /Completed \/ View Session|Completed Monday session/i);
  assert.match(planSource, /Five training days with balanced chest, back, legs, hips, arms, and trunk stability/);
});

test("strength days use the requested exercise selection and set balance", () => {
  const byDay = new Map(workoutPlan.DEFAULT_WORKOUT_PLAN.map((day) => [day.dayOfWeek, day]));

  assertDay(byDay.get(1), "Lower A — Lunges + Pendulum Squat / Quad-Hamstring Strength", 19, [
    ["A1 Walking Lunges", 2, "6-10 steps per leg", "4-5"],
    ["A2 Pendulum Squat", 3, "6-8", "5-7"],
    ["B1 Lying Leg Curl", 3, "10-12", "6-7"],
    ["C1 Seated Leg Extension", 3, "10-15", "6-7"],
    ["D1 Hip Abduction Machine", 3, "12-20", "6"],
    ["D2 Hip Adduction Machine", 3, "12-20", "5-6"],
    ["E1 Seated Bent-Leg Calf Raise or Seated Dumbbell Calf Raise", 2, "12-20", "5-6"],
  ]);
  assert.equal(byDay.get(1).exercises.length, 7);
  const mondayNames = byDay.get(1).exercises.map((exercise) => exercise.exerciseName);
  assert.equal(mondayNames[0], "A1 Walking Lunges");
  assert.equal(mondayNames[1], "A2 Pendulum Squat");
  assert.equal(mondayNames.some((name) => /Leg Press/i.test(name)), false);
  assert.match(byDay.get(1).exercises[0].cues, /Bodyweight first/i);
  assert.match(byDay.get(1).exercises[0].cues, /not conditioning/i);
  assert.match(byDay.get(1).exercises[0].cues, /foot, ankle, knee, or lower-back pain/i);

  assertDay(byDay.get(2), "Upper A — Incline Chest + Row / Dual Pulldown", 24, [
    ["A1 Two-Arm Reverse Pec Deck", 2, "12-15", "5-6"],
    ["A2 Single-Arm Pec Deck", 2, "10-15 per arm", "5-6"],
    ["B1 Neutral-Grip Lat Pulldown", 3, "8-12", "6-7"],
    ["B2 Close-Grip Lat Pulldown", 2, "10-12", "5-6"],
    ["C1 Dumbbell Incline Press or Machine Incline Press", 3, "8-12", "6-7"],
    ["C2 Chest-Supported Row or Seated Cable Row", 3, "8-12", "6-7"],
    ["D1 Machine Shoulder Press", 3, "8-12", "5-6"],
    ["E1 Triceps Extension Machine or Overhead Cable Triceps Extension", 3, "10-15", "6-7"],
    ["E2 Machine Preacher Curl or Cable Lateral Raise", 3, "10-15 curl / 12-20 lateral raise", "6-7"],
  ]);
  assert.deepEqual(
    Array.from(byDay.get(2).exercises.slice(0, 2), (exercise) => exercise.supersetGroup),
    ["A", "A"]
  );
  assert.equal(countMovement(byDay.get(2), /Two-Arm Reverse Pec Deck/), 1);
  assert.equal(countMovement(byDay.get(2), /Dead Hang/), 0);
  assert.equal(countMovement(byDay.get(2), /Close-Grip Lat Pulldown/), 1);

  // Wednesday is a lower accessory day plus a short upper/trunk finisher
  // (Block E: calves, side delts, and conservative cable crunches). Arm work stays off it.
  // Totals count the 2 warm-up sets, matching the file convention.
  assertDay(byDay.get(3), "Lower B", 27, [
    ["A1 Lying Leg Curl (warm-up)", 2, "12-15", "4-5"],
    ["B1 Supported Stationary Bulgarian Split Squat", 3, "8-10 per leg", "5-6"],
    ["C1 Seated Leg Extension", 3, "10-15", "6"],
    ["C2 Seated Leg Curl", 4, "10-12", "6"],
    ["D1 Hip Adduction Machine", 4, "12-20", "5-6"],
    ["D2 Hip Abduction Machine", 4, "12-20", "5-6"],
    ["E1 Seated Straight-Leg Calf Machine or Leg Press Calf Press", 2, "12-20", "5-6"],
    ["E2 Cable Lateral Raise", 3, "12-20", "6"],
    ["E3 Cable Crunch", 2, "10-15", "4-5"],
  ]);
  assert.equal(byDay.get(3).exercises.length, 9);
  // Hip adduction/abduction stay at 4 sets each — a deliberate focus.
  assert.equal(byDay.get(3).exercises.find((e) => e.exerciseName === "D1 Hip Adduction Machine").sets, 4);
  assert.equal(byDay.get(3).exercises.find((e) => e.exerciseName === "D2 Hip Abduction Machine").sets, 4);
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
  assertDay(byDay.get(4), "Upper B — Machine Chest + Dual Pulldown / Arms", 20, [
    ["A1 Chest Machine Press", 3, "8-12", "6-7"],
    ["A2 Chest-Supported Row or Seated Cable Row", 3, "8-12", "6-7"],
    ["B1 Neutral-Grip Lat Pulldown", 3, "8-12", "6-7"],
    ["B2 Close-Grip Lat Pulldown", 2, "10-12", "5-6"],
    ["C1 Triceps Pressdown, bar", 3, "15-20", "6-7"],
    ["C2 Reverse Cable Crossover", 3, "15-20", "5-6"],
    ["C3 Face-Away Bayesian Cable Curl", 3, "10-15", "6-7"],
  ]);
  assert.equal(countMovement(byDay.get(1), /Hip Abduction Machine/), 1);
  assert.equal(countMovement(byDay.get(1), /Hip Adduction Machine/), 1);
  assert.equal(countMovement(byDay.get(3), /Hip Abduction Machine/), 1);
  assert.equal(countMovement(byDay.get(3), /Hip Adduction Machine/), 1);

  // Friday keeps chest isolation, the C/F supersets, supported rowing,
  // shoulder work, and arms without the duplicated reverse-pec-deck slot.
  assertDay(byDay.get(5), "Friday — Chest Isolation + Row / Shoulders + Arms", 25, [
    ["A1 Pec Deck or Single-Arm Cable Fly", 3, "12-15", "5-6"],
    ["B1 T-Bar Chest-Supported Row or Chest-Supported Row", 3, "10-12", "5-6"],
    ["C1 Dumbbell Preacher Curl or Machine Preacher Curl", 3, "10-15", "6-7"],
    ["C2 Reverse Curl", 2, "10-15", "5-6"],
    ["C3 Cable or Dumbbell Wrist Curl", 2, "12-20", "5-6"],
    ["D1 Seated Machine Shoulder Press", 3, "8-12", "5-6"],
    ["E1 Seated Straight-Leg Calf Machine or Leg Press Calf Press", 3, "12-20", "5-6"],
    ["F1 Cable Lateral Raise", 3, "12-20", "6"],
    ["F2 Overhead Cable Triceps Extension", 3, "10-15", "6-7"],
  ]);
  assert.equal(byDay.get(5).exercises.length, 9);
  assert.equal(countMovement(byDay.get(5), /Incline Bench Plank/), 0);

  // Superset grouping is what makes the day work; assert it explicitly.
  assert.deepEqual(
    Array.from(byDay.get(5).exercises, (e) => e.supersetGroup),
    ["A", "B", "C", "C", "C", "D", "E", "F", "F"]
  );
  // The C triple superset runs rounds 1-2 in full, round 3 is C1 only.
  assert.equal(byDay.get(5).exercises.find((e) => /^C1 /.test(e.exerciseName)).sets, 3);
  assert.equal(byDay.get(5).exercises.find((e) => /^C2 /.test(e.exerciseName)).sets, 2);
  assert.equal(byDay.get(5).exercises.find((e) => /^C3 /.test(e.exerciseName)).sets, 2);

  // B1 must stay chest-supported on both variants — an unsupported landmine
  // T-bar is a loaded hip hinge and is barred by the back-pain rules.
  const fridayRow = byDay.get(5).exercises.find((e) => /^B1 /.test(e.exerciseName));
  assert.match(fridayRow.exerciseName, /Chest-Supported Row or Chest-Supported Row$/);
  assert.match(fridayRow.cues, /Chest-supported only on both variants/i);
  assert.match(fridayRow.cues, /loaded hip hinge and is not permitted/i);

  // Friday D1 IS overhead pressing and must carry the lower-back removal cue.
  const fridayPress = byDay.get(5).exercises.find((e) => e.exerciseName === "D1 Seated Machine Shoulder Press");
  assert.ok(workoutPlan.isOverheadPressExercise(fridayPress.exerciseName));
  assert.match(fridayPress.cues, /Removed while lower-back pain is 3\/10 or higher/i);

  // ...but F2 is elbow-extension accessory work and must NOT be gated, even
  // though its name starts with "Overhead".
  const overheadTriceps = byDay.get(5).exercises.find((e) => e.exerciseName === "F2 Overhead Cable Triceps Extension");
  assert.ok(!workoutPlan.isOverheadPressExercise(overheadTriceps.exerciseName));
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
    "Back Hyperextension",
    "Back Extension Machine",
  ]) {
    assert.doesNotMatch(activePlanText, new RegExp(escapeRegExp(prohibited), "i"));
  }

  // Calf work is now three slots — Monday (bent-leg/soleus), Wednesday and
  // Friday (straight-leg/gastrocnemius) — and exactly one per day. Tuesday and
  // Thursday must stay clear.
  const CALF_SLOTS_BY_DAY = { 1: 1, 2: 0, 3: 1, 4: 0, 5: 1 };
  for (const day of workoutPlan.DEFAULT_WORKOUT_PLAN) {
    assert.equal(
      countMovement(day, /Calf Raise|Calf Machine|Calf Press/i),
      CALF_SLOTS_BY_DAY[day.dayOfWeek],
      `day ${day.dayOfWeek} calf slots`
    );
  }
  // No standing calf variant may exist anywhere — the gym has no such machine.
  assert.doesNotMatch(activePlanText, /standing calf/i);
  assert.doesNotMatch(planSource, /Standing Calf Raise/);
  assert.doesNotMatch(trainingPlanSource, /Standing Calf Raise/);
  assert.doesNotMatch(workoutPlanPageSource, /Standing Calf Raise/);
  // Every calf slot carries a fallback, because the machines go out of service.
  for (const day of workoutPlan.DEFAULT_WORKOUT_PLAN) {
    for (const calf of day.exercises.filter((e) => /Calf/i.test(e.exerciseName))) {
      assert.match(calf.exerciseName, / or /, `${calf.exerciseName} needs a fallback`);
      assert.match(calf.cues, /3\/10 or higher/i, `${calf.exerciseName} needs the foot-load gate`);
    }
  }

  const monday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 1);
  assert.deepEqual(
    Array.from(monday.exercises.slice(0, 2), (exercise) => exercise.exerciseName),
    ["A1 Walking Lunges", "A2 Pendulum Squat"]
  );
  assert.equal(countMovement(monday, /Leg Press/i), 0);
  assert.ok(monday.exercises.some((exercise) => exercise.exerciseName === "D1 Hip Abduction Machine"));
  assert.ok(monday.exercises.some((exercise) => exercise.exerciseName === "D2 Hip Adduction Machine"));
  assert.equal(countMovement(monday, /Hip Abduction Machine/), 1);
  assert.equal(countMovement(monday, /Hip Adduction Machine/), 1);

  const tuesday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 2);
  assert.ok(tuesday.exercises.some((exercise) => exercise.exerciseName === "A1 Two-Arm Reverse Pec Deck"));
  assert.ok(tuesday.exercises.some((exercise) => exercise.exerciseName === "A2 Single-Arm Pec Deck"));
  assert.ok(tuesday.exercises.some((exercise) => exercise.exerciseName === "B1 Neutral-Grip Lat Pulldown"));
  assert.ok(tuesday.exercises.some((exercise) => exercise.exerciseName === "B2 Close-Grip Lat Pulldown"));
  assert.ok(tuesday.exercises.some((exercise) => exercise.exerciseName === "C1 Dumbbell Incline Press or Machine Incline Press"));
  assert.ok(tuesday.exercises.some((exercise) => exercise.exerciseName === "C2 Chest-Supported Row or Seated Cable Row"));
  assert.equal(countMovement(tuesday, /Reverse Pec Deck/), 1);
  assert.equal(countMovement(tuesday, /Dead Hang/), 0);

  const wednesday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 3);
  // "Leg Press Calf Press" is the Wednesday E1 calf fallback, not the removed
  // Monday compound, so match the compound explicitly rather than the fragment.
  assert.ok(
    !wednesday.exercises.some((exercise) =>
      /Leg Press/i.test(exercise.exerciseName) && !/Calf Press/i.test(exercise.exerciseName)
    )
  );
  assert.equal(countMovement(wednesday, /Leg Press Calf Press/), 1);
  assert.ok(wednesday.exercises.some((exercise) => exercise.exerciseName === "B1 Supported Stationary Bulgarian Split Squat"));
  assert.ok(!wednesday.exercises.some((exercise) => /Back Hyperextension|Back Extension/i.test(exercise.exerciseName)));
  assert.ok(wednesday.exercises.some((exercise) => exercise.exerciseName === "C1 Seated Leg Extension"));
  assert.ok(wednesday.exercises.some((exercise) => exercise.exerciseName === "C2 Seated Leg Curl"));
  assert.equal(countMovement(wednesday, /Hip Abduction Machine/), 1);
  assert.equal(countMovement(wednesday, /Hip Adduction Machine/), 1);
  assert.equal(countMovement(wednesday, /Cable Crunch/), 1);
  assert.equal(countMovement(wednesday, /Supported Cable Anti-Rotation Hold/), 0);
  // Wednesday is legs and hips only — the arm superset and triceps drop set
  // moved off this day; Tuesday, Thursday and Friday carry the arm volume.
  assert.ok(!wednesday.exercises.some((exercise) => /Preacher Curl|Reverse Curl|drop set/i.test(exercise.exerciseName)));

  const thursday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 4);
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "A1 Chest Machine Press"));
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "A2 Chest-Supported Row or Seated Cable Row"));
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "B1 Neutral-Grip Lat Pulldown"));
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "B2 Close-Grip Lat Pulldown"));
  assert.ok(thursday.exercises.some((exercise) => exercise.exerciseName === "C3 Face-Away Bayesian Cable Curl"));
  // Overhead press is removed from the template under the lower-back rule.
  assert.ok(!thursday.exercises.some((exercise) => /Overhead Press/i.test(exercise.exerciseName)));
  assert.doesNotMatch(workoutPlanPageSource, /Dumbbell Overhead Press/);

  const friday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 5);
  assert.equal(friday.sessionName, "Friday — Chest Isolation + Row / Shoulders + Arms");
  assert.ok(!friday.exercises.some((exercise) => /Incline Machine Press|Leg Extension|Single-Leg Lying Curl|Back Hyperextension|Back Extension Machine/i.test(exercise.exerciseName)));
  for (const expected of [
    "A1 Pec Deck or Single-Arm Cable Fly",
    "B1 T-Bar Chest-Supported Row or Chest-Supported Row",
    "C1 Dumbbell Preacher Curl or Machine Preacher Curl",
    "C2 Reverse Curl",
    "C3 Cable or Dumbbell Wrist Curl",
    "D1 Seated Machine Shoulder Press",
    "E1 Seated Straight-Leg Calf Machine or Leg Press Calf Press",
    "F1 Cable Lateral Raise",
    "F2 Overhead Cable Triceps Extension",
  ]) {
    assert.ok(
      friday.exercises.some((exercise) => exercise.exerciseName === expected),
      `Friday should include ${expected}`
    );
  }
  assert.ok(!friday.exercises.some((exercise) => /Reverse Pec Deck|Dead Hang|Incline Bench Plank/i.test(exercise.exerciseName)));
  assert.equal(countMovement(friday, /Supported Cable Anti-Rotation Hold/), 0);
  // No duplicate shoulder, forearm, or calf slots crept in with the rebuild.
  assert.equal(countMovement(friday, /Lateral Raise/), 1);
  assert.equal(countMovement(friday, /Wrist Curl/), 1);
  assert.equal(countMovement(friday, /Reverse Curl/), 1);
  assert.equal(countMovement(friday, /Calf/), 1);
  // Exactly one overhead-pressing slot on Friday, and it is D1.
  assert.deepEqual(
    Array.from(
      friday.exercises.filter((e) => workoutPlan.isOverheadPressExercise(e.exerciseName)),
      (e) => e.exerciseName
    ),
    ["D1 Seated Machine Shoulder Press"]
  );

  assert.doesNotMatch(
    [planSource, workoutPlanPageSource, trainingPlanSource, mobilitySource].join("\n"),
    /Incline Bench Plank/i
  );

  const inclinePresses = workoutPlan.DEFAULT_WORKOUT_PLAN
    .flatMap((day) => day.exercises)
    .filter((exercise) => /Incline/i.test(exercise.exerciseName) && /Press/i.test(exercise.exerciseName));
  // Still exactly one incline pressing slot — now with an equipment alternate.
  assert.deepEqual(Array.from(inclinePresses, (exercise) => exercise.exerciseName), ["C1 Dumbbell Incline Press or Machine Incline Press"]);
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
    "No aggressive or heavy loaded spinal flexion",
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
    "If feet/ankles rise above 3/10, remove walking lunges and all three calf slots (Monday E1, Wednesday E1, Friday E1) first",
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
    "Side delts: covered through the Tuesday curl/lateral-raise alternate plus dedicated Wednesday and Friday raises.",
    "Front delts: enough from pressing; do not add more.",
    "Triceps: good.",
    "Biceps: good — Tuesday, Thursday, and Friday carry the arm volume.",
    "Forearms/grip: covered by Friday reverse curls and wrist curls.",
    "Core/trunk: covered through conservative cable crunches on Wednesday.",
    "Calves/feet: three seated slots — Monday bent-leg (soleus), Wednesday and Friday straight-leg (gastrocnemius). No standing calf work; the gym has no standing calf machine. All three are removed whenever sole/plantar pain reaches 3/10.",
  ]);
  assert.match(workoutPlanPageSource, /WEEKLY_SET_SUMMARY/);
});

test("dashboard and schedule constants reflect the next-week five strength days", () => {
  assert.match(constantsSource, /DEFAULT_TRAINING_DAYS = \[1, 2, 3, 4, 5\]/);
  assert.match(constantsSource, /DEFAULT_RECOVERY_DAYS: number\[\] = \[\]/);
  assert.match(constantsSource, /DEFAULT_REST_DAYS = \[0, 6\]/);
  assert.match(dashboardSource, /5 Strength \/ 2 Full Rest/);
  assert.match(dashboardSource, /STRENGTH_RHYTHM_DAYS\.map/);
  assert.match(dashboardSource, /label: getPlanDay\(dayOfWeek\)\?\.sessionName \?\? "Training"/);
  assert.match(dashboardSource, /return getPlanDay\(dayOfWeek\)\?\.sessionName \?\? "Complete Rest"/);
  assert.deepEqual(
    Array.from(workoutPlan.DEFAULT_WORKOUT_PLAN, (day) => day.sessionName),
    [
      "Lower A — Lunges + Pendulum Squat / Quad-Hamstring Strength",
      "Upper A — Incline Chest + Row / Dual Pulldown",
      "Lower B — Split Squat + Hamstrings / Hips + Core",
      "Upper B — Machine Chest + Dual Pulldown / Arms",
      "Friday — Chest Isolation + Row / Shoulders + Arms",
    ]
  );
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
  assert.match(workoutDayPreviewSource, /const blockOrder = \["A", "B", "C", "D", "E", "F"\]/);
  assert.match(sessionLoggerSource, /group\[group\.length - 1\]\?\.restSeconds/);
  assert.match(sessionLoggerSource, /getProgrammedRestSeconds/);
});

test("start-new-plan and stale active snapshots rebuild from the next-week template", () => {
  assert.match(workoutPlanResetButtonSource, /Start new plan/);
  assert.match(workoutPlanResetButtonSource, /next-week progressive overload plan/);
  assert.match(workoutActionsSource, /Start a new next-week plan first/);
  for (const path of ["/", "/workout", "/workout/plan", "/mobility", "/flexibility-balance", "/steps", "/weight", "/settings"]) {
    assert.match(workoutActionsSource, new RegExp(`"${escapeRegExp(path)}"`));
  }
  assert.match(workoutPlanSeedSource, /isCurrentWorkoutPlanContent/);
  assert.match(workoutPlanSeedSource, /isCurrentPlanBackedWorkoutSession/);
  assert.match(workoutPlanSeedSource, /workoutPlanId: \{ not: null \}/);
  assert.match(workoutPlanSeedSource, /preservableOpenSessions/);
  assert.match(workoutPlanSeedSource, /staleOpenSessionIds/);
  assert.match(workoutPlanSeedSource, /workoutSession\.update/);
  assert.match(workoutPlanSeedSource, /buildCurrentPlanSessionNotes/);
  assert.match(workoutPlanSeedSource, /data: \{ isActive: false \}/);
  assert.match(workoutPlanSeedSource, /createDefaultWorkoutPlans\(tx, userId\)/);
  assert.match(workoutPlanSeedSource, /completed: false/);
  assert.match(activeTrainingSessionSource, /ensureDefaultWorkoutPlans\(prisma, userId\)/);
  assert.match(activeTrainingSessionSource, /getTrainingSessionKeyForPlanDay/);
  assert.match(workoutActionsSource, /completedSessionMatchesCurrentPlan/);
  assert.match(workoutActionsSource, /const existing = openSessions\[0\]/);
  assert.match(workoutActionsSource, /Another session is already in progress/);
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

  const staleMondayWithLegPress = {
    ...day1,
    exercises: day1.exercises.map((exercise) =>
      exercise.exerciseName === "A2 Pendulum Squat"
        ? { ...exercise, exerciseName: "A2 Leg Press" }
        : exercise
    ),
  };
  assert.equal(workoutPlanVersion.isCurrentWorkoutPlanContent(staleMondayWithLegPress), false);

  const currentTuesday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 2);
  assert.ok(currentTuesday);
  const staleTuesdayWithLateralRaise = {
    ...currentTuesday,
    exercises: currentTuesday.exercises.map((exercise) =>
      exercise.exerciseName === "B2 Close-Grip Lat Pulldown"
        ? {
            ...exercise,
            exerciseName: "B2 Dumbbell / Plate Lateral Raise",
            sets: 3,
            reps: "12-20",
          }
        : exercise
    ),
  };
  assert.equal(workoutPlanVersion.isCurrentWorkoutPlanContent(staleTuesdayWithLateralRaise), false);

  const currentFriday = workoutPlan.DEFAULT_WORKOUT_PLAN.find((day) => day.dayOfWeek === 5);
  assert.ok(currentFriday);
  // The anti-rotation hold moved off Friday to Wednesday E3 in v6, so the
  // stale-Friday fixture now anchors on the calf slot instead. Same job as
  // before: a Friday snapshot carrying the retired Incline Bench Plank must be
  // rejected as non-current.
  const calfSlot = currentFriday.exercises.find((exercise) =>
    /Calf Machine|Calf Press/.test(exercise.exerciseName)
  );
  assert.ok(calfSlot);
  const staleFridayWithPlank = {
    ...currentFriday,
    exercises: [
      ...currentFriday.exercises.filter((exercise) =>
        !/Calf Machine|Calf Press/.test(exercise.exerciseName)
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
        ...calfSlot,
        exerciseName: "E2 Seated Straight-Leg Calf Machine or Leg Press Calf Press",
      },
    ],
  };

  assert.equal(workoutPlanVersion.isCurrentWorkoutPlanContent(staleFridayWithPlank), false);

  // A v4 Friday snapshot (anti-rotation hold on Friday, no overhead press)
  // must also be rejected now that Friday has been rebuilt.
  const staleV4Friday = {
    dayOfWeek: 5,
    sessionName: currentFriday.sessionName,
    exercises: [
      {
        exerciseName: "D1 Supported Cable Anti-Rotation Hold",
        sets: 2,
        reps: "10-20 seconds per side",
        tempo: "steady hold",
        restSeconds: 90,
        targetRPE: "4-5",
        cues: "v4 Friday trunk slot.",
        supersetGroup: "D",
        exerciseType: "WORKING",
      },
    ],
  };
  assert.equal(workoutPlanVersion.isCurrentWorkoutPlanContent(staleV4Friday), false);

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
  assert.equal(mobility.getMobilityProgram(5).sessionTitle, "Friday chest + row primer");
  assert.equal(mobility.getTrainingSessionKeyForPlanDay(5), "UPPER_ACCESSORY");
  assert.equal(
    mobility.getTrainingSessionKey("Friday — Chest Isolation + Row / Shoulders + Arms"),
    "UPPER_ACCESSORY"
  );
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
  assert.match(settingsSource, /Training Load Unit/);
  assert.match(weightPageSource, /formatBodyweightSecondary/);
  assert.match(weightChartSource, /formatBodyweightWithConversions/);
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
  assert.match(dashboardSource, /detail="Consecutive goal days"/);
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
  for (const canonicalMovement of [
    "Walking Lunges",
    "Pendulum Squat",
    "Two-Arm Reverse Pec Deck",
    "Single-Arm Pec Deck",
    "Neutral-Grip Lat Pulldown",
    "Close-Grip Lat Pulldown",
    "Cable Crunch",
  ]) {
    assert.match(exerciseLibrarySource, new RegExp(escapeRegExp(canonicalMovement)));
  }
  const activeNames = workoutPlan.DEFAULT_WORKOUT_PLAN
    .flatMap((day) => day.exercises)
    .map((exercise) => exercise.exerciseName)
    .join("\n");
  // Calf work is three seated slots, each with a fallback. The library must
  // offer the same seated machines and fallbacks — and no standing variant,
  // because the gym has no standing calf machine.
  assert.match(activeNames, /E1 Seated Bent-Leg Calf Raise or Seated Dumbbell Calf Raise/);
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
