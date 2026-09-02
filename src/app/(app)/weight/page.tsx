import type { Metadata } from "next";
import { getWeightEntries } from "@/actions/weight";
import { WeightChart } from "@/components/weight/WeightChart";
import { WeightEntryForm } from "@/components/weight/WeightEntryForm";
import { WeightHistoryList } from "@/components/weight/WeightHistoryList";
import { WeightPageActions } from "@/components/weight/WeightPageActions";
import { WeightStatsCards } from "@/components/weight/WeightStatsCards";
import { Figure, PageTitle, Section } from "@/components/ui/ledger";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { computeWeightStats } from "@/lib/weight";
import {
  formatBodyweight,
  formatBodyweightDeltaPrimary,
  formatBodyweightDeltaSecondary,
  formatBodyweightSecondary,
} from "@/lib/units";

export const metadata: Metadata = {
  title: "Weight | Athanor",
  description: "Track weigh-ins, see your 7-day trend, compare to goal weight, and monitor projected progress.",
};

export default async function WeightPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const entries = await getWeightEntries(user.id);

  const serializedEntries = entries.map((entry) => ({
    id: entry.id,
    userId: entry.userId,
    date: entry.date.toISOString().split("T")[0],
    weight: entry.weight,
    bodyFatPercent: entry.bodyFatPercent,
    status: entry.status,
    timeOfDay: entry.timeOfDay,
    notes: entry.notes,
    createdAt: entry.createdAt.toISOString(),
  }));

  const stats = computeWeightStats(serializedEntries, {
    startWeight: user.startWeight,
    heightInches: user.heightInches,
    goalWeight: user.goalWeight,
  });

  const progress = getWeightProgress(stats.startWeight, stats.currentWeight, stats.goalWeight);
  const goalWeightSecondary = formatBodyweightSecondary(stats.goalWeight);

  return (
    <>
      <PageTitle
        eyebrow="Weight"
        title="Body-composition ledger."
        lead="Pounds remain canonical, with kg and stone visible throughout the ledger."
        action={<WeightPageActions />}
      />

      <Section className="mt-6">
        {/* The xl figure gets its own line. Sharing a 4-up grid gave it a
            108px cell for a 154px numeral, and since .num is nowrap it
            overran into Start rather than wrapping. */}
        <dl>
          <Figure
            label="Current"
            size="xl"
            value={formatBodyweight(stats.currentWeight)}
            detail={
              formatBodyweightSecondary(stats.currentWeight) ||
              "Log a weigh-in to unlock kg and stone conversion."
            }
          />
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
            <Figure
              label="Start"
              size="lg"
              value={formatBodyweight(stats.startWeight)}
              detail={joinDetail(formatBodyweightSecondary(stats.startWeight), "Baseline")}
            />
            <Figure
              label="Change"
              size="lg"
              tone="accent"
              value={formatBodyweightDeltaPrimary(stats.totalChange)}
              detail={joinDetail(
                formatBodyweightDeltaSecondary(stats.totalChange),
                "From start weight"
              )}
            />
            <Figure
              label="7-day"
              size="lg"
              value={formatBodyweight(stats.avg7Day)}
              detail={joinDetail(formatBodyweightSecondary(stats.avg7Day), "Smoothed trend")}
            />
          </div>
        </dl>

        {/* Progress to goal reads as a rule that fills, not a floating bar. */}
        <div className="mt-8">
          <div className="flex items-baseline justify-between gap-4 text-label uppercase text-tertiary">
            <span className="min-w-0">
              <span className="block">Progress to goal {formatBodyweight(stats.goalWeight)}</span>
              {goalWeightSecondary ? (
                <span className="mt-1 block normal-case">
                  {goalWeightSecondary}
                </span>
              ) : null}
            </span>
            <span className="num text-right text-accent">{progress}%</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden bg-sunken">
            <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </Section>

      <WeightStatsCards stats={stats} />

      <Section title="Trend">
        <WeightChart entries={serializedEntries} goalWeight={user.goalWeight} />
      </Section>

      <Section title="Log a weigh-in">
        <WeightEntryForm timezone={user.timezone} />
      </Section>

      <Section title="History">
        <WeightHistoryList entries={serializedEntries} timezone={user.timezone} />
      </Section>
    </>
  );
}

function joinDetail(conversion: string, detail: string) {
  return conversion ? `${conversion} · ${detail}` : detail;
}

function getWeightProgress(start: number | null, current: number | null, goal: number | null) {
  if (start == null || current == null || goal == null || start === goal) {
    return 0;
  }

  const progress = ((start - current) / (start - goal)) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}
