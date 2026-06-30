import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { getWorkoutPlanDayStatuses, getWorkoutPlans } from "@/actions/workout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { WorkoutSessionActionButton } from "@/components/workout/WorkoutSessionActionButton";
import { WorkoutPlanResetButton } from "@/components/workout/WorkoutPlanResetButton";
import { SectionHeader } from "@/components/ui/section-header";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { getTrainingDayOfWeek } from "@/lib/dates";
import {
  ADJUSTED_WEEK_HEADER_COPY,
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
    note: "Completed. Heaviest lower-body day of the week.",
    laterRecovery: "Completed Monday session data stays intact.",
    statusNote: "Completed / View Session",
  },
  {
    day: "Tuesday",
    title: "Recovery Override — No Gym",
    protocol: "Recovery Protocol",
    note: "Unplanned recovery day. Do not make up missed volume. Use foot and ankle recovery only.",
    laterRecovery: "No step chasing. Work steps count as load. If soles are irritated, recovery only.",
    details: [
      "Seated Ankle Pumps — 1-2 minutes; smooth rhythm; no aggressive range.",
      "Ankle Circles — 1 set x 8-12 each direction per side; slow, controlled circles.",
      "Wall Ankle Rocks — 1 set x 8-12 slow reps per side; knee tracks over middle toes; heel stays down; stop before pain rises.",
      "Wall Calf Stretch, Knee Straight — 1 round x 20-30 seconds per side; gentle stretch only.",
      "Wall Calf Stretch, Knee Bent — 1 round x 20-30 seconds per side; gentle stretch only.",
      "Supported Breathing Reset — 2 minutes; jaw, shoulders, and hips relaxed.",
    ],
    actionHref: "/mobility",
    actionLabel: "View Recovery",
  },
  {
    day: "Wednesday",
    title: "Upper A — Push/Pull Strength",
    protocol: "Strength Protocol",
    dayOfWeek: 3,
    note: "Main upper-body session moved from Tuesday. Strong work, controlled fatigue.",
    laterRecovery: "Post-Leg Fatigue + Shoulder Reset, 8-12 minutes.",
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
    title: "Upper B — Machine Upper + Arms / Training Reset",
    protocol: "Strength Protocol",
    dayOfWeek: 5,
    note: "Final training day of the week. Machine-supported upper body and arms. Leave fresher than you arrived.",
    laterRecovery: "Weekly Downshift / Foot-Flare Recovery, 12-16 minutes.",
    setLabel: "10 standard / 12 optional",
  },
  {
    day: "Saturday",
    title: "Complete Rest",
    protocol: "Full Rest",
    note: "Full rest. No gym. Gentle recovery mobility only if needed.",
    laterRecovery: "If soles, ankles, or lower back feel stiff, use 5-8 minutes of ankle pumps, gentle ankle circles, and supported breathing. No training.",
  },
  {
    day: "Sunday",
    title: "Complete Rest",
    protocol: "Full Rest",
    note: "Full rest. Keep the day deliberately empty.",
    laterRecovery: "No make-up training. Start the next week fresh.",
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
        description={ADJUSTED_WEEK_HEADER_COPY}
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
            <p className="data-number mt-3 text-4xl text-foreground">4 / 1 / 2</p>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-white/68">
            Monday lower body is completed. Tuesday is recovery-only with no gym. Wednesday through
            Friday carry the remaining strength work. Saturday and Sunday are full rest. Ramp-up
            sets stay outside the ledger. Required later recovery remains separate.
          </p>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Badge variant="secondary">4 Strength</Badge>
            <Badge variant="outline">1 Recovery</Badge>
            <Badge variant="outline">2 Full Rest</Badge>
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
            const showBackReadiness = plan?.dayOfWeek === 1 || plan?.dayOfWeek === 4;

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
                    {"statusNote" in day && typeof day.statusNote === "string" ? (
                      <p className="status-note mt-3 inline-flex px-3 py-2 text-xs font-semibold leading-relaxed text-foreground">
                        {day.statusNote}
                      </p>
                    ) : null}
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">Required later recovery:</span> {day.laterRecovery}
                    </p>
                    {"details" in day && Array.isArray(day.details) ? (
                      <ul className="mt-4 grid gap-2 text-sm leading-relaxed text-muted-foreground">
                        {day.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    ) : null}
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

                  {!plan &&
                  "actionHref" in day &&
                  typeof day.actionHref === "string" &&
                  "actionLabel" in day &&
                  typeof day.actionLabel === "string" ? (
                    <div className="grid gap-4 text-sm lg:justify-items-end lg:text-right">
                      <Button asChild variant="secondary" className="w-full sm:w-auto sm:min-w-40">
                        <Link href={day.actionHref}>{day.actionLabel}</Link>
                      </Button>
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
                        ? "Use the mobility page for the recovery override. Do not add gym work, missed volume, conditioning, or step chasing."
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
