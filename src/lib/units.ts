import type { DistanceUnit, WeightUnit } from "@/lib/app-settings";

export const LB_TO_KG = 0.45359237;
export const BODYWEIGHT_UNIT = "lb";
export const WORKOUT_LOAD_UNIT = "kg";
export const BODYWEIGHT_DIGITS = 1;
export const BODYWEIGHT_KG_DIGITS = 1;
export const BODYWEIGHT_RATE_KG_DIGITS = 2;
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

function toBodyweightNumber(value: number | string | null | undefined): number | null {
  if (value == null || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function roundedMagnitude(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round((Math.abs(value) + Number.EPSILON) * factor) / factor;
}

function signPrefix(value: number, includePositive: boolean): string {
  if (value < 0) {
    return "-";
  }

  return includePositive && value > 0 ? "+" : "";
}

function formatStone(value: number, includeSign: boolean, digits = BODYWEIGHT_DIGITS): string {
  // Round before splitting so a displayed remainder never reads `14.0 lb`.
  const roundedPounds = roundedMagnitude(value, digits);
  const stone = Math.floor(roundedPounds / 14);
  const pounds = roundedPounds - stone * 14;
  return `${signPrefix(value, includeSign)}${stone} st ${pounds.toFixed(digits)} lb`;
}

function formatSignedUnit(
  value: number,
  unit: string,
  digits: number,
  includePositive: boolean
): string {
  return `${signPrefix(value, includePositive)}${roundedMagnitude(value, digits).toFixed(digits)} ${unit}`;
}

export function formatBodyweight(
  value: number | null | undefined,
  digits = BODYWEIGHT_DIGITS
) {
  if (value == null || !Number.isFinite(value)) {
    return "--";
  }

  return formatSignedUnit(value, BODYWEIGHT_UNIT, digits, false);
}

export function formatBodyweightSecondary(
  value: number | string | null | undefined,
  { signed = false }: { signed?: boolean } = {}
) {
  const lb = toBodyweightNumber(value);
  if (lb == null || (!signed && lb < 0)) {
    return "";
  }

  const kg = poundsToKg(Math.abs(lb));
  if (kg == null) {
    return "";
  }

  const includePositive = signed;
  return `${formatSignedUnit(
    lb < 0 ? -kg : kg,
    "kg",
    BODYWEIGHT_KG_DIGITS,
    includePositive
  )} · ${formatStone(lb, includePositive)}`;
}

export function formatBodyweightWithConversions(
  value: number | string | null | undefined
) {
  const lb = toBodyweightNumber(value);
  const secondary = formatBodyweightSecondary(value);
  if (lb == null || lb < 0 || !secondary) {
    return "";
  }

  return `${formatBodyweight(lb)} · ${secondary}`;
}

export function formatBodyweightDeltaPrimary(
  value: number | null | undefined,
  digits = BODYWEIGHT_DIGITS
) {
  if (value == null || !Number.isFinite(value)) {
    return "--";
  }

  return formatSignedUnit(value, BODYWEIGHT_UNIT, digits, true);
}

export function formatBodyweightDelta(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) {
    return "--";
  }

  const kg = poundsToKg(Math.abs(value));
  if (kg == null) {
    return "--";
  }

  const includePositive = true;
  return `${formatSignedUnit(
    value,
    BODYWEIGHT_UNIT,
    BODYWEIGHT_DIGITS,
    includePositive
  )} · ${formatSignedUnit(
    value < 0 ? -kg : kg,
    "kg",
    BODYWEIGHT_KG_DIGITS,
    includePositive
  )} · ${formatStone(value, includePositive)}`;
}

export function formatBodyweightDeltaSecondary(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) {
    return "";
  }

  return formatBodyweightSecondary(value, { signed: true });
}

export function formatBodyweightConversion(value: number | string | null | undefined) {
  return formatBodyweightWithConversions(value);
}

export function formatBodyweightRatePrimary(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) {
    return "--";
  }

  return `${signPrefix(value, true)}${roundedMagnitude(value, BODYWEIGHT_DIGITS).toFixed(BODYWEIGHT_DIGITS)} lb/wk`;
}

export function formatBodyweightRateSecondary(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) {
    return "";
  }

  const kg = poundsToKg(Math.abs(value));
  if (kg == null) {
    return "";
  }

  return formatSignedUnit(
    value < 0 ? -kg : kg,
    "kg/wk",
    BODYWEIGHT_RATE_KG_DIGITS,
    true
  );
}

export function formatBodyweightRate(value: number | null | undefined) {
  const primary = formatBodyweightRatePrimary(value);
  const secondary = formatBodyweightRateSecondary(value);
  return secondary ? `${primary} · ${secondary}` : primary;
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
