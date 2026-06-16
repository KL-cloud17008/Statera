import type { DistanceUnit, WeightUnit } from "@/lib/app-settings";

export const LB_TO_KG = 0.45359237;
export const BODYWEIGHT_UNIT = "lb";
export const WORKOUT_LOAD_UNIT = "kg";
const STEPS_TO_MILES = 0.0004734848;
const MILES_TO_KM = 1.609344;
const INCHES_TO_CM = 2.54;

export type WorkoutLoadUnit = "lb" | "kg";

export function inchesToCm(inches: number): number {
  return Math.round(inches * INCHES_TO_CM * 10) / 10;
}

export function cmToInches(cm: number): number {
  return cm / INCHES_TO_CM;
}

export function convertWeight(value: number, unit: WeightUnit) {
  if (unit === "kg") {
    return poundsToKg(value) ?? value;
  }

  return value;
}

export function toPounds(value: number, unit: WeightUnit) {
  if (unit === "kg") {
    return value / LB_TO_KG;
  }

  return value;
}

export function formatWeight(value: number | null | undefined, unit: WeightUnit, digits = 1) {
  if (value == null) {
    return "--";
  }

  const converted = convertWeight(value, unit);
  return `${converted.toFixed(digits)} ${unit}`;
}

export function poundsToKg(lb: number | null | undefined): number | null {
  if (typeof lb !== "number" || !Number.isFinite(lb)) {
    return null;
  }

  return lb * LB_TO_KG;
}

export function poundsToStoneParts(lb: number | null | undefined): { stone: number; pounds: number } | null {
  if (typeof lb !== "number" || !Number.isFinite(lb) || lb < 0) {
    return null;
  }

  const stone = Math.floor(lb / 14);
  return {
    stone,
    pounds: lb - stone * 14,
  };
}

export function formatBodyweight(value: number | null | undefined, digits = 1) {
  if (value == null || !Number.isFinite(value)) {
    return "--";
  }

  return `${value.toFixed(digits)} ${BODYWEIGHT_UNIT}`;
}

export function formatBodyweightDelta(value: number | null | undefined, digits = 1) {
  if (value == null || !Number.isFinite(value)) {
    return "--";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(digits)} ${BODYWEIGHT_UNIT}`;
}

export function formatBodyweightConversion(value: number | string | null | undefined) {
  if (value == null || value === "") {
    return "";
  }

  const lb = typeof value === "number" ? value : Number.parseFloat(value);
  const kg = poundsToKg(lb);
  const stoneParts = poundsToStoneParts(lb);

  if (kg == null || stoneParts == null) {
    return "";
  }

  return `${lb.toFixed(1)} lb = ${kg.toFixed(2)} kg = ${stoneParts.stone} st ${stoneParts.pounds.toFixed(1)} lb`;
}

export function workoutLoadToKg(value: number | null | undefined, sourceUnit: WorkoutLoadUnit = WORKOUT_LOAD_UNIT) {
  if (value == null || !Number.isFinite(value)) {
    return null;
  }

  return sourceUnit === "lb" ? poundsToKg(value) : value;
}

export function formatWorkoutLoad(value: number | null | undefined, sourceUnit: WorkoutLoadUnit = WORKOUT_LOAD_UNIT, digits = 1) {
  const kg = workoutLoadToKg(value, sourceUnit);
  if (kg == null) {
    return "--";
  }

  return `${kg.toFixed(digits)} ${WORKOUT_LOAD_UNIT}`;
}

export function formatWorkoutVolume(value: number | null | undefined, sourceUnit: WorkoutLoadUnit = WORKOUT_LOAD_UNIT) {
  const kg = workoutLoadToKg(value, sourceUnit);
  if (kg == null) {
    return "--";
  }

  return `${Math.round(kg).toLocaleString()} ${WORKOUT_LOAD_UNIT}`;
}

export function formatWeightDelta(value: number | null | undefined, unit: WeightUnit, digits = 1) {
  if (value == null) {
    return "--";
  }

  const converted = convertWeight(value, unit);
  const prefix = converted > 0 ? "+" : "";
  return `${prefix}${converted.toFixed(digits)} ${unit}`;
}

export function stepsToDistance(steps: number, unit: DistanceUnit) {
  const miles = steps * STEPS_TO_MILES;
  return unit === "km" ? miles * MILES_TO_KM : miles;
}

export function formatDistance(steps: number, unit: DistanceUnit, digits = 1) {
  const value = stepsToDistance(steps, unit);
  return `${value.toFixed(digits)} ${unit}`;
}

export function poundsPerWeekToUnit(value: number, unit: WeightUnit) {
  return unit === "kg" ? value * LB_TO_KG : value;
}
