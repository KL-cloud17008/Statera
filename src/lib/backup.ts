import { NUTRITION_LIMITS } from "@/lib/nutrition";

export const MAX_BACKUP_FILE_BYTES = 5 * 1024 * 1024;

export const BACKUP_COLLECTION_KEYS = [
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

export type BackupCollectionKey = (typeof BACKUP_COLLECTION_KEYS)[number];

export type BackupPreview = {
  version: number | null;
  exportedAt: string | null;
  counts: Record<BackupCollectionKey, number>;
  dateRange: {
    start: string;
    end: string;
  } | null;
};

export type BackupAnalysis = {
  valid: boolean;
  errors: string[];
  preview: BackupPreview;
};

const DEFAULT_COUNTS = Object.fromEntries(
  BACKUP_COLLECTION_KEYS.map((key) => [key, 0])
) as Record<BackupCollectionKey, number>;

export function unwrapBackupEnvelope(input: unknown) {
  if (isRecord(input) && "serverData" in input) {
    return {
      payload: input.serverData,
      localSettings: input.localSettings,
    };
  }

  return { payload: input, localSettings: undefined };
}

export function analyzeBackupPayload(input: unknown): BackupAnalysis {
  const errors: string[] = [];
  const dates: string[] = [];
  const counts = { ...DEFAULT_COUNTS };
  const preview: BackupPreview = {
    version: null,
    exportedAt: null,
    counts,
    dateRange: null,
  };

  if (!isRecord(input)) {
    return {
      valid: false,
      errors: ["Backup root must be a JSON object."],
      preview,
    };
  }

  if ("version" in input) {
    if (typeof input.version !== "number" || !Number.isInteger(input.version) || input.version < 1) {
      errors.push("Backup version must be a positive number.");
    } else {
      preview.version = input.version;
    }
  }

  if ("exportedAt" in input) {
    if (typeof input.exportedAt !== "string" || Number.isNaN(Date.parse(input.exportedAt))) {
      errors.push("Backup exportedAt must be a valid timestamp.");
    } else {
      preview.exportedAt = input.exportedAt;
    }
  }

  if ("profile" in input) {
    validateProfile(input.profile, errors);
  }

  const hasRecognizedData =
    isRecord(input.profile) ||
    BACKUP_COLLECTION_KEYS.some((key) => Array.isArray(input[key]));

  if (!hasRecognizedData) {
    errors.push("Backup file is missing recognized tracker data.");
  }

  let totalItems = 0;
  for (const key of BACKUP_COLLECTION_KEYS) {
    if (!(key in input)) {
      continue;
    }

    if (!Array.isArray(input[key])) {
      errors.push(`${key} must be an array.`);
      continue;
    }

    const items = input[key] as unknown[];
    counts[key] = items.length;
    totalItems += items.length;
    validateCollection(key, items, errors, dates);
  }

  validateSavedMealReferences(input, errors);

  if (totalItems > 20000) {
    errors.push("Backup is too large to import safely in one pass.");
  }

  if (dates.length > 0) {
    const sortedDates = [...dates].sort();
    preview.dateRange = {
      start: sortedDates[0],
      end: sortedDates[sortedDates.length - 1],
    };
  }

  return {
    valid: errors.length === 0,
    errors,
    preview,
  };
}

function validateSavedMealReferences(input: Record<string, unknown>, errors: string[]) {
  if (!Array.isArray(input.savedMeals)) {
    return;
  }

  const savedFoodIds = new Set(
    Array.isArray(input.savedFoods)
      ? input.savedFoods
          .filter(isRecord)
          .map((food) => food.id)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      : []
  );

  input.savedMeals.forEach((meal, mealIndex) => {
    if (!isRecord(meal) || !Array.isArray(meal.items)) {
      return;
    }

    meal.items.forEach((item, itemIndex) => {
      if (!isRecord(item) || typeof item.savedFoodId !== "string") {
        return;
      }
      if (!savedFoodIds.has(item.savedFoodId)) {
        errors.push(`savedMeals[${mealIndex}].items[${itemIndex}].savedFoodId must reference a saved food in this backup.`);
      }
    });
  });
}

function validateCollection(
  key: BackupCollectionKey,
  items: unknown[],
  errors: string[],
  dates: string[]
) {
  if (key === "dailyLogs" || key === "nutritionDays") {
    const seenDates = new Set<string>();
    items.forEach((item, index) => {
      if (!isRecord(item) || typeof item.date !== "string" || !isDateString(item.date)) {
        return;
      }
      if (seenDates.has(item.date)) {
        errors.push(`${key}[${index}].date duplicates ${item.date}.`);
      }
      seenDates.add(item.date);
    });
  }

  items.forEach((item, index) => {
    const path = `${key}[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${path} must be an object.`);
      return;
    }

    switch (key) {
      case "weightEntries":
        requireDate(item.date, `${path}.date`, errors, dates);
        requireNumber(item.weight, `${path}.weight`, errors, 50, 999);
        validateOptionalNumber(item.bodyFatPercent, `${path}.bodyFatPercent`, errors, 1, 70);
        validateOptionalEnum(item.status, `${path}.status`, errors, ["BASELINE", "FASTING", "NORMAL"]);
        validateOptionalString(item.timeOfDay, `${path}.timeOfDay`, errors, 80);
        validateOptionalString(item.notes, `${path}.notes`, errors, 500);
        break;
      case "dailyLogs":
        requireDate(item.date, `${path}.date`, errors, dates);
        validateOptionalNumber(item.sleepHours, `${path}.sleepHours`, errors, 0, 24);
        validateOptionalNumber(item.moodRating, `${path}.moodRating`, errors, 1, 10, true);
        validateOptionalNumber(item.steps, `${path}.steps`, errors, 0, 200000, true);
        validateOptionalString(item.notes, `${path}.notes`, errors, 500);
        break;
      case "workoutPlans":
        requireNumber(item.dayOfWeek, `${path}.dayOfWeek`, errors, 0, 6, true);
        requireString(item.sessionName, `${path}.sessionName`, errors, 160);
        validateOptionalNumber(item.weekNumber, `${path}.weekNumber`, errors, 1, 52, true);
        validateOptionalBoolean(item.isActive, `${path}.isActive`, errors);
        validatePlanExercises(item.exercises, `${path}.exercises`, errors);
        break;
      case "workoutSessions":
        requireDate(item.date, `${path}.date`, errors, dates);
        requireDate(item.trainingDate, `${path}.trainingDate`, errors, dates);
        validateOptionalString(item.workoutPlanId, `${path}.workoutPlanId`, errors, 200);
        validateOptionalTimestamp(item.startTime, `${path}.startTime`, errors);
        validateOptionalTimestamp(item.endTime, `${path}.endTime`, errors);
        validateOptionalString(item.notes, `${path}.notes`, errors, 2000);
        validateOptionalNumber(item.weekNumber, `${path}.weekNumber`, errors, 1, 52, true);
        validateOptionalBoolean(item.completed, `${path}.completed`, errors);
        validateSessionSets(item.sets, `${path}.sets`, errors);
        break;
      case "mobilityLogs":
        requireDate(item.date, `${path}.date`, errors, dates);
        validateRequiredEnum(item.type, `${path}.type`, errors, ["PRE_WORKOUT", "POST_WORKOUT", "UNDO_SITTING"]);
        requireString(item.version, `${path}.version`, errors, 160);
        validateOptionalBoolean(item.completed, `${path}.completed`, errors);
        validateOptionalString(item.notes, `${path}.notes`, errors, 500);
        break;
      case "nutritionDays":
        requireDate(item.date, `${path}.date`, errors, dates);
        validateNutritionEntries(item.entries, `${path}.entries`, errors);
        break;
      case "savedFoods":
        requireString(item.name, `${path}.name`, errors, NUTRITION_LIMITS.foodNameMaxLength);
        requireNumber(item.calories, `${path}.calories`, errors, 0, NUTRITION_LIMITS.caloriesMax);
        requireNumber(item.protein, `${path}.protein`, errors, 0, NUTRITION_LIMITS.macroMax);
        requireNumber(item.carbs, `${path}.carbs`, errors, 0, NUTRITION_LIMITS.macroMax);
        requireNumber(item.fat, `${path}.fat`, errors, 0, NUTRITION_LIMITS.macroMax);
        validateOptionalString(item.id, `${path}.id`, errors, 200);
        validateOptionalString(item.servingSize, `${path}.servingSize`, errors, NUTRITION_LIMITS.servingSizeMaxLength);
        break;
      case "savedMeals":
        requireString(item.name, `${path}.name`, errors, 120);
        validateSavedMealItems(item.items, `${path}.items`, errors);
        break;
      case "progressPhotos":
        requireDate(item.date, `${path}.date`, errors, dates);
        requireString(item.imageUrl, `${path}.imageUrl`, errors, 2048);
        validateOptionalString(item.notes, `${path}.notes`, errors, 500);
        break;
    }
  });
}

