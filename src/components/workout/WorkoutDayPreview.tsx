"use client";

import { Badge } from "@/components/ui/badge";
import { WorkoutSessionActionButton } from "@/components/workout/WorkoutSessionActionButton";
import { LOWER_B_BACK_PAIN_READINESS_NOTE, LOWER_B_BACK_SAFE_TITLE } from "@/lib/default-workout-plan";
import { SESSION_PREP_ITEMS, isLoggableTrainingExercise } from "@/lib/training-session";
import { WORKOUT_LOAD_UNIT } from "@/lib/units";

// data shape only; do not alter workout payloads
type Exercise = {
  id: string;
  exerciseName: string;
  sets: number;
  reps: string;
  tempo: string | null;
  restSeconds: number | null;
  targetRPE: string | null;
  cues: string | null;
  supersetGroup: string | null;
  exerciseType: string;
};

type Plan = {
  id: string;
  sessionName: string;
  exercises: Exercise[];
};

export function WorkoutDayPreview({
  plan,
  hideHeader,
}: {
  plan: Plan;
  hideHeader?: boolean;
}) {
  const loggableExercises = plan.exercises.filter(isLoggableTrainingExercise);
  const workingExercises = plan.exercises.filter(
    (exercise) => isLoggableTrainingExercise(exercise) && exercise.exerciseType === "WORKING"
  );
  const accessoryExercises = plan.exercises.filter(
    (exercise) => isLoggableTrainingExercise(exercise) && exercise.exerciseType === "ACCESSORY"
  );
  const totalLoggableSets = loggableExercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const blockOrder = ["A", "B", "C", "D"] as const;
  const showLowerBReadiness = plan.sessionName === LOWER_B_BACK_SAFE_TITLE || /Lower A|Posterior Chain/.test(plan.sessionName);

  return (
    <section className="document-panel">
      {!hideHeader ? (
        <div className="grid gap-8 border-b border-border pb-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-end">
          <div>
            <p className="eyebrow">Today&apos;s programmed work</p>
            <h2 className="mt-3 max-w-3xl">{plan.sessionName}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Walking covers warm-up and recovery. Ramp-up sets stay outside the ledger.
            </p>
            {showLowerBReadiness ? (
              <p className="status-note mt-4 inline-flex px-3 py-2 text-xs font-semibold leading-relaxed text-foreground">
                {LOWER_B_BACK_PAIN_READINESS_NOTE}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm xl:text-right">
            <div>
              <p className="eyebrow text-[10px]">Blocks</p>
              <p className="data-number mt-2 text-2xl text-foreground">3</p>
            </div>
            <div>
              <p className="eyebrow text-[10px]">Exercises</p>
              <p className="data-number mt-2 text-2xl text-foreground">{loggableExercises.length}</p>
            </div>
            <div>
              <p className="eyebrow text-[10px]">Sets</p>
              <p className="data-number mt-2 text-2xl text-foreground">{totalLoggableSets}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="command-deck grid gap-5 rounded-[var(--radius-panel)] p-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end" data-animated="true">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <ProtocolMeta label="Walk to gym" value="General warm-up" note="Only if foot load is tolerable." />
          <ProtocolMeta label="At gym" value="Ramp-up sets" note="First lift or machine, RPE 3-5." />
          <ProtocolMeta label="Main work" value="Working sets" note="No failure training or conditioning." />
          <ProtocolMeta label="Later" value="Required recovery" note="Separate same-day block." />
          <ProtocolMeta label="Load unit" value={WORKOUT_LOAD_UNIT.toUpperCase()} note="Session load and volume are logged in kilograms." />
        </div>

        <WorkoutSessionActionButton planId={plan.id} status="start" prominent onDark fullWidth />
      </div>

      <SessionPrepStrip />

      <div className="protocol-grid">
        {blockOrder.map((block) => {
          const blockExercises = workingExercises.filter((exercise) => exercise.supersetGroup === block);
          if (blockExercises.length === 0) return null;
          const blockSets = Math.max(...blockExercises.map((exercise) => exercise.sets));
          const isPairedBlock = blockExercises.length > 1;
          const roundTarget = isPairedBlock
            ? `${blockSets} ${blockSets === 1 ? "round" : "rounds"}`
            : `${blockSets} ${blockSets === 1 ? "set" : "sets"}`;
          const restNote = blockExercises[blockExercises.length - 1]?.restSeconds ?? 90;

          return (
            <article key={block} className="border-t border-border pt-7 first:border-t-0 first:pt-0">
              <div className="micro-panel rounded-[var(--radius-card)] p-5">
                <div className="grid gap-4 md:grid-cols-[8rem_minmax(0,1fr)_auto] md:items-end">
                <div>
                  <p className="eyebrow">Block {block}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{roundTarget}</p>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {isPairedBlock
                    ? "Move through the pair or sequence cleanly, then take the programmed rest."
                    : "Use straight sets with the programmed rest. Do not rush."}
                </p>
                <Badge variant="outline">{restNote}s rest</Badge>
                </div>
              </div>

              <div className="mt-5 divide-y divide-border border-y border-border">
                {blockExercises.map((exercise, i) => (
                  <div key={exercise.id} className="protocol-row interactive-row px-2">
                    <p className="data-number text-xl text-muted-foreground">{block}{i + 1}</p>
                    <div>
                      <h3 className="text-[1.2rem] leading-snug">{exercise.exerciseName}</h3>
                      {exercise.cues ? (
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{exercise.cues}</p>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground md:text-right">
                      {exercise.sets} sets, {exercise.reps}
                      {exercise.targetRPE ? `, RPE ${exercise.targetRPE}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {accessoryExercises.length > 0 ? (
        <div>
          <p className="eyebrow">Low-dose accessory</p>
          <div className="mt-4 divide-y divide-border border-y border-border">
            {accessoryExercises.map((exercise) => (
              <div key={exercise.id} className="interactive-row grid gap-4 px-2 py-4 md:grid-cols-[minmax(0,1fr)_minmax(14rem,auto)] md:items-start">
                <div>
                  <h3 className="text-[1.2rem] leading-snug">{exercise.exerciseName}</h3>
                  {exercise.cues ? (
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{exercise.cues}</p>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground md:text-right">
                  {exercise.sets} {exercise.sets === 1 ? "set" : "sets"}, {exercise.reps}
                  {exercise.targetRPE ? `, RPE ${exercise.targetRPE}` : ""}
                  {exercise.restSeconds ? `, rest ${exercise.restSeconds}s` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SessionPrepStrip() {
  return (
    <div className="session-prep-strip">
      <div>
        <p className="eyebrow">Session prep</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Non-loggable arrival protocol. No Weight/Reps/RPE rows.
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
  );
}

function ProtocolMeta({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="border-t border-white/12 pt-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">{label}</p>
      <p className="mt-2 text-sm font-semibold text-primary-foreground">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-white/58">{note}</p>
    </div>
  );
}
