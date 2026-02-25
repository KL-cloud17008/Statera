"use server";

import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getTrainingDate } from "@/lib/dates";

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({ where: { supabaseUserId: user.id } });
}

export async function getWorkoutPlans(userId: string) {
  return prisma.workoutPlan.findMany({
    where: { userId, isActive: true },
    include: {
      exercises: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { dayOfWeek: "asc" },
  });
}

export async function getTodaysPlan(userId: string, _timezone?: string) {
  const now = new Date();
  const { getTrainingDayNumber } = await import("@/lib/dates");
  const dayNum = getTrainingDayNumber(now); // 1-5 or null (rest)

  if (!dayNum) return null;

  return prisma.workoutPlan.findFirst({
    where: { userId, dayOfWeek: dayNum, isActive: true },
    include: {
      exercises: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function startWorkoutSession(planId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const plan = await prisma.workoutPlan.findFirst({
    where: { id: planId, userId: user.id },
  });
  if (!plan) return { error: "Plan not found" };

  const now = new Date();
  const trainingDate = getTrainingDate(now, user.timezone);

  // Check for existing session today
  const existing = await prisma.workoutSession.findFirst({
    where: {
      userId: user.id,
      workoutPlanId: planId,
      trainingDate,
    },
  });

  if (existing) {
    return { sessionId: existing.id };
  }

  const session = await prisma.workoutSession.create({
    data: {
      userId: user.id,
      workoutPlanId: planId,
      date: now,
      trainingDate,
      startTime: now,
      weekNumber: 1,
    },
  });

  revalidatePath("/workout");
  revalidatePath("/");
  return { sessionId: session.id };
}

export async function logSet(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const sessionId = formData.get("sessionId") as string;
  const planExerciseId = (formData.get("planExerciseId") as string) || null;
  const exerciseName = formData.get("exerciseName") as string;
  const setNumber = parseInt(formData.get("setNumber") as string, 10);
  const weightUsed = formData.get("weightUsed")
    ? parseFloat(formData.get("weightUsed") as string)
    : null;
  const repsCompleted = formData.get("repsCompleted")
    ? parseInt(formData.get("repsCompleted") as string, 10)
    : null;
  const actualRPE = formData.get("actualRPE")
    ? parseInt(formData.get("actualRPE") as string, 10)
    : null;
  const duration = formData.get("duration")
    ? parseInt(formData.get("duration") as string, 10)
    : null;
  const isAMRAP = formData.get("isAMRAP") === "true";
  const notes = (formData.get("notes") as string) || null;

  // Verify session ownership
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: user.id },
  });
  if (!session) return { error: "Session not found" };

  // Check for existing set (update) or create new
  const existingSet = await prisma.sessionSet.findFirst({
    where: {
      workoutSessionId: sessionId,
      exerciseName,
      setNumber,
    },
  });

  if (existingSet) {
    await prisma.sessionSet.update({
      where: { id: existingSet.id },
      data: { weightUsed, repsCompleted, actualRPE, duration, isAMRAP, notes },
    });
  } else {
    await prisma.sessionSet.create({
      data: {
        workoutSessionId: sessionId,
        planExerciseId,
        exerciseName,
        setNumber,
        weightUsed,
        repsCompleted,
        actualRPE,
        duration,
        isAMRAP,
        notes,
      },
    });
  }

  revalidatePath("/workout");
  return {};
}

export async function completeSession(sessionId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: user.id },
  });
  if (!session) return { error: "Session not found" };

  await prisma.workoutSession.update({
    where: { id: sessionId },
    data: { completed: true, endTime: new Date() },
  });

  revalidatePath("/workout");
  revalidatePath("/");
  return {};
}

export async function getSessionWithSets(sessionId: string) {
  return prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      sets: { orderBy: [{ exerciseName: "asc" }, { setNumber: "asc" }] },
      workoutPlan: {
        include: { exercises: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}

export async function getRecentSessions(userId: string, limit = 10) {
  return prisma.workoutSession.findMany({
    where: { userId, completed: true },
    include: {
      sets: true,
      workoutPlan: true,
    },
    orderBy: { trainingDate: "desc" },
    take: limit,
  });
}

export async function getPreviousSessionSets(
  userId: string,
  planId: string
): Promise<
  { exerciseName: string; setNumber: number; weightUsed: number | null; repsCompleted: number | null }[]
> {
  const prevSession = await prisma.workoutSession.findFirst({
    where: {
      userId,
      workoutPlanId: planId,
      completed: true,
    },
    orderBy: { trainingDate: "desc" },
    include: {
      sets: { orderBy: [{ exerciseName: "asc" }, { setNumber: "asc" }] },
    },
  });

  if (!prevSession) return [];
  return prevSession.sets.map((s) => ({
    exerciseName: s.exerciseName,
    setNumber: s.setNumber,
    weightUsed: s.weightUsed,
    repsCompleted: s.repsCompleted,
  }));
}

export async function getExerciseHistory(userId: string, exerciseName: string) {
  return prisma.sessionSet.findMany({
    where: {
      exerciseName,
      workoutSession: { userId },
    },
    include: {
      workoutSession: { select: { trainingDate: true, date: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
