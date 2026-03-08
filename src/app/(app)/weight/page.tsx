import { getWeightEntries } from "@/actions/weight";
import { computeWeightStats } from "@/lib/weight";
import { WeightStatsCards } from "@/components/weight/WeightStatsCards";
import { WeightChart } from "@/components/weight/WeightChart";
import { WeightEntryForm } from "@/components/weight/WeightEntryForm";
import { WeightHistoryList } from "@/components/weight/WeightHistoryList";
import { WeightPageActions } from "@/components/weight/WeightPageActions";
import { getOrCreateCurrentUser } from "@/lib/current-user";

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weight Tracking</h1>
          <p className="text-muted-foreground">Log weigh-ins, monitor trend, and compare against your goal.</p>
        </div>
        <WeightPageActions />
      </div>

      <WeightStatsCards stats={stats} />
      <WeightChart entries={serializedEntries} goalWeight={user.goalWeight} />
      <WeightEntryForm />
      <WeightHistoryList entries={serializedEntries} />
    </div>
  );
}
