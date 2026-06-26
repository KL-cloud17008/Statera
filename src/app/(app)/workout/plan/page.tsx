import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { getWorkoutPlanDayStatuses, getWorkoutPlans } from "@/actions/workout";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { WorkoutSessionActionButton } from "@/components/workout/WorkoutSessionActionButton";
import { WorkoutPlanResetButton } from "@/components/workout/WorkoutPlanResetButton";
import { SectionHeader } from "@/components/ui/section-header";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { getTrainingDayOfWeek } from "@/lib/dates";
import { SESSION_PREP_ITEMS, isLoggableTrainingExercise } from "@/lib/training-session";

const WEEK_STRUCTURE = [
  { day: "Monday", title: "Upper A", protocol: "Strength Protocol", dayOfWeek: 1, note: "Upper-body push and pull foundation." },
  { day: "Tuesday", title: "Lower A", protocol: "Strength Protocol", dayOfWeek: 2, note: "Stable lower-body strength and trunk control." },
  { day: "Wednesday", title: "Mobility, Flexibility & Balance", protocol: "Recovery Protocol", meta: "10,000 steps", note: "Recovery mobility, flexibility, supported balance, and Wednesday's 10,000-step target." },
  { day: "Thursday", title: "Upper B", protocol: "Strength Protocol", dayOfWeek: 4, note: "Back and shoulder emphasis." },
  { day: "Friday", title: "Lower B", protocol: "Strength Protocol", dayOfWeek: 5, note: "Machine posterior chain, hip stability, and knee-support accessory work." },
  { day: "Saturday", title: "Mobility, Flexibility & Balance", protocol: "Recovery Protocol", note: "12-20 minutes of recovery mobility, flexibility, and supported balance." },
  { day: "Sunday", title: "Complete rest", protocol: "Full Rest", note: "Complete rest. Gentle recovery mobility only if needed." },
] as const;

export const metadata: Metadata = {
  title: "Training Plan | Athanor",
  description: "Review the current training phase, weekly protocol rhythm, exercise order, and rest guidance.",
};

export default async function WorkoutPlanPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const [plans, dayStatuses] = await Promise.all([
    getWorkoutPlans(user.id),
    getWorkoutPlanDayStatuses(user.id, user.timezone),
  ]);
  const plansByDay = new Map(plans.map((plan) => [plan.dayOfWeek, plan]));
  const statusByPlanId = new Map(dayStatuses.map((status) => [status.planId, status]));
  const trainingDayOfWeek = getTrainingDayOfWeek(new Date(), user.timezone);

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Training Protocol"
        title="Current phase"
        description="Four strength protocols. Two recovery protocols. One full rest day."
        action={<WorkoutPlanResetButton />}
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No saved training plan"
          description="Use the custom session builder on the Training page to start immediately."
        />
      ) : null}

      <section className="document-panel">
        <div className="command-deck grid gap-4 rounded-[var(--radius-panel)] p-6 md:grid-cols-[12rem_minmax(0,1fr)_14rem] md:items-end" data-animated="true">
          <div>
            <p className="eyebrow">Week structure</p>
            <p className="data-number mt-3 text-4xl text-foreground">4/2/1</p>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-white/68">
            Strength protocols run Monday, Tuesday, Thursday, and Friday. Wednesday carries the
            10,000-step target. Saturday is recovery protocol. Sunday is full rest. Ramp-up sets
            stay outside the ledger. Progress only after clean top-range sets at target RPE.
            Required later recovery remains separate.
          </p>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Badge variant="secondary">4 strength</Badge>
            <Badge variant="outline">2 recovery</Badge>
            <Badge variant="outline">1 full rest</Badge>
          </div>
        </div>

        <div className="session-prep-strip">
          <div>
            <p className="eyebrow">Session prep</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Non-loggable arrival guidance. No set rows.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {SESSION_PREP_ITEMS.map((item) => (
              <div key={item.label} className="border-t border-border/70 pt-3">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border">
          {WEEK_STRUCTURE.map((day, index) => {
            const plan = "dayOfWeek" in day ? plansByDay.get(day.dayOfWeek) : null;
            const loggableExercises = plan?.exercises.filter(isLoggableTrainingExercise) ?? [];
            const workingCount = loggableExercises.length;
            const totalSets = loggableExercises
              .reduce((sum, exercise) => sum + exercise.sets, 0) ?? 0;

            return (
              <section key={day.day} className="py-8 first:pt-0 last:pb-0">
                <div className="grid gap-5 lg:grid-cols-[8rem_minmax(0,1fr)_minmax(12rem,auto)] lg:items-start">
                  <div>
                    <p className="data-number text-3xl text-muted-foreground">{String(index + 1).padStart(2, "0")}</p>
                    <p className="eyebrow mt-3">{day.day}</p>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-3xl">{plan?.sessionName ?? day.title}</h2>
                      <Badge variant={day.protocol === "Strength Protocol" ? "default" : "outline"}>{day.protocol}</Badge>
                      {"meta" in day ? <Badge variant="secondary">{day.meta}</Badge> : null}
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{day.note}</p>
                  </div>

                  {plan ? (
                    <div className="grid gap-4 text-sm lg:justify-items-end lg:text-right">
                      <WorkoutSessionActionButton
                        planId={plan.id}
                        status={statusByPlanId.get(plan.id)?.status ?? "start"}
                        prominent={plan.dayOfWeek === trainingDayOfWeek}
                        fullWidth
                        className="sm:w-auto sm:min-w-40"
                      />
                      <div className="grid w-full grid-cols-2 gap-4">
                        <div>
                          <p className="eyebrow text-[10px]">Exercises</p>
                          <p className="data-number mt-2 text-2xl text-foreground">{workingCount}</p>
                        </div>
                        <div>
                          <p className="eyebrow text-[10px]">Sets</p>
                          <p className="data-number mt-2 text-2xl text-foreground">{totalSets}</p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {plan ? (
                  <div className="mt-6 divide-y divide-border border-y border-border">
                    {loggableExercises.map((exercise) => (
                      <article key={exercise.id} className="interactive-row grid gap-4 px-2 py-4 md:grid-cols-[minmax(0,1fr)_minmax(14rem,auto)] md:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <p className="font-medium text-foreground">{exercise.exerciseName}</p>
                            {exercise.supersetGroup ? <Badge variant="outline">Circuit {exercise.supersetGroup}</Badge> : null}
                            {exercise.exerciseType === "ACCESSORY" ? <Badge variant="outline">Low-dose accessory</Badge> : null}
                            {exercise.exerciseType === "FINISHER" ? <Badge variant="outline">Finisher</Badge> : null}
                          </div>
                          {exercise.cues ? <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{exercise.cues}</p> : null}
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground md:text-right">
                          {exercise.sets} x {exercise.reps}
                          {exercise.tempo ? `, tempo ${exercise.tempo}` : ""}
                          {exercise.targetRPE ? `, RPE ${exercise.targetRPE}` : ""}
                          {exercise.restSeconds != null && exercise.restSeconds > 0 ? `, rest ${exercise.restSeconds}s` : ""}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 border-y border-border py-4 text-sm leading-relaxed text-muted-foreground">
                    {day.day === "Wednesday"
                      ? "Use the mobility page for recovery mobility. Step target: 10,000. Keep intensity easy, use supported balance only, and do not add conditioning."
                      : day.protocol === "Recovery Protocol"
                        ? "Use the mobility page for 12-20 minutes of recovery mobility, flexibility, and supported balance. Do not add conditioning."
                        : "Keep the day deliberately empty. Use only gentle recovery mobility if needed."}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
