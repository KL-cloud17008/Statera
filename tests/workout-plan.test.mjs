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
const navItemsSource = readFileSync("src/components/layout/nav-items.ts", "utf8");
const desktopSidebarSource = readFileSync("src/components/layout/DesktopSidebar.tsx", "utf8");
const mobileNavSource = readFileSync("src/components/layout/MobileNav.tsx", "utf8");
const dashboardSource = readFileSync("src/components/dashboard/DashboardPageClient.tsx", "utf8");
const dashboardPageSource = readFileSync("src/app/(app)/page.tsx", "utf8");
const nutritionRouteSources = [
  "src/app/(app)/nutrition/page.tsx",
  "src/app/(app)/nutrition/foods/page.tsx",
  "src/app/(app)/nutrition/meals/page.tsx",
  "src/app/(app)/nutrition/summary/page.tsx",
  "src/app/(app)/nutrition/import/page.tsx",
].map((path) => readFileSync(path, "utf8"));
const settingsSource = readFileSync("src/components/settings/SettingsPageClient.tsx", "utf8");
const trainingPlanSource = readFileSync("training_plan.md", "utf8");
const weightChartSource = readFileSync("src/components/weight/WeightChart.tsx", "utf8");
const require = createRequire(import.meta.url);
const ts = require("typescript");
const moduleCache = new Map();
const units = loadTypescriptModule("src/lib/units.ts");
const appSettings = loadTypescriptModule("src/lib/app-settings.ts");
const backup = loadTypescriptModule("src/lib/backup.ts");
const mobility = loadTypescriptModule("src/lib/mobility.ts");
const nutrition = loadTypescriptModule("src/lib/nutrition.ts");
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
  "Leg Press Calf Press",
  "Glute Kickback Machine",
  "Hyperextension / Back Extension Machine",
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
    "Wednesday: Mobility + 10,000 steps",
    "Thursday: Upper B - Machine Back/Shoulder Emphasis",
    "Friday: Lower B - Machine Posterior Chain",
    "Saturday: Recovery mobility",
    "Sunday: Complete rest or very low-intensity recovery mobility",
  ]);
  assert.match(planSource, /optional 2-round mode/i);
  assert.match(planSource, /RPE 6-7/);
  assert.match(planSource, /2-4 reps in reserve/);
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
  assert.equal(wednesday.trainingRole, "Mobility + 10,000 steps");
  assert.equal(wednesday.sessionTitle, "Mobility + 10,000 steps");
  assert.equal(wednesday.logType, "POST_WORKOUT");
  assert.ok(wednesday.blocks.length >= 3);

  assert.match(planSource, /Wednesday: Mobility \+ 10,000 steps/);
  assert.match(workoutPlanPageSource, /Mobility \+ 10,000 steps/);
  assert.match(dashboardSource, /Mobility \+ 10,000 steps/);
  assert.match(trainingPlanSource, /\| Wednesday \| Mobility \+ 10,000 steps \|/);
  assert.match(mobilitySource, /value: "10,000 steps"/);
  assert.equal(
    appSettings.parseAppSettings(JSON.stringify({ stepGoal: 8000 })).stepGoal,
    8000
  );
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
  assert.match(lateralRaise.cues, /cardiovascular fitness is currently low/i);

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

  assert.equal(
    day5.exercises.find((item) => item.exerciseType === "WORKING")?.exerciseName,
    "A1 Leg Press"
  );
  assert.match(day5.exercises.find((item) => item.exerciseName.includes("Leg Press"))?.cues ?? "", /straight sets/i);
  assert.ok(day5.exercises.some((item) => item.exerciseName.includes("Hyperextension / Back Extension Machine")));

  for (const removedFromLowerB of ["Hip Adduction Machine", "Walking Lunges", "Hack Squat", "Squat Machine"]) {
    assert.ok(
      !day5.exercises.some((item) => item.exerciseName.includes(removedFromLowerB)),
      `Day 5 should not include ${removedFromLowerB}`
    );
  }
});

test("canonical workout plan replaces cardio warm-up prescriptions with at-home primers", () => {
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

  assert.match(planSource, /Walking to the gym is the general warm-up/);
  assert.match(planSource, /Do the mobility primer at home before leaving/);
  assert.match(planSource, /1-2 easy ramp-up sets/);

  for (const primer of [
    "At home - Upper A Mobility Primer",
    "At home - Lower A Mobility Primer",
    "At home - Upper B Mobility Primer",
    "At home - Lower B Mobility Primer",
  ]) {
    assert.match(planSource, new RegExp(escapeRegExp(primer)), `${primer} should be in the plan`);
  }
});

