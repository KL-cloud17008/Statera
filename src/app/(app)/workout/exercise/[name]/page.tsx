import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getExerciseHistory } from "@/actions/workout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { calculateSetVolume } from "@/lib/workout-stats";

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
          <Link href="/workout/history">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to workout history</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">{exerciseName}</h1>
          <p className="text-sm text-muted-foreground">{sets.length} sets across {dates.length} sessions</p>
        </div>
      </div>

      {bestSet ? (
        <Card className="border-green-500/30">
          <CardContent className="py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-green-500">Best Set</p>
            <p className="text-lg font-bold text-foreground">{bestSet.weightUsed ?? "--"} lbs × {bestSet.repsCompleted ?? "--"} reps</p>
            <p className="text-xs text-muted-foreground">{Math.round(bestVolume).toLocaleString()} lbs volume</p>
          </CardContent>
        </Card>
      ) : null}

      {dates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No history for this exercise yet.</p>
          </CardContent>
        </Card>
      ) : null}

      {dates.map((date) => {
        const dateSets = byDate.get(date) ?? [];
        return (
          <Card key={date}>
            <CardHeader>
              <CardTitle className="text-sm text-foreground">
                {new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {dateSets.sort((a, b) => a.setNumber - b.setNumber).map((set) => (
                  <div key={set.id} className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="w-8 text-xs text-muted-foreground">Set {set.setNumber}</span>
                    <span className="font-medium text-foreground">{set.weightUsed ?? "--"} lbs</span>
                    <span className="text-muted-foreground">× {set.repsCompleted ?? "--"}</span>
                    {set.actualRPE ? <span className="text-xs text-muted-foreground">RPE {set.actualRPE}</span> : null}
                    {set.notes ? <span className="text-xs text-muted-foreground">{set.notes}</span> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

