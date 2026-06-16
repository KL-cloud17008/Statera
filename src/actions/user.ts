"use server";

import { prisma } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { parseDate } from "@/lib/dates";
import { revalidatePath } from "next/cache";
import { WORKOUT_LOAD_UNIT, cmToInches, workoutLoadToKg } from "@/lib/units";
import { getWorkoutSessionLoadUnit } from "@/lib/workout-session-meta";

type WeighInStatus = "BASELINE" | "FASTING" | "NORMAL";

type BackupProfile = {
  email?: string;
  heightInches?: number | null;
  startWeight?: number | null;
  goalWeight?: number | null;
  timezone?: string;
  caloricTarget?: number | null;
  proteinTarget?: number | null;
  carbTarget?: number | null;
  fatTarget?: number | null;
};

type BackupWeightEntry = {
  date: string;
  weight: number;
  bodyFatPercent?: number | null;
  status?: WeighInStatus;
  timeOfDay?: string | null;
  notes?: string | null;
};

type BackupDailyLog = {
  date: string;
  sleepHours?: number | null;
  moodRating?: number | null;
  steps?: number | null;
  notes?: string | null;
};

type BackupPlanExercise = {
  exerciseName: string;
  sets: number;
  reps: string;
  tempo?: string | null;
  restSeconds?: number | null;
  targetRPE?: string | null;
  cues?: string | null;
  supersetGroup?: string | null;
  exerciseType?: string;
  sortOrder?: number;
};

type BackupWorkoutPlan = {
  id?: string;
  dayOfWeek: number;
  sessionName: string;
  weekNumber?: number;
  isActive?: boolean;
  exercises?: BackupPlanExercise[];
};

type BackupSessionSet = {
  exerciseName: string;
  setNumber: number;
  // Workout loads use kg when session notes contain loadUnit: "kg".
  // Sessions without loadUnit are legacy exports and are treated as implicit pounds.
  weightUsed?: number | null;
  repsCompleted?: number | null;
  actualRPE?: number | null;
  duration?: number | null;
  isAMRAP?: boolean;
  notes?: string | null;
};

type BackupWorkoutSession = {
  workoutPlanId?: string | null;
  date: string;
  trainingDate: string;
  startTime?: string | null;
  endTime?: string | null;
  notes?: string | null;
  weekNumber?: number;
  completed?: boolean;
  sets?: BackupSessionSet[];
};

type BackupMobilityLog = {
  date: string;
  type: string;
  version: string;
  completed?: boolean;
  notes?: string | null;
};

type BackupSavedFood = {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string | null;
};

type BackupSavedMealItem = {
  savedFoodId: string;
  quantity?: number;
};

type BackupSavedMeal = {
  name: string;
  items?: BackupSavedMealItem[];
};

type BackupNutritionEntry = {
  mealLabel: string;
  foodName: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingSize?: string | null;
  sortOrder?: number;
};

type BackupNutritionDay = {
  date: string;
  entries?: BackupNutritionEntry[];
};

type BackupProgressPhoto = {
  date: string;
  imageUrl: string;
  notes?: string | null;
};

type BackupPayload = {
  version?: number;
  exportedAt?: string;
  profile?: BackupProfile;
  weightEntries?: BackupWeightEntry[];
  dailyLogs?: BackupDailyLog[];
  workoutPlans?: BackupWorkoutPlan[];
  workoutSessions?: BackupWorkoutSession[];
  mobilityLogs?: BackupMobilityLog[];
  nutritionDays?: BackupNutritionDay[];
  savedFoods?: BackupSavedFood[];
  savedMeals?: BackupSavedMeal[];
  progressPhotos?: BackupProgressPhoto[];
};

const BACKUP_COLLECTION_KEYS = [
  "weightEntries",
  "dailyLogs",
  "workoutPlans",
  "workoutSessions",
  "mobilityLogs",
  "nutritionDays",
  "savedFoods",
  "savedMeals",
  "progressPhotos",
] as const;

type ExportedDailyLog = {
  date: Date;
  sleepHours: number | null;
  moodRating: number | null;
  steps: number | null;
  notes: string | null;
};

