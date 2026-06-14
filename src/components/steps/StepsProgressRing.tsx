"use client";

export function StepsProgressRing({
  current,
  goal,
  size = 188,
}: {
  current: number;
  goal: number;
  size?: number;
}) {
  const safeGoal = Math.max(goal, 1);
  const progress = Math.min(current / safeGoal, 1);
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const percentage = Math.round(progress * 100);

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      aria-label={`${current.toLocaleString()} of ${goal.toLocaleString()} steps`}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="steps-progress" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-chart-2)" />
            <stop offset="100%" stopColor="var(--color-chart-1)" />
          </linearGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r={radius}
          className="fill-none"
          stroke="color-mix(in srgb, var(--stone) 20%, transparent)"
          strokeWidth="14"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          className="fill-none transition-all duration-500"
          stroke="url(#steps-progress)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="warm-empty-panel absolute inset-4 flex flex-col items-center justify-center rounded-full text-center backdrop-blur-md">
        <p className="eyebrow">Today</p>
        <p className="mt-2 text-4xl font-semibold text-foreground data-number">
          {current.toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Goal {goal.toLocaleString()}
        </p>
        <p className="warm-pill mt-3 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-primary">
          {percentage}% reached
        </p>
      </div>
    </div>
  );
}
