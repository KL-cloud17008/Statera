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
        eyebrow="Training Split"
        title="4-day circuit workout plan"
        description="Structured beginner supersets with controlled rest, RPE 6–7 guidance, and progressive rounds."
        action={<WorkoutPlanResetButton />}
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No saved workout plan"
          description="Use the custom session builder on the workout page to start training immediately."
        />
      ) : null}

      {plans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">{DAY_NAMES[plan.dayOfWeek]}</p>
                <CardTitle className="mt-2">{plan.sessionName}</CardTitle>
              </div>
              <Badge variant="secondary">
                {plan.exercises.filter((exercise) => exercise.exerciseType === "WORKING").length} exercises
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.exercises.map((exercise) => (
              <div key={exercise.id} className={`rounded-[1.2rem] border border-border p-4 ${exercise.exerciseType === "WARMUP" ? "bg-muted/30" : exercise.exerciseType === "FINISHER" ? "bg-warning/8" : "bg-muted/15"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{exercise.exerciseName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {exercise.sets} × {exercise.reps}
                      {exercise.tempo ? ` • Tempo ${exercise.tempo}` : ""}
                      {exercise.targetRPE ? ` • RPE ${exercise.targetRPE}` : ""}
                      {exercise.restSeconds != null && exercise.restSeconds > 0 ? ` • Rest ${exercise.restSeconds}s` : ""}
                    </p>
                    {exercise.cues ? <p className="mt-2 text-sm text-muted-foreground">{exercise.cues}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    {exercise.supersetGroup ? <Badge variant="outline">Superset {exercise.supersetGroup}</Badge> : null}
                    {exercise.exerciseType === "WARMUP" ? <Badge variant="secondary">Warm-up</Badge> : null}
                    {exercise.exerciseType === "FINISHER" ? <Badge variant="outline" className="border-warning/40 text-warning">Finisher</Badge> : null}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
