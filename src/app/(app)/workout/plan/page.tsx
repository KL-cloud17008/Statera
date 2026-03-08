import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { getWorkoutPlans } from "@/actions/workout";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { getOrCreateCurrentUser } from "@/lib/current-user";

const DAY_NAMES: Record<number, string> = {
  1: "Day 1",
  2: "Day 2",
  3: "Day 3",
  4: "Day 4",
  5: "Day 5",
};

export const metadata: Metadata = {
  title: "Workout Plan | ATHANOR",
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
        eyebrow="Training Split"
        title="Full workout plan"
        description="Review each programmed day, exercise order, working sets, warm-ups, and finishers."
      >
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-white/8 px-3 py-1.5">{plans.length} programmed days</span>
          <span className="rounded-full bg-white/8 px-3 py-1.5">Editorial plan view</span>
        </div>
      </SectionHeader>

      {plans.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No saved workout plan"
          description="Use the custom session builder on the workout page to start training immediately."
        />
      ) : null}

      {plans.map((plan) => (
        <section key={plan.id} className="editorial-panel px-6 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">{DAY_NAMES[plan.dayOfWeek]}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {plan.sessionName}
              </h2>
              <p className="mt-3 supporting-copy">
                Review the full sequence before you begin so the session runs cleanly once it starts.
              </p>
            </div>
            <Badge variant="secondary">
              {plan.exercises.filter((exercise) => exercise.exerciseType === "WORKING").length} exercises
            </Badge>
          </div>

          <div className="mt-6 grid gap-3">
            {plan.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className={`rounded-[1.3rem] border px-4 py-4 sm:px-5 ${exercise.exerciseType === "WARMUP" ? "border-border/80 bg-background/35" : exercise.exerciseType === "FINISHER" ? "border-warning/30 bg-warning/[0.08]" : "border-border/80 bg-background/45"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{exercise.exerciseName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {exercise.sets} × {exercise.reps}
                      {exercise.tempo ? ` • Tempo ${exercise.tempo}` : ""}
                      {exercise.targetRPE ? ` • RPE ${exercise.targetRPE}` : ""}
                      {exercise.restSeconds != null && exercise.restSeconds > 0 ? ` • Rest ${exercise.restSeconds}s` : ""}
                    </p>
                    {exercise.cues ? <p className="mt-3 text-sm text-muted-foreground">{exercise.cues}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exercise.supersetGroup ? <Badge variant="outline">Superset {exercise.supersetGroup}</Badge> : null}
                    {exercise.exerciseType === "WARMUP" ? <Badge variant="secondary">Warm-up</Badge> : null}
                    {exercise.exerciseType === "FINISHER" ? (
                      <Badge variant="outline" className="border-warning/40 text-warning">
                        Finisher
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
