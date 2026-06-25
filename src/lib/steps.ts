import {
  addDaysToDateString,
  diffDays,
  formatDate,
  getTodayDateString,
  isValidISODateString,
  parseDate,
} from "@/lib/dates";

export type SerializedStepsEntry = {
  id: string;
  date: string;
  steps: number | null;
};

export type NormalizedStepEntry = {
  id: string;
  date: string;
  steps: number;
};

type StepStatsOptions = {
  todayLocalDate?: string;
  timezone?: string;
  recentLimit?: number;
};

type StepStatsOptionsInput = string | StepStatsOptions;

function normalizeStatsOptions(options?: StepStatsOptionsInput): Required<Pick<StepStatsOptions, "recentLimit">> &
  Omit<StepStatsOptions, "recentLimit"> {
  if (typeof options === "string") {
    return {
      todayLocalDate: options,
      recentLimit: 14,
    };
  }

  return {
    ...options,
    recentLimit: options?.recentLimit ?? 14,
  };
}

function normalizeStepDate(date: string) {
  const dateOnly = date.match(/^(\d{4}-\d{2}-\d{2})(?:T|$)/)?.[1];
  if (dateOnly && isValidISODateString(dateOnly)) {
    return dateOnly;
  }

  if (isValidISODateString(date)) {
    return date;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return formatDate(parsed);
}

function buildStepsByDate(entries: SerializedStepsEntry[]) {
  const byDate = new Map<string, number>();

  for (const entry of entries) {
    const date = normalizeStepDate(entry.date);
    if (!date) {
      continue;
    }

    // DailyLog is unique by day, but imports/tests may contain duplicates; totals intentionally sum.
    byDate.set(date, (byDate.get(date) ?? 0) + (entry.steps ?? 0));
  }

  return byDate;
}

function getNormalizedStepEntries(entries: SerializedStepsEntry[]) {
  return Array.from(buildStepsByDate(entries).entries())
    .map(([date, steps]) => ({
      id: date,
      date,
      steps,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function sortStepsAscending(entries: SerializedStepsEntry[]) {
  return getNormalizedStepEntries(entries).sort((a, b) => a.date.localeCompare(b.date));
}

export function buildDailyStepsData(
  entries: SerializedStepsEntry[],
  days = 7,
  timezone?: string
) {
  return buildDailyStepsDataFromToday(entries, days, getTodayDateString(timezone));
}

function buildDailyStepsDataFromToday(
  entries: SerializedStepsEntry[],
  days: number,
  today: string
) {
  const byDate = buildStepsByDate(entries);

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
    const key = formatDate(weekStart);
    buckets.set(key, (buckets.get(key) ?? 0) + entry.steps);
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
    buckets.set(key, (buckets.get(key) ?? 0) + entry.steps);
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
  return calculateStepStats(entries, goal, { timezone }).currentStreak;
}

export function calculateStepStats(
  entries: SerializedStepsEntry[],
  dailyStepGoal: number,
  options?: StepStatsOptionsInput
) {
  const { todayLocalDate, timezone, recentLimit } = normalizeStatsOptions(options);
  const today = todayLocalDate ?? getTodayDateString(timezone);
  const goal = Math.max(1, dailyStepGoal);
  const byDate = buildStepsByDate(entries);
  const daily = buildDailyStepsDataFromToday(entries, 7, today);
  const todaySteps = byDate.get(today) ?? 0;
  const goalReachedToday = todaySteps >= goal;
  let cursor = goalReachedToday ? today : addDaysToDateString(today, -1);
  let streak = 0;

  while ((byDate.get(cursor) ?? 0) >= goal) {
    streak += 1;
    cursor = addDaysToDateString(cursor, -1);
  }

  const recentEntries = getNormalizedStepEntries(entries);
  const goalDaysTotal = recentEntries.filter((entry) => entry.steps >= goal).length;
  const latestCompletedGoalDate =
    recentEntries.find((entry) => entry.date <= today && entry.steps >= goal)?.date ?? null;
  const bestDay = recentEntries.reduce<NormalizedStepEntry | null>((best, entry) => {
    if (!best || entry.steps > best.steps) {
      return entry;
    }

    return best;
  }, null);
  const sevenDayAverage =
    daily.length > 0
      ? Math.round(daily.reduce((sum, point) => sum + point.steps, 0) / daily.length)
      : 0;

  const stats = {
    todaySteps,
    todayPercent: Math.min(100, Math.round((todaySteps / goal) * 100)),
    goalDaysTotal,
    currentStreak: streak,
    bestDay,
    sevenDayAverage,
    recentEntries: recentEntries.slice(0, recentLimit),
    goalReachedToday,
    latestCompletedGoalDate,
    completionRate:
      recentEntries.length > 0 ? Math.round((goalDaysTotal / recentEntries.length) * 100) : 0,
  };

  return {
    ...stats,
    average: stats.sevenDayAverage,
    streak: stats.currentStreak,
    goalMetCount: stats.goalDaysTotal,
  };
}

export function computeStepStats(entries: SerializedStepsEntry[], goal: number, timezone?: string) {
  return calculateStepStats(entries, goal, { timezone });
}

export function buildMonthlyHeatmap(entries: SerializedStepsEntry[], monthDate = new Date()) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const byDate = buildStepsByDate(entries);
  const lastDay = new Date(year, month + 1, 0).getDate();

  return Array.from({ length: lastDay }, (_, index) => {
    const day = index + 1;
    const date = formatDate(new Date(year, month, day));
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
  const byDate = buildStepsByDate(entries);
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
