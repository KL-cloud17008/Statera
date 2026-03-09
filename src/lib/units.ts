import type { DistanceUnit, WeightUnit } from "@/lib/app-settings";

const LB_TO_KG = 0.45359237;
const STEPS_TO_MILES = 0.0004734848;
const MILES_TO_KM = 1.609344;
const INCHES_TO_CM = 2.54;

export function inchesToCm(inches: number): number {
  return Math.round(inches * INCHES_TO_CM * 10) / 10;
}

export function cmToInches(cm: number): number {
  return cm / INCHES_TO_CM;
}

export function convertWeight(value: number, unit: WeightUnit) {
  if (unit === "kg") {
    return value * LB_TO_KG;
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
