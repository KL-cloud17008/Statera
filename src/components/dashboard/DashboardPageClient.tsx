"use client";

import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Dumbbell,
  Footprints,
  PlayCircle,
  Scale,
} from "lucide-react";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { StepsProgressRing } from "@/components/steps/StepsProgressRing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
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
    <div className="page-shell">
      <SectionHeader
        eyebrow={greeting}
        title="Everything important, above the fold"
        description="See today’s movement, your bodyweight trajectory, training volume, and streaks without digging through the app."
        action={
          <Link href="/workout">
            <Button size="lg" className="gap-2">
              <PlayCircle className="h-4 w-4" />
              Today&apos;s Workout
            </Button>
          </Link>
        }
      >
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-muted/60 px-3 py-1.5">
            {stepStats.streak} day streak
          </span>
          <span className="rounded-full bg-muted/60 px-3 py-1.5">
            {workoutSummary.weeklySessions} sessions this week
          </span>
        </div>
      </SectionHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link href="/steps" className="block">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Steps</p>
                  <CardTitle className="mt-2">Today&apos;s goal progress</CardTitle>
                </div>
                <Footprints className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-5 xl:flex-row xl:items-center xl:justify-between">
              <StepsProgressRing current={todaySteps} goal={settings.stepGoal} size={156} />
              <div className="space-y-3 text-center xl:text-left">
                <p className="text-3xl font-semibold text-foreground data-number">
                  {todaySteps.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Goal {settings.stepGoal.toLocaleString()} steps
                </p>
                <p className="text-sm text-primary">
                  {stepStats.goalMetCount} days have already cleared goal
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/weight" className="block">
          <StatCard
            label="Weight"
            value={formatWeight(weightStats.currentWeight, settings.weightUnit)}
            hint={`Trend is ${weightStats.trend}`}
            icon={<Scale className="h-5 w-5" />}
            className="h-full"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendIcon className="h-4 w-4 text-primary" />
              <span>Tap to open full chart and projection</span>
            </div>
          </StatCard>
        </Link>

        <Link href="/workout/history" className="block">
          <StatCard
            label="Training Volume"
            value={`${weeklyVolume} ${settings.weightUnit}`}
            hint={`Across ${workoutSummary.weeklySessions} completed sessions`}
            icon={<Dumbbell className="h-5 w-5" />}
            className="h-full"
          >
            <p className="text-sm text-muted-foreground">This week&apos;s total load moved.</p>
          </StatCard>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Link href="/steps" className="block">
          <StatCard
            label="Consistency"
            value={`${stepStats.streak} days`}
            hint={`${stepStats.goalMetCount} lifetime goal hits`}
            icon={<Activity className="h-5 w-5" />}
          >
            <p className="text-sm text-muted-foreground">
              Keep momentum by staying above {settings.stepGoal.toLocaleString()} daily steps.
            </p>
          </StatCard>
        </Link>

        <Link href="/workout/history" className="block">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Last Workout</p>
                  <CardTitle className="mt-2">Quick session recap</CardTitle>
                </div>
                <Dumbbell className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              {workoutSummary.lastWorkout ? (
                <div className="grid gap-4 sm:grid-cols-[1.4fr_repeat(2,minmax(0,1fr))]">
                  <div>
                    <p className="text-xl font-semibold text-foreground">
                      {workoutSummary.lastWorkout.label}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {workoutSummary.lastWorkout.trainingDate}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Sets</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground data-number">
                      {workoutSummary.lastWorkout.setCount}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Volume</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground data-number">
                      {lastWorkoutVolume} <span className="text-base text-muted-foreground">{settings.weightUnit}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-[--radius-card] border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
                  No completed workouts yet. Start a session and your recap will appear here.
                </div>
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
