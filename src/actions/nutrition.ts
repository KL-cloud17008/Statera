"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { parseDate } from "@/lib/dates";
import { NUTRITION_LIMITS, roundCalories, roundMacro } from "@/lib/nutrition";

type NutritionMutationResult = {
  error?: string;
};

type ParsedNutritionEntry = {
  date: Date;
  mealLabel: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string | null;
};

type ParsedNumberField =
  | { value: number }
  | { error: string };

function revalidateNutritionRoutes() {
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/nutrition");
  revalidatePath("/nutrition/summary");
  revalidatePath("/settings");
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = parseDate(value);
  const [year, month, day] = value.split("-").map(Number);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

function parseNumberField(
  formData: FormData,
  field: string,
  label: string,
  max: number
): ParsedNumberField {
  const value = formData.get(field);
  if (value == null || String(value).trim() === "") {
    return { value: 0 };
  }

  const parsed = Number.parseFloat(String(value));
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > max) {
    return { error: `${label} must be between 0 and ${max}.` };
  }

  return { value: parsed };
}

function parseEntryPayload(formData: FormData): ParsedNutritionEntry | { error: string } {
  const dateStr = String(formData.get("date") ?? "");
  const foodName = String(formData.get("foodName") ?? "").trim();
  const mealLabel = String(formData.get("mealLabel") ?? "Meal 1").trim() || "Meal 1";
  const servingSize = String(formData.get("servingSize") ?? "").trim();

  if (!dateStr || !isValidDateString(dateStr)) {
    return { error: "Enter a valid date." };
  }
  if (!foodName) {
    return { error: "Food name is required." };
  }
  if (foodName.length > NUTRITION_LIMITS.foodNameMaxLength) {
    return { error: "Food name is too long." };
  }
  if (mealLabel.length > NUTRITION_LIMITS.mealLabelMaxLength) {
    return { error: "Meal label is too long." };
  }
  if (servingSize.length > NUTRITION_LIMITS.servingSizeMaxLength) {
    return { error: "Serving size is too long." };
  }

  const calories = parseNumberField(formData, "calories", "Calories", NUTRITION_LIMITS.caloriesMax);
  if ("error" in calories) {
    return { error: calories.error };
  }
  const protein = parseNumberField(formData, "protein", "Protein", NUTRITION_LIMITS.macroMax);
  if ("error" in protein) {
    return { error: protein.error };
  }
  const carbs = parseNumberField(formData, "carbs", "Carbs", NUTRITION_LIMITS.macroMax);
  if ("error" in carbs) {
    return { error: carbs.error };
  }
  const fat = parseNumberField(formData, "fat", "Fat", NUTRITION_LIMITS.macroMax);
  if ("error" in fat) {
    return { error: fat.error };
  }

  return {
    date: parseDate(dateStr),
    mealLabel,
    foodName,
    calories: roundCalories(calories.value),
    protein: roundMacro(protein.value),
    carbs: roundMacro(carbs.value),
    fat: roundMacro(fat.value),
    servingSize: servingSize || null,
  };
}

function parseOptionalTarget(formData: FormData, field: string, label: string, min: number, max: number) {
  const value = formData.get(field);
  if (value == null || String(value).trim() === "") {
    return { value: null };
  }

  const parsed = Number.parseFloat(String(value));
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return { error: `${label} target must be between ${min} and ${max}.` };
  }

  return { value: Math.round(parsed) };
}

export async function addNutritionEntry(formData: FormData): Promise<NutritionMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = parseEntryPayload(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const day = await prisma.nutritionDay.upsert({
    where: { userId_date: { userId: user.id, date: parsed.date } },
    create: { userId: user.id, date: parsed.date },
    update: {},
    include: { entries: { select: { id: true } } },
  });

  await prisma.nutritionEntry.create({
    data: {
      nutritionDayId: day.id,
      mealLabel: parsed.mealLabel,
      foodName: parsed.foodName,
      calories: parsed.calories,
      protein: parsed.protein,
      carbs: parsed.carbs,
      fat: parsed.fat,
      servingSize: parsed.servingSize,
      sortOrder: day.entries.length,
    },
  });

  revalidateNutritionRoutes();
  return {};
}

export async function updateNutritionEntry(formData: FormData): Promise<NutritionMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const entryId = String(formData.get("entryId") ?? "");
  if (!entryId) {
    return { error: "Entry ID is required." };
  }

  const parsed = parseEntryPayload(formData);
  if ("error" in parsed) {
    return parsed;
  }

  const existing = await prisma.nutritionEntry.findFirst({
    where: {
      id: entryId,
      nutritionDay: { userId: user.id },
    },
    include: { nutritionDay: true },
  });
  if (!existing) {
    return { error: "Nutrition entry not found." };
  }

  const nextDay = await prisma.nutritionDay.upsert({
    where: { userId_date: { userId: user.id, date: parsed.date } },
    create: { userId: user.id, date: parsed.date },
    update: {},
  });

  await prisma.nutritionEntry.update({
    where: { id: entryId },
    data: {
      nutritionDayId: nextDay.id,
      mealLabel: parsed.mealLabel,
      foodName: parsed.foodName,
      calories: parsed.calories,
      protein: parsed.protein,
      carbs: parsed.carbs,
      fat: parsed.fat,
      servingSize: parsed.servingSize,
    },
  });

  revalidateNutritionRoutes();
  return {};
}

export async function deleteNutritionEntry(formData: FormData): Promise<NutritionMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const entryId = String(formData.get("entryId") ?? "");
  if (!entryId) {
    return { error: "Entry ID is required." };
  }

  const existing = await prisma.nutritionEntry.findFirst({
    where: {
      id: entryId,
      nutritionDay: { userId: user.id },
    },
  });
  if (!existing) {
    return { error: "Nutrition entry not found." };
  }

  await prisma.nutritionEntry.delete({ where: { id: entryId } });

  revalidateNutritionRoutes();
  return {};
}

export async function updateNutritionTargets(formData: FormData): Promise<NutritionMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const calories = parseOptionalTarget(
    formData,
    "caloricTarget",
    "Calories",
    NUTRITION_LIMITS.targetCaloriesMin,
    NUTRITION_LIMITS.targetCaloriesMax
  );
  if ("error" in calories) {
    return calories;
  }
  const protein = parseOptionalTarget(formData, "proteinTarget", "Protein", 0, NUTRITION_LIMITS.targetMacroMax);
  if ("error" in protein) {
    return protein;
  }
  const carbs = parseOptionalTarget(formData, "carbTarget", "Carbs", 0, NUTRITION_LIMITS.targetMacroMax);
  if ("error" in carbs) {
    return carbs;
  }
  const fat = parseOptionalTarget(formData, "fatTarget", "Fat", 0, NUTRITION_LIMITS.targetMacroMax);
  if ("error" in fat) {
    return fat;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      caloricTarget: calories.value,
      proteinTarget: protein.value,
      carbTarget: carbs.value,
      fatTarget: fat.value,
    },
  });

  revalidateNutritionRoutes();
  return {};
}
