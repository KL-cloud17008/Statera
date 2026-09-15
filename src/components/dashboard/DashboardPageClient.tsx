"use client";

import Link from "next/link";
import { ArrowRight, Dumbbell, Footprints, Scale } from "lucide-react";
import type { SerializedPainCheckIn } from "@/actions/pain";
import { PainCheckInCard } from "@/components/pain/PainCheckInCard";
import { useAppSettings } from "@/components/settings/AppSettingsProvider";
import { Button } from "@/components/ui/button";
import { Figure, Notice, PageTitle, Section } from "@/components/ui/ledger";
import { WorkoutSessionActionButton } from "@/components/workout/WorkoutSessionActionButton";
import { addDaysToDateString, getTodayDateString } from "@/lib/dates";
import { DAY_NAMES, buildPlanDayStats, getPlanDay, isStepGoalSuspendedByPlan } from "@/lib/plan-preview";
import { calculateStepStats, type SerializedStepsEntry } from "@/lib/steps";
import { formatBodyweight, formatBodyweightSecondary, formatWorkoutVolume } from "@/lib/units";
import { getPainGuidance, MOVEMENT_STOP_RULE } from "@/lib/movement-guidance";
import { cn } from "@/lib/utils";

type WorkoutSummary = {
  weeklyVolume: number; prevWeeklyVolume: number; weeklySessions: number;
  hasCompletedWorkoutToday: boolean;
  lastWorkout: { label: string; trainingDate: string; volume: number; setCount: number } | null;
};
type WorkoutDayStatus = { planId: string; dayOfWeek: number; status: "start" | "resume" | "view"; sessionId?: string };

