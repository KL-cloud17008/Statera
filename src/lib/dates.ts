/**
 * Training day and timezone-safe date helpers.
 */

import {
  TRAINING_DAY_BOUNDARY_HOUR,
  TRAINING_TIMEZONE,
} from "./constants";

function getDateTimeParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/**
 * Convert a UTC Date to a local wall-clock Date in the provided timezone.
 */
export function toLocalDate(date: Date, timezone: string = TRAINING_TIMEZONE): Date {
  const parts = getDateTimeParts(date, timezone);
  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
}

export function getTodayDateString(timezone: string = TRAINING_TIMEZONE) {
  return formatDate(toLocalDate(new Date(), timezone));
}

/**
 * Get the training date for a given timestamp.
 * Before boundary hour -> current calendar date.
 * At or after boundary hour -> next calendar date.
 */
export function getTrainingDate(
  timestamp: Date,
  userTimezone: string = TRAINING_TIMEZONE
): Date {
  const localTime = toLocalDate(timestamp, userTimezone);
  const hour = localTime.getHours();

  if (hour < TRAINING_DAY_BOUNDARY_HOUR) {
    return startOfDay(localTime);
  }

  const tomorrow = new Date(localTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return startOfDay(tomorrow);
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addDaysToDateString(dateStr: string, days: number) {
  return formatDate(addDays(parseDate(dateStr), days));
}

export function getTrainingDayOfWeek(
  timestamp: Date,
  userTimezone: string = TRAINING_TIMEZONE
): number {
  const trainingDate = getTrainingDate(timestamp, userTimezone);
  return trainingDate.getDay();
}

export function getTrainingDayNumber(
  timestamp: Date,
  userTimezone: string = TRAINING_TIMEZONE
): number | null {
  const trainingDate = getTrainingDate(timestamp, userTimezone);
  const jsDay = trainingDate.getDay();
  if (jsDay >= 1 && jsDay <= 5) {
    return jsDay;
  }

  return null;
}

export function getTrainingDayLabel(
  timestamp: Date,
  userTimezone: string = TRAINING_TIMEZONE
): string {
  const dayNum = getTrainingDayNumber(timestamp, userTimezone);
  return dayNum ? `Day ${dayNum}` : "Rest Day";
}

export function isTrainingDay(date: Date, trainingDays: number[]): boolean {
  return trainingDays.includes(date.getDay());
}

export function getCurrentTrainingDate(
  userTimezone: string = TRAINING_TIMEZONE
): Date {
  return getTrainingDate(new Date(), userTimezone);
}

export function diffDays(fromDate: string, toDate: string) {
  const from = parseDate(fromDate).getTime();
  const to = parseDate(toDate).getTime();
  return Math.round((to - from) / 86400000);
}
