"use client";

export function StepsProgressRing({
  current,
  goal,
  size = 148,
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
      role="progressbar"
      aria-label={`${current.toLocaleString()} of ${goal.toLocaleString()} steps`}
      aria-valuemin={0}
      aria-valuemax={safeGoal}
      aria-valuenow={Math.min(current, safeGoal)}
    >
      <svg viewBox="0 0 200 200" className="size-full -rotate-90">
        <circle
          cx="100"
          cy="100"
          r={radius}
          className="fill-none stroke-chart-track"
          strokeWidth="12"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          className="fill-none stroke-chart-ink"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
        <span className="tabular text-data-lg font-medium leading-none text-primary">
          {current.toLocaleString()}
        </span>
        <span className="text-caption text-tertiary">of {goal.toLocaleString()}</span>
        <span className="tabular mt-1 text-micro text-tertiary">{percentage}%</span>
      </div>
    </div>
  );
}
