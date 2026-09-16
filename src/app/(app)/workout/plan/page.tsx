import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { getLatestPainCheckIn } from "@/actions/pain";
import { getWorkoutPlanDayStatuses, getWorkoutPlans } from "@/actions/workout";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Figure, Notice, PageTitle, Row, Rows, Section, Sub } from "@/components/ui/ledger";
import { SessionPrepStrip } from "@/components/workout/SessionPrepStrip";
import { WorkoutSessionActionButton } from "@/components/workout/WorkoutSessionActionButton";
import { WorkoutPlanResetButton } from "@/components/workout/WorkoutPlanResetButton";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { getTodayDateString, getTrainingDayOfWeek } from "@/lib/dates";
import {
  DEFAULT_WORKOUT_PLAN,
  BACK_PAIN_RULES,
  FOOT_LOAD_RULES,
  LOWER_B_BACK_PAIN_READINESS_NOTE,
  PROGRESSIVE_OVERLOAD_RULES,
  WEEKLY_SET_SUMMARY,
  isOverheadPressExercise,
} from "@/lib/default-workout-plan";
import { getIntroductorySets, formatSetPrescription } from "@/lib/workout-prescription";
import { isLoggableTrainingExercise } from "@/lib/training-session";

const WEEK_STRUCTURE = [
  ...DEFAULT_WORKOUT_PLAN.map((day, index) => ({
    day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][index],
    title: day.sessionName, protocol: "Strength Protocol", dayOfWeek: day.dayOfWeek,
    note: day.dayOfWeek === 3 ? "Warm-up: Lying Leg Curl, 1-2 easy sets of 12-15. Not working hamstring volume." : "Add clean reps before load; keep every set controlled.",
    laterRecovery: ["Lower-Body Flush + Sole Care, 10-14 minutes.", "Upper-Body Downshift + Foot/Ankle Base, 8-12 minutes.", "Lower-Body Flush + Back Care, 10-14 minutes.", "Shoulder / Upper-Back Reset + Foot Base, 8-12 minutes.", "Weekly Downshift / Foot-Flare Recovery, 12-16 minutes."][index],
    details: [],
  })),
  ...["Saturday", "Sunday"].map(day => ({day, title: "Complete Rest", protocol: "Full Rest", note: "Complete rest from scheduled strength training.", laterRecovery: "No required block. No make-up training.", details: []})),
];

export const metadata: Metadata = {
  title: "Training Plan | Athanor",
  description: "Review the current training phase, weekly protocol rhythm, exercise order, and rest guidance.",
};

