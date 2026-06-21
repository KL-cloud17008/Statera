export type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type NutritionTarget = {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
};

export type NutritionEntryLike = Partial<NutritionTotals>;

export const NUTRITION_LIMITS = {
  foodNameMaxLength: 120,
  mealLabelMaxLength: 48,
  servingSizeMaxLength: 80,
  caloriesMax: 10000,
  macroMax: 1000,
  targetCaloriesMin: 800,
  targetCaloriesMax: 8000,
  targetMacroMax: 1000,
};

export function calculateNutritionTotals(entries: NutritionEntryLike[]): NutritionTotals {
  return entries.reduce<NutritionTotals>(
    (totals, entry) => ({
      calories: totals.calories + sanitizeNumber(entry.calories),
      protein: totals.protein + sanitizeNumber(entry.protein),
      carbs: totals.carbs + sanitizeNumber(entry.carbs),
      fat: totals.fat + sanitizeNumber(entry.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function roundMacro(value: number) {
  return Math.round(value * 10) / 10;
}

export function roundCalories(value: number) {
  return Math.round(value);
}

export function hasNutritionTargets(target: NutritionTarget) {
  return (
    target.calories != null ||
    target.protein != null ||
    target.carbs != null ||
    target.fat != null
  );
}

export function getTargetPercent(value: number, target: number | null) {
  if (target == null || target <= 0) {
    return null;
  }

  return Math.min(200, Math.round((value / target) * 100));
}

function sanitizeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
