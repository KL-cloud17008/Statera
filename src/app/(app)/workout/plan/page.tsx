import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";
import { getWorkoutPlans } from "@/actions/workout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DAY_NAMES: Record<number, string> = {
  1: "Day 1",
  2: "Day 2",
  3: "Day 3",
  4: "Day 4",
  5: "Day 5",
};

export default async function WorkoutPlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
  });
  if (!dbUser) return null;

  const plans = await getWorkoutPlans(dbUser.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workout Plan</h1>
        <p className="text-muted-foreground">
          Phase 1: Foundation Re-Build (Weeks 1&ndash;8)
        </p>
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No workout plans found. Run the seed script to populate your
              training plan.
            </p>
            <code className="mt-2 block text-xs text-muted-foreground">
              npx tsx prisma/seed.ts &lt;your-supabase-user-id&gt;
            </code>
          </CardContent>
        </Card>
      )}

      {plans.map((plan) => (
        <Card key={plan.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground text-base">
                {DAY_NAMES[plan.dayOfWeek]}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {plan.exercises.filter((e) => e.exerciseType === "WORKING")
                  .length}{" "}
                exercises
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {plan.sessionName}
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.exercises.map((ex) => (
              <div
                key={ex.id}
                className={`flex items-start gap-3 rounded-md p-2 ${
                  ex.exerciseType === "WARMUP"
                    ? "bg-muted/30"
                    : ex.exerciseType === "FINISHER"
                      ? "bg-orange-500/5"
                      : ""
                }`}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                  {ex.supersetGroup ?? ""}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {ex.exerciseName}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{ex.sets}&times; {ex.reps}</span>
                    {ex.tempo && <span>Tempo: {ex.tempo}</span>}
                    {ex.targetRPE && <span>RPE {ex.targetRPE}</span>}
                    {ex.restSeconds != null && ex.restSeconds > 0 && (
                      <span>Rest: {ex.restSeconds}s</span>
                    )}
                  </div>
                  {ex.cues && (
                    <p className="mt-1 text-xs text-muted-foreground/70 line-clamp-2">
                      {ex.cues}
                    </p>
                  )}
                </div>
                {ex.exerciseType === "WARMUP" && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] shrink-0"
                  >
                    Warm-up
                  </Badge>
                )}
                {ex.exerciseType === "FINISHER" && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] shrink-0 bg-orange-500/20 text-orange-400"
                  >
                    Finisher
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
