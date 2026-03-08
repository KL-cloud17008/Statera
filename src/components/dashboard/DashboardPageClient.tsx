"use client";

import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Dumbbell,
  Footprints,
  Scale,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepsProgressRing } from "@/components/steps/StepsProgressRing";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { computeStepStats, type SerializedStepsEntry } from "@/lib/steps";
import { convertWeight, formatWeight } from "@/lib/units";

type WeightStats = {
  currentWeight: number | null;
  trend: "down" | "up" | "stable";
};

type WorkoutSummary = {
  weeklyVolume: number;
  weeklySessions: number;
  lastWorkout: {
    label: string;
    trainingDate: string;
    volume: number;
    setCount: number;
  } | null;
};

export function DashboardPageClient({
  stepsEntries,
  todaySteps,
  weightStats,
  workoutSummary,
  timezone,
}: {
  stepsEntries: SerializedStepsEntry[];
  todaySteps: number;
  weightStats: WeightStats;
  workoutSummary: WorkoutSummary;
  timezone?: string;
}) {
  const { settings } = useAppSettings();
  const stepStats = computeStepStats(stepsEntries, settings.stepGoal, timezone);
  const greeting = getGreeting();
  const weeklyVolume = Math.round(
    convertWeight(workoutSummary.weeklyVolume, settings.weightUnit)
  ).toLocaleString();
  const lastWorkoutVolume = workoutSummary.lastWorkout
    ? Math.round(
        convertWeight(workoutSummary.lastWorkout.volume, settings.weightUnit)
      ).toLocaleString()
    : null;

  const TrendIcon =
    weightStats.trend === "down"
      ? ArrowDown
      : weightStats.trend === "up"
        ? ArrowUp
        : ArrowRight;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          {greeting}
        </p>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Your current training snapshot across steps, weight, and workouts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link href="/steps">
          <Card className="h-full transition hover:bg-accent/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">
                  Today&apos;s Steps
                </CardTitle>
                <Footprints className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <StepsProgressRing current={todaySteps} goal={settings.stepGoal} />
              <div className="space-y-2 text-right">
                <p className="text-3xl font-bold text-foreground">
                  {todaySteps.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Goal {settings.stepGoal.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/weight">
          <Card className="h-full transition hover:bg-accent/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Current Weight</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-foreground">
                  {formatWeight(weightStats.currentWeight, settings.weightUnit)}
                </p>
                <TrendIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Trend is currently {weightStats.trend}.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/workout/history">
          <Card className="h-full transition hover:bg-accent/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">
                  This Week&apos;s Volume
                </CardTitle>
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-foreground">
                {weeklyVolume} {settings.weightUnit}
              </p>
              <p className="text-sm text-muted-foreground">
                Across {workoutSummary.weeklySessions} completed sessions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/steps">
          <Card className="h-full transition hover:bg-accent/60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Streaks</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-foreground">
                {stepStats.streak} days
              </p>
              <p className="text-sm text-muted-foreground">
                {stepStats.goalMetCount} goal hits total
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/workout/history">
          <Card className="h-full transition hover:bg-accent/60 md:col-span-2 xl:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Last Workout</CardTitle>
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {workoutSummary.lastWorkout ? (
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-foreground">
                    {workoutSummary.lastWorkout.label}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{workoutSummary.lastWorkout.trainingDate}</span>
                    <span>{workoutSummary.lastWorkout.setCount} sets</span>
                    <span>
                      {lastWorkoutVolume} {settings.weightUnit}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No completed workouts yet.
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}
