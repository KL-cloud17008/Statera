import type { Metadata } from "next";
import { getWorkoutPlans } from "@/actions/workout";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { WorkoutPlanResetButton } from "@/components/workout/WorkoutPlanResetButton";
import { SectionHeader } from "@/components/ui/section-header";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { ClipboardList } from "lucide-react";

const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  4: "Thursday",
  5: "Friday",
};

export const metadata: Metadata = {
  title: "Workout Plan | Athanor",
  description: "Review the scheduled training split, exercise order, warm-ups, finishers, and rest guidance.",
};

export default async function WorkoutPlanPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const plans = await getWorkoutPlans(user.id);

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Training split"
        title="4-day circuit workout plan"
        description="Structured beginner supersets with controlled rest, RPE 6–7 guidance, and progressive rounds. The plan reads as a calm ledger with hierarchy in the day, block, and exercise details."
        action={<WorkoutPlanResetButton />}
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No saved workout plan"
          description="Use the custom session builder on the workout page to start training immediately."
        />
      ) : null}

      <div className="space-y-4">
        {plans.map((plan, index) => {
          const workingCount = plan.exercises.filter((exercise) => exercise.exerciseType === "WORKING").length;
          const totalSets = plan.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);

          return (
            <section key={plan.id} className="editorial-surface p-0">
              <div className="grid gap-6 border-b border-border/60 px-5 py-5 sm:px-6 lg:grid-cols-[7rem_minmax(0,1fr)_auto] lg:items-end">
                <div>
                  <p className="data-number text-4xl text-muted-foreground/70">0{index + 1}</p>
                  <p className="eyebrow mt-3">{DAY_NAMES[plan.dayOfWeek]}</p>
                </div>
                <div>
                  <h2 className="max-w-[12ch] text-[clamp(2rem,1.5rem+2vw,3.4rem)]">{plan.sessionName}</h2>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Badge variant="secondary">{workingCount} exercises</Badge>
                  <Badge variant="outline">{totalSets} total sets</Badge>
                </div>
              </div>

              <div className="divide-y divide-border/56 px-5 py-2 sm:px-6">
                {plan.exercises.map((exercise) => (
                  <article key={exercise.id} className="grid gap-4 py-5 md:grid-cols-[minmax(0,1fr)_minmax(13rem,auto)] md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="text-[1.05rem] font-medium tracking-[-0.04em] text-foreground">{exercise.exerciseName}</p>
                        {exercise.supersetGroup ? <Badge variant="outline">Superset {exercise.supersetGroup}</Badge> : null}
                        {exercise.exerciseType === "WARMUP" ? <Badge variant="secondary">Warm-up</Badge> : null}
                        {exercise.exerciseType === "FINISHER" ? <Badge variant="outline" className="border-warning/35 text-warning">Finisher</Badge> : null}
                      </div>
                      {exercise.cues ? <p className="mt-2 max-w-3xl text-sm leading-[1.75] text-muted-foreground">{exercise.cues}</p> : null}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-right">
                      {exercise.sets} × {exercise.reps}
                      {exercise.tempo ? ` · Tempo ${exercise.tempo}` : ""}
                      {exercise.targetRPE ? ` · RPE ${exercise.targetRPE}` : ""}
                      {exercise.restSeconds != null && exercise.restSeconds > 0 ? ` · Rest ${exercise.restSeconds}s` : ""}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
