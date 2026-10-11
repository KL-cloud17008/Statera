"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { formText } from "@/lib/measurement-input";
import { withWorkoutTransaction } from "@/lib/workout-transaction";
import { getHomeCoreCalendar, HOME_CORE_LOG_TYPE, HOME_CORE_VERSION, type HomeCoreWeek } from "@/lib/home-core";

export async function getHomeCoreWeek(userId: string): Promise<HomeCoreWeek | null> {
  const user = await getOrCreateCurrentUser();
  if (!user || user.id !== userId) return null;
  const today = getHomeCoreCalendar(new Date(), user.timezone);
  const logs = await prisma.mobilityLog.findMany({
    where: { userId: user.id, type: HOME_CORE_LOG_TYPE, completed: true, date: { gte: today.weekStart, lte: today.calendarDate } },
    orderBy: { date: "asc" },
  });
  const completedDates = [...new Set(logs.map((log) => log.date.toISOString().slice(0, 10)))];
  const todayLog = logs.find((log) => log.date.toISOString().slice(0, 10) === today.date);
  // Restore the selected dose from earlier routines without rewriting their logs.
  const todayDose = [`${HOME_CORE_VERSION}:full`, "home-core-v1:full"].includes(todayLog?.version ?? "") ? "full" : [`${HOME_CORE_VERSION}:intro`, "home-core-v1:intro"].includes(todayLog?.version ?? "") ? "intro" : null;
  return { date: today.date, dayOfWeek: today.dayOfWeek, completedToday: completedDates.includes(today.date), completedDates, todayDose };
}

export async function logHomeCore(formData: FormData): Promise<{ error?: string }> {
  const user = await getOrCreateCurrentUser();
  if (!user) return { error: "Not authenticated" };
  const dose = formText(formData, "dose");
  if (dose !== "intro" && dose !== "full") return { error: "Choose one or two sets" };
  const { calendarDate } = getHomeCoreCalendar(new Date(), user.timezone);
  // The user row lock makes double taps and lost-response retries one completion.
  await withWorkoutTransaction(prisma, user.id, async (tx) => {
    const existing = await tx.mobilityLog.findFirst({ where: { userId: user.id, date: calendarDate, type: HOME_CORE_LOG_TYPE, completed: true } });
    if (existing) return;
    await tx.mobilityLog.create({ data: { userId: user.id, date: calendarDate, type: HOME_CORE_LOG_TYPE, version: `${HOME_CORE_VERSION}:${dose}`, completed: true } });
  });
  for (const path of ["/mobility", "/flexibility-balance", "/"]) revalidatePath(path);
  return {};
}
