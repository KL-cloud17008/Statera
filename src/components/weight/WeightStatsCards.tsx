"use client";

import { Minus, Scale, Target, TrendingDown, TrendingUp, Activity, HeartPulse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeightStats } from "@/lib/weight";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { formatWeight, formatWeightDelta, poundsPerWeekToUnit } from "@/lib/units";

export function WeightStatsCards({ stats }: { stats: WeightStats }) {
  const { settings } = useAppSettings();

  const trendIcon =
    stats.trend === "down" ? (
      <TrendingDown className="h-4 w-4 text-green-500" />
    ) : stats.trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-red-500" />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground" />
    );

  const weeklyRate =
    stats.weeklyRate != null ? `${stats.weeklyRate > 0 ? "+" : ""}${poundsPerWeekToUnit(stats.weeklyRate, settings.weightUnit).toFixed(1)} ${settings.weightUnit}/wk` : "--";

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Current</CardTitle>
            <Scale className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-foreground">{formatWeight(stats.currentWeight, settings.weightUnit)}</p>
          <p className="text-[10px] text-muted-foreground">{stats.lastEntryDate ?? "No data"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">BMI</CardTitle>
            <HeartPulse className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-foreground">{stats.bmi?.toFixed(1) ?? "--"}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Change</CardTitle>
            {trendIcon}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-foreground">{formatWeightDelta(stats.totalChange, settings.weightUnit)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">7-Day Avg</CardTitle>
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-foreground">{formatWeight(stats.avg7Day, settings.weightUnit)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Rate</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-foreground">{weeklyRate}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">Goal</CardTitle>
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold text-foreground">{formatWeight(stats.goalWeight, settings.weightUnit)}</p>
          <p className="text-[10px] text-muted-foreground">{stats.projectedGoalDate ? `Proj. ${stats.projectedGoalDate}` : "Set target date in settings"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
