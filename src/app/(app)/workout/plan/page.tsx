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
  ADJUSTED_WEEK_HEADER_COPY,
  BACK_PAIN_RULES,
  FOOT_LOAD_RULES,
  LOWER_B_BACK_PAIN_READINESS_NOTE,
  NEXT_WEEK_TAPER_TITLE,
  PROGRESSIVE_OVERLOAD_RULES,
  WEEKLY_SET_SUMMARY,
  isOverheadPressExercise,
} from "@/lib/default-workout-plan";
import { isLoggableTrainingExercise } from "@/lib/training-session";

const WEEK_STRUCTURE = [
  {
    day: "Monday",
    title: "Lower A — Leg Press + Quad/Hamstring Strength",
    protocol: "Strength Protocol",
    dayOfWeek: 1,
    note: "Primary lower-body strength day. Leg press first, controlled lunges second, then quad/hamstring and hip accessory work.",
    laterRecovery: "Lower-Body Flush + Sole Care, 10-14 minutes.",
    details: [
      "Block A: Lying Leg Curl opens the session — it warms the knees and hamstrings without axial loading. First set is deliberately easy, then work at the assigned RPE.",
      "Block B: Leg Press or Pendulum Squat (if available), and Walking Lunges (weighted, dumbbells 16 kg, 3 sets). Rest 180-300 seconds; this is not conditioning. Keep 1-3 reps in reserve on every set, including the last. Optional fourth lunge set only if feet, knees and balance are all quiet — skip it by default.",
      "Block C: Seated Leg Extension. Rest 120 seconds after C2.",
      "Block D: Hip Abduction Machine and Hip Adduction Machine. Rest 120 seconds after D2.",
      "Block E: Seated Bent-Leg Calf Raise or Seated Dumbbell Calf Raise. Bent knee, soleus emphasis; machine is the default, dumbbells across the knees are the fallback. Monday's deliberately lighter calf option because walking lunges already load the sole. Skip entirely if sole/plantar pain is 3/10 or higher.",
      "Monday total working sets: 20.",
    ],
  },
  {
    day: "Tuesday",
    title: "Upper A — Incline Push / Row / Trunk Stability",
    protocol: "Strength Protocol",
    dayOfWeek: 2,
    note: "Upper-body strength with one incline chest slot, strong pulling work, rear delts, and arm work.",
    laterRecovery: "Upper-Body Downshift + Foot/Ankle Base, 8-12 minutes.",
    details: [
      "Block A: Dumbbell Incline Press or Machine Incline Press, and Chest-Supported Row or Seated Cable Row.",
      "Block B: Neutral-Grip Lat Pulldown, Dumbbell / Plate Lateral Raise, and Machine Shoulder Press.",
      "Block C: Triceps Extension Machine (downstairs) or Overhead Cable Triceps Extension (upstairs); Machine Preacher Curl (downstairs) or Cable Lateral Raise (upstairs); Reverse Pec Deck (downstairs) or Face Pull (either floor) or Dead Hang (upstairs).",
      "Tuesday total working sets: 24.",
      "Machine Shoulder Press is overhead pressing: removed while lower-back pain is 3/10 or higher, and it returns when pain clears. Overhead Cable Triceps Extension is not overhead pressing and is not gated.",
    ],
  },
  {
    day: "Wednesday",
    title: "Lower B — Accessory Legs + Hip Stability",
    protocol: "Strength Protocol",
    dayOfWeek: 3,
    note: "Lower accessory day plus a short upper/trunk finisher. Legs and hips carry the session; Block E adds side delts, anti-rotation core, and calves without turning this into another max-effort leg day.",
    laterRecovery: "Lower-Body Flush + Back Care, 10-14 minutes.",
    details: [
      "Block A: Lying Leg Curl (warm-up) — 2 light sets to open the knees and hamstrings. Not a working hamstring set.",
      "Block B: Supported Stationary Bulgarian Split Squat.",
      "Block C: Seated Leg Extension and Seated Leg Curl (4 sets — replaces back hyperextensions without loaded spinal extension). The working hamstring volume stays here.",
      "Block D: Hip Adduction Machine and Hip Abduction Machine (4 sets each) — a deliberate focus.",
      "Block E finisher: Seated Straight-Leg Calf Machine or Leg Press Calf Press; Cable Lateral Raise; Supported Cable Anti-Rotation Hold. Straight knee, gastrocnemius emphasis; skip the calf slot entirely if sole/plantar pain is 3/10 or higher.",
      "Arm work has moved off Wednesday: Tuesday, Thursday, and Friday already carry the biceps and triceps volume.",
      "Wednesday total working sets: 27, including the 2 warm-up sets.",
    ],
  },
  {
    day: "Thursday",
    title: "Upper B — Chest Machine Press / Pull + Shoulders and Arms",
    protocol: "Strength Protocol",
    dayOfWeek: 4,
    note: "Balanced upper-body day with mid-chest machine press, rows, pulldown, shoulders, and arms.",
    laterRecovery: "Shoulder / Upper-Back Reset + Foot Base, 8-12 minutes.",
    details: [
      "Block A: Chest Machine Press and Chest-Supported Row or Seated Cable Row.",
      "Block B: Neutral-Grip Lat Pulldown and Dumbbell / Plate Lateral Raise.",
      "Block C: Triceps Pressdown, bar; Reverse Cable Crossover; and Face-Away Bayesian Cable Curl.",
      "Thursday total working sets: 21.",
      "Chest Machine Press balances repeated incline pressing with neutral mid-chest work.",
    ],
  },
  {
    day: "Friday",
    title: "Upper Accessory + Arms + Core",
    protocol: "Strength Protocol",
    dayOfWeek: 5,
    note: "Accessory upper-body day built around supersets: chest and rear delts paired, a chest-supported row, an arm triple superset, overhead pressing, calves, and a shoulder/triceps pair.",
    laterRecovery: "Weekly Downshift / Foot-Flare Recovery, 12-16 minutes.",
    details: [
      "Block A superset: Pec Deck or Single-Arm Cable Fly, then Reverse Pec Deck or Reverse Cable Fly. Minimal rest between A1 and A2; rest 120 seconds after A2.",
      "Block B: T-Bar Chest-Supported Row or Chest-Supported Row. Chest-supported only on both variants — an unsupported landmine T-bar is a loaded hip hinge and is not permitted.",
      "Block C triple superset: Dumbbell Preacher Curl or Machine Preacher Curl, then Reverse Curl, then Cable or Dumbbell Wrist Curl. Rounds 1 and 2 run all three; round 3 is C1 only. Rest 120 seconds after each round.",
      "Block D: Seated Machine Shoulder Press. This is overhead pressing — removed while lower-back pain is 3/10 or higher, and it returns when pain clears, the same gate as Tuesday B3.",
      "Block E: Seated Straight-Leg Calf Machine or Leg Press Calf Press. Straight knee, gastrocnemius emphasis; skip entirely if sole/plantar pain is 3/10 or higher.",
      "Block F superset: Cable Lateral Raise, then Overhead Cable Triceps Extension. Rest 120 seconds after F2. The overhead cable extension is elbow-extension accessory work, not overhead pressing, and is not gated.",
      "Friday total working sets: 28.",
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

  const [plans, dayStatuses, painCheckIn] = await Promise.all([
    getWorkoutPlans(user.id),
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
        eyebrow="Training Protocol"
        title={NEXT_WEEK_TAPER_TITLE}
        lead={ADJUSTED_WEEK_HEADER_COPY}
        action={<WorkoutPlanResetButton />}
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

      <Section className="mt-6" title="Week structure">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="num num-left text-data-xl font-medium text-primary">5 / 0 / 2</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">5 Strength</Badge>
            <Badge variant="secondary">0 Recovery</Badge>
            <Badge variant="secondary">2 Full Rest</Badge>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-body text-secondary">
          Five training days with balanced chest, back, legs, hips, arms, and trunk stability.
          Progress by clean reps before load. Saturday and Sunday are full rest. Ramp-up sets
          stay outside the ledger. Required later recovery remains separate.
        </p>
      </Section>

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
        <SessionPrepStrip note="Non-loggable arrival guidance. No set rows." />
      </Section>

      <div>
        {WEEK_STRUCTURE.map((day, index) => {
            const plan = "dayOfWeek" in day ? plansByDay.get(day.dayOfWeek) : null;
            const loggableExercises = plan?.exercises.filter(isLoggableTrainingExercise) ?? [];
            const workingCount = loggableExercises.length;
            const totalSets = loggableExercises
              .reduce((sum, exercise) => sum + exercise.sets, 0) ?? 0;
            const showBackReadiness = plan?.dayOfWeek === 3 || plan?.dayOfWeek === 4;

            return (
              <Section key={day.day}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="num num-left text-row text-tertiary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2>{day.day}</h2>
                  <Badge variant={day.protocol === "Strength Protocol" ? "accent" : "outline"}>
                    {day.protocol}
                  </Badge>
                </div>

                <p className="mt-2 text-body font-medium text-primary">
                  {plan?.sessionName ?? day.title}
                </p>

                {plan ? (
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                    <dl className="flex gap-8">
                      <Figure label="Exercises" value={workingCount} />
                      <Figure label="Sets" value={totalSets} />
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

                <p className="mt-4 max-w-2xl text-row text-secondary">{day.note}</p>
                <p className="mt-2 max-w-2xl text-row text-secondary">
                  <span className="font-medium text-primary">Required later recovery:</span> {day.laterRecovery}
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
                      const programming = `${exercise.sets} x ${exercise.reps}${
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
                            <Sub className="mt-1 block">{programming}</Sub>
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
              </Section>
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
      <p className="text-label uppercase text-tertiary">{title}</p>
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
