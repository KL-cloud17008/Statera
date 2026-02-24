"use server";

import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.user.findUnique({
    where: { supabaseUserId: user.id },
  });
}

export async function getStepsEntries(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

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
    },
  });
}

export async function getTodaySteps(userId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const log = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId, date: today } },
    select: { steps: true },
  });

  return log?.steps ?? null;
}

export async function logSteps(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const dateStr = formData.get("date") as string;
  const stepsStr = formData.get("steps") as string;

  if (!dateStr) return { error: "Date is required" };

  const steps = parseInt(stepsStr, 10);
  if (isNaN(steps) || steps < 0 || steps > 200000) {
    return { error: "Steps must be between 0 and 200,000" };
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  await prisma.dailyLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: { steps },
    create: { userId: user.id, date, steps },
  });

  revalidatePath("/steps");
  revalidatePath("/");
  return {};
}

export async function deleteStepsEntry(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Entry ID is required" };

  const existing = await prisma.dailyLog.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return { error: "Entry not found" };

  // Set steps to null rather than deleting the log (it may have other data)
  await prisma.dailyLog.update({
    where: { id },
    data: { steps: null },
  });

  revalidatePath("/steps");
  revalidatePath("/");
  return {};
}
