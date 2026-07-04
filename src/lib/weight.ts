import { diffDays, isValidISODateString } from "@/lib/dates";

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

const TREND_WINDOW_DAYS = 28;
const MIN_TREND_SPAN_DAYS = 7;

/**
 * Weekly pace from a least-squares regression over the most recent 28 days of
 * daily averages (anchored to the latest entry). A regression keeps a plateau
 * week or a single outlier weigh-in from zeroing the trend the way an
 * endpoint-to-endpoint delta does. Falls back to the full history when the
 * recent window is too sparse to be stable (< 2 points or < 7 days of span).
 */
export function computeWeeklyRate(entries: SerializedWeightEntry[]) {
  if (entries.length < 2) {
    return null;
  }

  const points = [...groupWeightEntriesByDay(entries).entries()]
    .map(([date, weight]) => ({
      day: new Date(`${date}T00:00:00`).getTime() / 86400000,
      weight,
    }))
    .sort((a, b) => a.day - b.day);

  if (points.length < 2) {
    return null;
  }

  const latestDay = points[points.length - 1].day;
  let window = points.filter((point) => latestDay - point.day <= TREND_WINDOW_DAYS - 1);
  if (
    window.length < 2 ||
    window[window.length - 1].day - window[0].day < MIN_TREND_SPAN_DAYS
  ) {
    window = points;
  }

  const count = window.length;
  const meanDay = window.reduce((sum, point) => sum + point.day, 0) / count;
  const meanWeight = window.reduce((sum, point) => sum + point.weight, 0) / count;
  let numerator = 0;
  let denominator = 0;
  for (const point of window) {
    numerator += (point.day - meanDay) * (point.weight - meanWeight);
    denominator += (point.day - meanDay) ** 2;
  }

  if (denominator === 0) {
    return null;
  }

  return Math.round((numerator / denominator) * 7 * 10) / 10;
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

export function computeRequiredWeeklyLossPace(
  currentWeight: number | null,
  goalWeight: number | null,
  fromDate: string | null,
  targetDate: string | null
) {
  if (
    currentWeight == null ||
    goalWeight == null ||
    !fromDate ||
    !targetDate ||
    !isValidISODateString(fromDate) ||
    !isValidISODateString(targetDate)
  ) {
    return null;
  }

  const remainingLoss = currentWeight - goalWeight;
  const daysToTarget = diffDays(fromDate, targetDate);
  if (remainingLoss <= 0 || daysToTarget <= 0) {
    return null;
  }

  const weeksToTarget = daysToTarget / 7;
  return Math.round((remainingLoss / weeksToTarget) * 10) / 10;
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
