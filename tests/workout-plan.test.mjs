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
    assert.match(base.purpose, /ankle range/i);
    assert.match(base.purpose, /shin and calf stiffness/i);

    const baseNames = base.exercises.map((exercise) => exercise.name);
    assert.ok(baseNames.includes("Toe spreads / short-foot drill"));
    assert.ok(baseNames.includes("Seated ankle pumps"));
    assert.ok(baseNames.includes("Ankle rocks"));
    assert.ok(baseNames.includes("Calf stretch"));
    assert.ok(baseNames.includes("Optional tibialis raises"));
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
