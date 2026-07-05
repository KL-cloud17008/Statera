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
  ADJUSTED_WEEK_HEADER_COPY,
  BACK_PAIN_RULES,
  FOOT_LOAD_RULES,
  LOWER_B_BACK_PAIN_READINESS_NOTE,
  NEXT_WEEK_TAPER_TITLE,
  PROGRESSIVE_OVERLOAD_RULES,
  WEEKLY_SET_SUMMARY,
} from "@/lib/default-workout-plan";
import { SESSION_PREP_ITEMS, isLoggableTrainingExercise } from "@/lib/training-session";

const WEEK_STRUCTURE = [
  {
    day: "Monday",
    title: "Lower A — Single-Leg Press + Quad/Hamstring Strength",
    protocol: "Strength Protocol",
    dayOfWeek: 1,
    note: "Primary lower-body strength day. Single-leg press first, controlled lunges second, then quad/hamstring and hip accessory work.",
    laterRecovery: "Lower-Body Flush + Sole Care, 10-14 minutes.",
    details: [
      "Block B: Single-Leg Press and Walking Lunges. Rest 180-300 seconds; this is not conditioning.",
      "Block C: Lying Leg Curl and Seated Leg Extension. Rest 120 seconds after C2.",
      "Block D: Hip Abduction Machine and Hip Adduction Machine. Rest 120 seconds after D2.",
      "Monday total working sets: 17.",
    ],
  },
  {
    day: "Tuesday",
    title: "Upper A — Incline Push / Row / Trunk Stability",
    protocol: "Strength Protocol",
    dayOfWeek: 2,
    note: "Upper-body strength with one incline chest slot, strong pulling work, rear delts, and anti-rotation trunk work.",
    laterRecovery: "Upper-Body Downshift + Foot/Ankle Base, 8-12 minutes.",
    details: [
      "Block A: Dumbbell Incline Press and Machine Row.",
      "Block B: Neutral-Grip Lat Pulldown and Dumbbell / Plate Lateral Raise.",
      "Block C: Rope Triceps Pressdown, Standing Cable Anti-Rotation Press, and Face Pull.",
      "Tuesday total working sets: 19.",
      "Anti-rotation work is trunk control, not a max strength lift.",
    ],
  },
  {
    day: "Wednesday",
    title: "Lower B — Accessory Legs + Hip Stability",
    protocol: "Strength Protocol",
    dayOfWeek: 3,
    note: "Lower accessory day. Supports Monday without turning into another max-effort leg session.",
    laterRecovery: "Lower-Body Flush + Back Care, 10-14 minutes.",
    details: [
      "Block A: Supported Stationary Bulgarian Split Squat.",
      "Block B: Back Hyperextension / Back Extension Machine.",
      "Block C: Seated Leg Extension and Seated Leg Curl.",
      "Block D: Hip Adduction Machine and Hip Abduction Machine.",
      "Wednesday total working sets: 15.",
    ],
  },
  {
    day: "Thursday",
    title: "Upper B — Machine Press / Pull + Shoulders and Arms",
    protocol: "Strength Protocol",
    dayOfWeek: 4,
    note: "Balanced upper-body day with mid-chest machine press, rows, pulldown, shoulders, and arms.",
    laterRecovery: "Shoulder / Upper-Back Reset + Foot Base, 8-12 minutes.",
    details: [
      "Block A: Machine Press and Seated Cable Row.",
      "Block B: Neutral-Grip Lat Pulldown and Dumbbell / Plate Lateral Raise.",
      "Block C: Rope Triceps Pressdown, Cable Curl, and Dumbbell Overhead Press.",
      "Thursday total working sets: 20.",
      "Machine Press balances repeated incline pressing with neutral mid-chest work.",
    ],
  },
  {
    day: "Friday",
    title: "Upper Accessory + Arms + Core",
    protocol: "Strength Protocol",
    dayOfWeek: 5,
    note: "Accessory upper-body day with chest balance, rows, arms, rear delts, and direct trunk stability.",
    laterRecovery: "Weekly Downshift / Foot-Flare Recovery, 12-16 minutes.",
    details: [
      "Block A: Pec Deck or High-to-Low Cable Fly and Chest-Supported Row or Seated Cable Row.",
      "Block B: Cable Curl and Rope Triceps Pressdown.",
      "Block C: Face Pull.",
      "Block D: Supported Cable Anti-Rotation Hold.",
      "Friday total working sets: 16.",
    ],
  },
  {
    day: "Saturday",
    title: "Complete Rest",
    protocol: "Full Rest",
    note: "Full rest. Use mobility only if it improves foot, ankle, hip, or lower-back comfort.",
    laterRecovery: "No required block. Optional recovery only: breathing reset, seated ankle pumps, ankle circles, and easy wall calf stretches.",
    details: [
      "Supported Breathing Reset — 2 minutes.",
      "Seated Ankle Pumps — 1-2 minutes.",
      "Ankle Circles — 1 set x 8-12 each direction.",
      "Wall Calf Stretch, Knee Straight — 20-30 seconds per side.",
      "Wall Calf Stretch, Knee Bent — 20-30 seconds per side.",
    ],
  },
  {
    day: "Sunday",
    title: "Complete Rest",
    protocol: "Full Rest",
    note: "Full rest. Keep the day deliberately empty and start the next week fresh.",
    laterRecovery: "No required block. No make-up training.",
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
            <p className="data-number value-reveal mt-3 text-4xl text-foreground">5 / 0 / 2</p>
          </div>
          <p className="max-w-3xl text-sm leading-relaxed text-[var(--cream-2)]">
            Five training days with balanced chest, back, legs, hips, arms, and trunk stability.
            Progress by clean reps before load. Saturday and Sunday are full rest. Ramp-up sets
            stay outside the ledger. Required later recovery remains separate.
          </p>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Badge variant="secondary">5 Strength</Badge>
            <Badge variant="outline">0 Recovery</Badge>
            <Badge variant="outline">2 Full Rest</Badge>
          </div>
        </div>

        <div className="grid gap-4 border-b border-border pb-7 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Foot-load rules</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {FOOT_LOAD_RULES.map((rule) => (
                <li key={rule} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--cream-3)]" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Back-pain rules</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
              {BACK_PAIN_RULES.map((rule) => (
                <li key={rule} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--cream-3)]" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-b border-border pb-7">
          <p className="eyebrow">Progressive overload</p>
          <div className="mt-4 grid gap-2 text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
            {PROGRESSIVE_OVERLOAD_RULES.map((rule) => (
              <p key={rule}>{rule}</p>
            ))}
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
            const showBackReadiness = plan?.dayOfWeek === 3 || plan?.dayOfWeek === 4;

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
                          <p className="data-number value-reveal mt-2 text-2xl text-foreground">{workingCount}</p>
                        </div>
                        <div>
                          <p className="eyebrow text-[10px]">Sets</p>
                          <p className="data-number value-reveal mt-2 text-2xl text-foreground">{totalSets}</p>
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
                    Keep the day deliberately empty. Use only gentle recovery mobility if needed.
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
