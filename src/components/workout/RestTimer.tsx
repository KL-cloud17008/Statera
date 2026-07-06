"use client";

import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RestTimer({
  defaultSeconds = 90,
  variant = "inline",
}: {
  defaultSeconds?: number;
  variant?: "inline" | "bar";
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(defaultSeconds);
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAlertedRef = useRef(false);
  const [prevDefault, setPrevDefault] = useState(defaultSeconds);

  // The sticky bar follows the current exercise, so pick up its programmed
  // rest when it changes — but never interrupt a countdown in progress.
  if (prevDefault !== defaultSeconds) {
    setPrevDefault(defaultSeconds);
    if (!isRunning) {
      setDuration(defaultSeconds);
      setTimeLeft(defaultSeconds);
    }
  }

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          if (!hasAlertedRef.current) {
            hasAlertedRef.current = true;
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
          }
          setIsRunning(false);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setTimeLeft(duration);
    hasAlertedRef.current = false;
  }

  function start() {
    setTimeLeft(duration);
    setIsRunning(true);
    hasAlertedRef.current = false;
  }

  function adjustDuration(delta: number) {
    if (isRunning) {
      setTimeLeft((current) => Math.max(1, current + delta));
      return;
    }

    setDuration((current) => {
      const next = Math.max(15, current + delta);
      setTimeLeft(next);
      return next;
    });
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  if (variant === "bar") {
    return (
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => adjustDuration(-15)}
          disabled={!isRunning && duration <= 15}
          className="text-xs text-[var(--cream-3)] hover:bg-[var(--veil-2)] hover:text-[var(--cream)]"
          aria-label="Reduce rest timer by 15 seconds"
        >
          -15
        </Button>
        {isRunning ? (
          <span
            className={
              timeLeft === 0
                ? "data-number min-w-[3.25rem] text-center text-base font-semibold tracking-normal text-[var(--sky-accent)]"
                : "data-number min-w-[3.25rem] text-center text-base font-semibold tracking-normal text-[var(--cream)]"
            }
          >
            {timeLeft === 0 ? "GO" : display}
          </span>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={start}
            className="gap-1.5 border-[var(--hairline)] bg-[var(--veil-1)] px-2.5 text-[var(--cream)] hover:bg-[var(--veil-2)] hover:text-[var(--cream)]"
            aria-label={`Start ${duration} second rest timer`}
          >
            <Timer className="h-3.5 w-3.5" />
            <span className="data-number">{duration}s</span>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => adjustDuration(15)}
          className="text-xs text-[var(--cream-3)] hover:bg-[var(--veil-2)] hover:text-[var(--cream)]"
          aria-label="Increase rest timer by 15 seconds"
        >
          +15
        </Button>
        {isRunning ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={stop}
            className="px-2 text-xs text-[var(--cream-3)] hover:bg-[var(--veil-2)] hover:text-[var(--cream)]"
            aria-label="Stop rest timer"
          >
            {timeLeft === 0 ? "Reset" : "Stop"}
          </Button>
        ) : null}
      </div>
    );
  }

  if (!isRunning) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="eyebrow">Rest</span>
        <button
          type="button"
          onClick={() => adjustDuration(-15)}
          disabled={duration <= 15}
          className="text-link disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Reduce rest timer by 15 seconds"
        >
          -15
        </button>
        <button type="button" onClick={start} className="inline-flex items-center gap-2 text-link">
          <Timer className="h-3.5 w-3.5" />
          {duration}s
        </button>
        <button
          type="button"
          onClick={() => adjustDuration(15)}
          className="text-link"
          aria-label="Increase rest timer by 15 seconds"
        >
          +15
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="eyebrow">Rest</span>
      <span className="text-lg font-semibold tracking-normal text-foreground data-number">
        {timeLeft === 0 ? "GO" : display}
      </span>
      <button type="button" onClick={stop} className="text-link" aria-label="Stop rest timer">
        {timeLeft === 0 ? "Reset" : "Stop"}
      </button>
    </div>
  );
}
