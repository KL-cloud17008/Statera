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
  title: "Weight | ATHANOR",
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
        title="Read the signal, not the noise"
        description="Track raw weigh-ins against the moving average, goal marker, and current pace so the page reads more like a brief than a dashboard."
        action={<WeightPageActions />}
      >
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-white/8 px-3 py-1.5">
            {serializedEntries.length} logged weigh-ins
          </span>
          {user.goalWeight ? (
            <span className="rounded-full bg-white/8 px-3 py-1.5">Goal weight saved</span>
          ) : (
            <span className="rounded-full bg-white/8 px-3 py-1.5">
              Add a goal in settings for projections
            </span>
          )}
        </div>
      </SectionHeader>

      <WeightStatsCards stats={stats} />
      <WeightChart entries={serializedEntries} goalWeight={user.goalWeight} />
      <div className="grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
        <WeightEntryForm />
        <WeightHistoryList entries={serializedEntries} />
      </div>
    </div>
  );
}