export function DashboardPageClient({ stepsEntries, todaySteps, weightStats, workoutSummary, workoutDayStatuses, mobilitySummary, latestWeightDate, timezone, trainingDayOfWeek, painCheckIn }: {
  stepsEntries: SerializedStepsEntry[]; todaySteps: number;
  weightStats: { currentWeight: number | null; trend: "down" | "up" | "stable" };
  workoutSummary: WorkoutSummary; workoutDayStatuses: WorkoutDayStatus[];
  mobilitySummary: { completedTypes: string[]; footFlareLogged: boolean };
  latestWeightDate: string | null; timezone?: string; trainingDayOfWeek: number;
  painCheckIn: SerializedPainCheckIn | null;
}) {
  const { settings } = useAppSettings();
  const today = getTodayDateString(timezone);
  const dateLabel = new Date(`${today}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const stepStats = calculateStepStats(stepsEntries, settings.stepGoal, { timezone, isGoalSuspended: isStepGoalSuspendedByPlan });
  const active = workoutDayStatuses.find(day => day.status === "resume");
  const todayStatus = workoutDayStatuses.find(day => day.dayOfWeek === trainingDayOfWeek);
  const focusDay = active?.dayOfWeek ?? trainingDayOfWeek;
  const plan = getPlanDay(focusDay);
  const planStats = plan ? buildPlanDayStats(plan) : null;
  const status = active?.status ?? todayStatus?.status ?? "start";
  const footPain = painCheckIn?.date === today ? painCheckIn.footPain : null;
  const guidance = getPainGuidance(footPain);
  const stepPercent = settings.stepGoal > 0 ? Math.min(100, Math.round(todaySteps / settings.stepGoal * 100)) : 0;
  const restDay = !getPlanDay(trainingDayOfWeek);
  const stepGoalSuspended = isStepGoalSuspendedByPlan(today);
  const stepsByDate = new Map(stepsEntries.map(e => [e.date, e.steps ?? 0]));
  const chartDays = Array.from({ length: 7 }, (_, i) => { const date = addDaysToDateString(today, i - 6); return {date, steps: date === today ? todaySteps : stepsByDate.get(date) ?? 0}; });
  const maxSteps = Math.max(settings.stepGoal, ...chartDays.map(d => d.steps), 1);

  return <>
    <PageTitle title="Dashboard" action={<p className="text-row text-tertiary">{dateLabel}</p>} />
    <div className="dashboard-grid">
        <section className="command-surface training-overview dashboard-training" aria-label="Today's training" data-tone="training">
          <div className="training-caption flex items-center justify-between gap-3 text-row text-tertiary">
            <span className="flex items-center gap-2"><Dumbbell className="size-4" />{active ? "Session in progress" : "Today's training"}</span>
            <span>{active ? DAY_NAMES[focusDay] : status === "view" ? "Completed" : restDay ? "Rest day" : DAY_NAMES[focusDay]}</span>
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-primary">{plan?.sessionName.split(" — ")[0] ?? "Complete Rest"}</h2>
          <p className="mt-2 text-body text-secondary">{plan?.sessionName.split(" — ").slice(1).join(" — ") ?? "No strength session scheduled today."}</p>
          {planStats ? <p className="mt-3 text-row text-tertiary">{planStats.exerciseCount} exercises · About {planStats.estimatedMinutes} min</p> : null}
          <div className="training-action mt-6 flex flex-wrap items-center gap-3">
            {plan ? <WorkoutSessionActionButton planId={active?.planId ?? todayStatus?.planId} status={status} prominent className="min-h-touch px-5 text-body" /> : <Button asChild variant="secondary"><Link href="/workout/plan">View training plan</Link></Button>}
            <Button asChild variant="ghost"><Link href="/mobility">Mobility <ArrowRight className="size-4" /></Link></Button>
          </div>
          {guidance.attention ? <Notice className="mt-5">Foot pain {guidance.text}</Notice> : null}
        </section>
        <Section title="Steps" tone="movement" className="dashboard-steps" action={<Link href="/steps" className="text-row text-accent hover:underline">Log steps</Link>}>
          <dl className="flex flex-wrap justify-between gap-4"><Figure label="Today" value={todaySteps.toLocaleString()} size="xl" detail={stepGoalSuspended ? "Rest day · no goal" : `of ${settings.stepGoal.toLocaleString()}`} /><Figure label="7-day average" value={stepStats.sevenDayAverage.toLocaleString()} size="lg" /></dl>
          <div className="mt-4 grid h-24 grid-cols-7 items-end gap-2" aria-label="Steps over the last seven days">
            {chartDays.map(day => <div key={day.date} className="flex h-full flex-col justify-end gap-2 text-center" title={`${day.date}: ${day.steps.toLocaleString()} steps`}><div className={cn("min-h-1 rounded-t-sm",day.date === today ? "bg-accent" : "bg-chart-ink-muted")} style={{height:`${Math.max(3,day.steps/maxSteps*75)}%`}} /><span className="text-caption text-tertiary">{new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US",{weekday:"narrow"})}</span></div>)}
          </div>
          {!stepGoalSuspended ? <p className="mt-4 text-row text-tertiary">{stepPercent}% of goal · {stepStats.currentStreak} day streak</p> : null}
        </Section>
        <Section title="Weight" tone="weight" className="dashboard-weight" action={<Link href="/weight" className="text-row text-accent hover:underline">Weigh in</Link>}>
          <dl><Figure label={latestWeightDate ? `Latest · ${latestWeightDate}` : "Latest"} value={formatBodyweight(weightStats.currentWeight)} detail={formatBodyweightSecondary(weightStats.currentWeight)} size="xl" /></dl>
        </Section>
        <Section title="This week" className="dashboard-week" action={<Link className="text-row text-secondary hover:underline" href="/workout/plan">Full plan</Link>}>
          <div>
            {[1,2,3,4,5,6,0].map(day => {
              const item = getPlanDay(day);
              const dayStatus = workoutDayStatuses.find(s => s.dayOfWeek === day);
              const isToday = day === trainingDayOfWeek;
              return <div key={day} className={cn("week-index-row grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-rule", isToday && "border-l-2 border-l-accent pl-3 bg-accent-subtle/40")}>
                <span className={cn("text-row",isToday ? "font-semibold text-accent" : "text-tertiary")}>{DAY_NAMES[day].slice(0,3)}</span>
                <div className="min-w-0"><p className="text-row font-medium">{item?.sessionName.split(" — ")[0] ?? "Complete Rest"}</p>{item ? <p className="mt-1 hidden text-caption text-tertiary sm:block">{item.sessionName.split(" — ").slice(1).join(" — ")}</p> : null}</div>
                {item ? <WorkoutSessionActionButton planId={dayStatus?.planId} status={dayStatus?.status ?? "start"} className="text-caption [&_svg]:hidden" /> : <span className="text-caption text-tertiary">Rest</span>}
              </div>;
            })}
          </div>
          <p className="text-caption text-tertiary">5 strength days · 2 full rest days</p>
        </Section>
        <Section title="Training totals" className="dashboard-totals">
          <dl className="grid grid-cols-2 gap-4"><Figure label="Sessions this week" value={workoutSummary.weeklySessions} size="lg" /><Figure label="Volume" value={formatWorkoutVolume(workoutSummary.weeklyVolume)} detail="This week" /></dl>
        </Section>
        <Section title="Last session" className="dashboard-last" action={<Link className="text-row text-secondary hover:underline" href="/workout/history">History</Link>}>
          {workoutSummary.lastWorkout ? <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-body font-medium">{workoutSummary.lastWorkout.label}</p><p className="mt-1 text-row text-tertiary">{workoutSummary.lastWorkout.trainingDate} · {workoutSummary.lastWorkout.setCount} sets</p></div><p className="num text-data-md">{formatWorkoutVolume(workoutSummary.lastWorkout.volume)}</p></div> : <p className="text-body text-secondary">Completed sessions will appear here.</p>}
        </Section>
        <Section title="Daily check-in" className="dashboard-checkin">
          <p className="mb-4 text-row text-secondary">Mobility {mobilitySummary.completedTypes.includes("PRE_WORKOUT") ? "primer logged" : "primer not logged"}{mobilitySummary.completedTypes.includes("POST_WORKOUT") ? " · Recovery logged" : ""}</p>
          <PainCheckInCard latest={painCheckIn} timezone={timezone} />
          <details className="mt-4 text-caption text-tertiary"><summary className="cursor-pointer py-2">When to stop</summary><p className="mt-2">{MOVEMENT_STOP_RULE}</p></details>
        </Section>
    </div>
    <div className="quick-links mt-8 border-t border-rule pt-5"><Button asChild variant="secondary"><Link href="/steps"><Footprints className="size-4" /> Log steps</Link></Button><Button asChild variant="secondary"><Link href="/weight"><Scale className="size-4" /> Weigh in</Link></Button></div>
  </>;
}
