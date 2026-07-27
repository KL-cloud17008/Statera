"use client";

import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  /* The bar variant sits in the session dock, which is ink chrome — its tones
     come from the ink ramp, not the paper ramp, or the controls vanish. */
  if (variant === "bar") {
    const inkControl =
      "text-ink-muted hover:bg-ink-700 hover:text-ink-text focus-visible:outline-accent-bright";

    return (
      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => adjustDuration(-15)}
          disabled={!isRunning && duration <= 15}
          className={cn("num text-caption", inkControl)}
          aria-label="Reduce rest timer by 15 seconds"
        >
          -15
        </Button>
        {isRunning ? (
          <span
            className={cn(
              "num min-w-[3.25rem] text-center text-data-md font-medium",
              /* Elapsed reads as the goal-met state; olive-bright is the only
                 olive legible on ink. */
              timeLeft === 0 ? "text-accent-bright" : "text-ink-text"
            )}
          >
            {timeLeft === 0 ? "GO" : display}
          </span>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={start}
            className="gap-1.5 border-ink-line bg-ink-800 px-2.5 text-ink-text hover:bg-ink-700 hover:text-ink-text focus-visible:outline-accent-bright"
            aria-label={`Start ${duration} second rest timer`}
          >
            <Timer className="size-3.5" />
            <span className="num">{duration}s</span>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => adjustDuration(15)}
          className={cn("num text-caption", inkControl)}
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
            className={cn("px-2 text-caption", inkControl)}
            aria-label="Stop rest timer"
          >
            {timeLeft === 0 ? "Reset" : "Stop"}
          </Button>
        ) : null}
      </div>
    );
  }

  /* The inline variant sits on the paper canvas. */
  if (!isRunning) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-label uppercase text-tertiary">Rest</span>
        <Button
          type="button"
          variant="link"
          onClick={() => adjustDuration(-15)}
          disabled={duration <= 15}
          className="num text-row"
          aria-label="Reduce rest timer by 15 seconds"
        >
          -15
        </Button>
        <Button type="button" variant="link" onClick={start} className="gap-2 text-row">
          <Timer className="size-3.5" />
          <span className="num">{duration}s</span>
        </Button>
        <Button
          type="button"
          variant="link"
          onClick={() => adjustDuration(15)}
          className="num text-row"
          aria-label="Increase rest timer by 15 seconds"
        >
          +15
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-label uppercase text-tertiary">Rest</span>
      <span
        className={cn(
          "num text-data-md font-medium",
          timeLeft === 0 ? "text-accent" : "text-primary"
        )}
      >
        {timeLeft === 0 ? "GO" : display}
      </span>
      <Button
        type="button"
        variant="link"
        onClick={stop}
        className="text-row"
        aria-label="Stop rest timer"
      >
        {timeLeft === 0 ? "Reset" : "Stop"}
      </Button>
    </div>
  );
}
