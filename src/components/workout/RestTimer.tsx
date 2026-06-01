"use client";

import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";

export function RestTimer({ defaultSeconds = 90 }: { defaultSeconds?: number }) {
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(defaultSeconds);
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAlertedRef = useRef(false);

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
    setDuration((current) => {
      const next = Math.max(15, current + delta);
      setTimeLeft(next);
      return next;
    });
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, "0")}`;

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
