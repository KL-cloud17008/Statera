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
import {
  BACK_PAIN_RULES,
  FOOT_LOAD_RULES,
  LOWER_B_BACK_PAIN_READINESS_NOTE,
  NEXT_WEEK_TAPER_TITLE,
  WEEKLY_SET_SUMMARY,
} from "@/lib/default-workout-plan";
import { SESSION_PREP_ITEMS, isLoggableTrainingExercise } from "@/lib/training-session";

const WEEK_STRUCTURE = [
  {
    day: "Monday",
    title: "Lower A — Leg Strength Peak / Machine-Supported",
    protocol: "Strength Protocol",
    dayOfWeek: 1,
    note: "Heaviest lower-body day of the week. Controlled machine and lunge work. Strength stimulus, not conditioning.",
    laterRecovery: "Lower Body Downshift + Foot-Flare Care, 10-14 minutes.",
  },
  {
    day: "Tuesday",
    title: "Upper A — Push/Pull Strength",
    protocol: "Strength Protocol",
    dayOfWeek: 2,
    note: "Main upper-body session after the heavy lower-body day. Strong work, controlled fatigue.",
    laterRecovery: "Post-Leg Fatigue + Shoulder Reset, 8-12 minutes.",
  },
  {
    day: "Wednesday",
    title: "Posterior Chain + Upper Recovery Strength",
    protocol: "Strength Protocol",
    dayOfWeek: 3,
    note: "Low-to-moderate recovery-strength day. Upper-back, arms, and very low-dose back-extension pattern. No grinding.",
    laterRecovery: "Foot Load Control + Lower Back Relief, 10-14 minutes.",
    setLabel: "9-10",
  },
  {
    day: "Thursday",
    title: "Lower B — Low-Dose Legs + Hip Stability",
    protocol: "Strength Protocol",
    dayOfWeek: 4,
    note: "Reduced lower-body session. Maintain leg pattern, add hip stability, avoid excessive foot and back stress.",
    laterRecovery: "Lower-Body Flush + Sole Care, 10-12 minutes.",
  },
  {
    day: "Friday",
    title: "Training Reset — Machine Upper + Arms",
    protocol: "Strength Protocol",
    dayOfWeek: 5,
    note: "Lowest-dose training day. Machine-supported upper body and arms. Leave fresher than you arrived.",
    laterRecovery: "Weekly Downshift / Foot-Flare Recovery, 12-16 minutes.",
  },
  {
    day: "Saturday",
    title: "Mobility, Flexibility & Balance — Recovery Protocol",
    protocol: "Recovery Protocol",
    note: "Dedicated recovery day. Restore soles, ankles, hips, lower back, and breathing. No conditioning.",
    laterRecovery: "15-20 minutes. Effort 1-3/10. Pain 0-2/10 maximum.",
  },
  {
    day: "Sunday",
    title: "Complete Rest",
    protocol: "Full Rest",
    note: "Keep the day deliberately empty. Gentle recovery mobility only if needed.",
    laterRecovery: "If stiff, use 5-8 minutes of ankle pumps, gentle ankle circles, and supported breathing. No training.",
  },
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
        title={NEXT_WEEK_TAPER_TITLE}
        description="Next week uses a 5-day taper. Day 1 is the highest lower-body stress. Day 2 is upper-body strength. Days 3-5 progressively reduce volume, joint stress, and systemic fatigue. Work steps count as primary load. Foot pain controls walking volume."
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
            <p className="data-number mt-3 text-4xl text-foreground">5/1/1</p>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-white/68">
            Five strength protocols run Monday through Friday. Saturday is the dedicated
            Mobility, Flexibility & Balance recovery protocol. Sunday is full rest. Ramp-up sets
            stay outside the ledger. Required later recovery remains separate.
          </p>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Badge variant="secondary">5 Strength</Badge>
            <Badge variant="outline">1 Recovery</Badge>
            <Badge variant="outline">1 full rest</Badge>
          </div>
        </div>

        <div className="grid gap-4 border-b border-border pb-7 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Foot-load rules</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {FOOT_LOAD_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Back-pain rules</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {BACK_PAIN_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
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
            const showBackReadiness = plan?.dayOfWeek === 1 || plan?.dayOfWeek === 3 || plan?.dayOfWeek === 4;

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
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{day.note}</p>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">Required later recovery:</span> {day.laterRecovery}
                    </p>
                    {showBackReadiness ? (
                      <p className="status-note mt-3 inline-flex px-3 py-2 text-xs font-semibold leading-relaxed text-foreground">
                        {LOWER_B_BACK_PAIN_READINESS_NOTE}
                      </p>
                    ) : null}
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
                          <p className="data-number mt-2 text-2xl text-foreground">
                            {"setLabel" in day && typeof day.setLabel === "string" ? day.setLabel : totalSets}
                          </p>
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
                            {exercise.supersetGroup ? <Badge variant="outline">Block {exercise.supersetGroup}</Badge> : null}
                          {exercise.exerciseName.includes("Back Hyperextension") ? <Badge variant="outline">If tolerated</Badge> : null}
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
                    {day.protocol === "Recovery Protocol"
                        ? "Use the mobility page for 15-20 minutes of recovery mobility, flexibility, and supported balance. Do not add conditioning."
                        : "Keep the day deliberately empty. Use only gentle recovery mobility if needed."}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="border-t border-border pt-7">
          <p className="eyebrow">Weekly set summary</p>
          <div className="mt-4 grid gap-2 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
            {WEEKLY_SET_SUMMARY.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
