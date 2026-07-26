"use client";

import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { Notice, Num, Row, Rows, Section, Sub } from "@/components/ui/ledger";
import { normalizeGoalTargetDate } from "@/lib/app-settings";
import { computeRequiredWeeklyLossPace, type WeightStats } from "@/lib/weight";
import { formatBodyweight } from "@/lib/units";

export function WeightStatsCards({ stats }: { stats: WeightStats }) {
  const { settings } = useAppSettings();
  const targetDate = normalizeGoalTargetDate(settings.weightGoalTargetDate);
  const requiredPace = computeRequiredWeeklyLossPace(
    stats.currentWeight,
    stats.goalWeight,
    stats.lastEntryDate,
    targetDate
  );

  const weeklyRate =
    stats.weeklyRate != null
      ? `${stats.weeklyRate > 0 ? "+" : ""}${stats.weeklyRate.toFixed(1)} lb/wk`
      : "--";

  const remainingToGoal =
    stats.currentWeight != null && stats.goalWeight != null
      ? stats.goalWeight - stats.currentWeight
      : null;

  const paceGuardrailActive =
    stats.weeklyRate != null &&
    stats.currentWeight != null &&
    stats.weeklyRate < 0 &&
    Math.abs(stats.weeklyRate) > stats.currentWeight * 0.01;

  const projectedHint = stats.projectedGoalDate
    ? `At the current ${weeklyRate} pace`
    : stats.weeklyRate == null
      ? "Needs more weigh-ins to project"
      : "Current pace is not moving toward goal";

  const paceHint =
    requiredPace != null && targetDate
      ? `Required -${requiredPace.toFixed(1)} lb/wk to hit ${formatGoalDate(targetDate)}`
      : targetDate
        ? `No further loss required by ${formatGoalDate(targetDate)}`
        : "Set a target date in settings to compare";

  /* Six metrics that used to be six cards. As ledger rows they share one
     numeral column, so the values line up and can be read down. */
  const metrics: Array<{
    label: string;
    value: string;
    hint: string;
    tone?: "primary" | "accent" | "ember";
  }> = [
    {
      label: "Projected goal date",
      value: stats.projectedGoalDate ? formatGoalDate(stats.projectedGoalDate) : "--",
      hint: projectedHint,
    },
    {
      label: "Weekly pace",
      value: weeklyRate,
      hint: paceHint,
      tone: paceGuardrailActive ? "ember" : "primary",
    },
    {
      label: "Remaining to goal",
      value: remainingToGoal != null ? formatBodyweight(Math.abs(remainingToGoal)) : "--",
      hint:
        stats.goalWeight != null
          ? `To go — goal ${formatBodyweight(stats.goalWeight)}`
          : "Set a goal weight in settings",
    },
    { label: "BMI", value: stats.bmi?.toFixed(1) ?? "--", hint: "Based on height set in profile" },
    {
      label: "Goal weight",
      value: formatBodyweight(stats.goalWeight),
      hint: "Target set in profile settings",
    },
    {
      label: "Direction",
      value: stats.trend === "stable" ? "Holding" : stats.trend === "down" ? "Cutting" : "Rising",
      hint: "Based on recent change velocity",
    },
  ];

  return (
    <Section title="Projection">
      {paceGuardrailActive ? (
        <Notice className="mb-4">
          Pace above ~1% of bodyweight/wk — consider easing to protect muscle.
        </Notice>
      ) : null}
      <Rows
        columns={STAT_COLUMNS_MOBILE}
        mdColumns={STAT_COLUMNS}
        head={
          <>
            <span>Metric</span>
            <span className="hidden md:block">Basis</span>
            <span className="text-right">Value</span>
          </>
        }
      >
        {metrics.map((metric) => (
          <Row
            key={metric.label}
            columns={STAT_COLUMNS_MOBILE}
            mdColumns={STAT_COLUMNS}
          >
            <span className="min-w-0">
              <span className="block truncate text-secondary">{metric.label}</span>
              <Sub className="mt-0.5 block">{metric.hint}</Sub>
            </span>
            <span className="hidden truncate text-tertiary md:block">{metric.hint}</span>
            <Num tone={metric.tone === "ember" ? "ember" : "primary"}>{metric.value}</Num>
          </Row>
        ))}
      </Rows>
    </Section>
  );
}

const STAT_COLUMNS_MOBILE = "minmax(0,1fr) minmax(0,7rem)";
const STAT_COLUMNS = "minmax(0,14rem) minmax(0,1fr) minmax(0,9rem)";

function formatGoalDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
