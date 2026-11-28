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
const { isContinuousTrainingExercise, isTimedTrainingExercise, KETTLEBELL_FLOWS } = loadTypescriptModule("src/lib/training-session.ts");

test("the reviewed six-day programme uses the approved order, sets, and rep ranges", () => {
  const days = workoutPlan.DEFAULT_WORKOUT_PLAN;
  const day = (number) => days.find((entry) => entry.dayOfWeek === number);
  const exerciseNames = (number) => Array.from(day(number).exercises, (exercise) => exercise.exerciseName);
  assert.equal(workoutPlan.DEFAULT_WORKOUT_PLAN_VERSION, "six-day-sun-fri-v26");
  assert.deepEqual(Array.from(days, (entry) => entry.dayOfWeek), [1, 2, 3, 4, 5, 0]);
  const totals = Array.from(days, (entry) => entry.exercises
    .filter((exercise) => !isContinuousTrainingExercise(exercise.exerciseName))
    .reduce((sets, exercise) => sets + exercise.sets, 0));
  assert.deepEqual(totals, [19, 23, 18, 24, 14, 17]);
  assert.equal(totals.reduce((sum, sets) => sum + sets, 0), 115);
  const exercises = days.flatMap((entry) => entry.exercises);
  const mainLifts = new Set([
    "Machine Chest Press", "Incline Machine Chest Press", "Pendulum Squat", "Wide-Grip Lat Pulldown",
    "Chest-Supported T-Bar Row",
  ]);
  for (const movement of exercises) {
    if (isTimedTrainingExercise(movement) || movement.exerciseName.endsWith("Walking Lunges")) continue;
    const name = movement.exerciseName.replace(/^[A-Z]\d+ /, "");
    const expectedRange = mainLifts.has(name)
      ? /^4-6$/
      : name === "Cable Lateral Raise"
        ? /^10-12 per arm$/
        : name === "Rotary Torso Machine"
          ? /^10-12 per side$/
          : /^8-12(?: per (?:leg|arm|side))?$/;
    assert.match(movement.reps, expectedRange, name);
  }
  const quadSets = exercises.filter((exercise) => /Lunges|Bulgarian|Pendulum|Leg Extension/.test(exercise.exerciseName))
    .reduce((sets, exercise) => sets + exercise.sets, 0);
  assert.equal(quadSets, 13);
  assert.deepEqual(exerciseNames(1), [
    "Lying Leg Curl", "F2 Hip Adduction Machine", "F1 Hip Abduction Machine",
    "B1 Walking Lunges", "C1 Pendulum Squat", "Seated Calf Raise", "E1 Seated Leg Curl — Working Sets",
    "D1 Seated Leg Extension", "Triceps Pressdown, bar",
  ]);
  assert.deepEqual(exerciseNames(3), [
    "Lying Leg Curl", "D1 Hip Adduction Machine", "D2 Hip Abduction Machine",
    "B3 Pendulum Squat", "B1 Supported Stationary Bulgarian Split Squat", "C2 Seated Leg Curl",
    "Seated Straight-Leg Calf Machine", "C1 Seated Leg Extension", "E1 Seated Machine Preacher Curl",
  ]);
  const monday = day(1).exercises;
  const wednesday = day(3).exercises;
  assert.deepEqual(Array.from(monday, (exercise) => exercise.sets), [1, 2, 2, 2, 3, 3, 3, 1, 2]);
  assert.deepEqual(Array.from(wednesday, (exercise) => exercise.sets), [1, 1, 1, 3, 3, 3, 3, 1, 2]);
  assert.equal(monday[3].reps, "6-10 steps per leg");
  assert.equal(monday[4].supersetGroup, "Squat and calves");
  assert.equal(monday[4].supersetGroup, monday[5].supersetGroup);
  assert.equal(monday[4].restSeconds, 0);
  assert.equal(monday[5].restSeconds, 165);
  assert.equal(wednesday[3].supersetGroup, null);
  assert.equal(wednesday[6].supersetGroup, null);
  assert.equal(wednesday[3].restSeconds, 165);
  assert.match(workoutPlan.LOWER_BODY_WARMUP, /bodyweight walking lunge.*Bulgarian split squats.*reverse lunges/);
  assert.deepEqual(exerciseNames(2), [
    "A1 Machine Chest Press", "Wide-Grip Lat Pulldown", "B2 Close-Grip Lat Pulldown", "A2 Seated Chest-Supported Machine Row",
    "Abdominal Crunch Machine / Plate-Weighted Decline Bench Crunch", "Rotary Torso Machine", "Cable Lateral Raise", "D2 Reverse Pec Deck / Seated Machine Reverse Fly", "Back Extension Machine",
  ]);
  const tuesday = day(2).exercises;
  assert.deepEqual(Array.from(tuesday, (exercise) => exercise.sets), [3, 3, 2, 3, 3, 3, 2, 2, 2]);
  assert.deepEqual(Array.from(tuesday.slice(0, 4), (exercise) => exercise.reps), ["4-6", "4-6", "8-12", "8-12"]);
  assert.equal(tuesday[1].supersetGroup, null);
  assert.equal(tuesday[2].supersetGroup, null);
  assert.match(tuesday[2].cues, /reverse grip/);
  assert.deepEqual(exerciseNames(4), [
    "A1 Incline Machine Chest Press", "Chest-Supported T-Bar Row", "C1 Overhead Cable Triceps Extension",
    "C3 Face-Away Bayesian Cable Curl", "Cable Lateral Raise", "Abdominal Crunch Machine / Plate-Weighted Decline Bench Crunch", "Rotary Torso Machine", "Back Extension Machine",
  ]);
  assert.deepEqual(Array.from(day(4).exercises, (exercise) => exercise.sets), [3, 3, 3, 3, 3, 3, 3, 3]);
  assert.equal(day(4).exercises[0].reps, "4-6");
  assert.equal(day(4).exercises[3].reps, "8-12 per arm");
  assert.equal(day(4).exercises[2].supersetGroup, "Arms");
  assert.equal(day(4).exercises[3].supersetGroup, "Arms");
  assert.match(day(4).exercises[2].cues, /straight-bar attachment/);
  assert.deepEqual(exerciseNames(0), [
    "Kettlebell Farmer Walk", "Machine Glute Kickback", "Abdominal Crunch Machine / Plate-Weighted Decline Bench Crunch",
    "Rotary Torso Machine", "Reverse EZ-Bar Curl", "Back Extension Machine",
  ]);
  const [carry, kickback] = day(0).exercises;
  assert.equal(kickback.sets, 2);
  assert.equal(kickback.reps, "8-12 per leg");
  assert.deepEqual([carry.sets, carry.reps, carry.restSeconds, carry.exerciseType], [5, "60 sec", 60, "TIMED"]);
  for (const [number, crunchIndex] of [[0, 2], [2, 4], [4, 5]]) {
    const [crunch, torso] = day(number).exercises.slice(crunchIndex, crunchIndex + 2);
    const extension = day(number).exercises.at(-1);
    assert.deepEqual(
      [crunch.exerciseName, crunch.sets, crunch.reps, crunch.restSeconds, crunch.targetRPE, crunch.supersetGroup, crunch.exerciseType],
      ["Abdominal Crunch Machine / Plate-Weighted Decline Bench Crunch", 3, "8-12", 75, "8", null, "ACCESSORY"],
    );
    assert.match(crunch.cues, /20[–-]25 kg plate/);
    assert.match(crunch.cues, /3\/10/);
    assert.deepEqual(
      [torso.exerciseName, torso.sets, torso.reps, torso.restSeconds, torso.targetRPE, torso.supersetGroup, torso.exerciseType],
      ["Rotary Torso Machine", 3, "10-12 per side", 75, "7", null, "ACCESSORY"],
    );
    assert.match(torso.cues, /both sides before resting/i);
    assert.match(torso.cues, /3\/10/);
    assert.deepEqual([extension.exerciseName, extension.sets, extension.reps, extension.targetRPE, extension.restSeconds, extension.supersetGroup],
      ["Back Extension Machine", number === 4 ? 3 : 2, "8-12", "6-7", 120, null]);
    assert.match(extension.cues, /lightest machine setting/);
  }
  assert.deepEqual(Array.from(days.filter(entry => entry.exercises.some(exercise => exercise.exerciseName === "Back Extension Machine")), entry => entry.dayOfWeek), [2, 4, 0]);
  const friday = day(5).exercises;
  assert.deepEqual(exerciseNames(5), [
    "A1 Seated Machine Chest Fly", "A2 Reverse Pec Deck / Seated Machine Reverse Fly",
    "High-to-Low Cable Chest Press", "Machine Glute Kickback", workoutPlan.FRIDAY_TRICEPS_EXERCISE,
    "Hip Adduction Machine", "Hip Abduction Machine", KETTLEBELL_FLOWS.fridayWarrior,
  ]);
  assert.equal(friday[0].supersetGroup, friday[1].supersetGroup);
  assert.ok(friday[0].supersetGroup);
  assert.deepEqual(Array.from(friday.slice(0, 2), (exercise) => [exercise.sets, exercise.restSeconds]), [[3, 0], [3, 90]]);
  assert.match(friday[1].cues, /reverse cable crossover/);
  assert.deepEqual([friday[3].sets, friday[3].reps, friday[4].sets], [2, "8-12 per leg", 2]);
  assert.ok(friday.slice(-3, -1).every((exercise) => exercise.sets === 1 && exercise.targetRPE === "5-6"));
  assert.equal(friday.at(-1).reps, "Up to 5 min · self-paced");
  assert.match(friday.at(-1).cues, /swings to goblet squats to two-hand floor presses/);
  const flows = exercises.filter((exercise) => isContinuousTrainingExercise(exercise.exerciseName));
  const { formatExerciseDose } = loadTypescriptModule("src/lib/workout-prescription.ts");
  assert.equal(flows.length, 1);
  assert.equal(flows[0].exerciseName, KETTLEBELL_FLOWS.fridayWarrior);
  for (const flow of flows) {
    assert.deepEqual([flow.sets, flow.restSeconds, flow.exerciseType, flow.supersetGroup], [1, 0, "TIMED", null]);
    assert.equal(formatExerciseDose(flow), flow.reps);
  }
  assert.deepEqual(Array.from(workoutPlan.FRIDAY_TRICEPS_VARIATIONS), ["Straight-bar cable pressdown", "Rope cable pressdown"]);
});

