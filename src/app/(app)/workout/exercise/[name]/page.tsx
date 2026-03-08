import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { getExerciseHistory } from "@/actions/workout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { calculateSetVolume } from "@/lib/workout-stats";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const exerciseName = decodeURIComponent(name);
  return {
    title: `${exerciseName} | ATHANOR`,
    description: `Review workout history, set performance, and best efforts for ${exerciseName}.`,
  };
}

export default async function ExerciseHistoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const exerciseName = decodeURIComponent(name);

  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const sets = await getExerciseHistory(user.id, exerciseName);

  const byDate = new Map<string, typeof sets>();
  for (const set of sets) {
    const date = set.workoutSession.trainingDate.toISOString().split("T")[0];
    const bucket = byDate.get(date) ?? [];
    bucket.push(set);
    byDate.set(date, bucket);
  }

  const dates = Array.from(byDate.keys()).sort().reverse();

  let bestVolume = 0;
  let bestSet: (typeof sets)[number] | null = null;
  for (const set of sets) {
    const volume = calculateSetVolume(set.weightUsed, set.repsCompleted);
    if (volume > bestVolume) {
      bestVolume = volume;
      bestSet = set;
    }
  }

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Exercise History"
        title={exerciseName}
        description={`${sets.length} total sets across ${dates.length} logged sessions.`}
        action={
          <Link href="/workout/history">
            <Button variant="outline" size="lg" className="gap-2 rounded-full">
              <ArrowLeft className="h-4 w-4" />
              Back to history
            </Button>
          </Link>
        }
      />

      {bestSet ? (
        <section className="editorial-panel px-6 py-6 sm:px-7 sm:py-7">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricBlock label="Best Set" value={`${bestSet.weightUsed ?? "--"} lbs`} />
            <MetricBlock label="Reps" value={`${bestSet.repsCompleted ?? "--"}`} />
            <MetricBlock label="Volume" value={Math.round(bestVolume).toLocaleString()} accent />
          </div>
        </section>
      ) : null}

      {dates.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No history for this exercise"
          description="Log a session with this movement and the detailed set history will appear here."
        />
      ) : null}

      {dates.map((date) => {
        const dateSets = byDate.get(date) ?? [];
        return (
          <section key={date} className="editorial-panel-quiet px-6 py-6 sm:px-7 sm:py-7">
            <div>
              <p className="eyebrow">Session</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">
                {new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </h2>
            </div>
            <div className="mt-6 grid gap-3">
              {dateSets.sort((a, b) => a.setNumber - b.setNumber).map((set) => (
                <div
                  key={set.id}
                  className="rounded-[1.2rem] border border-border/80 bg-background/35 px-4 py-4 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="eyebrow">Set {set.setNumber}</span>
                    <span className="font-semibold text-foreground data-number">{set.weightUsed ?? "--"} lbs</span>
                    <span className="text-muted-foreground">× {set.repsCompleted ?? "--"}</span>
                    {set.actualRPE ? <span className="text-muted-foreground">RPE {set.actualRPE}</span> : null}
                  </div>
                  {set.notes ? <p className="mt-3 text-sm text-muted-foreground">{set.notes}</p> : null}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function MetricBlock({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[1.25rem] border border-border/80 bg-background/35 px-4 py-4">
      <p className="eyebrow">{label}</p>
      <p className={`mt-3 text-2xl font-semibold tracking-tight data-number ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
