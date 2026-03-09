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
        eyebrow="Weight Tracker"
        title="See trend, pace, and goal alignment"
        description="Track raw weigh-ins alongside the 7-day moving average, BMI, goal marker, and projected trajectory."
        action={<WeightPageActions />}
      />

      <WeightStatsCards stats={stats} />
      <WeightChart entries={serializedEntries} goalWeight={user.goalWeight} />
      <div className="grid gap-4 xl:grid-cols-2">
        <WeightEntryForm />
        <WeightHistoryList entries={serializedEntries} />
      </div>
    </div>
  );
}
