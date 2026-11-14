import { formText, parseMeasurementNumber } from "@/lib/measurement-input";

export const JOURNAL_NOTES_LIMIT = 500;
export const SUPPLEMENT_NAME_LIMIT = 100;
export const SUPPLEMENT_AMOUNT_LIMIT = 80;
export const CLOCK_TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
export const JOURNAL_ENTRY_ID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export type WorkoutCheckInValues = { effort: number; notes: string | null };
export type RecoveryValues = { energy: number; soreness: number; sleepHours: number | null; notes: string | null };
export type SupplementValues = { name: string; amount: string | null; time: string | null; notes: string | null };

export type JournalEntry<T> = T & { revision: string };
export type RecoveryEntry = JournalEntry<RecoveryValues> & { date: string };
export type SupplementEntry = JournalEntry<SupplementValues> & { id: string; date: string };

export type JournalResult = { error?: string; revision?: string };

function isRating(value: number | null, min: number, max: number): value is number {
  return value != null && Number.isInteger(value) && value >= min && value <= max;
}

export function readWorkoutCheckIn(form: FormData) {
  const effort = parseMeasurementNumber(formText(form, "effort"), true);
  const notes = formText(form, "notes");
  if (!isRating(effort, 1, 10)) return { error: "Choose an overall effort from 1 to 10." } as const;
  if (notes.length > JOURNAL_NOTES_LIMIT) return { error: "Keep notes to 500 characters." } as const;
  return { values: { effort, notes: notes || null } satisfies WorkoutCheckInValues } as const;
}

export function readRecoveryCheckIn(form: FormData) {
  const energy = parseMeasurementNumber(formText(form, "energy"), true);
  const soreness = parseMeasurementNumber(formText(form, "soreness"), true);
  const enteredSleep = formText(form, "sleepHours");
  const sleepHours = enteredSleep ? parseMeasurementNumber(enteredSleep) : null;
  const notes = formText(form, "notes");
  if (!isRating(energy, 1, 5)) return { error: "Choose an energy level from 1 to 5." } as const;
  if (!isRating(soreness, 0, 10)) return { error: "Choose a soreness level from 0 to 10." } as const;
  if (enteredSleep && (sleepHours == null || sleepHours > 24)) return { error: "Enter sleep between 0 and 24 hours." } as const;
  if (notes.length > JOURNAL_NOTES_LIMIT) return { error: "Keep notes to 500 characters." } as const;
  return { values: { energy, soreness, sleepHours, notes: notes || null } satisfies RecoveryValues } as const;
}

export function readSupplement(form: FormData) {
  const name = formText(form, "name");
  const amount = formText(form, "amount");
  const time = formText(form, "time");
  const notes = formText(form, "notes");
  if (!name || name.length > SUPPLEMENT_NAME_LIMIT) return { error: "Enter a supplement name up to 100 characters." } as const;
  if (amount.length > SUPPLEMENT_AMOUNT_LIMIT) return { error: "Keep the amount to 80 characters." } as const;
  if (time && !CLOCK_TIME.test(time)) return { error: "Enter a valid time." } as const;
  if (notes.length > JOURNAL_NOTES_LIMIT) return { error: "Keep notes to 500 characters." } as const;
  return { values: { name, amount: amount || null, time: time || null, notes: notes || null } satisfies SupplementValues } as const;
}
