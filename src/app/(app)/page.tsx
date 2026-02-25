import Link from "next/link";
import {
  Scale,
  Dumbbell,
  Apple,
  TrendingDown,
  TrendingUp,
  Minus,
  Footprints,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";
import { getWeightEntries } from "@/actions/weight";
import { getTodaySteps } from "@/actions/steps";
import { computeWeightStats } from "@/lib/weight";
import { DashboardWeightChart } from "@/components/dashboard/DashboardWeightChart";
import { getTrainingDate, getTrainingDayNumber } from "@/lib/dates";
import { TRAINING_DAY_LABELS } from "@/lib/constants";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbUser = user
    ? await prisma.user.findUnique({ where: { supabaseUserId: user.id } })
    : null;

  // Weight data
  const weightEntries = dbUser ? await getWeightEntries(dbUser.id) : [];
  const weightStats = computeWeightStats(
    weightEntries.map((e) => ({
      ...e,
      date: e.date.toISOString().split("T")[0],
      createdAt: e.createdAt.toISOString(),
    })),
    dbUser?.startWeight ?? null
  );

  const serializedEntries = weightEntries.map((e) => ({
    id: e.id,
    userId: e.userId,
    date: e.date.toISOString().split("T")[0],
    weight: e.weight,
    bodyFatPercent: e.bodyFatPercent,
    status: e.status,
    timeOfDay: e.timeOfDay,
    notes: e.notes,
    createdAt: e.createdAt.toISOString(),
  }));

  // Compute weekly change
  const weeklyChange = (() => {
    if (weightEntries.length < 2) return null;
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    const recent = weightEntries[0]; // most recent (desc order)
    const weekAgoEntry = weightEntries.find(
      (e) => e.date.toISOString().split("T")[0] <= weekAgoStr
    );
    if (!weekAgoEntry) return null;
    return Math.round((recent.weight - weekAgoEntry.weight) * 10) / 10;
  })();

  // Today's workout — use training date logic (noon boundary, America/New_York)
  const today = new Date();
  const trainingDayNum = getTrainingDayNumber(today); // 1-5 or null (rest)
  const todayPlan = dbUser && trainingDayNum
    ? await prisma.workoutPlan.findFirst({
        where: {
          userId: dbUser.id,
          dayOfWeek: trainingDayNum,
          isActive: true,
        },
      })
    : null;

  // Steps data
  const todaySteps = dbUser ? await getTodaySteps(dbUser.id) : null;

  const formatted = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const TrendIcon =
    weightStats.trend === "down"
      ? TrendingDown
      : weightStats.trend === "up"
        ? TrendingUp
        : Minus;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">{formatted}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Current Weight */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Weight
              </CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {weightStats.currentWeight
                ? `${weightStats.currentWeight.toFixed(1)} lbs`
                : "\u2014"}
            </p>
            {weeklyChange != null ? (
              <p className="text-xs text-muted-foreground">
                <TrendIcon className="mr-1 inline h-3 w-3" />
                {weeklyChange > 0 ? "+" : ""}
                {weeklyChange} lbs this week
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Today's Calories */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today&apos;s Calories
              </CardTitle>
              <Apple className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              &mdash; / {dbUser?.caloricTarget?.toLocaleString() ?? "2,874"}
            </p>
            <p className="text-xs text-muted-foreground">No entries yet</p>
          </CardContent>
        </Card>

        {/* Workout Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today&apos;s Workout
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {todayPlan && trainingDayNum ? (
              <>
                <p className="text-lg font-bold text-foreground leading-tight">
                  {todayPlan.sessionName}
                </p>
                <p className="text-xs text-muted-foreground">{TRAINING_DAY_LABELS[trainingDayNum]}</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-foreground">Rest Day</p>
                <p className="text-xs text-muted-foreground">No workout scheduled</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Steps */}
        <Link href="/steps">
          <Card className="transition hover:bg-accent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today&apos;s Steps
                </CardTitle>
                <Footprints className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {todaySteps != null
                  ? todaySteps.toLocaleString()
                  : "\u2014"}
              </p>
              <p className="text-xs text-muted-foreground">
                {todaySteps != null ? "Logged today" : "Not logged"}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Two-column section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weight Trend */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Weight Trend</CardTitle>
              <Link
                href="/weight"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all &rarr;
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <DashboardWeightChart entries={serializedEntries} />
          </CardContent>
        </Card>

        {/* Today's Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">
                {todayPlan && trainingDayNum
                  ? `${TRAINING_DAY_LABELS[trainingDayNum]} Plan`
                  : "Training Week"}
              </CardTitle>
              {todayPlan && (
                <Link
                  href="/workout"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Start &rarr;
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {todayPlan ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {todayPlan.sessionName}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tap &ldquo;Start&rdquo; to begin logging your session
                </p>
              </div>
            ) : (
              <div className="flex justify-between">
                {([
                  { label: "D1", training: true },
                  { label: "D2", training: true },
                  { label: "D3", training: true },
                  { label: "D4", training: true },
                  { label: "D5", training: true },
                  { label: "R", training: false },
                  { label: "R", training: false },
                ] as const).map((day, i) => (
                  <div
                    key={i}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                      day.training
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {day.label}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/workout">
          <Card className="cursor-pointer transition hover:bg-accent">
            <CardContent className="flex flex-col items-center gap-2 py-6">
              <Dumbbell className="h-8 w-8 text-foreground" />
              <span className="text-sm font-medium text-foreground">
                Start Workout
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/nutrition">
          <Card className="cursor-pointer transition hover:bg-accent">
            <CardContent className="flex flex-col items-center gap-2 py-6">
              <Apple className="h-8 w-8 text-foreground" />
              <span className="text-sm font-medium text-foreground">
                Log Meal
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/weight">
          <Card className="cursor-pointer transition hover:bg-accent">
            <CardContent className="flex flex-col items-center gap-2 py-6">
              <Scale className="h-8 w-8 text-foreground" />
              <span className="text-sm font-medium text-foreground">
                Log Weight
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
