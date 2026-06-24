import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { getWorkoutPlans } from "@/actions/workout";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { WorkoutPlanResetButton } from "@/components/workout/WorkoutPlanResetButton";
import { SectionHeader } from "@/components/ui/section-header";
import { getOrCreateCurrentUser } from "@/lib/current-user";

const WEEK_STRUCTURE = [
  { day: "Monday", role: "Lift", dayOfWeek: 1, note: "Upper-body push and pull foundation." },
  { day: "Tuesday", role: "Lift", dayOfWeek: 2, note: "Stable lower-body strength and trunk control." },
  { day: "Wednesday", role: "Mobility + 10,000 steps", note: "Recovery mobility plus the 10,000-step day-level target; no added cardio." },
  { day: "Thursday", role: "Lift", dayOfWeek: 4, note: "Back and shoulder emphasis." },
  { day: "Friday", role: "Lift", dayOfWeek: 5, note: "Machine posterior chain, hip stability, and calf work." },
  { day: "Saturday", role: "Mobility", note: "12-20 minute recovery mobility and balance reset; no extra conditioning." },
  { day: "Sunday", role: "Complete rest", note: "Complete rest or very low-intensity recovery mobility only if needed." },
] as const;

export const metadata: Metadata = {
  title: "Workout Plan | Athanor",
  description: "Review the scheduled training split, exercise order, at-home primers, circuit blocks, and rest guidance.",
};

export default async function WorkoutPlanPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const plans = await getWorkoutPlans(user.id);
  const plansByDay = new Map(plans.map((plan) => [plan.dayOfWeek, plan]));

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Training split"
        title="A scaled five-pillar protocol for four lift days, two recovery days, and one full rest day."
        description="Strength, low-intensity walking only, mobility/flexibility, supported balance, and recovery are organized as at-home primer, walk to gym, gym ramp-up sets, strength blocks, and required later recovery."
        action={<WorkoutPlanResetButton />}
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No saved workout plan"
          description="Use the custom session builder on the workout page to start training immediately."
        />
      ) : null}

      <section className="document-panel">
        <div className="command-panel grid gap-4 rounded-[var(--radius-panel)] p-6 md:grid-cols-[12rem_minmax(0,1fr)_14rem] md:items-end">
          <div>
            <p className="eyebrow">Week structure</p>
            <p className="data-number mt-3 text-4xl text-foreground">4/2/1</p>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Monday, Tuesday, Thursday, and Friday are lifting days. Wednesday is mobility plus a
            10,000-step target, and Saturday is required recovery mobility. Sunday is complete rest or very low-intensity
            recovery mobility only if needed. Walking to and from the gym is the only planned cardio. On lift days, do the mobility primer at home,
            walk to the gym as the general warm-up, then do 1-2 easy ramp-up sets on the first
            programmed lift or machine before Block A. Use double progression only when all sets reach the top of the rep range at target RPE with clean form. Required later recovery is completed separately later the same day.
          </p>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Badge variant="secondary">4 lift days</Badge>
            <Badge variant="outline">2 mobility</Badge>
            <Badge variant="outline">1 rest</Badge>
          </div>
        </div>

        <div className="divide-y divide-border">
          {WEEK_STRUCTURE.map((day, index) => {
            const plan = "dayOfWeek" in day ? plansByDay.get(day.dayOfWeek) : null;
            const workingCount = plan?.exercises.filter((exercise) => exercise.exerciseType === "WORKING").length ?? 0;
            const totalSets = plan?.exercises
              .filter((exercise) => exercise.exerciseType === "WORKING")
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
                      <h2 className="text-3xl">{plan?.sessionName ?? day.role}</h2>
                      <Badge variant={day.role === "Lift" ? "default" : "outline"}>{day.role}</Badge>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{day.note}</p>
                  </div>

                  {plan ? (
                    <div className="grid grid-cols-2 gap-4 text-sm lg:text-right">
                      <div>
                        <p className="eyebrow text-[10px]">Exercises</p>
                        <p className="data-number mt-2 text-2xl text-foreground">{workingCount}</p>
                      </div>
                      <div>
                        <p className="eyebrow text-[10px]">Sets</p>
                        <p className="data-number mt-2 text-2xl text-foreground">{totalSets}</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                {plan ? (
                  <div className="mt-6 divide-y divide-border border-y border-border">
                    {plan.exercises.map((exercise) => (
                      <article key={exercise.id} className="interactive-row grid gap-4 px-2 py-4 md:grid-cols-[minmax(0,1fr)_minmax(14rem,auto)] md:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <p className="font-medium text-foreground">{exercise.exerciseName}</p>
                            {exercise.supersetGroup ? <Badge variant="outline">Circuit {exercise.supersetGroup}</Badge> : null}
                            {exercise.exerciseType === "WARMUP" ? <Badge variant="secondary">At-home primer</Badge> : null}
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
                      ? "Use the mobility page for recovery mobility and log 10,000 steps as the day-level target. Keep intensity easy, use supported balance only, and do not add cardio."
                      : day.role === "Mobility"
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
