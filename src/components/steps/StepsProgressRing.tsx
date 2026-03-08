"use client";

export function StepsProgressRing({
  current,
  goal,
  size = 196,
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
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={`${current.toLocaleString()} of ${goal.toLocaleString()} steps`}
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(68,227,157,0.16),transparent_64%)] blur-2xl" />
      <svg viewBox="0 0 200 200" className="relative h-full w-full -rotate-90">
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
          stroke="color-mix(in srgb, var(--color-border) 88%, transparent)"
          strokeWidth="14"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          className="fill-none transition-all duration-700"
          stroke="url(#steps-progress)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-[16%] flex flex-col items-center justify-center rounded-full border border-white/8 bg-background/72 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
        <p className="eyebrow">Today</p>
        <p className="mt-2 text-[clamp(2.1rem,1.7rem+1vw,2.8rem)] font-semibold text-foreground data-number">
          {current.toLocaleString()}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Goal {goal.toLocaleString()}</p>
        <p className="mt-3 rounded-full bg-primary/12 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-primary">
          {percentage}% reached
        </p>
      </div>
    </div>
  );
}
