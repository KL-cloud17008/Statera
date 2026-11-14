"use server";

import { revalidatePath } from "next/cache";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/db";
import { formText, measurementDate, validateMeasurementDate } from "@/lib/measurement-input";
import { getTodayDateString } from "@/lib/dates";
import { JOURNAL_ENTRY_ID, readRecoveryCheckIn, readSupplement, readWorkoutCheckIn, type JournalResult, type SupplementEntry } from "@/lib/training-journal";
import { trainingJournalInstalled } from "@/lib/training-journal-storage";
import { withWorkoutTransaction } from "@/lib/workout-transaction";

const unavailable = { error: "The training journal is temporarily unavailable." };
const changed = { error: "This entry changed elsewhere. Reload the journal and review it before saving again." };

function revisionMatches(form: FormData, current: { updatedAt: Date } | null) {
  return formText(form, "revision") === (current?.updatedAt.toISOString() ?? "");
}

function sameValues<T extends object>(current: T | null, values: Partial<T>) {
  return current != null && (Object.keys(values) as (keyof T)[]).every((key) => current[key] === values[key]);
}

export async function getTrainingJournal(date: string) {
  const user = await getOrCreateCurrentUser();
  if (!user) return null;
  const today = getTodayDateString(user.timezone);
  const selectedDate = validateMeasurementDate(date, user.timezone) ? today : date;
  if (!await trainingJournalInstalled()) return { available: false as const, date: selectedDate, today };
  const [recovery, supplements] = await Promise.all([
    prisma.recoveryCheckIn.findUnique({ where: { userId_date: { userId: user.id, date: measurementDate(selectedDate) } } }),
    prisma.supplementEntry.findMany({ where: { userId: user.id, date: measurementDate(selectedDate) }, orderBy: [{ time: "asc" }, { updatedAt: "asc" }] }),
  ]);
  return {
    available: true as const, date: selectedDate, today,
    recovery: recovery && { date: selectedDate, energy: recovery.energy, soreness: recovery.soreness, sleepHours: recovery.sleepHours, notes: recovery.notes, revision: recovery.updatedAt.toISOString() },
    supplements: supplements.map(({ id, name, amount, time, notes, updatedAt }) => ({ id, date: selectedDate, name, amount, time, notes, revision: updatedAt.toISOString() })),
  };
}

export async function getWorkoutCheckIn(sessionId: string) {
  const user = await getOrCreateCurrentUser();
  if (!user || !await trainingJournalInstalled()) return { available: false as const };
  const entry = await prisma.workoutCheckIn.findFirst({
    where: { workoutSessionId: sessionId, workoutSession: { userId: user.id, completed: true } },
  });
  return { available: true as const, entry: entry && { effort: entry.effort, notes: entry.notes, revision: entry.updatedAt.toISOString() } };
}

export async function saveWorkoutCheckIn(form: FormData): Promise<JournalResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Sign in to save your check-in." };
  const sessionId = formText(form, "sessionId");
  if (!sessionId || sessionId.length > 200) return { error: "Choose a completed workout." };
  const parsed = readWorkoutCheckIn(form);
  if ("error" in parsed) return { error: parsed.error };
  if (!await trainingJournalInstalled()) return unavailable;

  const result = await withWorkoutTransaction<JournalResult>(prisma, user.id, async (tx) => {
    const session = await tx.workoutSession.findFirst({ where: { id: sessionId, userId: user.id, completed: true }, select: { id: true } });
    if (!session) return { error: "Choose a completed workout from your history." };
    const key = { workoutSessionId: session.id };
    const current = await tx.workoutCheckIn.findUnique({ where: key });
    if (current && sameValues(current, parsed.values)) return { revision: current.updatedAt.toISOString() };
    if (!revisionMatches(form, current)) return changed;
    const saved = await tx.workoutCheckIn.upsert({ where: key, create: { ...key, ...parsed.values }, update: parsed.values });
    return { revision: saved.updatedAt.toISOString() };
  });
  if (!result.error) revalidatePath(`/workout/history/${sessionId}`);
  return result;
}

export async function saveRecoveryCheckIn(form: FormData): Promise<JournalResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Sign in to save your recovery check-in." };
  const date = formText(form, "date");
  const dateError = validateMeasurementDate(date, user.timezone);
  if (dateError) return { error: dateError };
  const parsed = readRecoveryCheckIn(form);
  if ("error" in parsed) return { error: parsed.error };
  if (!await trainingJournalInstalled()) return unavailable;

  const result = await withWorkoutTransaction<JournalResult>(prisma, user.id, async (tx) => {
    const key = { userId: user.id, date: measurementDate(date) };
    const where = { userId_date: key };
    const current = await tx.recoveryCheckIn.findUnique({ where });
    if (current && sameValues(current, parsed.values)) return { revision: current.updatedAt.toISOString() };
    if (!revisionMatches(form, current)) return changed;
    const saved = await tx.recoveryCheckIn.upsert({ where, create: { ...key, ...parsed.values }, update: parsed.values });
    return { revision: saved.updatedAt.toISOString() };
  });
  if (!result.error) {
    revalidatePath("/workout/journal");
    revalidatePath("/workout/suggestions");
  }
  return result;
}

export async function saveSupplement(form: FormData): Promise<JournalResult & { entry?: SupplementEntry }> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Sign in to save a supplement entry." };
  const id = formText(form, "id");
  if (!JOURNAL_ENTRY_ID.test(id)) return { error: "Reload before saving this entry." };
  const date = formText(form, "date");
  const dateError = validateMeasurementDate(date, user.timezone);
  if (dateError) return { error: dateError };
  const parsed = readSupplement(form);
  if ("error" in parsed) return { error: parsed.error };
  if (!await trainingJournalInstalled()) return unavailable;

  const result = await withWorkoutTransaction<JournalResult & { entry?: SupplementEntry }>(prisma, user.id, async (tx) => {
    const key = { userId: user.id, id };
    const where = { userId_id: key };
    const current = await tx.supplementEntry.findUnique({ where });
    const entryDate = measurementDate(date);
    const identical = current?.date.getTime() === entryDate.getTime() && sameValues(current, parsed.values);
    if (!identical && !revisionMatches(form, current)) return changed;
    const values = { ...parsed.values, date: entryDate };
    const saved = identical ? current : await tx.supplementEntry.upsert({ where, create: { ...key, ...values }, update: values });
    const revision = saved.updatedAt.toISOString();
    return { revision, entry: { ...parsed.values, id, date, revision } };
  });
  if (!result.error) revalidatePath("/workout/journal");
  return result;
}

export async function deleteSupplement(form: FormData): Promise<JournalResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Sign in to remove a supplement entry." };
  const id = formText(form, "id");
  if (!JOURNAL_ENTRY_ID.test(id)) return { error: "Choose a valid supplement entry." };
  if (!await trainingJournalInstalled()) return unavailable;
  const result = await withWorkoutTransaction<JournalResult>(prisma, user.id, async (tx) => {
    const where = { userId_id: { userId: user.id, id } };
    const current = await tx.supplementEntry.findUnique({ where });
    if (!current) return {};
    if (!revisionMatches(form, current)) return changed;
    await tx.supplementEntry.delete({ where });
    return {};
  });
  if (!result.error) revalidatePath("/workout/journal");
  return result;
}
