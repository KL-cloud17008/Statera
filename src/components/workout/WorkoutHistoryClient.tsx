"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
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
        eyebrow="Workout History"
        title="Review performance over time"
        description="Use the calendar to scan training frequency, then drill into sessions, volume, duration, and PR activity."
      >
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-white/8 px-3 py-1.5">{sessions.length} recorded sessions</span>
          {selectedDate ? (
            <span className="rounded-full bg-white/8 px-3 py-1.5">Filtering {selectedDate}</span>
          ) : (
            <span className="rounded-full bg-white/8 px-3 py-1.5">All sessions</span>
          )}
        </div>
      </SectionHeader>

      {sessions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No completed sessions yet"
          description="Finish a workout and the calendar, exercise links, and PR summaries will appear here."
        />
      ) : (
        <>
          <section className="editorial-panel px-6 py-6 sm:px-7 sm:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Calendar</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h2>
                <p className="mt-3 supporting-copy">
                  Select a day to isolate those sessions or clear the selection to see the full archive again.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous month</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next month</span>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-2 text-center text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {Array.from({ length: calendar[0]?.weekday ?? 0 }).map((_, index) => (
                <div key={`pad-${index}`} className="h-20 rounded-[1rem] border border-transparent" />
              ))}
              {calendar.map((day) => {
                const daySessions = sessionMap.get(day.date) ?? [];
                const isSelected = selectedDate === day.date;
                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDate(isSelected ? null : day.date)}
                    className={`focus-surface flex h-20 flex-col rounded-[1.15rem] border px-3 py-3 text-left focus-visible:outline-none ${isSelected ? "border-primary/40 bg-primary/10" : "border-border/80 bg-background/35"}`}
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
          </section>

          <Card>
            <CardHeader>
              <div>
                <p className="eyebrow">{selectedDate ? "Filtered View" : "Archive"}</p>
                <CardTitle className="mt-2">
                  {selectedDate ? `Sessions for ${selectedDate}` : "All sessions"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No completed sessions in this view yet.</p>
              ) : (
                filteredSessions.map((session) => (
                  <div key={session.id} className="focus-surface rounded-[1.45rem] border border-border/80 bg-background/35 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-foreground">{session.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {new Date(`${session.trainingDate}T12:00:00`).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <MetricCell label="Sets" value={session.setCount.toString()} />
                        <MetricCell label="Volume" value={Math.round(session.volume).toLocaleString()} />
                        <MetricCell label="Duration" value={session.durationMinutes != null ? `${session.durationMinutes}m` : "--"} />
                        <MetricCell label="PRs" value={session.prCount.toString()} accent />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {session.exercises.map((exercise) => (
                        <Link
                          key={`${session.id}-${exercise}`}
                          href={`/workout/exercise/${encodeURIComponent(exercise)}`}
                          className="focus-surface rounded-full border border-border/80 bg-background/70 px-3 py-1.5 text-xs text-muted-foreground focus-visible:outline-none hover:text-foreground"
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

function MetricCell({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[1rem] border border-border/70 bg-background/35 px-3 py-3">
      <p className="eyebrow">{label}</p>
      <p className={`mt-2 text-lg font-semibold data-number ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