type ExportedSessionSet = {
  exerciseName: string;
  setNumber: number;
  weightUsed: number | null;
  repsCompleted: number | null;
  actualRPE: number | null;
  notes: string | null;
};

type ExportedWorkoutSession = {
  trainingDate: Date;
  workoutPlanId: string | null;
  notes: string | null;
  completed: boolean;
  sets: ExportedSessionSet[];
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidTimeZone(timezone: string) {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function hasRecognizedBackupPayload(payload: BackupPayload) {
  return (
    typeof payload.version === "number" ||
    isPlainObject(payload.profile) ||
    BACKUP_COLLECTION_KEYS.some((key) => Array.isArray(payload[key]))
  );
}

function revalidateAllUserRoutes() {
  revalidatePath("/");
  revalidatePath("/steps");
  revalidatePath("/weight");
  revalidatePath("/workout");
  revalidatePath("/mobility");
  revalidatePath("/settings");
}

export async function updateUserProfile(formData: FormData) {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const heightCmStr = formData.get("heightCm") as string;
  const startWeightStr = formData.get("startWeight") as string;
  const goalWeightStr = formData.get("goalWeight") as string;
  const timezone = ((formData.get("timezone") as string) || user.timezone).trim();

  const heightCm = heightCmStr ? Number.parseFloat(heightCmStr) : null;
  const heightInches = heightCm != null ? Math.round(cmToInches(heightCm)) : null;
  const startWeight = startWeightStr ? Number.parseFloat(startWeightStr) : null;
  const goalWeight = goalWeightStr ? Number.parseFloat(goalWeightStr) : null;

  if (
    heightCm != null &&
    (Number.isNaN(heightCm) || heightCm < 91 || heightCm > 244)
  ) {
    return { error: "Height must be between 91 and 244 cm" };
  }

  if (
    startWeight != null &&
    (Number.isNaN(startWeight) || startWeight < 50 || startWeight > 999)
  ) {
    return { error: "Start weight must be between 50 and 999 lbs" };
  }

  if (
    goalWeight != null &&
    (Number.isNaN(goalWeight) || goalWeight < 50 || goalWeight > 999)
  ) {
    return { error: "Goal weight must be between 50 and 999 lbs" };
  }

  if (!timezone || !isValidTimeZone(timezone)) {
    return { error: "Enter a valid IANA timezone, such as America/New_York" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      heightInches,
      startWeight,
      goalWeight,
      timezone,
    },
  });

  revalidatePath("/");
  revalidatePath("/weight");
  revalidatePath("/workout");
  revalidatePath("/settings");
  return {};
}

export async function exportUserData() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated", payload: null };
  }

  const [
    weightEntries,
    dailyLogs,
    workoutPlans,
    workoutSessions,
    mobilityLogs,
    nutritionDays,
    savedFoods,
    savedMeals,
    progressPhotos,
  ] = await Promise.all([
    prisma.weightEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    }),
    prisma.dailyLog.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    }),
    prisma.workoutPlan.findMany({
      where: { userId: user.id },
      include: { exercises: { orderBy: { sortOrder: "asc" } } },
      orderBy: { dayOfWeek: "asc" },
    }),
    prisma.workoutSession.findMany({
      where: { userId: user.id },
      include: { sets: { orderBy: { createdAt: "asc" } } },
      orderBy: { trainingDate: "asc" },
    }),
    prisma.mobilityLog.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    }),
    prisma.nutritionDay.findMany({
      where: { userId: user.id },
      include: { entries: { orderBy: { sortOrder: "asc" } } },
      orderBy: { date: "asc" },
    }),
    prisma.savedFood.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.savedMeal.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { name: "asc" },
    }),
    prisma.progressPhoto.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    }),
  ]);

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: {
      email: user.email,
      heightInches: user.heightInches,
      startWeight: user.startWeight,
      goalWeight: user.goalWeight,
      timezone: user.timezone,
      caloricTarget: user.caloricTarget,
      proteinTarget: user.proteinTarget,
      carbTarget: user.carbTarget,
      fatTarget: user.fatTarget,
    },
    weightEntries,
    dailyLogs,
    workoutPlans,
    workoutSessions,
    mobilityLogs,
    nutritionDays,
    savedFoods,
    savedMeals,
    progressPhotos,
  };

  const stepsCsv = [
    "Date,Steps,Sleep Hours,Mood Rating,Notes",
    ...dailyLogs.map(
      (log: ExportedDailyLog) =>
        `${log.date.toISOString().split("T")[0]},${log.steps ?? ""},${log.sleepHours ?? ""},${log.moodRating ?? ""},${JSON.stringify(log.notes ?? "")}`
    ),
  ].join("\n");

  const workoutsCsv = [
    `Training Date,Session,Completed,Exercise,Set,Weight (${WORKOUT_LOAD_UNIT}),Reps,RPE,Notes`,
    ...workoutSessions.flatMap((session: ExportedWorkoutSession) => {
      const loadUnit = getWorkoutSessionLoadUnit(session.notes);
      return session.sets.map((set: ExportedSessionSet) => {
        const label = session.notes || session.workoutPlanId || "Free Session";
        const weightKg = workoutLoadToKg(set.weightUsed, loadUnit);
        const exportedWeight = weightKg != null ? Number(weightKg.toFixed(2)) : "";
        return `${session.trainingDate.toISOString().split("T")[0]},${JSON.stringify(label)},${session.completed},${JSON.stringify(set.exerciseName)},${set.setNumber},${exportedWeight},${set.repsCompleted ?? ""},${set.actualRPE ?? ""},${JSON.stringify(set.notes ?? "")}`;
      });
    }),
  ].join("\n");

  return {
    payload,
    csv: {
      steps: stepsCsv,
      workouts: workoutsCsv,
    },
  };
}

