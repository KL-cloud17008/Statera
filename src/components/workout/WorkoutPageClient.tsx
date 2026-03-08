"use client";

import Link from "next/link";
import { ClipboardList, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SessionLogger } from "./SessionLogger";
import { WorkoutDayPreview } from "./WorkoutDayPreview";
import { CustomWorkoutBuilder } from "./CustomWorkoutBuilder";

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

type TodayPlan = {
  id: string;
  sessionName: string;
  exercises: Exercise[];
} | null;

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

type ActiveSession = {
  id: string;
  sessionName: string;
  startTime: string;
  exercises: Exercise[];
  sets: SessionSet[];
  previousSets: PrevSet[];
} | null;

export function WorkoutPageClient({
  todayPlan,
  activeSession,
}: {
  todayPlan: TodayPlan;
  activeSession: ActiveSession;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workout</h1>
          <p className="text-muted-foreground">
            {activeSession
              ? "Active session in progress"
              : todayPlan
                ? todayPlan.sessionName
                : "Build a custom session or review your plan"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/workout/history">
            <Button variant="outline" size="sm" className="gap-1.5">
              <History className="h-4 w-4" />
              History
            </Button>
          </Link>
          <Link href="/workout/plan">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Full Plan
            </Button>
          </Link>
        </div>
      </div>

      {activeSession ? (
        <SessionLogger
          sessionId={activeSession.id}
          sessionName={activeSession.sessionName}
          exercises={activeSession.exercises}
          existingSets={activeSession.sets}
          previousSets={activeSession.previousSets}
          startTime={activeSession.startTime}
        />
      ) : (
        <Tabs defaultValue={todayPlan ? "today" : "custom"}>
          <TabsList className="w-full">
            <TabsTrigger value="today" className="flex-1">Today</TabsTrigger>
            <TabsTrigger value="custom" className="flex-1">Custom Session</TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="mt-4">
            {todayPlan ? (
              <WorkoutDayPreview plan={todayPlan} />
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No scheduled workout for today. Start a custom session or review your saved templates.
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="custom" className="mt-4">
            <CustomWorkoutBuilder hasActiveSession={false} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
