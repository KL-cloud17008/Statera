import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getExerciseHistory } from "@/actions/workout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { getWorkoutSessionLoadUnit } from "@/lib/workout-session-meta";
import { calculateSetVolume } from "@/lib/workout-stats";
import { formatWorkoutLoad, formatWorkoutVolume } from "@/lib/units";
import { Dumbbell } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const exerciseName = decodeURIComponent(name);
  return {
    title: `${exerciseName} | Athanor`,
    description: `Review training history, set performance, and best efforts for ${exerciseName}.`,
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
  let bestSetLoadUnit = getWorkoutSessionLoadUnit(null);
  for (const set of sets) {
    const loadUnit = getWorkoutSessionLoadUnit(set.workoutSession.notes);
    const volume = calculateSetVolume(set.weightUsed, set.repsCompleted, loadUnit);
    if (volume > bestVolume) {
      bestVolume = volume;
      bestSet = set;
      bestSetLoadUnit = loadUnit;
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
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to history
            </Button>
          </Link>
        }
      />

      {bestSet ? (
        <Card className="border-primary/30">
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="eyebrow">Best Set</p>
              <p className="mt-2 text-2xl font-semibold text-foreground data-number">{formatWorkoutLoad(bestSet.weightUsed, bestSetLoadUnit)}</p>
            </div>
            <div>
              <p className="eyebrow">Reps</p>
              <p className="mt-2 text-2xl font-semibold text-foreground data-number">{bestSet.repsCompleted ?? "--"}</p>
            </div>
            <div>
              <p className="eyebrow">Volume</p>
              <p className="mt-2 text-2xl font-semibold text-foreground data-number">{formatWorkoutVolume(bestVolume)}</p>
            </div>
          </CardContent>
        </Card>
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
          <Card key={date}>
            <CardHeader>
              <CardTitle>
                {new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dateSets.sort((a, b) => a.setNumber - b.setNumber).map((set) => (
                <div key={set.id} className="interactive-row warm-row flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Set {set.setNumber}</span>
                  <span className="font-semibold text-foreground data-number">{formatWorkoutLoad(set.weightUsed, getWorkoutSessionLoadUnit(set.workoutSession.notes))}</span>
                  <span className="text-muted-foreground">x {set.repsCompleted ?? "--"}</span>
                  {set.actualRPE ? <span className="text-muted-foreground">RPE {set.actualRPE}</span> : null}
                  {set.notes ? <span className="text-muted-foreground">{set.notes}</span> : null}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
