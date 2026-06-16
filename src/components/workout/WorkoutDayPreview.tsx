"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { startWorkoutSession } from "@/actions/workout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const warmups = plan.exercises.filter((exercise) => exercise.exerciseType === "WARMUP");
  const workingExercises = plan.exercises.filter(
    (exercise) => exercise.exerciseType === "WORKING"
  );
  const totalWorkingSets = workingExercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const blockOrder = ["A", "B", "C"] as const;

  function handleStart() {
    startTransition(async () => {
      const result = await startWorkoutSession(plan.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.warning ?? "Workout started");
      router.refresh();
    });
  }

  return (
    <section className="document-panel">
      {!hideHeader ? (
        <div className="grid gap-8 border-b border-border pb-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-end">
          <div>
            <p className="eyebrow">Today&apos;s programmed work</p>
            <h2 className="mt-3 max-w-3xl">{plan.sessionName}</h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Run the session as a sequence: primer first, paired circuit blocks next, rest only
              at the programmed transition points.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm xl:text-right">
            <div>
              <p className="eyebrow text-[10px]">Blocks</p>
              <p className="data-number mt-2 text-2xl text-foreground">3</p>
            </div>
            <div>
              <p className="eyebrow text-[10px]">Exercises</p>
              <p className="data-number mt-2 text-2xl text-foreground">{workingExercises.length}</p>
            </div>
            <div>
              <p className="eyebrow text-[10px]">Sets</p>
              <p className="data-number mt-2 text-2xl text-foreground">{totalWorkingSets}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="command-panel grid gap-5 rounded-[var(--radius-panel)] p-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div className="grid gap-4 md:grid-cols-3">
          <ProtocolMeta label="Primer" value={warmups[0]?.exerciseName ?? "Ramp-up"} note={warmups[0]?.reps ?? "5 min easy"} />
          <ProtocolMeta label="Walk target" value="Easy nasal pace" note="Keep breathing conversational." />
          <ProtocolMeta label="Session rule" value="RPE 6-7" note="Leave 2-4 reps in reserve." />
        </div>

        <Button size="lg" type="button" onClick={handleStart} disabled={isPending} className="w-full gap-2 border-white/20 bg-[#f7efe3] text-primary hover:bg-white">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Start Session
        </Button>
      </div>

      {warmups.length > 0 ? (
        <div>
          <p className="eyebrow">Primer block</p>
          <div className="mt-4 divide-y divide-border border-y border-border">
            {warmups.map((exercise) => (
              <div key={exercise.id} className="interactive-row grid gap-4 px-2 py-4 md:grid-cols-[minmax(0,1fr)_minmax(12rem,auto)] md:items-start">
                <div>
                  <p className="font-medium text-foreground">{exercise.exerciseName}</p>
                  {exercise.cues ? (
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{exercise.cues}</p>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground md:text-right">
                  {exercise.reps}
                  {exercise.restSeconds ? `, rest ${exercise.restSeconds}s` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="protocol-grid">
        {blockOrder.map((block) => {
          const blockExercises = workingExercises.filter((exercise) => exercise.supersetGroup === block);
          if (blockExercises.length === 0) return null;
          const roundTarget = block === "C" ? "2 rounds" : "3 rounds";
          const restNote = blockExercises[blockExercises.length - 1]?.restSeconds ?? 90;

          return (
            <article key={block} className="border-t border-border pt-7 first:border-t-0 first:pt-0">
              <div className="warm-row rounded-[var(--radius-card)] p-5">
                <div className="grid gap-4 md:grid-cols-[8rem_minmax(0,1fr)_auto] md:items-end">
                <div>
                  <p className="eyebrow">Circuit {block}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{roundTarget}</p>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Move through the pair or sequence cleanly, then take the programmed rest.
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
    </section>
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
