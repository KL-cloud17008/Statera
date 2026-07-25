"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { formatWorkoutVolume } from "@/lib/units";
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
    <div className="page-shell">
      <SectionHeader
        eyebrow="Training History"
        title="Review performance over time"
        description="Use the calendar to scan training frequency, then drill into sessions, volume, duration, and PR activity."
      />

      {sessions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No completed sessions yet"
          description="Finish a training session and the calendar, exercise links, and PR summaries will appear here."
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Calendar</p>
                  <CardTitle className="mt-2">
                    {monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" size="icon-sm" onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous month</span>
                  </Button>
                  <Button type="button" variant="secondary" size="icon-sm" onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next month</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: calendar[0]?.weekday ?? 0 }).map((_, index) => (
                  <div key={`pad-${index}`} className="h-[4.5rem] rounded-[var(--radius-card)] border border-transparent" />
                ))}
                {calendar.map((day) => {
                  const daySessions = sessionMap.get(day.date) ?? [];
                  const isSelected = selectedDate === day.date;
                  return (
                    <button
                      key={day.date}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedDate(isSelected ? null : day.date)}
                      className={`interactive-row flex h-[4.5rem] flex-col rounded-[var(--radius-card)] border px-3 py-3 text-left ${isSelected ? "border-[var(--hairline-strong)] bg-[var(--basalt-3)]" : "border-[var(--hairline)] bg-[var(--basalt-1)]"}`}
                    >
                      <span className="text-sm font-semibold text-foreground data-number">{day.day}</span>
                      <div className="mt-auto flex flex-wrap gap-1">
                        {daySessions.slice(0, 4).map((session) => (
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
              <CardTitle>
                {selectedDate ? `Sessions for ${selectedDate}` : "All sessions"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No completed sessions in this view yet.</p>
              ) : (
                filteredSessions.map((session) => (
                  <div key={session.id} className="interactive-row warm-row rounded-[var(--radius-card)] p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-foreground">{session.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {new Date(`${session.trainingDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <div>
                          <p className="eyebrow">Sets</p>
                          <p className="mt-2 text-lg font-semibold text-foreground data-number">{session.setCount}</p>
                        </div>
                        <div>
                          <p className="eyebrow">Volume</p>
                          <p className="mt-2 text-lg font-semibold text-foreground data-number">{formatWorkoutVolume(session.volume)} moved</p>
                        </div>
                        <div>
                          <p className="eyebrow">Duration</p>
                          <p className="mt-2 text-lg font-semibold text-foreground data-number">{session.durationMinutes != null ? `${session.durationMinutes}m` : "--"}</p>
                        </div>
                        <div>
                          <p className="eyebrow">PRs</p>
                          <p className="mt-2 text-lg font-semibold text-primary data-number">{session.prCount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {session.exercises.map((exercise) => (
                        <Link
                          key={`${session.id}-${exercise}`}
                          href={`/workout/exercise/${encodeURIComponent(exercise)}`}
                          className="warm-pill rounded-full px-3 py-1.5 text-xs transition-colors hover:text-foreground"
                        >
                          {exercise}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
