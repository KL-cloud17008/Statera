import { addDaysToDateString, diffDays, getTodayDateString, parseDate } from "@/lib/dates";

export type SerializedStepsEntry = {
  id: string;
  date: string;
  steps: number | null;
};

export function sortStepsAscending(entries: SerializedStepsEntry[]) {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

export function buildDailyStepsData(
  entries: SerializedStepsEntry[],
  days = 7,
  timezone?: string
) {
  const byDate = new Map(entries.map((entry) => [entry.date, entry.steps ?? 0]));
  const today = getTodayDateString(timezone);

  const points = [] as { date: string; label: string; steps: number; isToday: boolean }[];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = addDaysToDateString(today, -offset);
    const parsed = parseDate(date);
    points.push({
      date,
      label: parsed.toLocaleDateString("en-US", { weekday: "short" }),
      steps: byDate.get(date) ?? 0,
      isToday: date === today,
    });
  }

  return points;
}

export function buildWeeklyAggregateData(entries: SerializedStepsEntry[], weeks = 8) {
  const sorted = sortStepsAscending(entries);
  const buckets = new Map<string, number>();

  for (const entry of sorted) {
    const date = parseDate(entry.date);
    const weekStart = new Date(date);
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - day);
    const key = weekStart.toISOString().split("T")[0];
    buckets.set(key, (buckets.get(key) ?? 0) + (entry.steps ?? 0));
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-weeks)
    .map(([date, steps], index) => ({
      key: `W${index + 1}`,
      date,
      steps,
    }));
}

export function buildMonthlyAggregateData(entries: SerializedStepsEntry[], months = 6) {
  const sorted = sortStepsAscending(entries);
  const buckets = new Map<string, number>();

  for (const entry of sorted) {
    const date = parseDate(entry.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) ?? 0) + (entry.steps ?? 0));
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-months)
    .map(([month, steps]) => {
      const [year, monthIndex] = month.split("-").map(Number);
      const label = new Date(year, monthIndex - 1, 1).toLocaleDateString("en-US", {
        month: "short",
      });
      return {
        key: month,
        label,
        steps,
      };
    });
}

export function computeStepStreak(entries: SerializedStepsEntry[], goal: number, timezone?: string) {
  const byDate = new Map(entries.map((entry) => [entry.date, entry.steps ?? 0]));
  let cursor = getTodayDateString(timezone);
  let streak = 0;

  while ((byDate.get(cursor) ?? 0) >= goal) {
    streak += 1;
    cursor = addDaysToDateString(cursor, -1);
  }

  return streak;
}

export function computeStepStats(entries: SerializedStepsEntry[], goal: number, timezone?: string) {
  const daily = buildDailyStepsData(entries, 7, timezone);
  const todaySteps = daily[daily.length - 1]?.steps ?? 0;
  const average =
    daily.length > 0
      ? Math.round(daily.reduce((sum, point) => sum + point.steps, 0) / daily.length)
      : 0;
  const streak = computeStepStreak(entries, goal, timezone);
  const goalMetCount = entries.filter((entry) => (entry.steps ?? 0) >= goal).length;
  const bestDay = entries.reduce<SerializedStepsEntry | null>((best, entry) => {
    if (!best || (entry.steps ?? 0) > (best.steps ?? 0)) {
      return entry;
    }

    return best;
  }, null);

  return {
    todaySteps,
    average,
    streak,
    goalMetCount,
    completionRate: entries.length > 0 ? Math.round((goalMetCount / entries.length) * 100) : 0,
    bestDay,
  };
}

export function buildMonthlyHeatmap(entries: SerializedStepsEntry[], monthDate = new Date()) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const byDate = new Map(entries.map((entry) => [entry.date, entry.steps ?? 0]));
  const lastDay = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month, day).toISOString().split("T")[0];
    return {
      date,
      day,
      steps: byDate.get(date) ?? 0,
    };
  });
}

export function getWeeklyStepChange(entries: SerializedStepsEntry[], timezone?: string) {
  const today = getTodayDateString(timezone);
  const weekAgo = addDaysToDateString(today, -7);
  const byDate = new Map(entries.map((entry) => [entry.date, entry.steps ?? 0]));
  return (byDate.get(today) ?? 0) - (byDate.get(weekAgo) ?? 0);
}

export function getAverageStepsPerDay(entries: SerializedStepsEntry[]) {
  if (entries.length === 0) {
    return 0;
  }

  const first = entries[entries.length - 1];
  const last = entries[0];
  const span = Math.max(1, diffDays(first.date, last.date) + 1);
  const total = entries.reduce((sum, entry) => sum + (entry.steps ?? 0), 0);
  return Math.round(total / span);
}
