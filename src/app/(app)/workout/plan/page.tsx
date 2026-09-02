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
    title: "Lower A — Hamstring Primer → Lunges → Pendulum Squat Strength",
    protocol: "Strength Protocol",
    dayOfWeek: 1,
    note: "Primary lower-body strength day. A controlled lying-curl primer leads into lunges, pendulum squat strength, and quad/hip accessory work.",
    laterRecovery: "Lower-Body Flush + Sole Care, 10-14 minutes.",
    details: [
      "Block A: Lying Leg Curl — 3 sets of 10-15 at RPE 5-6. This is a controlled hamstring/knee primer, not pre-exhaustion; keep 2-4 reps in reserve.",
      "Block B: Walking Lunges — 2 sets of 6-10 steps per leg at RPE 5-6, bodyweight initially or minimal load. Use support or regress if needed; reduce or skip if ankle/sole symptoms meaningfully worsen.",
      "Block C: Pendulum Squat — 3 controlled sets of 8-12 at RPE 6-7. Use controlled depth and tempo; no bouncing or grinding.",
      "Block D: Leg Extension, Hip Abduction Machine, and Hip Adduction Machine. Use 3, 3, and 2 sets respectively, with 120 seconds of rest.",
      "Block E: Seated Bent-Leg Calf Raise or Seated Dumbbell Calf Raise. Bent knee, soleus emphasis; skip entirely if sole/plantar pain is 3/10 or higher.",
      "Monday total working sets: 18.",
    ],
  },
  {
    day: "Tuesday",
    title: "Upper A — Incline Chest + Row / Dual Pulldown + Rear Delts",
    protocol: "Strength Protocol",
    dayOfWeek: 2,
    note: "Primary upper-body strength day with incline pressing first, a machine row, complementary dual pulldowns, triceps, rear delts, lateral delts, and modest biceps work.",
    laterRecovery: "Upper-Body Downshift + Foot/Ankle Base, 8-12 minutes.",
    details: [
      "Block A main push/pull: Incline Dumbbell Press first, then Machine Row. Both are 3 sets of 8-12 at RPE 6-7.",
      "Block B dual-pulldown pairing: Neutral-Grip Lat Pulldown for 3 sets of 8-12 at RPE 6-7, then Close-Grip Lat Pulldown for 2 sets of 10-12 at RPE 5-6. Use controlled reps and rest 120 seconds after the pair.",
      "Block C: Overhead Cable Triceps Extension for 3 sets of 10-15 at RPE 6-7. This is elbow-extension accessory work, not overhead pressing.",
      "Block D rear delt/lateral delt pairing: Reverse Cable Crossover for 3 sets and Cable Lateral Raise for 3 sets, both for 12-20 reps at RPE 5-6.",
      "Block E optional existing biceps work: Cable Curl for 2 sets of 10-15 at RPE 6. No unnecessary arm-volume increase.",
      "Tuesday total working sets: 22.",
    ],
  },
  {
    day: "Wednesday",
    title: "Lower B — Split Squat + Hamstrings / Hips + Core",
    protocol: "Strength Protocol",
    dayOfWeek: 3,
    note: "Lower accessory day with split-squat, hamstring, and hip work plus a short calf, side-delt, and conservative trunk finisher.",
    laterRecovery: "Lower-Body Flush + Back Care, 10-14 minutes.",
    details: [
      "Block A: Lying Leg Curl (warm-up) — 2 light sets to open the knees and hamstrings. Not a working hamstring set.",
      "Block B: Supported Stationary Bulgarian Split Squat.",
      "Block C: Seated Leg Extension and Seated Leg Curl (4 sets — replaces back hyperextensions without loaded spinal extension). The working hamstring volume stays here.",
      "Block D: Hip Adduction Machine and Hip Abduction Machine (4 sets each) — a deliberate focus.",
      "Block E finisher: Seated Straight-Leg Calf Machine or Leg Press Calf Press; Cable Lateral Raise; Cable Crunch for 2 sets of 10-15 at RPE 4-5. Crunch slowly with a light/moderate load, stable hips, and no arm yanking or aggressive loaded flexion; stop for back pain, nerve-like symptoms, or loss of control. Skip the calf slot entirely if sole/plantar pain is 3/10 or higher.",
      "Arm work has moved off Wednesday: Tuesday, Thursday, and Friday already carry the biceps and triceps volume.",
      "Wednesday total working sets: 27, including the 2 warm-up sets.",
    ],
  },
  {
    day: "Thursday",
    title: "Upper B — Machine Chest + Dual Pulldown / Arms",
    protocol: "Strength Protocol",
    dayOfWeek: 4,
    note: "Balanced upper-body day with mid-chest machine press, rows, complementary dual pulldowns, rear delts, and arms.",
    laterRecovery: "Shoulder / Upper-Back Reset + Foot Base, 8-12 minutes.",
    details: [
      "Block A: Chest Machine Press and Chest-Supported Row or Seated Cable Row.",
      "Block B dual-pulldown pairing: Neutral-Grip Lat Pulldown for 3 sets of 8-12 at RPE 6-7, then Close-Grip Lat Pulldown for 2 sets of 10-12 at RPE 5-6. Use controlled reps and rest 120 seconds after the pair.",
      "Block C: Triceps Pressdown, bar; Reverse Cable Crossover; and Face-Away Bayesian Cable Curl.",
      "Thursday total working sets: 20.",
      "Chest Machine Press balances repeated incline pressing with neutral mid-chest work.",
    ],
  },
  {
    day: "Friday",
    title: "Upper C — Chest Isolation + Upper Back / Arms + Core",
    protocol: "Strength Protocol",
    dayOfWeek: 5,
    note: "Lower-fatigue third upper-body day built around chest isolation, upper-back work, an arms superset, rear-delt/scapular work, and conservative core.",
    laterRecovery: "Weekly Downshift / Foot-Flare Recovery, 12-16 minutes.",
    details: [
      "Block A upper back/chest: Chest-Supported Row for 3 sets of 10-12, followed by High-to-Low Cable Fly for 2-3 sets of 12-15, both at RPE 5-6. Seated Cable Row is the supported alternative where appropriate.",
      "Block B arms superset: Cable Curl and Rope Triceps Pressdown, 3 sets each of 10-15 at RPE 6-7. Rest approximately 90-120 seconds after the pair.",
      "Block C: Face Pull for 2-3 sets of 12-20 at RPE 5-6. This differs from Tuesday's Reverse Cable Crossover.",
      "Block D: Cable Crunch for 2 conservative sets of 10-15 at RPE 5-6. Progress control, then reps, then small load increases; no maximal loading or grinding.",
      "Friday total working sets: 16, keeping systemic fatigue below Tuesday and Thursday.",
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
