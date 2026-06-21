import type { Metadata } from "next";
import { NutritionPageClient } from "@/components/nutrition/NutritionPageClient";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { formatDate, getTodayDateString, parseDate } from "@/lib/dates";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Nutrition | Athanor",
  description: "Log daily meals, track macros, and review nutrition trends.",
};

type NutritionPageProps = {
  searchParams?: Promise<{
    date?: string;
  }>;
};

function isValidDateString(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
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

export default async function NutritionPage({ searchParams }: NutritionPageProps) {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const params = await searchParams;
  const requestedDate = params?.date;
  const selectedDate = isValidDateString(requestedDate)
    ? requestedDate
    : getTodayDateString(user.timezone);
  const date = parseDate(selectedDate);

  const day = await prisma.nutritionDay.findUnique({
    where: { userId_date: { userId: user.id, date } },
    include: {
      entries: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return (
    <NutritionPageClient
      date={formatDate(date)}
      entries={(day?.entries ?? []).map((entry) => ({
        id: entry.id,
        mealLabel: entry.mealLabel,
        foodName: entry.foodName,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        servingSize: entry.servingSize,
        sortOrder: entry.sortOrder,
        createdAt: entry.createdAt.toISOString(),
      }))}
      targets={{
        calories: user.caloricTarget,
        protein: user.proteinTarget,
        carbs: user.carbTarget,
        fat: user.fatTarget,
      }}
    />
  );
}
