import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";
import { getRecentSessions } from "@/actions/workout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function WorkoutHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
  });
  if (!dbUser) return null;

  const sessions = await getRecentSessions(dbUser.id, 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workout History</h1>
        <p className="text-muted-foreground">Past training sessions</p>
      </div>

      {sessions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No completed sessions yet. Start your first workout!
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {sessions.map((session) => {
          const totalSets = session.sets.length;
          const totalVolume = session.sets.reduce((sum, s) => {
            if (s.weightUsed && s.repsCompleted) {
              return sum + s.weightUsed * s.repsCompleted;
            }
            return sum;
          }, 0);
          const dateStr = session.trainingDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          const duration =
            session.startTime && session.endTime
              ? Math.round(
                  (session.endTime.getTime() - session.startTime.getTime()) /
                    60000
                )
              : null;

          return (
            <Card key={session.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {session.workoutPlan?.dayOfWeek ? `D${session.workoutPlan.dayOfWeek}` : "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {session.workoutPlan?.sessionName ?? "Free Session"}
                  </p>
                  <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                    <span>{dateStr}</span>
                    <span>{totalSets} sets</span>
                    {totalVolume > 0 && (
                      <span>
                        {Math.round(totalVolume).toLocaleString()} lbs
                      </span>
                    )}
                    {duration != null && <span>{duration} min</span>}
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="text-[10px] shrink-0 text-green-500"
                >
                  Complete
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