function validateProfile(value: unknown, errors: string[]) {
  if (!isRecord(value)) {
    errors.push("profile must be an object.");
    return;
  }

  validateOptionalString(value.email, "profile.email", errors, 320);
  validateOptionalNumber(value.heightInches, "profile.heightInches", errors, 36, 96, true);
  validateOptionalNumber(value.startWeight, "profile.startWeight", errors, 50, 999);
  validateOptionalNumber(value.goalWeight, "profile.goalWeight", errors, 50, 999);
  validateOptionalString(value.timezone, "profile.timezone", errors, 120);
  validateOptionalNumber(value.caloricTarget, "profile.caloricTarget", errors, NUTRITION_LIMITS.targetCaloriesMin, NUTRITION_LIMITS.targetCaloriesMax, true);
  validateOptionalNumber(value.proteinTarget, "profile.proteinTarget", errors, 0, NUTRITION_LIMITS.targetMacroMax);
  validateOptionalNumber(value.carbTarget, "profile.carbTarget", errors, 0, NUTRITION_LIMITS.targetMacroMax);
  validateOptionalNumber(value.fatTarget, "profile.fatTarget", errors, 0, NUTRITION_LIMITS.targetMacroMax);
}

function validatePlanExercises(value: unknown, path: string, errors: string[]) {
  if (value == null) {
    return;
  }
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`);
    return;
  }

  value.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${itemPath} must be an object.`);
      return;
    }
    requireString(item.exerciseName, `${itemPath}.exerciseName`, errors, 160);
    requireNumber(item.sets, `${itemPath}.sets`, errors, 1, 20, true);
    requireString(item.reps, `${itemPath}.reps`, errors, 40);
    validateOptionalString(item.tempo, `${itemPath}.tempo`, errors, 40);
    validateOptionalNumber(item.restSeconds, `${itemPath}.restSeconds`, errors, 0, 7200, true);
    validateOptionalString(item.targetRPE, `${itemPath}.targetRPE`, errors, 20);
    validateOptionalString(item.cues, `${itemPath}.cues`, errors, 2000);
    validateOptionalString(item.supersetGroup, `${itemPath}.supersetGroup`, errors, 20);
    validateOptionalString(item.exerciseType, `${itemPath}.exerciseType`, errors, 40);
    validateOptionalNumber(item.sortOrder, `${itemPath}.sortOrder`, errors, 0, 1000, true);
  });
}

