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
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeGoal}
      aria-valuenow={Math.min(current, safeGoal)}
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
          stroke="rgba(255,255,255,0.2)"
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
      <div className="absolute inset-4 flex flex-col items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/92 px-5 text-center shadow-[var(--shadow-elevated)] backdrop-blur-md">
        <p className="eyebrow">Today</p>
        <p className="mt-1.5 text-3xl font-semibold leading-none text-foreground data-number">
          {current.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Goal {goal.toLocaleString()}
        </p>
        <p className="warm-pill mt-2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
          {percentage}% reached
        </p>
      </div>
    </div>
  );
}
