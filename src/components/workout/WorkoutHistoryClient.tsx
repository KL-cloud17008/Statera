"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildWorkoutCalendar } from "@/lib/workout-stats";

type HistorySession = {
  id: string;
  trainingDate: string;
  label: string;
  setCount: number;
  volume: number;
  durationMinutes: number | null;
  prCount: number;
  exercises: string[];
};

export function WorkoutHistoryClient({ sessions }: { sessions: HistorySession[] }) {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const sessionMap = useMemo(() => {
    const map = new Map<string, HistorySession[]>();
    for (const session of sessions) {
      const bucket = map.get(session.trainingDate) ?? [];
      bucket.push(session);
      map.set(session.trainingDate, bucket);
    }
    return map;
  }, [sessions]);

  const calendar = useMemo(() => {
    return buildWorkoutCalendar(
      sessions.map((session) => ({
        id: session.id,
        trainingDate: new Date(`${session.trainingDate}T12:00:00`),
        notes: session.label,
        sets: [],
      })),
      monthDate
    );
  }, [monthDate, sessions]);

  const filteredSessions = selectedDate ? sessionMap.get(selectedDate) ?? [] : sessions;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workout History</h1>
        <p className="text-muted-foreground">Calendar view, session volume, and personal-record highlights.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardTitle>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: calendar[0]?.weekday ?? 0 }).map((_, index) => (
              <div key={`pad-${index}`} className="h-16 rounded-lg border border-transparent" />
            ))}
            {calendar.map((day) => {
              const daySessions = sessionMap.get(day.date) ?? [];
              const isSelected = selectedDate === day.date;
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(isSelected ? null : day.date)}
                  className={`flex h-16 flex-col rounded-lg border p-2 text-left ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                >
                  <span className="text-sm font-medium text-foreground">{day.day}</span>
                  <div className="mt-auto flex flex-wrap gap-1">
                    {daySessions.slice(0, 3).map((session) => (
                      <span key={session.id} className="h-2 w-2 rounded-full bg-primary" />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{selectedDate ? `Sessions for ${selectedDate}` : 'All Sessions'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed sessions in this view yet.</p>
          ) : (
            filteredSessions.map((session) => (
              <div key={session.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{session.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(`${session.trainingDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{session.setCount} sets</p>
                    <p>{Math.round(session.volume).toLocaleString()} lbs</p>
                    {session.durationMinutes != null ? <p>{session.durationMinutes} min</p> : null}
                    {session.prCount > 0 ? <p className="font-medium text-green-500">{session.prCount} PRs</p> : null}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {session.exercises.map((exercise) => (
                    <Link key={`${session.id}-${exercise}`} href={`/workout/exercise/${encodeURIComponent(exercise)}`} className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
                      {exercise}
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
