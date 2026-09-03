"use client";

import { Badge } from "@/components/ui/badge";
import { Figure, Notice, PageTitle, Row, Rows, Section, Sub } from "@/components/ui/ledger";
import { SessionPrepStrip } from "@/components/workout/SessionPrepStrip";
import { WorkoutSessionActionButton } from "@/components/workout/WorkoutSessionActionButton";
import { LOWER_B_BACK_PAIN_READINESS_NOTE, LOWER_B_BACK_SAFE_TITLE, isOverheadPressExercise } from "@/lib/default-workout-plan";
import { isLoggableTrainingExercise } from "@/lib/training-session";
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
  backPainGateActive = false,
}: {
  plan: Plan;
  hideHeader?: boolean;
  backPainGateActive?: boolean;
}) {
  const loggableExercises = plan.exercises.filter(isLoggableTrainingExercise);
  const workingExercises = plan.exercises.filter(
    (exercise) => isLoggableTrainingExercise(exercise) && exercise.exerciseType === "WORKING"
  );
  const accessoryExercises = plan.exercises.filter(
    (exercise) => isLoggableTrainingExercise(exercise) && exercise.exerciseType === "ACCESSORY"
  );
  const totalLoggableSets = loggableExercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const blockOrder = ["A", "B", "C", "D", "E", "F"] as const;
  const blockCount = blockOrder.filter((block) =>
    workingExercises.some((exercise) => exercise.supersetGroup === block)
  ).length;
  const showLowerBReadiness =
    plan.sessionName === LOWER_B_BACK_SAFE_TITLE || /Lower A|Upper B/.test(plan.sessionName);

  /* Number, movement, programming. The programming folds onto a second line
     on mobile rather than being squeezed into a third column. */
  const EXERCISE_COLUMNS = "2.25rem minmax(0,1fr)";
  const EXERCISE_COLUMNS_MD = "2.25rem minmax(0,1fr) minmax(11rem,auto)";

  return (
    <div>
      {!hideHeader ? (
        <>
          <PageTitle
            eyebrow="Today's programmed work"
            title={plan.sessionName}
            lead="Walk to gym only if foot load is tolerable. Ramp-up sets remain outside the working ledger."
          />
          {showLowerBReadiness ? (
            <Notice tone="accent" className="mt-5 max-w-3xl">
              {LOWER_B_BACK_PAIN_READINESS_NOTE}
            </Notice>
          ) : null}
          <Section className="mt-6">
            <dl className="grid grid-cols-3 gap-4">
              <Figure label="Blocks" value={blockCount} size="lg" />
              <Figure label="Exercises" value={loggableExercises.length} size="lg" />
              <Figure label="Sets" value={totalLoggableSets} size="lg" />
            </dl>
          </Section>
        </>
      ) : null}

      <Section title="Protocol">
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-5">
          <ProtocolMeta label="Walk to gym" value="General warm-up" note="Use transport or reduce walking if foot/ankle pain rises above 3/10." />
          <ProtocolMeta label="At gym" value="Ramp-up sets" note="First lift or machine, RPE 3-5." />
          <ProtocolMeta label="Main work" value="Working sets" note="No failure training or conditioning." />
          <ProtocolMeta label="Later" value="Required recovery" note="Separate same-day block." />
          <ProtocolMeta label="Load unit" value={WORKOUT_LOAD_UNIT.toUpperCase()} note="Session load and volume are logged in kilograms." />
        </div>

        <div className="mt-6">
          <WorkoutSessionActionButton planId={plan.id} status="start" prominent fullWidth className="sm:w-auto sm:min-w-48" />
        </div>
      </Section>

      <Section title="Session prep">
        <SessionPrepStrip note="Non-loggable arrival protocol. No Weight/Reps/RPE rows." />
      </Section>

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
          <Section key={block}>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <div className="flex items-baseline gap-3">
                <h2>Block {block}</h2>
                <span className="num text-right text-caption text-secondary">{roundTarget}</span>
              </div>
              <Badge variant="secondary">{restNote}s rest</Badge>
            </div>
            <p className="mb-4 max-w-2xl text-caption text-tertiary">
              {isPairedBlock
                ? "Move through the pair or circuit cleanly, then take the programmed rest."
                : "Use straight sets with the programmed rest. Do not rush."}
            </p>

            <Rows columns={EXERCISE_COLUMNS} mdColumns={EXERCISE_COLUMNS_MD}>
              {blockExercises.map((exercise, i) => (
                <Row
                  key={exercise.id}
                  columns={EXERCISE_COLUMNS}
                  mdColumns={EXERCISE_COLUMNS_MD}
                  className="items-start"
                >
                  <span className="num num-left text-row text-tertiary">{block}{i + 1}</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-row font-medium text-primary">{exercise.exerciseName}</span>
                      {backPainGateActive && isOverheadPressExercise(exercise.exerciseName) ? (
                        <Badge variant="ember">Removed — lower-back ≥3/10</Badge>
                      ) : null}
                    </div>
                    {exercise.cues ? (
                      <p className="mt-1 text-caption text-tertiary">{exercise.cues}</p>
                    ) : null}
                    <Sub className="mt-1 block">
                      {exercise.sets} sets, {exercise.reps}
                      {exercise.targetRPE ? `, RPE ${exercise.targetRPE}` : ""}
                    </Sub>
                  </div>
                  <span className="hidden text-row text-secondary md:block md:text-right">
                    {exercise.sets} sets, {exercise.reps}
                    {exercise.targetRPE ? `, RPE ${exercise.targetRPE}` : ""}
                  </span>
                </Row>
              ))}
            </Rows>
          </Section>
        );
      })}

      {accessoryExercises.length > 0 ? (
        <Section title="Low-dose accessory">
          <Rows columns="minmax(0,1fr)" mdColumns="minmax(0,1fr) minmax(13rem,auto)">
            {accessoryExercises.map((exercise) => {
              const programming = `${exercise.sets} ${exercise.sets === 1 ? "set" : "sets"}, ${exercise.reps}${
                exercise.targetRPE ? `, RPE ${exercise.targetRPE}` : ""
              }${exercise.restSeconds ? `, rest ${exercise.restSeconds}s` : ""}`;

              return (
                <Row
                  key={exercise.id}
                  columns="minmax(0,1fr)"
                  mdColumns="minmax(0,1fr) minmax(13rem,auto)"
                  className="items-start"
                >
                  <div className="min-w-0">
                    <span className="text-row font-medium text-primary">{exercise.exerciseName}</span>
                    {exercise.cues ? (
                      <p className="mt-1 text-caption text-tertiary">{exercise.cues}</p>
                    ) : null}
                    <Sub className="mt-1 block">{programming}</Sub>
                  </div>
                  <span className="hidden text-row text-secondary md:block md:text-right">
                    {programming}
                  </span>
                </Row>
              );
            })}
          </Rows>
        </Section>
      ) : null}
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
    <div className="border-t border-rule pt-3">
      <p className="text-label uppercase text-tertiary">{label}</p>
      <p className="mt-1 text-row font-medium text-primary">{value}</p>
      <p className="mt-1 text-caption text-tertiary">{note}</p>
    </div>
  );
}
