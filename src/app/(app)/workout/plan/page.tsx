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
  PROGRESSIVE_OVERLOAD_RULES,
  WEEKLY_SET_SUMMARY,
} from "@/lib/default-workout-plan";
import { SESSION_PREP_ITEMS, isLoggableTrainingExercise } from "@/lib/training-session";

const WEEK_STRUCTURE = [
  {
    day: "Monday",
    title: "Lower A — Leg Strength Peak / Machine-Supported",
    protocol: "Strength Protocol",
    dayOfWeek: 1,
    note: "Completed. Heaviest lower-body session of the week.",
    laterRecovery: "Completed Monday session data stays intact.",
    statusNote: "Completed / View Session",
  },
  {
    day: "Tuesday",
    title: "Off Day — Recovery Reset",
    protocol: "Recovery Protocol",
    note: "Taken off. No missed-volume penalty. Use light foot, ankle, and breathing recovery only.",
    laterRecovery: "No step chasing. Recovery preserves the next three training days.",
    details: [
      "Seated Ankle Pumps — 1-2 minutes; smooth rhythm; no aggressive range.",
      "Ankle Circles — 1 set x 8-12 each direction per side; slow, controlled circles.",
      "Wall Ankle Rocks — 1 set x 8-12 slow reps per side; knee tracks over middle toes; heel stays down.",
      "Wall Calf Stretch, Knee Straight — 1 round x 20-30 seconds per side; gentle stretch only.",
      "Wall Calf Stretch, Knee Bent — 1 round x 20-30 seconds per side; gentle stretch only.",
      "Supported Breathing Reset — 2 minutes; downshift breathing; jaw, shoulders, and hips relaxed.",
    ],
    actionHref: "/mobility",
    actionLabel: "View Recovery",
  },
  {
    day: "Wednesday",
    title: "Upper A — Progressive Push/Pull Circuit Strength",
    protocol: "Strength Protocol",
    dayOfWeek: 3,
    note: "Higher-volume upper-body day. Controlled strength circuits, more total work, no failure.",
    laterRecovery: "Upper-Body Downshift + Foot/Ankle Base, 8-12 minutes.",
    details: [
      "Use paired circuits for efficiency. Rest after each pair, not after every single exercise unless needed.",
      "Wednesday total working sets: 23.",
      "Overload target: add reps first. If every set hits the upper target with clean form and target RPE, increase next time by the smallest kg jump.",
    ],
  },
  {
    day: "Thursday",
    title: "Lower B — Progressive Lower Body + Hip Stability",
    protocol: "Strength Protocol",
    dayOfWeek: 4,
    note: "Moderate lower-body overload after Monday legs. More work than the taper, but still controlled for feet and lower back.",
    laterRecovery: "Lower-Body Flush + Sole Care, 10-14 minutes.",
    details: [
      "Single-Leg Leg Press stays straight sets. Accessories can be paired.",
      "Thursday total working sets: 14.",
      "Keep lunges conservative. Overload leg press, leg curl, leg extension, and hip abduction by reps first.",
    ],
  },
  {
    day: "Friday",
    title: "Full-Body Machine Circuit + Arms",
    protocol: "Strength Protocol",
    dayOfWeek: 5,
    note: "Highest-density day of the week. Machine-supported full-body circuits with controlled rests. No HIIT, no failure, no reckless conditioning.",
    laterRecovery: "Weekly Downshift / Foot-Flare Recovery, 12-16 minutes.",
    details: [
      "Block A: 3 rounds. Incline Machine Press, Seated Cable Row, Leg Extension. Rest 2 minutes after A3.",
      "Block B: 3 rounds. Lat Pulldown Variation, Reverse Pec Deck or Face Pull, Seated Hamstring Curl. Rest 2 minutes after B3.",
      "Block C: 3 rounds. Bicep Curl Machine, Rope Triceps Pressdown, Machine or Dumbbell Lateral Raise. Rest 90-120 seconds after C3.",
      "Friday total working sets: 27.",
      "Circuit safety: strength density only. Do not chase breathlessness. Stop for dizziness, sharp pain, limping, chest pain, unusual shortness of breath, numbness, tingling, or worsening symptoms.",
      "Overload target: conservative loads, add reps before load, keep every rep clean.",
    ],
  },
  {
    day: "Saturday",
    title: "Recovery Rest",
    protocol: "Full Rest",
    note: "Rest at home. Use mobility only if it improves foot, ankle, hip, or lower-back comfort.",
    laterRecovery: "No gym. No make-up sets. No step chasing.",
    details: [
      "Optional if stiff: Supported Breathing Reset — 2 minutes.",
      "Seated Ankle Pumps — 1-2 minutes.",
      "Ankle Circles — 1 set x 8-12 each direction.",
      "Wall Ankle Rocks — 1 set x 8-12 slow reps.",
      "Wall Calf Stretch, Knee Straight — 20-30 seconds per side.",
      "Wall Calf Stretch, Knee Bent — 20-30 seconds per side.",
      "Pelvic Tilts — 1 set x 8-12 slow reps.",
      "Open Book Thoracic Rotation — 1 set x 5 reps per side.",
    ],
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
            Monday lower body was completed. Tuesday was taken off. Wednesday through Friday now
            use controlled progressive overload because food intake and home recovery are available.
            Saturday and Sunday are reserved for recovery. Ramp-up sets stay outside the ledger.
            Required later recovery remains separate.
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