test("the load rules and form guides cover the new accessories", () => {
  const days = workoutPlan.DEFAULT_WORKOUT_PLAN;
  const exercises = days.flatMap((day) => day.exercises);
  const names = exercises.map((exercise) => exercise.exerciseName).join("\n");
  const { getExerciseFormGuide } = loadTypescriptModule("src/lib/exercise-form-guides.ts");
  assert.doesNotMatch(names, /Cable Crunch|Standing Barbell Curl|Face Pull|Incline Dumbbell Press|Conventional Deadlift|Barbell Squat|Barbell Bench Press|Bench-Supported Cross-Body Kettlebell Row|Kettlebell Halo → Uppercut → Pullover|Kettlebell Uppercut → Pullover/);
  for (const exercise of exercises.filter((exercise) => /Calf|Farmer Walk/.test(exercise.exerciseName))) {
    assert.match(exercise.cues, /3\/10/);
    assert.ok(workoutPlan.isFootPainGatedExercise(exercise.exerciseName));
  }
  for (const name of ["Kettlebell Farmer Walk", "Reverse EZ-Bar Curl", "Wide-Grip Lat Pulldown", "Chest-Supported T-Bar Row", "Abdominal Crunch Machine", "Abdominal Crunch Machine / Plate-Weighted Decline Bench Crunch", "Rotary Torso Machine", "Machine Hip Thrust", "Cable Glute Kickback", "Incline Machine Chest Press", "High-to-Low Cable Chest Press"]) {
    assert.ok(getExerciseFormGuide(name), name);
  }
  for (const name of ["Seated Machine Shoulder Press", "Abdominal Crunch Machine", "Abdominal Crunch Machine / Plate-Weighted Decline Bench Crunch", "Plate-Weighted Decline Bench Crunch", "Rotary Torso Machine", "Back Extension Machine"]) {
    assert.ok(workoutPlan.isBackPainGatedExercise(name), name);
  }
  assert.ok(!workoutPlan.isBackPainGatedExercise("Overhead Cable Triceps Extension"));
  assert.match(workoutPlan.PROGRESSIVE_OVERLOAD_RULES.join(" "), /three clean repetitions in reserve/);
  assert.match(getExerciseFormGuide("Machine Glute Kickback").setup, /machine's placard/);
  assert.equal(getExerciseFormGuide("Kettlebell Halo").video.url, "https://www.youtube.com/watch?v=gKi_KT9kuMs&t=156s");
  const crossBodyGuide = getExerciseFormGuide("Bench-Supported Cross-Body Kettlebell Row");
  assert.match(crossBodyGuide.setup, /stable bench/);
  assert.equal(crossBodyGuide.video.url, "https://www.youtube.com/watch?v=gKi_KT9kuMs&t=260s");
  for (const [name, timestamp] of [[KETTLEBELL_FLOWS.sundayCore, 323], [KETTLEBELL_FLOWS.coreSuperset, 335], [KETTLEBELL_FLOWS.fridayWarrior, 83]]) {
    assert.ok(workoutPlan.isBackPainGatedExercise(name));
    assert.ok(isTimedTrainingExercise({ exerciseName: name }), "retained entries still accept duration");
    assert.equal(getExerciseFormGuide(name).video.url, `https://www.youtube.com/watch?v=kt9QyErXJZs&t=${timestamp}s`);
  }
  assert.match(getExerciseFormGuide("Back Extension Machine").setup, /machine placard/);
  assert.match(getExerciseFormGuide("Back Extension — Hyperextension Bench").setup, /hip crease/);
  const declineGuide = getExerciseFormGuide("Plate-Weighted Decline Bench Crunch");
  assert.match(declineGuide.setup, /plate flat against your chest/);
  assert.match(declineGuide.video.url, /^https:\/\/www\.youtube\.com\/watch\?v=/);
  assert.match(workoutPlan.WEEKLY_SET_SUMMARY.join(" "), /9 abdominal crunch sets.*9 rotary torso machine sets/);
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
  assert.equal(mobility.getMobilityProgram(0).sessionTitle, "Carry and core primer");
  assert.equal(mobility.getMobilityProgram(0).logType, "PRE_WORKOUT");
  assert.equal(mobility.getTrainingSessionKeyForPlanDay(0), "SUNDAY_ACCESSORY");
  assert.equal(mobility.getMobilityProgramForSession("REST", 0).dayOfWeek, 6);
  assert.equal(mobility.getRequiredLaterRecoveryTitle("standard", 0), "Carry and foot reset");
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
  assert.doesNotMatch(dashboardSource, /calculateStepStats|weightStats|Weigh in/);
  assert.doesNotMatch(dashboardPageSource, /getStepsEntries|getWeightEntries|computeWeightStats/);
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
  const { DEFAULT_EXERCISE_LIBRARY: library } = loadTypescriptModule("src/lib/exercise-library.ts");
  const mainLifts = new Set([
    "machine-chest-press", "incline-machine-chest-press", "incline-dumbbell-press", "chest-supported-row", "chest-supported-t-bar-row",
    "machine-row", "lat-pulldown", "neutral-grip-lat-pulldown", "wide-grip-lat-pulldown",
    "seated-cable-row", "single-leg-leg-press", "leg-press", "pendulum-squat",
  ]);
  for (const movement of library) {
    if (movement.id === "walking-lunges" || / (sec|m)$/.test(movement.defaultReps)) continue;
    if (movement.id === "kettlebell-halo") {
      assert.equal(movement.defaultReps, "8-10 total");
      continue;
    }
    const expectedRange = mainLifts.has(movement.id) ? /^4-6(?: per side)?$/ : /^8-12(?: per (?:leg|arm|side))?$/;
    assert.match(movement.defaultReps, expectedRange, movement.name);
  }
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
  assert.equal(activeNames.match(/Seated (?:Calf Raise|Straight-Leg Calf Machine)/g).length, 2);
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
