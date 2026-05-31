import type { Metadata } from "next";
import { getWorkoutPlans } from "@/actions/workout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        description="Structured beginner supersets with controlled rest, RPE 6–7 guidance, and progressive rounds. The plan is presented as a calm training ledger instead of a stack of dark cards."
        action={<WorkoutPlanResetButton />}
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No saved workout plan"
          description="Use the custom session builder on the workout page to start training immediately."
        />
      ) : null}

      <div className="grid gap-5">
        {plans.map((plan) => (
          <Card key={plan.id} className="gap-5 overflow-hidden p-0">
            <CardHeader className="border-b border-border/70 px-6 py-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">{DAY_NAMES[plan.dayOfWeek]}</p>
                  <CardTitle className="mt-2 text-2xl">{plan.sessionName}</CardTitle>
                </div>
                <Badge variant="secondary">
                  {plan.exercises.filter((exercise) => exercise.exerciseType === "WORKING").length} exercises
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="divide-y divide-border/70">
                {plan.exercises.map((exercise) => (
                  <article key={exercise.id} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{exercise.exerciseName}</p>
                        {exercise.supersetGroup ? <Badge variant="outline">Superset {exercise.supersetGroup}</Badge> : null}
                        {exercise.exerciseType === "WARMUP" ? <Badge variant="secondary">Warm-up</Badge> : null}
                        {exercise.exerciseType === "FINISHER" ? <Badge variant="outline" className="border-warning/40 text-warning">Finisher</Badge> : null}
                      </div>
                      {exercise.cues ? <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{exercise.cues}</p> : null}
                    </div>
                    <p className="text-sm text-muted-foreground md:text-right">
                      {exercise.sets} × {exercise.reps}
                      {exercise.tempo ? ` • Tempo ${exercise.tempo}` : ""}
                      {exercise.targetRPE ? ` • RPE ${exercise.targetRPE}` : ""}
                      {exercise.restSeconds != null && exercise.restSeconds > 0 ? ` • Rest ${exercise.restSeconds}s` : ""}
                    </p>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
