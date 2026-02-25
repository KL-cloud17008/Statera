/**
 * Training day boundary logic.
 *
 * Training days are Day 1 through Day 5, starting Sunday night
 * and ending Thursday night. Sessions happen at 2-4 AM.
 *
 * The training day boundary is 12:00 PM noon America/New_York:
 *   Day 1: Sunday noon → Monday noon
 *   Day 2: Monday noon → Tuesday noon
 *   Day 3: Tuesday noon → Wednesday noon
 *   Day 4: Wednesday noon → Thursday noon
 *   Day 5: Thursday noon → Friday noon
 *   Rest:  Friday noon → Sunday noon
 *
 * All date calculations use America/New_York timezone.
 */

import { TRAINING_TIMEZONE } from "./constants";

/**
 * Convert a UTC Date to a local date in the training timezone.
 */
export function toLocalDate(date: Date, timezone: string = TRAINING_TIMEZONE): Date {
  const local = new Date(
    date.toLocaleString("en-US", { timeZone: timezone })
  );
  return local;
}

/**
 * Get the training date for a given timestamp.
 * Before noon → current calendar date.
 * After noon  → next calendar date.
 * Always uses America/New_York timezone.
 */
export function getTrainingDate(timestamp: Date, _userTimezone?: string): Date {
  const localTime = toLocalDate(timestamp, TRAINING_TIMEZONE);
  const hour = localTime.getHours();

  if (hour < 12) {
    // Training date = today's calendar date
    return startOfDay(localTime);
  } else {
    // Training date = tomorrow
    const tomorrow = new Date(localTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return startOfDay(tomorrow);
  }
}

/**
 * Get start of day (midnight) for a date.
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format a date as YYYY-MM-DD.
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a Date (at midnight local).
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get the day of week (0=Sun, 1=Mon, ..., 6=Sat) for a training date.
 */
export function getTrainingDayOfWeek(
  timestamp: Date,
  _userTimezone?: string
): number {
  const trainingDate = getTrainingDate(timestamp);
  return trainingDate.getDay();
}

/**
 * Get the training day number (1-5) for a given timestamp, or null if rest day.
 *
 * Training date JS day → training day number:
 *   1 (Mon) → Day 1 (Sunday night session)
 *   2 (Tue) → Day 2 (Monday night session)
 *   3 (Wed) → Day 3 (Tuesday night session)
 *   4 (Thu) → Day 4 (Wednesday night session)
 *   5 (Fri) → Day 5 (Thursday night session)
 *   0 (Sun), 6 (Sat) → Rest day
 */
export function getTrainingDayNumber(timestamp: Date): number | null {
  const trainingDate = getTrainingDate(timestamp);
  const jsDay = trainingDate.getDay(); // 0=Sun...6=Sat
  if (jsDay >= 1 && jsDay <= 5) return jsDay;
  return null; // rest day (Sat or Sun)
}

/**
 * Get the training day label for a given timestamp.
 * Returns "Day 1" through "Day 5", or "Rest Day".
 */
export function getTrainingDayLabel(timestamp: Date): string {
  const dayNum = getTrainingDayNumber(timestamp);
  return dayNum ? `Day ${dayNum}` : "Rest Day";
}

/**
 * Check if a given date is a training day.
 */
export function isTrainingDay(
  date: Date,
  trainingDays: number[]
): boolean {
  return trainingDays.includes(date.getDay());
}

/**
 * Get the current training date based on the current time.
 * Always uses America/New_York timezone.
 */
export function getCurrentTrainingDate(_userTimezone?: string): Date {
  return getTrainingDate(new Date());
}