function validateSessionSets(value: unknown, path: string, errors: string[]) {
  if (value == null) {
    return;
  }
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`);
    return;
  }

  value.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${itemPath} must be an object.`);
      return;
    }
    requireString(item.exerciseName, `${itemPath}.exerciseName`, errors, 160);
    requireNumber(item.setNumber, `${itemPath}.setNumber`, errors, 1, 50, true);
    validateOptionalNumber(item.weightUsed, `${itemPath}.weightUsed`, errors, 0, 1500);
    validateOptionalNumber(item.repsCompleted, `${itemPath}.repsCompleted`, errors, 0, 1000, true);
    validateOptionalNumber(item.actualRPE, `${itemPath}.actualRPE`, errors, 1, 10, true);
    validateOptionalNumber(item.duration, `${itemPath}.duration`, errors, 0, 7200, true);
    validateOptionalBoolean(item.isAMRAP, `${itemPath}.isAMRAP`, errors);
    validateOptionalString(item.notes, `${itemPath}.notes`, errors, 240);
  });
}

function validateNutritionEntries(value: unknown, path: string, errors: string[]) {
  if (value == null) {
    return;
  }
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`);
    return;
  }

  value.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${itemPath} must be an object.`);
      return;
    }
    requireString(item.mealLabel, `${itemPath}.mealLabel`, errors, NUTRITION_LIMITS.mealLabelMaxLength);
    requireString(item.foodName, `${itemPath}.foodName`, errors, NUTRITION_LIMITS.foodNameMaxLength);
    validateOptionalNumber(item.calories, `${itemPath}.calories`, errors, 0, NUTRITION_LIMITS.caloriesMax);
    validateOptionalNumber(item.protein, `${itemPath}.protein`, errors, 0, NUTRITION_LIMITS.macroMax);
    validateOptionalNumber(item.carbs, `${itemPath}.carbs`, errors, 0, NUTRITION_LIMITS.macroMax);
    validateOptionalNumber(item.fat, `${itemPath}.fat`, errors, 0, NUTRITION_LIMITS.macroMax);
    validateOptionalString(item.servingSize, `${itemPath}.servingSize`, errors, NUTRITION_LIMITS.servingSizeMaxLength);
    validateOptionalNumber(item.sortOrder, `${itemPath}.sortOrder`, errors, 0, 1000, true);
  });
}

