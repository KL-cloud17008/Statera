"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => adjustDuration(-15)} disabled={duration <= 15} aria-label="Reduce rest timer by 15 seconds">
          <Minus className="h-3 w-3" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={start} className="h-8 gap-1 text-xs text-muted-foreground">
          <Timer className="h-3 w-3" />
          {duration}s
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => adjustDuration(15)} aria-label="Increase rest timer by 15 seconds">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-mono ${timeLeft === 0 ? "animate-pulse bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"}`}>
      <Timer className="h-3.5 w-3.5" />
      <span>{timeLeft === 0 ? "GO!" : display}</span>
      <button type="button" onClick={stop} className="ml-1 rounded-full p-0.5 hover:bg-background/50" aria-label="Stop rest timer">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