test("workout data remains circuit based after the primer row", () => {
  for (const day of workoutPlan.DEFAULT_WORKOUT_PLAN) {
    const primers = day.exercises.filter((exercise) => exercise.exerciseType === "WARMUP");
    assert.equal(primers.length, 1, `${day.sessionName} should have one at-home primer`);

    const workingExercises = day.exercises.filter((exercise) => exercise.exerciseType === "WORKING");
    assert.ok(workingExercises.length >= 4, `${day.sessionName} should keep working sets`);
    assert.deepEqual(
      Array.from(new Set(workingExercises.map((exercise) => exercise.supersetGroup))).sort(),
      ["A", "B", "C"],
      `${day.sessionName} should keep A/B/C circuit blocks`
    );
  }
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
    assert.ok(program.blocks.length >= 3, `${program.dayName} should include base, main block, and finisher`);
  }
});

test("every mobility day includes the daily lower-leg base", () => {
  for (const program of mobility.getAllMobilityPrograms()) {
    const base = program.blocks.find((block) => block.id === "daily-lower-leg-base");
    assert.ok(base, `${program.dayName} should include Daily lower-leg base`);
    assert.equal(base.title, "Daily lower-leg base");
    assert.match(base.purpose, /foot control/i);
    assert.match(base.purpose, /ankle dorsiflexion/i);
    assert.match(base.purpose, /soleus/i);

    const baseNames = base.exercises.map((exercise) => exercise.name);
    assert.ok(baseNames.includes("Toe spreads / short-foot drill"));
    assert.ok(baseNames.includes("Seated ankle pumps"));
    assert.ok(baseNames.includes("Wall ankle rocks"));
    assert.ok(baseNames.includes("Wall calf stretch, knee straight"));
    assert.ok(baseNames.includes("Wall calf stretch, knee bent"));
  }
});

test("training-day mobility primers use the requested at-home sequences", () => {
  const expectedByDay = new Map([
    [1, [
      "Toe spreads / short-foot drill",
      "Seated ankle pumps",
      "Wall ankle rocks",
      "Wall calf stretch, knee straight",
      "Wall calf stretch, knee bent",
      "Wall thoracic rotations",
      "Wall slides",
      "Doorway pec stretch",
      "Wall lat stretch",
      "Seated bracing breaths",
    ]],
    [2, [
      "Toe spreads / short-foot drill",
      "Seated ankle pumps",
      "Wall ankle rocks",
      "Wall calf stretch, knee straight",
      "Wall calf stretch, knee bent",
      "90/90 hip switches",
      "Half-kneeling or standing hip flexor stretch",
      "Adductor rock-backs",
      "Bodyweight glute bridge",
      "Seated bracing breaths",
    ]],
    [4, [
      "Toe spreads / short-foot drill",
      "Seated ankle pumps",
      "Wall ankle rocks",
      "Wall calf stretch, knee straight",
      "Wall calf stretch, knee bent",
      "Wall thoracic rotations",
      "Wall angels or wall slides",
      "Scapular circles",
      "Doorway pec stretch",
      "Wall lat stretch",
      "Seated bracing breaths",
    ]],
    [5, [
      "Toe spreads / short-foot drill",
      "Seated ankle pumps",
      "Wall ankle rocks",
      "Wall calf stretch, knee straight",
      "Wall calf stretch, knee bent",
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
    assert.equal(program.totalDuration, "8-12 min");

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

test("foot flare recovery includes foot, sole, shin, calf, and ankle recovery items", () => {
  const exerciseNames = mobility
    .getRequiredLaterRecoveryBlocks("footFlare", 2)
    .flatMap((block) => block.exercises)
    .map((exercise) => exercise.name);

  for (const expected of [
    "Foot check-in",
    "Gentle plantar fascia / sole stretch",
    "Soft foot roll",
    "Toe spreads / short-foot drill",
    "Seated ankle pumps",
    "Wall ankle rocks",
    "Wall calf stretch, knee straight",
    "Wall calf stretch, knee bent",
    "Supported breathing reset",
  ]) {
    assert.ok(exerciseNames.includes(expected), `${expected} should be in foot flare recovery`);
  }
});

test("rest-day foot flare recovery puts foot and lower-leg work first", () => {
  const wednesdayBlocks = mobility.getRecoverySessionBlocks(3, "footFlare");
  const sundayBlocks = mobility.getRecoverySessionBlocks(0, "footFlare");

  assert.equal(wednesdayBlocks[0].title, "Required foot-flare recovery");
  assert.equal(wednesdayBlocks[1].title, "Shins, calves, ankles");
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
