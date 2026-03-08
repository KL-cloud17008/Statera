"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepsChart } from "@/components/steps/StepsChart";
import { StepsEntryForm } from "@/components/steps/StepsEntryForm";
import { StepsHistoryList } from "@/components/steps/StepsHistoryList";
import { StepsProgressRing } from "@/components/steps/StepsProgressRing";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { computeStepStats, getWeeklyStepChange, type SerializedStepsEntry } from "@/lib/steps";
import { formatDistance } from "@/lib/units";

export function StepsPageClient({
  entries,
  timezone,
}: {
  entries: SerializedStepsEntry[];
  timezone?: string;
}) {
  const { settings } = useAppSettings();
  const stats = computeStepStats(entries, settings.stepGoal, timezone);
  const weeklyChange = getWeeklyStepChange(entries, timezone);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Steps</h1>
        <p className="text-muted-foreground">Track daily totals, progress to goal, and multi-period trends.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-6 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex justify-center">
            <StepsProgressRing current={stats.todaySteps} goal={settings.stepGoal} />
          </div>
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-bold text-foreground">{stats.todaySteps.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{formatDistance(stats.todaySteps, settings.distanceUnit)} walked</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">7-Day Avg</p>
              <p className="text-2xl font-bold text-foreground">{stats.average.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{weeklyChange >= 0 ? "+" : ""}{weeklyChange.toLocaleString()} vs 7 days ago</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Goal Streak</p>
              <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
              <p className="text-xs text-muted-foreground">consecutive goal days</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Best Day</p>
              <p className="text-2xl font-bold text-foreground">{stats.bestDay?.steps?.toLocaleString() ?? "--"}</p>
              <p className="text-xs text-muted-foreground">{stats.bestDay?.date ?? "No data yet"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepsChart entries={entries} goal={settings.stepGoal} timezone={timezone} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          <StepsEntryForm />
          <Card>
            <CardHeader>
              <CardTitle>Goal Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{stats.goalMetCount} logged days have met or exceeded your {settings.stepGoal.toLocaleString()} step goal.</p>
              <p>{stats.completionRate}% of logged days have cleared the goal so far.</p>
            </CardContent>
          </Card>
        </div>
        <StepsHistoryList entries={entries} />
      </div>
    </div>
  );
}