export async function clearAllUserData() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  await prisma.$transaction([
    prisma.sessionSet.deleteMany({ where: { workoutSession: { userId: user.id } } }),
    prisma.workoutSession.deleteMany({ where: { userId: user.id } }),
    prisma.planExercise.deleteMany({ where: { workoutPlan: { userId: user.id } } }),
    prisma.workoutPlan.deleteMany({ where: { userId: user.id } }),
    prisma.weightEntry.deleteMany({ where: { userId: user.id } }),
    prisma.dailyLog.deleteMany({ where: { userId: user.id } }),
    prisma.mobilityLog.deleteMany({ where: { userId: user.id } }),
    prisma.nutritionEntry.deleteMany({ where: { nutritionDay: { userId: user.id } } }),
    prisma.nutritionDay.deleteMany({ where: { userId: user.id } }),
    prisma.savedMealItem.deleteMany({ where: { savedMeal: { userId: user.id } } }),
    prisma.savedMeal.deleteMany({ where: { userId: user.id } }),
    prisma.savedFood.deleteMany({ where: { userId: user.id } }),
    prisma.progressPhoto.deleteMany({ where: { userId: user.id } }),
  ]);

  revalidateAllUserRoutes();
  return {};
}

export async function importUserData(formData: FormData) {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const json = formData.get("json") as string;
  if (!json) {
    return { error: "No backup data provided" };
  }

  let payload: BackupPayload;
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!isPlainObject(parsed)) {
      return { error: "Invalid backup format" };
    }
    payload = parsed as BackupPayload;
  } catch {
    return { error: "Invalid backup format" };
  }

  if (!hasRecognizedBackupPayload(payload)) {
    return { error: "Backup file is missing tracker data" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.sessionSet.deleteMany({ where: { workoutSession: { userId: user.id } } });
    await tx.workoutSession.deleteMany({ where: { userId: user.id } });
    await tx.planExercise.deleteMany({ where: { workoutPlan: { userId: user.id } } });
    await tx.workoutPlan.deleteMany({ where: { userId: user.id } });
    await tx.weightEntry.deleteMany({ where: { userId: user.id } });
    await tx.dailyLog.deleteMany({ where: { userId: user.id } });
    await tx.mobilityLog.deleteMany({ where: { userId: user.id } });
    await tx.nutritionEntry.deleteMany({ where: { nutritionDay: { userId: user.id } } });
    await tx.nutritionDay.deleteMany({ where: { userId: user.id } });
    await tx.savedMealItem.deleteMany({ where: { savedMeal: { userId: user.id } } });
    await tx.savedMeal.deleteMany({ where: { userId: user.id } });
    await tx.savedFood.deleteMany({ where: { userId: user.id } });
    await tx.progressPhoto.deleteMany({ where: { userId: user.id } });

    await tx.user.update({
      where: { id: user.id },
      data: {
        heightInches: payload.profile?.heightInches ?? null,
        startWeight: payload.profile?.startWeight ?? null,
        goalWeight: payload.profile?.goalWeight ?? null,
        timezone: payload.profile?.timezone || user.timezone,
        caloricTarget: payload.profile?.caloricTarget ?? user.caloricTarget,
        proteinTarget: payload.profile?.proteinTarget ?? user.proteinTarget,
        carbTarget: payload.profile?.carbTarget ?? user.carbTarget,
        fatTarget: payload.profile?.fatTarget ?? user.fatTarget,
      },
    });

    const weightEntries = (payload.weightEntries ?? []).filter(
      (entry) => typeof entry.date === "string" && typeof entry.weight === "number"
    );
    if (weightEntries.length > 0) {
      await tx.weightEntry.createMany({
        data: weightEntries.map((entry) => ({
          userId: user.id,
          date: parseDate(entry.date),
          weight: entry.weight,
          bodyFatPercent: entry.bodyFatPercent ?? null,
          status: entry.status ?? "NORMAL",
          timeOfDay: entry.timeOfDay ?? null,
          notes: entry.notes ?? null,
        })),
      });
    }

    const dailyLogs = (payload.dailyLogs ?? []).filter(
      (entry) => typeof entry.date === "string"
    );
    if (dailyLogs.length > 0) {
      await tx.dailyLog.createMany({
        data: dailyLogs.map((entry) => ({
          userId: user.id,
          date: parseDate(entry.date),
          sleepHours: entry.sleepHours ?? null,
          moodRating: entry.moodRating ?? null,
          steps: entry.steps ?? null,
          notes: entry.notes ?? null,
        })),
      });
    }

    const planIdMap = new Map<string, string>();
    const workoutPlans = (payload.workoutPlans ?? []).filter(
      (plan) => typeof plan.dayOfWeek === "number" && typeof plan.sessionName === "string"
    );
    for (const plan of workoutPlans) {
      const createdPlan = await tx.workoutPlan.create({
        data: {
          userId: user.id,
          dayOfWeek: plan.dayOfWeek,
          sessionName: plan.sessionName,
          weekNumber: plan.weekNumber ?? 1,
          isActive: plan.isActive ?? true,
        },
      });

      if (plan.id) {
        planIdMap.set(plan.id, createdPlan.id);
      }

      const exercises = (plan.exercises ?? []).filter(
        (exercise) =>
          typeof exercise.exerciseName === "string" &&
          typeof exercise.sets === "number" &&
          typeof exercise.reps === "string"
      );

      if (exercises.length > 0) {
        await tx.planExercise.createMany({
          data: exercises.map((exercise, index) => ({
            workoutPlanId: createdPlan.id,
            exerciseName: exercise.exerciseName,
            sets: exercise.sets,
            reps: exercise.reps,
            tempo: exercise.tempo ?? null,
            restSeconds: exercise.restSeconds ?? null,
            targetRPE: exercise.targetRPE ?? null,
            cues: exercise.cues ?? null,
            supersetGroup: exercise.supersetGroup ?? null,
            exerciseType: exercise.exerciseType ?? "WORKING",
            sortOrder: exercise.sortOrder ?? index,
          })),
        });
      }
    }

    const workoutSessions = (payload.workoutSessions ?? []).filter(
      (session) =>
        typeof session.date === "string" &&
        typeof session.trainingDate === "string"
    );
    for (const session of workoutSessions) {
      const createdSession = await tx.workoutSession.create({
        data: {
          userId: user.id,
          workoutPlanId: session.workoutPlanId
            ? planIdMap.get(session.workoutPlanId) ?? null
            : null,
          date: parseDate(session.date),
          trainingDate: parseDate(session.trainingDate),
          startTime: session.startTime ? new Date(session.startTime) : null,
          endTime: session.endTime ? new Date(session.endTime) : null,
          notes: session.notes ?? null,
          weekNumber: session.weekNumber ?? 1,
          completed: session.completed ?? false,
        },
      });

      const sets = (session.sets ?? []).filter(
        (set) =>
          typeof set.exerciseName === "string" &&
          typeof set.setNumber === "number"
      );

      if (sets.length > 0) {
        await tx.sessionSet.createMany({
          data: sets.map((set) => ({
            workoutSessionId: createdSession.id,
            exerciseName: set.exerciseName,
            setNumber: set.setNumber,
            weightUsed: set.weightUsed ?? null,
            repsCompleted: set.repsCompleted ?? null,
            actualRPE: set.actualRPE ?? null,
            duration: set.duration ?? null,
            isAMRAP: set.isAMRAP ?? false,
            notes: set.notes ?? null,
          })),
        });
      }
    }

    const mobilityLogs = (payload.mobilityLogs ?? []).filter(
      (entry) =>
        typeof entry.date === "string" &&
        typeof entry.type === "string" &&
        typeof entry.version === "string"
    );
    if (mobilityLogs.length > 0) {
      await tx.mobilityLog.createMany({
        data: mobilityLogs.map((entry) => ({
          userId: user.id,
          date: parseDate(entry.date),
          type: entry.type,
          version: entry.version,
          completed: entry.completed ?? true,
          notes: entry.notes ?? null,
        })),
      });
    }

    const savedFoods = (payload.savedFoods ?? []).filter(
      (food) =>
        typeof food.name === "string" &&
        typeof food.calories === "number" &&
        typeof food.protein === "number" &&
        typeof food.carbs === "number" &&
        typeof food.fat === "number"
    );

    if (savedFoods.length > 0) {
      const createdFoods = await Promise.all(
        savedFoods.map((food) =>
          tx.savedFood.create({
            data: {
              userId: user.id,
              name: food.name,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fat,
              servingSize: food.servingSize ?? null,
            },
          })
        )
      );

      const foodIdMap = new Map<string, string>();
      savedFoods.forEach((food, index) => {
        if (food.id) {
          foodIdMap.set(food.id, createdFoods[index].id);
        }
      });

      const savedMeals = (payload.savedMeals ?? []).filter(
        (meal) => typeof meal.name === "string"
      );
      for (const meal of savedMeals) {
        const createdMeal = await tx.savedMeal.create({
          data: {
            userId: user.id,
            name: meal.name,
          },
        });

        const items = (meal.items ?? []).filter(
          (item) => typeof item.savedFoodId === "string"
        );

        if (items.length > 0) {
          await tx.savedMealItem.createMany({
            data: items.map((item) => ({
              savedMealId: createdMeal.id,
              savedFoodId:
                foodIdMap.get(item.savedFoodId) ?? item.savedFoodId,
              quantity: item.quantity ?? 1,
            })),
          });
        }
      }
    }

    const nutritionDays = (payload.nutritionDays ?? []).filter(
      (day) => typeof day.date === "string"
    );
    for (const day of nutritionDays) {
      const createdDay = await tx.nutritionDay.create({
        data: {
          userId: user.id,
          date: parseDate(day.date),
        },
      });

      const entries = (day.entries ?? []).filter(
        (entry) =>
          typeof entry.mealLabel === "string" &&
          typeof entry.foodName === "string"
      );

      if (entries.length > 0) {
        await tx.nutritionEntry.createMany({
          data: entries.map((entry) => ({
            nutritionDayId: createdDay.id,
            mealLabel: entry.mealLabel,
            foodName: entry.foodName,
            calories: entry.calories ?? 0,
            protein: entry.protein ?? 0,
            carbs: entry.carbs ?? 0,
            fat: entry.fat ?? 0,
            servingSize: entry.servingSize ?? null,
            sortOrder: entry.sortOrder ?? 0,
          })),
        });
      }
    }

    const progressPhotos = (payload.progressPhotos ?? []).filter(
      (photo) =>
        typeof photo.date === "string" &&
        typeof photo.imageUrl === "string"
    );
    if (progressPhotos.length > 0) {
      await tx.progressPhoto.createMany({
        data: progressPhotos.map((photo) => ({
          userId: user.id,
          date: parseDate(photo.date),
          imageUrl: photo.imageUrl,
          notes: photo.notes ?? null,
        })),
      });
    }
  });

  revalidateAllUserRoutes();
  return {};
}
