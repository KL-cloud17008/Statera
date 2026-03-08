import { getWorkoutPlans } from "@/actions/workout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateCurrentUser } from "@/lib/current-user";

const DAY_NAMES: Record<number, string> = {
  1: "Day 1",
  2: "Day 2",
  3: "Day 3",
  4: "Day 4",
  5: "Day 5",
};

export default async function WorkoutPlanPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const plans = await getWorkoutPlans(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workout Plan</h1>
        <p className="text-muted-foreground">Review your scheduled training days and exercise order.</p>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No workout plans found yet. Use the custom builder on the workout page to start training immediately.</p>
          </CardContent>
        </Card>
      ) : null}

      {plans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-foreground">{DAY_NAMES[plan.dayOfWeek]}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {plan.exercises.filter((exercise) => exercise.exerciseType === "WORKING").length} exercises
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{plan.sessionName}</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.exercises.map((exercise) => (
              <div key={exercise.id} className={`flex items-start gap-3 rounded-md p-2 ${exercise.exerciseType === "WARMUP" ? "bg-muted/30" : exercise.exerciseType === "FINISHER" ? "bg-orange-500/5" : ""}`}>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                  {exercise.supersetGroup ?? ""}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{exercise.exerciseName}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{exercise.sets}× {exercise.reps}</span>
                    {exercise.tempo ? <span>Tempo: {exercise.tempo}</span> : null}
                    {exercise.targetRPE ? <span>RPE {exercise.targetRPE}</span> : null}
                    {exercise.restSeconds != null && exercise.restSeconds > 0 ? <span>Rest: {exercise.restSeconds}s</span> : null}
                  </div>
                  {exercise.cues ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/70">{exercise.cues}</p> : null}
                </div>
                {exercise.exerciseType === "WARMUP" ? <Badge variant="secondary" className="shrink-0 text-[10px]">Warm-up</Badge> : null}
                {exercise.exerciseType === "FINISHER" ? <Badge variant="secondary" className="shrink-0 bg-orange-500/20 text-[10px] text-orange-400">Finisher</Badge> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

