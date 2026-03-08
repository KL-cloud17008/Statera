export type SerializedWeightEntry = {
  id: string;
  userId: string;
  date: string;
  weight: number;
  bodyFatPercent: number | null;
  status: "BASELINE" | "FASTING" | "NORMAL";
  timeOfDay: string | null;
  notes: string | null;
  createdAt: string;
};

export type WeightStats = {
  currentWeight: number | null;
  startWeight: number | null;
  totalChange: number | null;
  avg7Day: number | null;
  avg30Day: number | null;
  trend: "down" | "up" | "stable";
  lastEntryDate: string | null;
  bmi: number | null;
  goalWeight: number | null;
  weeklyRate: number | null;
  projectedGoalDate: string | null;
};

export type ChartPoint = {
  date: string;
  weight: number | null;
  avg7: number | null;
};

function formatDateISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function average(numbers: number[]) {
  if (numbers.length === 0) {
    return null;
  }

  return Math.round((numbers.reduce((sum, value) => sum + value, 0) / numbers.length) * 10) / 10;
}

export function groupWeightEntriesByDay(entries: SerializedWeightEntry[]) {
  const byDay = new Map<string, number[]>();
  for (const entry of entries) {
    const bucket = byDay.get(entry.date) ?? [];
    bucket.push(entry.weight);
    byDay.set(entry.date, bucket);
  }

  const result = new Map<string, number>();
  for (const [date, values] of byDay.entries()) {
    result.set(date, values.reduce((sum, value) => sum + value, 0) / values.length);
  }

  return result;
}

function buildDateRange(start: string, end: string) {
  const dates: string[] = [];
  let cursor = new Date(`${start}T00:00:00`);
  const finish = new Date(`${end}T00:00:00`);

  while (cursor <= finish) {
    dates.push(formatDateISO(cursor));
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function getWindowValues(map: Map<string, number>, targetDate: string, windowDays: number) {
  const target = new Date(`${targetDate}T00:00:00`);
  const start = addDays(target, -(windowDays - 1));
  const values: number[] = [];

  for (const [date, value] of map.entries()) {
    const current = new Date(`${date}T00:00:00`);
    if (current >= start && current <= target) {
      values.push(value);
    }
  }

  return values;
}

export function buildChartData(entries: SerializedWeightEntry[]): ChartPoint[] {
  if (entries.length === 0) {
    return [];
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const byDay = groupWeightEntriesByDay(sorted);
  const dates = buildDateRange(sorted[0].date, sorted[sorted.length - 1].date);

  return dates.map((date) => ({
    date,
    weight: byDay.get(date) ?? null,
    avg7: average(getWindowValues(byDay, date, 7)),
  }));
}

export function computeBMI(weightLbs: number | null, heightInches: number | null) {
  if (!weightLbs || !heightInches) {
    return null;
  }

  return Math.round(((weightLbs / (heightInches * heightInches)) * 703) * 10) / 10;
}

export function computeWeeklyRate(entries: SerializedWeightEntry[]) {
  if (entries.length < 2) {
    return null;
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalDays = Math.max(1, Math.round((new Date(`${last.date}T00:00:00`).getTime() - new Date(`${first.date}T00:00:00`).getTime()) / 86400000));
  const totalWeeks = totalDays / 7;
  if (totalWeeks <= 0) {
    return null;
  }

  return Math.round((((last.weight - first.weight) / totalWeeks) * 10)) / 10;
}

export function projectGoalDate(currentWeight: number | null, goalWeight: number | null, weeklyRate: number | null) {
  if (currentWeight == null || goalWeight == null || weeklyRate == null || weeklyRate === 0) {
    return null;
  }

  const remaining = goalWeight - currentWeight;
  if ((remaining < 0 && weeklyRate >= 0) || (remaining > 0 && weeklyRate <= 0)) {
    return null;
  }

  const weeks = remaining / weeklyRate;
  if (!Number.isFinite(weeks) || weeks <= 0 || weeks > 260) {
    return null;
  }

  const projected = addDays(new Date(), Math.round(weeks * 7));
  return formatDateISO(projected);
}

export function computeWeightStats(
  entries: SerializedWeightEntry[],
  options: {
    startWeight: number | null;
    heightInches?: number | null;
    goalWeight?: number | null;
  }
): WeightStats {
  if (entries.length === 0) {
    return {
      currentWeight: null,
      startWeight: options.startWeight,
      totalChange: null,
      avg7Day: null,
      avg30Day: null,
      trend: "stable",
      lastEntryDate: null,
      bmi: null,
      goalWeight: options.goalWeight ?? null,
      weeklyRate: null,
      projectedGoalDate: null,
    };
  }

  const sortedDesc = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const currentWeight = sortedDesc[0].weight;
  const lastEntryDate = sortedDesc[0].date;
  const byDay = groupWeightEntriesByDay(entries);
  const avg7Day = average(getWindowValues(byDay, lastEntryDate, 7));
  const avg30Day = average(getWindowValues(byDay, lastEntryDate, 30));
  const avg14Day = average(getWindowValues(byDay, lastEntryDate, 14));
  const weeklyRate = computeWeeklyRate(entries);

  let trend: "down" | "up" | "stable" = "stable";
  if (avg7Day != null && avg14Day != null) {
    const diff = avg7Day - avg14Day;
    if (diff < -0.3) {
      trend = "down";
    } else if (diff > 0.3) {
      trend = "up";
    }
  }

  return {
    currentWeight,
    startWeight: options.startWeight,
    totalChange: options.startWeight != null ? currentWeight - options.startWeight : null,
    avg7Day,
    avg30Day,
    trend,
    lastEntryDate,
    bmi: computeBMI(currentWeight, options.heightInches ?? null),
    goalWeight: options.goalWeight ?? null,
    weeklyRate,
    projectedGoalDate: projectGoalDate(currentWeight, options.goalWeight ?? null, weeklyRate),
  };
}

export function parseCSVDate(mdy: string): string | null {
  const parts = mdy.trim().split("/");
  if (parts.length !== 3) {
    return null;
  }

  const month = Number.parseInt(parts[0], 10);
  const day = Number.parseInt(parts[1], 10);
  const year = Number.parseInt(parts[2], 10);

  if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) {
    return null;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
