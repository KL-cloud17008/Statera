import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";
import { getStepsEntries } from "@/actions/steps";
import { StepsEntryForm } from "@/components/steps/StepsEntryForm";
import { StepsChart } from "@/components/steps/StepsChart";
import { StepsHistoryList } from "@/components/steps/StepsHistoryList";

export default async function StepsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
  });

  if (!dbUser) return null;

  const entries = await getStepsEntries(dbUser.id, 30);

  const serialized = entries.map((e) => ({
    id: e.id,
    date: e.date.toISOString().split("T")[0],
    steps: e.steps,
  }));

  // Compute stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todayEntry = serialized.find((e) => e.date === todayStr);
  const todaySteps = todayEntry?.steps ?? 0;

  const last7 = serialized.filter((e) => {
    const d = new Date(e.date);
    const ago = new Date();
    ago.setDate(ago.getDate() - 7);
    return d >= ago;
  });
  const weekAvg =
    last7.length > 0
      ? Math.round(
          last7.reduce((s, e) => s + (e.steps ?? 0), 0) / last7.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Steps</h1>
        <p className="text-muted-foreground">
          Track your daily step count
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-2xl font-bold text-foreground">
            {todaySteps > 0 ? todaySteps.toLocaleString() : "\u2014"}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted-foreground">7-Day Avg</p>
          <p className="text-2xl font-bold text-foreground">
            {weekAvg > 0 ? weekAvg.toLocaleString() : "\u2014"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <StepsChart entries={serialized} />

      {/* Entry Form */}
      <StepsEntryForm />

      {/* History */}
      <StepsHistoryList entries={serialized} />
    </div>
  );
}
