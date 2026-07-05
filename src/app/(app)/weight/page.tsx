import type { Metadata } from "next";
import { getWeightEntries } from "@/actions/weight";
import { WeightChart } from "@/components/weight/WeightChart";
import { WeightEntryForm } from "@/components/weight/WeightEntryForm";
import { WeightHistoryList } from "@/components/weight/WeightHistoryList";
import { WeightPageActions } from "@/components/weight/WeightPageActions";
import { WeightStatsCards } from "@/components/weight/WeightStatsCards";
import { SectionHeader } from "@/components/ui/section-header";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { computeWeightStats } from "@/lib/weight";
import { formatBodyweight, formatBodyweightConversion, formatBodyweightDelta } from "@/lib/units";

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

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Weight"
        title="Body-composition ledger."
        description="Pounds remain canonical, with kg and stone available at the point of entry."
        action={<WeightPageActions />}
      />

      <section className="command-deck grid gap-8 p-6 sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.34fr)] xl:items-end" data-animated="true">
        <div>
          <p className="eyebrow">Current Bodyweight</p>
          <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-3">
            <p className="data-number value-reveal text-6xl font-medium leading-none text-[var(--cream)] sm:text-7xl">
              {formatBodyweight(stats.currentWeight)}
            </p>
            <p className="pb-2 font-mono text-xs font-medium uppercase tracking-[0.16em] text-[var(--cream-3)]">
              Goal {formatBodyweight(stats.goalWeight)}
            </p>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--cream-2)]">
            {formatBodyweightConversion(stats.currentWeight) || "Log a weigh-in to unlock kg and stone conversion."}
          </p>
          <div className="mt-8 h-1.5 overflow-hidden rounded-full border border-[var(--hairline)] bg-[rgba(240,232,220,0.06)]">
            <div className="track-fill h-full rounded-full bg-[var(--cream)]" style={{ width: `${getWeightProgress(stats.startWeight, stats.currentWeight, stats.goalWeight)}%` }} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <WeightHeroMetric label="Start" value={formatBodyweight(stats.startWeight)} detail="Baseline" />
          <WeightHeroMetric label="Change" value={formatBodyweightDelta(stats.totalChange)} detail="From start weight" />
          <WeightHeroMetric label="7-Day" value={formatBodyweight(stats.avg7Day)} detail="Smoothed trend" />
        </div>
      </section>

      <WeightStatsCards stats={stats} />
      <WeightChart entries={serializedEntries} goalWeight={user.goalWeight} />
      <div className="grid gap-4 xl:grid-cols-2">
        <WeightEntryForm timezone={user.timezone} />
        <WeightHistoryList entries={serializedEntries} timezone={user.timezone} />
      </div>
    </div>
  );
}

function WeightHeroMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="black-glass rounded-[var(--radius-card)] p-4">
      <p className="eyebrow text-[10px]">{label}</p>
      <p className="data-number value-reveal mt-3 text-2xl font-medium text-[var(--cream)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--cream-3)]">{detail}</p>
    </div>
  );
}

function getWeightProgress(start: number | null, current: number | null, goal: number | null) {
  if (start == null || current == null || goal == null || start === goal) {
    return 0;
  }

  const progress = ((start - current) / (start - goal)) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}
