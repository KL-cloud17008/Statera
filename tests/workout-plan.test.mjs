import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const planSource = readFileSync("src/lib/default-workout-plan.ts", "utf8");
const settingsSource = readFileSync("src/components/settings/SettingsPageClient.tsx", "utf8");

const requiredExercises = [
  "Machine Chest Press",
  "Leg Press",
  "Machine Hip Thrust",
  "Machine Abdominal Crunch",
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
];

test("canonical workout plan keeps the machine-supported exercise set", () => {
  for (const exercise of requiredExercises) {
    assert.match(planSource, new RegExp(escapeRegExp(exercise)), `${exercise} should stay in the plan`);
  }
});

test("canonical workout plan does not restore removed bodyweight exercises", () => {
  for (const exercise of removedExercises) {
    assert.doesNotMatch(planSource, new RegExp(escapeRegExp(exercise)), `${exercise} should not return`);
  }
});

test("settings do not expose dark or system theme controls", () => {
  assert.doesNotMatch(settingsSource, /<SelectItem[^>]+value=["']dark["']/);
  assert.doesNotMatch(settingsSource, /<SelectItem[^>]+value=["']system["']/);
  assert.doesNotMatch(settingsSource, />\s*Dark\s*</);
  assert.doesNotMatch(settingsSource, />\s*System\s*</);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
