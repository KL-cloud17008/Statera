"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import {
  addDaysToDateString,
  getTodayDateString,
  parseDate,
} from "@/lib/dates";

type StepsActionError = {
  error: string;
};

type StepsActionResult =
  | {
      error?: undefined;
    }
  | StepsActionError;

type ParsedStepsPayload =
  | {
      date: Date;
      steps: number;
    }
  | StepsActionError;

export async function getStepsEntries(userId: string, days = 180, timezone?: string) {
  const since = parseDate(addDaysToDateString(getTodayDateString(timezone), -(days - 1)));

  return prisma.dailyLog.findMany({
    where: {
      userId,
      date: { gte: since },
      steps: { not: null },
    },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      steps: true,
      sleepHours: true,
      moodRating: true,
      notes: true,
    },
  });
}

export async function getTodaySteps(userId: string, timezone?: string) {
  const today = parseDate(getTodayDateString(timezone));

  const log = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId, date: today } },
    select: { steps: true },
  });

  return log?.steps ?? null;
}

function parseStepsPayload(formData: FormData): ParsedStepsPayload {
  const dateStr = formData.get("date") as string;
  const stepsStr = formData.get("steps") as string;

  if (!dateStr) {
    return { error: "Date is required" };
  }

  const steps = Number.parseInt(stepsStr, 10);
  if (Number.isNaN(steps) || steps < 0 || steps > 200000) {
    return { error: "Steps must be between 0 and 200,000" };
  }

  return {
    date: parseDate(dateStr),
    steps,
  };
}

export async function logSteps(formData: FormData): Promise<StepsActionResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = parseStepsPayload(formData);
  if ("error" in parsed) {
    return parsed;
  }

  await prisma.dailyLog.upsert({
    where: { userId_date: { userId: user.id, date: parsed.date } },
    update: { steps: parsed.steps },
    create: { userId: user.id, date: parsed.date, steps: parsed.steps },
  });

  revalidatePath("/steps");
  revalidatePath("/");
  return {};
}

export async function updateStepsEntry(
  formData: FormData
): Promise<StepsActionResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const id = formData.get("id") as string;
  if (!id) {
    return { error: "Entry ID is required" };
  }

  const parsed = parseStepsPayload(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const existing = await prisma.dailyLog.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return { error: "Entry not found" };
  }

  const target = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId: user.id, date: parsed.date } },
  });

  if (target && target.id !== existing.id) {
    await prisma.$transaction([
      prisma.dailyLog.update({
        where: { id: target.id },
        data: { steps: parsed.steps },
      }),
      prisma.dailyLog.update({
        where: { id: existing.id },
        data: { steps: null },
      }),
    ]);
  } else {
    await prisma.dailyLog.update({
      where: { id: existing.id },
      data: {
        date: parsed.date,
        steps: parsed.steps,
      },
    });
  }

  revalidatePath("/steps");
  revalidatePath("/");
  return {};
}

export async function deleteStepsEntry(
  formData: FormData
): Promise<StepsActionResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const id = formData.get("id") as string;
  if (!id) {
    return { error: "Entry ID is required" };
  }

  const existing = await prisma.dailyLog.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return { error: "Entry not found" };
  }

  await prisma.dailyLog.update({
    where: { id },
    data: { steps: null },
  });

  revalidatePath("/steps");
  revalidatePath("/");
  return {};
}
