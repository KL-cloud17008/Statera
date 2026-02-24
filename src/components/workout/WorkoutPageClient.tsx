"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SessionLogger } from "./SessionLogger";
import { WorkoutDayPreview } from "./WorkoutDayPreview";

type Exercise = {
  id: string;
  exerciseName: string;
  sets: number;
  reps: string;
  tempo: string | null;
  restSeconds: number | null;
  targetRPE: string | null;
  cues: string | null;
  supersetGroup: string | null;
  exerciseType: string;
};

type Plan = {
  id: string;
  sessionName: string;
  dayOfWeek: number;
  exercises: Exercise[];
};

type SessionSet = {
  exerciseName: string;
  setNumber: number;
  weightUsed: number | null;
  repsCompleted: number | null;
  actualRPE: number | null;
  notes: string | null;
};

type PrevSet = {
  exerciseName: string;
  setNumber: number;
  weightUsed: number | null;
  repsCompleted: number | null;
};

type TodaySession = {
  id: string;
  completed: boolean;
  startTime: string | null;
  sets: SessionSet[];
} | null;

const DAY_LABELS: Record<number, string> = {
  1: "Day 1: Upper A",
  2: "Day 2: Lower A",
  3: "Day 3: Upper B",
  4: "Day 4: Lower B",
  5: "Day 5: Full Body",
};

export function WorkoutPageClient({
  plans,
  todayDayOfWeek,
  todaySession,
  todayPlanId,
  previousSets,
}: {
  plans: Plan[];
  todayDayOfWeek: number | null;
  todaySession: TodaySession;
  todayPlanId: string | null;
  previousSets: PrevSet[];
}) {
  const defaultTab = todayDayOfWeek?.toString() ?? plans[0]?.dayOfWeek.toString() ?? "1";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workout</h1>
          <p className="text-muted-foreground">
            {todayDayOfWeek
              ? DAY_LABELS[todayDayOfWeek] ?? "Training Day"
              : "Rest Day"}
          </p>
        </div>
        <Link href="/workout/plan">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ClipboardList className="h-4 w-4" />
            Full Plan
          </Button>
        </Link>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full overflow-x-auto flex">
          {plans.map((plan) => (
            <TabsTrigger
              key={plan.dayOfWeek}
              value={plan.dayOfWeek.toString()}
              className="flex-1 text-xs min-w-0 px-1.5"
            >
              <span className="truncate">
                {plan.dayOfWeek === todayDayOfWeek ? "Today" : `Day ${plan.dayOfWeek}`}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {plans.map((plan) => {
          const isToday = plan.dayOfWeek === todayDayOfWeek;

          return (
            <TabsContent key={plan.dayOfWeek} value={plan.dayOfWeek.toString()} className="mt-4">
              {isToday ? (
                <TodayContent
                  plan={plan}
                  session={todaySession}
                  previousSets={previousSets}
                />
              ) : (
                <ReadOnlyDayView plan={plan} />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function TodayContent({
  plan,
  session,
  previousSets,
}: {
  plan: Plan;
  session: TodaySession;
  previousSets: PrevSet[];
}) {
  // Active session in progress
  if (session && !session.completed) {
    return (
      <SessionLogger
        sessionId={session.id}
        sessionName={plan.sessionName}
        exercises={plan.exercises}
        existingSets={session.sets}
        previousSets={previousSets}
        startTime={session.startTime ?? new Date().toISOString()}
      />
    );
  }

  // Completed session
  if (session && session.completed) {
    const totalSets = session.sets.length;
    const totalVolume = session.sets.reduce((sum, s) => {
      if (s.weightUsed && s.repsCompleted) {
        return sum + s.weightUsed * s.repsCompleted;
      }
      return sum;
    }, 0);

    return (
      <Card>
        <CardContent className="py-8 text-center space-y-3">
          <div className="text-4xl">&#10003;</div>
          <p className="text-lg font-semibold text-foreground">Done!</p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span>{totalSets} sets</span>
            <span>{Math.round(totalVolume).toLocaleString()} lbs volume</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No session yet — show preview with start button
  return (
    <WorkoutDayPreview
      plan={plan}
      hideHeader
    />
  );
}

function ReadOnlyDayView({ plan }: { plan: Plan }) {
  const workingExercises = plan.exercises.filter(
    (e) => e.exerciseType === "WORKING"
  );
  const totalWorkingSets = workingExercises.reduce(
    (sum, e) => sum + e.sets,
    0
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-4">
          <p className="font-semibold text-foreground">{plan.sessionName}</p>
          <p className="text-xs text-muted-foreground">
            {workingExercises.length} exercises &middot; {totalWorkingSets} working sets
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Exercises
        </h2>
        {plan.exercises.map((ex, i) => (
          <Card
            key={ex.id}
            className={
              ex.exerciseType === "WARMUP"
                ? "bg-muted/30"
                : ex.exerciseType === "FINISHER"
                  ? "bg-orange-500/5"
                  : ""
            }
          >
            <CardContent className="flex items-center gap-3 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {ex.supersetGroup ?? (i + 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {ex.exerciseName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ex.sets}&times; {ex.reps}
                  {ex.tempo ? ` · ${ex.tempo}` : ""}
                  {ex.targetRPE ? ` · RPE ${ex.targetRPE}` : ""}
                  {ex.restSeconds ? ` · Rest ${ex.restSeconds}s` : ""}
                </p>
                {ex.cues && (
                  <p className="mt-0.5 text-xs text-muted-foreground/70 line-clamp-1">
                    {ex.cues}
                  </p>
                )}
              </div>
              {ex.exerciseType === "WARMUP" && (
                <Badge variant="secondary" className="text-[10px] shrink-0">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
