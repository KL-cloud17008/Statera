"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { addDaysToDateString, getTodayDateString } from "@/lib/dates";
import { formText, measurementDate, parseMeasurementNumber, validateMeasurementDate } from "@/lib/measurement-input";

type StepsActionResult = { error?: string };

export async function getStepsEntries(userId: string, days = 180, timezone?: string) {
  const user = await getOrCreateCurrentUser();
  if (!user || user.id !== userId) return [];
  const safeDays = Number.isInteger(days) ? Math.max(1, Math.min(days, 3650)) : 180;
  const today = getTodayDateString(user.timezone ?? timezone);
  const since = measurementDate(addDaysToDateString(today, -(safeDays - 1)));

  return prisma.dailyLog.findMany({
    where: { userId: user.id, date: { gte: since, lte: measurementDate(today) }, steps: { not: null } },
    orderBy: { date: "desc" },
    select: { id: true, date: true, steps: true, sleepHours: true, moodRating: true, notes: true },
  });
}

export async function getTodaySteps(userId: string, timezone?: string) {
  const user = await getOrCreateCurrentUser();
  if (!user || user.id !== userId) return null;
  const today = measurementDate(getTodayDateString(user.timezone ?? timezone));
  const log = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
    select: { steps: true },
  });
  return log?.steps ?? null;
}

function parseStepsPayload(formData: FormData, timezone: string) {
  const dateStr = formText(formData, "date");
  const error = validateMeasurementDate(dateStr, timezone);
  if (error) return { error };
  const steps = parseMeasurementNumber(formText(formData, "steps"), true);
  if (steps == null || steps < 0 || steps > 200000) {
    return { error: "Steps must be a whole number between 0 and 200,000" };
  }
  return { date: measurementDate(dateStr), steps };
}

function refreshSteps() {
  revalidatePath("/steps");
  revalidatePath("/");
  revalidatePath("/workout");
  revalidatePath("/mobility");
}

export async function logSteps(formData: FormData): Promise<StepsActionResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const parsed = parseStepsPayload(formData, user.timezone);
  if ("error" in parsed) return { error: parsed.error };
  await prisma.dailyLog.upsert({
    where: { userId_date: { userId: user.id, date: parsed.date } },
    update: { steps: parsed.steps },
    create: { userId: user.id, date: parsed.date, steps: parsed.steps },
  });
  refreshSteps();
  return {};
}

export async function updateStepsEntry(formData: FormData): Promise<StepsActionResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const id = formText(formData, "id");
  if (!id) return { error: "Entry ID is required" };
  const parsed = parseStepsPayload(formData, user.timezone);
  if ("error" in parsed) return { error: parsed.error };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.dailyLog.findFirst({ where: { id, userId: user.id } });
      if (!existing) return { error: "Entry changed or was removed. Refresh to see the latest total." };

      const originalSteps = formText(formData, "originalSteps");
      const originalDate = formText(formData, "originalDate");
      const sameDate = existing.date.getTime() === parsed.date.getTime();
      // A lost response must be safe to retry, including a move that already
      // cleared the source count. Confirm the requested result without writing.
      if (sameDate && existing.steps === parsed.steps) return {};
      if (existing.steps == null) {
        if (!sameDate && originalDate === existing.date.toISOString().slice(0, 10)) {
          const moved = await tx.dailyLog.findUnique({
            where: { userId_date: { userId: user.id, date: parsed.date } },
          });
          if (moved?.steps === parsed.steps) return {};
        }
        return { error: "Entry changed or was removed. Refresh to see the latest total." };
      }
      if ((originalSteps && Number(originalSteps) !== existing.steps) ||
        (originalDate && originalDate !== existing.date.toISOString().slice(0, 10))) {
        return { error: "This entry changed elsewhere. Refresh before saving your correction." };
      }

      if (sameDate) {
        await tx.dailyLog.update({ where: { id, userId: user.id }, data: { steps: parsed.steps } });
        return {};
      }

      const target = await tx.dailyLog.findUnique({
        where: { userId_date: { userId: user.id, date: parsed.date } },
      });
      if (target?.steps != null) {
        return { error: "That date already has steps. Edit its entry, or choose another date." };
      }
      // Move only steps. Sleep, mood and notes belong to their original dates.
      await tx.dailyLog.upsert({
        where: { userId_date: { userId: user.id, date: parsed.date } },
        update: { steps: parsed.steps },
        create: { userId: user.id, date: parsed.date, steps: parsed.steps },
      });
      await tx.dailyLog.update({ where: { id, userId: user.id }, data: { steps: null } });
      return {};
    }, { isolationLevel: "Serializable" });
    if (result.error) return result;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2034") {
      return { error: "Another save arrived at the same time. Refresh and check the totals before retrying." };
    }
    throw error;
  }

  refreshSteps();
  return {};
}

export async function deleteStepsEntry(formData: FormData): Promise<StepsActionResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const id = formText(formData, "id");
  if (!id) return { error: "Entry ID is required" };
  const deleted = await prisma.dailyLog.updateMany({ where: { id, userId: user.id }, data: { steps: null } });
  if (!deleted.count) return { error: "Entry not found" };
  refreshSteps();
  return {};
}
