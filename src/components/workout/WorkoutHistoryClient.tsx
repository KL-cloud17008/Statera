"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Figure, PageTitle, Section } from "@/components/ui/ledger";
import { formatWorkoutVolume } from "@/lib/units";
import { cn } from "@/lib/utils";
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
    <>
      <PageTitle
        eyebrow="Training History"
        title="Review performance over time"
        lead="Use the calendar to scan training frequency, then drill into sessions, volume, duration, and PR activity."
      />

      {sessions.length === 0 ? (
        <Section className="mt-6">
          <EmptyState
            icon={History}
            title="No completed sessions yet"
            description="Finish a training session and the calendar, exercise links, and PR summaries will appear here."
          />
        </Section>
      ) : (
        <>
          <Section
            className="mt-6"
            title={monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            action={
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="icon-sm" onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Previous month</span>
                </Button>
                <Button type="button" variant="secondary" size="icon-sm" onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Next month</span>
                </Button>
              </div>
            }
          >
            <div className="grid grid-cols-7 gap-1 border-b border-rule-strong pb-2 text-center text-label uppercase text-tertiary">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {Array.from({ length: calendar[0]?.weekday ?? 0 }).map((_, index) => (
                <div key={`pad-${index}`} className="min-h-touch" />
              ))}
              {calendar.map((day) => {
                const daySessions = sessionMap.get(day.date) ?? [];
                const isSelected = selectedDate === day.date;
                const label = new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                });

                return (
                  <button
                    key={day.date}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`${label}, ${daySessions.length} ${daySessions.length === 1 ? "session" : "sessions"}`}
                    onClick={() => setSelectedDate(isSelected ? null : day.date)}
                    className={cn(
                      "flex min-h-touch flex-col items-center justify-center gap-1 rounded-control border px-1 py-2",
                      "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      isSelected
                        ? "border-accent bg-accent-subtle"
                        : "border-transparent hover:bg-row-hover"
                    )}
                  >
                    <span className={cn("num text-row", isSelected ? "text-accent" : "text-primary")}>
                      {day.day}
                    </span>
                    {/* Training days are marked by a dot rather than a fill, so
                        the selected state stays distinguishable from activity. */}
                    <span className="flex h-1.5 items-center gap-0.5">
                      {daySessions.slice(0, 4).map((session) => (
                        <span key={session.id} className="size-1.5 rounded-pill bg-accent" />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section
            title={
              selectedDate
                ? `Sessions for ${new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "All sessions"
            }
            action={
              selectedDate ? (
                <Button type="button" variant="link" onClick={() => setSelectedDate(null)} className="text-caption">
                  Clear filter
                </Button>
              ) : null
            }
          >
            {filteredSessions.length === 0 ? (
              <p className="text-body text-tertiary">No completed sessions in this view yet.</p>
            ) : (
              <div className="ledger-rows">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className="text-body font-medium text-primary">{session.label}</span>
                      <span className="num text-caption text-tertiary">
                        {new Date(`${session.trainingDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <Figure label="Sets" value={session.setCount} />
                      <Figure label="Volume" value={formatWorkoutVolume(session.volume)} />
                      <Figure label="Duration" value={session.durationMinutes != null ? `${session.durationMinutes}m` : "--"} />
                      <Figure label="PRs" value={session.prCount} tone={session.prCount > 0 ? "accent" : "primary"} />
                    </dl>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                      {session.exercises.map((exercise) => (
                        <Link
                          key={`${session.id}-${exercise}`}
                          href={`/workout/exercise/${encodeURIComponent(exercise)}`}
                          className="text-caption text-secondary underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          {exercise}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </>
  );
}
