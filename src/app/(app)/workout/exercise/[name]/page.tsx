import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getExerciseHistory } from "@/actions/workout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Figure, Num, PageTitle, Row, Rows, Section, Sub } from "@/components/ui/ledger";
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
    <>
      <PageTitle
        eyebrow="Exercise History"
        title={exerciseName}
        lead={`${sets.length} total sets across ${dates.length} logged sessions.`}
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/workout/history">
              <ArrowLeft className="size-4" />
              Back to history
            </Link>
          </Button>
        }
      />

      {bestSet ? (
        <Section className="mt-6" title="Best set">
          <dl className="grid grid-cols-3 gap-4">
            <Figure label="Load" value={formatWorkoutLoad(bestSet.weightUsed, bestSetLoadUnit)} size="lg" tone="accent" />
            <Figure label="Reps" value={bestSet.repsCompleted ?? "--"} size="lg" />
            <Figure label="Volume" value={formatWorkoutVolume(bestVolume)} size="lg" />
          </dl>
        </Section>
      ) : null}

      {dates.length === 0 ? (
        <Section className="mt-6">
          <EmptyState
            icon={Dumbbell}
            title="No history for this exercise"
            description="Log a session with this movement and the detailed set history will appear here."
          />
        </Section>
      ) : null}

      {dates.map((date) => {
        const dateSets = byDate.get(date) ?? [];
        return (
          <Section
            key={date}
            title={new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          >
            <Rows
              columns={SET_COLUMNS}
              head={
                <>
                  <span>Set</span>
                  <span className="text-right">Load</span>
                  <span className="text-right">Reps</span>
                  <span className="text-right">RPE</span>
                </>
              }
            >
              {dateSets.sort((a, b) => a.setNumber - b.setNumber).map((set) => (
                <Row key={set.id} columns={SET_COLUMNS} interactive>
                  <span className="num num-left text-secondary">{set.setNumber}</span>
                  <Num>{formatWorkoutLoad(set.weightUsed, getWorkoutSessionLoadUnit(set.workoutSession.notes))}</Num>
                  <Num tone="secondary">{set.repsCompleted ?? "--"}</Num>
                  <Num tone="secondary">{set.actualRPE ?? "--"}</Num>
                  {set.notes ? <Sub hideOnDesktop={false} className="col-span-full">{set.notes}</Sub> : null}
                </Row>
              ))}
            </Rows>
          </Section>
        );
      })}
    </>
  );
}

/* Set, load, reps, RPE — four narrow columns fit at 375px because every cell
   is a tabular numeral. Notes fold onto a full-width second line. */
const SET_COLUMNS = "2.5rem minmax(0,1fr) minmax(0,3.5rem) minmax(0,3rem)";
