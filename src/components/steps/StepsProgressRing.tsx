"use client";

export function StepsProgressRing({ current, goal }: { current: number; goal: number }) {
  const safeGoal = Math.max(goal, 1);
  const progress = Math.min(current / safeGoal, 1);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="fill-none stroke-border"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="fill-none stroke-primary transition-all duration-300"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold text-foreground">{current.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">of {goal.toLocaleString()}</p>
      </div>
    </div>
  );
}
