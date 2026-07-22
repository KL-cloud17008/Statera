"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getTrainingDate } from "@/lib/dates";
import { getOrCreateCurrentUser } from "@/lib/current-user";

type MobilityActionResult = {
  error?: string;
};

export async function logMobility(
  formData: FormData
): Promise<MobilityActionResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const type = formData.get("type") as string;
  const version = (formData.get("version") as string) || "A";
  const notes = (formData.get("notes") as string) || null;

  if (!["PRE_WORKOUT", "POST_WORKOUT", "UNDO_SITTING", "BACK_CARE"].includes(type)) {
    return { error: "Invalid type" };
  }

  const trainingDate = getTrainingDate(new Date(), user.timezone);

  // Primer/recovery log once per day; desk resets and back care repeat as needed.
  if (type === "PRE_WORKOUT" || type === "POST_WORKOUT") {
    const existing = await prisma.mobilityLog.findFirst({
      where: {
        userId: user.id,
        date: trainingDate,
        type,
      },
    });

    if (existing) {
      return { error: "This routine is already logged for today" };
    }
  }

  await prisma.mobilityLog.create({
    data: {
      userId: user.id,
      date: trainingDate,
      type,
      version,
      completed: true,
      notes,
    },
  });

  revalidatePath("/mobility");
  revalidatePath("/");
  return {};
}

export async function getTodayMobilityLogs(userId: string, timezone: string) {
  const trainingDate = getTrainingDate(new Date(), timezone);
  return prisma.mobilityLog.findMany({
    where: { userId, date: trainingDate },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMobilityHistory(userId: string, limit = 30) {
  return prisma.mobilityLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: limit,
  });
}
