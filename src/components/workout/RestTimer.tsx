"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseRestState, readWorkoutStorage, restSecondsRemaining, restStorageKey, startSessionRest, subscribeWorkoutStorage, writeWorkoutStorage } from "@/lib/workout-entry-state";

export function RestTimer({ defaultSeconds = 90, sessionId = "preview" }: { defaultSeconds?: number; sessionId?: string }) {
  const key = restStorageKey(sessionId);
  const raw = useSyncExternalStore(subscribeWorkoutStorage, () => readWorkoutStorage(key), () => null);
  const state = parseRestState(raw) ?? { duration: defaultSeconds, deadline: null };
  const [now, setNow] = useState(() => Date.now());
  const hasAlerted = useRef<number | null>(null);
  const remaining = restSecondsRemaining(state, now);
  const finished = state.deadline !== null && remaining === 0;
  const running = state.deadline !== null && !finished;

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = window.setInterval(tick, 250);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", tick); document.removeEventListener("visibilitychange", tick); };
  }, []);

  useEffect(() => {
    if (finished && state.deadline !== hasAlerted.current) {
      hasAlerted.current = state.deadline;
      if (document.visibilityState === "visible") navigator.vibrate?.([150, 75, 150]);
    }
  }, [finished, state.deadline]);

  function adjust(delta: number) {
    const next = state.deadline !== null && !finished
      ? { ...state, deadline: Math.max(Date.now() + 1000, state.deadline + delta * 1000) }
      : { duration: Math.max(15, state.duration + delta), deadline: null };
    writeWorkoutStorage(key, JSON.stringify(next));
    setNow(Date.now());
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-4">
      <div className="flex items-center gap-2">
        <Timer className="size-4 text-tertiary" />
        <span className="text-caption text-secondary">Rest</span>
        <span role="timer" aria-label={finished ? "Rest complete" : `${remaining} seconds remaining`} className={cn("min-w-14 text-xl font-medium tabular-nums", finished ? "text-accent" : "text-primary")}>{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" className="min-h-12 min-w-12 px-2 tabular-nums" onClick={() => adjust(-15)} aria-label="Reduce rest by 15 seconds" disabled={!running && state.duration <= 15}>−15</Button>
        <Button type="button" variant="ghost" className="min-h-12 min-w-12 px-2 tabular-nums" onClick={() => adjust(15)} aria-label="Increase rest by 15 seconds">+15</Button>
        <Button type="button" variant="secondary" className="min-h-12 min-w-16" onClick={() => {
          if (running) writeWorkoutStorage(key, JSON.stringify({ duration: defaultSeconds, deadline: null }));
          else startSessionRest(sessionId, finished ? defaultSeconds : state.duration);
          setNow(Date.now());
        }}>{running ? "Stop" : finished ? "Restart" : "Start"}</Button>
      </div>
      {finished ? <p role="status" className="w-full text-caption text-accent">Rest complete</p> : null}
    </div>
  );
}