function validateSavedMealItems(value: unknown, path: string, errors: string[]) {
  if (value == null) {
    return;
  }
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array.`);
    return;
  }

  value.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${itemPath} must be an object.`);
      return;
    }
    requireString(item.savedFoodId, `${itemPath}.savedFoodId`, errors, 200);
    validateOptionalNumber(item.quantity, `${itemPath}.quantity`, errors, 0, 1000);
  });
}

function requireDate(value: unknown, path: string, errors: string[], dates: string[]) {
  if (typeof value !== "string" || !isDateString(value)) {
    errors.push(`${path} must be a valid YYYY-MM-DD date.`);
    return;
  }
  dates.push(value);
}

function requireString(value: unknown, path: string, errors: string[], maxLength: number) {
  if (typeof value !== "string" || !value.trim()) {
    errors.push(`${path} is required.`);
    return;
  }
  if (value.length > maxLength) {
    errors.push(`${path} is too long.`);
  }
}

function requireNumber(
  value: unknown,
  path: string,
  errors: string[],
  min: number,
  max: number,
  integer = false
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push(`${path} must be a number.`);
    return;
  }
  if (integer && !Number.isInteger(value)) {
    errors.push(`${path} must be a whole number.`);
  }
  if (value < min || value > max) {
    errors.push(`${path} must be between ${min} and ${max}.`);
  }
}

function validateOptionalNumber(
  value: unknown,
  path: string,
  errors: string[],
  min: number,
  max: number,
  integer = false
) {
  if (value == null) {
    return;
  }
  requireNumber(value, path, errors, min, max, integer);
}

function validateOptionalString(value: unknown, path: string, errors: string[], maxLength: number) {
  if (value == null) {
    return;
  }
  if (typeof value !== "string") {
    errors.push(`${path} must be a string.`);
    return;
  }
  if (value.length > maxLength) {
    errors.push(`${path} is too long.`);
  }
}

function validateOptionalBoolean(value: unknown, path: string, errors: string[]) {
  if (value == null) {
    return;
  }
  if (typeof value !== "boolean") {
    errors.push(`${path} must be true or false.`);
  }
}

function validateOptionalTimestamp(value: unknown, path: string, errors: string[]) {
  if (value == null) {
    return;
  }
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    errors.push(`${path} must be a valid timestamp.`);
  }
}

function validateOptionalEnum(value: unknown, path: string, errors: string[], allowed: string[]) {
  if (value == null) {
    return;
  }
  validateRequiredEnum(value, path, errors, allowed);
}

function validateRequiredEnum(value: unknown, path: string, errors: string[], allowed: string[]) {
  if (typeof value !== "string" || !allowed.includes(value)) {
    errors.push(`${path} must be one of ${allowed.join(", ")}.`);
  }
}

function isDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
