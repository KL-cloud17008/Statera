"use client";

import Link from "next/link";
import { ClipboardList, History, PlayCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
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
    <div className="page-shell">
      <SectionHeader
        eyebrow="Workout Logger"
        title={activeSession ? activeSession.sessionName : "Train with focus"}
        description={
          activeSession
            ? "Your session is live. Log sets, track rest, and finish with a complete record of the workout."
            : todayPlan
              ? todayPlan.sessionName
              : "Start today’s plan, build a custom session, or load a saved template."
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/workout/history">
              <Button variant="outline" className="gap-2">
                <History className="h-4 w-4" />
                History
              </Button>
            </Link>
            <Link href="/workout/plan">
              <Button variant="secondary" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                Full Plan
              </Button>
            </Link>
          </div>
        }
      />

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
          <TabsList className="w-full justify-start sm:w-fit">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="custom">Custom Session</TabsTrigger>
          </TabsList>
          <TabsContent value="today" className="mt-4">
            {todayPlan ? (
              <WorkoutDayPreview plan={todayPlan} />
            ) : (
              <EmptyState
                icon={PlayCircle}
                title="No scheduled session today"
                description="Use the custom builder below, or open the full plan to review your programmed days."
              />
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