export default async function WorkoutPlanPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  // Both plan readers ensure the active snapshot matches the canonical
  // template. Seed once before reading statuses so two concurrent rotations
  // cannot race when this page is rendered or prefetched on mobile.
  const plans = await getWorkoutPlans(user.id);
  const [dayStatuses, painCheckIn] = await Promise.all([
    getWorkoutPlanDayStatuses(user.id, user.timezone),
    getLatestPainCheckIn(user.id),
  ]);
  const todayBackPain =
    painCheckIn && painCheckIn.date === getTodayDateString(user.timezone)
      ? (painCheckIn.lowerBackPain ?? null)
      : null;
  const backPainGateActive = todayBackPain != null && todayBackPain >= 3;
  const plansByDay = new Map(plans.map((plan) => [plan.dayOfWeek, plan]));
  const statusByPlanId = new Map(dayStatuses.map((status) => [status.planId, status]));
  const trainingDayOfWeek = getTrainingDayOfWeek(new Date(), user.timezone);

  return (
    <>
      <PageTitle
        eyebrow="Training"
        title="Full plan"
        lead="Five training days. Progress by controlled reps, then load."
      />

      {plans.length === 0 ? (
        <Section className="mt-6">
          <EmptyState
            icon={ClipboardList}
            title="No saved training plan"
            description="Use the custom session builder on the Training page to start immediately."
          />
        </Section>
      ) : null}

      <nav aria-label="Plan days" className="plan-day-index my-4 grid grid-cols-7 gap-1">
        {WEEK_STRUCTURE.map(day => <a key={day.day} aria-label={day.day} href={`#${day.day.toLowerCase()}`} className="inline-flex min-h-12 items-center justify-center border-b border-rule bg-sunken px-1 text-caption font-medium hover:bg-raised focus-visible:outline-2 focus-visible:outline-accent"><span className="sm:hidden">{day.day.slice(0,3)}</span><span className="hidden sm:inline">{day.day}</span></a>)}
      </nav>
      <details className="border-y border-rule">
        <summary className="flex min-h-14 cursor-pointer items-center text-body font-medium focus-visible:outline-2 focus-visible:outline-accent">Load rules, progression & preparation</summary>
      <Section title="Load rules">
        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
          <RuleList title="Foot-load rules" rules={FOOT_LOAD_RULES} />
          <RuleList title="Back-pain rules" rules={BACK_PAIN_RULES} />
        </div>
      </Section>

      <Section title="Progressive overload">
        <div className="grid gap-2 md:grid-cols-2">
          {PROGRESSIVE_OVERLOAD_RULES.map((rule) => (
            <p key={rule} className="text-row text-secondary">{rule}</p>
          ))}
        </div>
      </Section>

      <Section title="Session prep">
        <SessionPrepStrip note="Use controlled ramp-up sets before working sets." />
      </Section>

      <Section title="Plan management"><WorkoutPlanResetButton /></Section>

      </details>

      <div className="mt-6">
        {WEEK_STRUCTURE.map((day, index) => {
            const plan = "dayOfWeek" in day && typeof day.dayOfWeek === "number" ? plansByDay.get(day.dayOfWeek) : null;
            const loggableExercises = plan?.exercises.filter(isLoggableTrainingExercise) ?? [];
            const workingCount = loggableExercises.length;
            const totalSets = loggableExercises
              .reduce((sum, exercise) => sum + exercise.sets, 0) ?? 0;
            const showBackReadiness = plan?.dayOfWeek === 3 || plan?.dayOfWeek === 4;

            return (
              <Section key={day.day} id={day.day.toLowerCase()} title={`${String(index + 1).padStart(2, "0")} · ${day.day}`} action={<Badge variant={day.protocol === "Strength Protocol" ? "accent" : "outline"}>{day.protocol}</Badge>}>

                <p className="mt-2 text-body font-medium text-primary">
                  {plan?.sessionName ?? day.title}
                </p>

                {plan ? (
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                    <dl className="flex gap-8">
                      <Figure label="Exercises" value={workingCount} />
                      <Figure label="Intro / target sets" value={`${loggableExercises.reduce((sum, exercise) => sum + getIntroductorySets(exercise), 0)} / ${totalSets}`} />
                    </dl>
                    <WorkoutSessionActionButton
                      planId={plan.id}
                      status={statusByPlanId.get(plan.id)?.status ?? "start"}
                      prominent={plan.dayOfWeek === trainingDayOfWeek}
                      fullWidth
                      className="sm:w-auto sm:min-w-40"
                    />
                  </div>
                ) : null}

                <details className="mt-4" open={plan?.dayOfWeek === trainingDayOfWeek}><summary className="flex min-h-12 cursor-pointer items-center text-row font-medium focus-visible:outline-2 focus-visible:outline-accent">{plan ? "Exercises & guidance" : "Rest-day guidance"}</summary><p className="mt-3 max-w-2xl text-row text-secondary">{day.note}</p>
                <p className="mt-2 max-w-2xl text-row text-secondary">
                  <span className="font-medium text-primary">Later recovery:</span> {day.laterRecovery}
                </p>
                {"details" in day && Array.isArray(day.details) ? (
                  <ul className="mt-3 grid gap-1.5">
                    {day.details.map((detail) => (
                      <li key={detail} className="text-caption text-tertiary">{detail}</li>
                    ))}
                  </ul>
                ) : null}
                {showBackReadiness ? (
                  <Notice tone="accent" className="mt-3">
                    {LOWER_B_BACK_PAIN_READINESS_NOTE}
                  </Notice>
                ) : null}

                {plan ? (
                  <Rows
                    className="mt-5"
                    columns={PLAN_COLUMNS}
                    mdColumns={PLAN_COLUMNS_MD}
                  >
                    {loggableExercises.map((exercise) => {
                      const programming = `${formatSetPrescription(exercise)} x ${exercise.reps}${
                        exercise.tempo ? `, tempo ${exercise.tempo}` : ""
                      }${exercise.targetRPE ? `, RPE ${exercise.targetRPE}` : ""}${
                        exercise.restSeconds != null && exercise.restSeconds > 0
                          ? `, rest ${exercise.restSeconds}s`
                          : ""
                      }`;

                      return (
                        <Row
                          key={exercise.id}
                          columns={PLAN_COLUMNS}
                          mdColumns={PLAN_COLUMNS_MD}
                          className="items-start"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-row font-medium text-primary">{exercise.exerciseName}</span>
                              {exercise.supersetGroup ? <Badge variant="secondary">Block {exercise.supersetGroup}</Badge> : null}
                              {exercise.exerciseType === "ACCESSORY" ? <Badge variant="secondary">Low-dose accessory</Badge> : null}
                              {exercise.exerciseType === "FINISHER" ? <Badge variant="secondary">Finisher</Badge> : null}
                              {backPainGateActive && isOverheadPressExercise(exercise.exerciseName) ? (
                                <Badge variant="ember">Removed — lower-back ≥3/10</Badge>
                              ) : null}
                            </div>
                            {exercise.cues ? (
                              <p className="mt-1 text-caption text-tertiary">{exercise.cues}</p>
                            ) : null}
                            <Sub className="mt-1 block md:hidden">{programming}</Sub>
                          </div>
                          <span className="hidden text-row text-secondary md:block md:text-right">
                            {programming}
                          </span>
                        </Row>
                      );
                    })}
                  </Rows>
                ) : (
                  <p className="mt-5 border-t border-rule pt-4 text-row text-tertiary">
                    Keep the day deliberately empty. Use only gentle recovery mobility if needed.
                  </p>
                )}
              </details></Section>
            );
          })}
      </div>

      <Section title="Weekly set summary">
        <div className="grid gap-2 md:grid-cols-2">
          {WEEKLY_SET_SUMMARY.map((item) => (
            <p key={item} className="text-row text-secondary">{item}</p>
          ))}
        </div>
      </Section>
    </>
  );
}

/* Movement plus programming; the programming folds onto a second line on
   mobile rather than being crushed into a narrow third column. */
const PLAN_COLUMNS = "minmax(0,1fr)";
const PLAN_COLUMNS_MD = "minmax(0,1fr) minmax(14rem,auto)";

function RuleList({ title, rules }: { title: string; rules: readonly string[] }) {
  return (
    <div>
      <p className="text-caption text-tertiary">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {rules.map((rule) => (
          <li key={rule} className="flex items-start gap-2 text-row text-secondary">
            <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-pill bg-accent" />
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}
