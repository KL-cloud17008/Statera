import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

const planSource = readFileSync("src/lib/default-workout-plan.ts", "utf8");
const settingsSource = readFileSync("src/components/settings/SettingsPageClient.tsx", "utf8");
const require = createRequire(import.meta.url);
const ts = require("typescript");
const units = loadTypescriptModule("src/lib/units.ts");
const appSettings = loadTypescriptModule("src/lib/app-settings.ts");
const mobility = loadTypescriptModule("src/lib/mobility.ts");
const workoutPlan = loadTypescriptModule("src/lib/default-workout-plan.ts");

const requiredExercises = [
  "Machine Chest Press",
  "Leg Press",
  "Walking Lunges",
  "Leg Press Calf Press",
  "Hack Squat Machine",
  "Glute Kickback Machine",
  "Back Extension Machine",
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
];

test("canonical workout plan keeps the selected beginner exercise set", () => {
  for (const exercise of requiredExercises) {
    assert.match(planSource, new RegExp(escapeRegExp(exercise)), `${exercise} should stay in the plan`);
  }
});

test("canonical workout plan does not restore removed or replaced exercises", () => {
  for (const exercise of removedExercises) {
    assert.doesNotMatch(planSource, new RegExp(escapeRegExp(exercise)), `${exercise} should not return`);
  }
});

test("canonical workout plan replaces cardio warm-up prescriptions with at-home primers", () => {
  for (const removedCopy of [
    "Ramp-Up: Treadmill Walk",
    "Ramp-Up: Recumbent Bike",
    "Ramp-Up: Arm Bike",
    "5 min bike",
    "5 min arm bike",
    "Nasal-breathing pace on the treadmill",
    "Warm up with easy cycling",
  ]) {
    assert.doesNotMatch(planSource, new RegExp(escapeRegExp(removedCopy), "i"), `${removedCopy} should not remain`);
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
    assert.ok(workingExercises.length >= 6, `${day.sessionName} should keep machine-supported working sets`);
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

test("training-day mobility preserves optional later recovery", () => {
  assert.equal(mobility.OPTIONAL_LATER_RECOVERY.title, "Optional later recovery");
  assert.equal(mobility.OPTIONAL_LATER_RECOVERY.recoveryIntro, true);
  assert.ok(mobility.OPTIONAL_LATER_RECOVERY.exercises.length >= 4);
});

test("mobility optional later recovery supports standard and foot flare modes", () => {
  const standardBlocks = mobility.getOptionalLaterRecoveryBlocks("standard", 1);
  const footFlareBlocks = mobility.getOptionalLaterRecoveryBlocks("footFlare", 1);

  assert.equal(standardBlocks.length, 1);
  assert.equal(standardBlocks[0].title, "Optional later recovery");
  assert.equal(mobility.OPTIONAL_LATER_RECOVERY_FOOT_FLARE_TITLE, "Optional later recovery - foot flare focus");
  assert.ok(footFlareBlocks.length >= 3);
  assert.equal(footFlareBlocks[0].recoveryIntroVariant, "footFlare");
});

test("foot flare focus includes foot, sole, shin, calf, and ankle recovery items", () => {
  const exerciseNames = mobility
    .getOptionalLaterRecoveryBlocks("footFlare", 2)
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
  ]) {
    assert.ok(exerciseNames.includes(expected), `${expected} should be in foot flare recovery`);
  }
});

test("rest-day foot flare recovery puts foot and lower-leg work first", () => {
  const wednesdayBlocks = mobility.getRecoverySessionBlocks(3, "footFlare");
  const sundayBlocks = mobility.getRecoverySessionBlocks(0, "footFlare");

  assert.equal(wednesdayBlocks[0].title, "Foot and sole downshift");
  assert.equal(wednesdayBlocks[1].title, "Shins, calves, ankles");
  assert.equal(sundayBlocks[0].title, "Foot and sole downshift");
  assert.equal(sundayBlocks[1].title, "Supported full-body downshift");
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function loadTypescriptModule(path) {
  const source = readFileSync(path, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: path,
  }).outputText;
  const compiledModule = { exports: {} };
  const filename = resolve(path);
  const contextRequire = (specifier) => {
    if (specifier.startsWith("@/")) {
      return require(resolve(specifier.replace("@/", "src/")));
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
