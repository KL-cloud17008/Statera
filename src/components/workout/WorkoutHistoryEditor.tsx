"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { ArrowLeft, Check, ChevronDown, Loader2, Plus, Trash2 } from "lucide-react";
import { deleteCompletedWorkoutSet } from "@/actions/workout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTitle } from "@/components/ui/ledger";
import { SetInput } from "@/components/workout/SetInput";
import { mergeSavedSessionExercises, type SessionExercise } from "@/lib/workout-session-exercises";
import { draftTargets, sessionDraftSnapshot, subscribeWorkoutStorage, workoutDraftKey, writeWorkoutStorage, type SavedEntry } from "@/lib/workout-entry-state";
import { isAtHomePrimerExerciseName } from "@/lib/training-session";
import { cn } from "@/lib/utils";

export type HistoricalWorkoutSet = SavedEntry & {
  exerciseName: string;
  setNumber: number;
  duration: number | null;
  isAMRAP: boolean;
};
type Target = { exerciseName: string; setNumber: number };

export function WorkoutHistoryEditor({ sessionId, sessionName, trainingDate, exercises, existingSets }: {
  sessionId: string;
  sessionName: string;
  trainingDate: string;
  exercises: SessionExercise[];
  existingSets: HistoricalWorkoutSet[];
}) {
  const router = useRouter();
  const [loggedSets, setLoggedSets] = useState(existingSets);
  const [previousExistingSets, setPreviousExistingSets] = useState(existingSets);
  if (previousExistingSets !== existingSets) {
    setPreviousExistingSets(existingSets);
    setLoggedSets(existingSets);
  }
  const [extras, setExtras] = useState<SessionExercise[]>([]);
  const [setCounts, setSetCounts] = useState<Map<string, number>>(() => new Map());
  const [selected, setSelected] = useState<Target | null>(null);
  const [exerciseName, setExerciseName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const operationInFlight = useRef(false);
  const editorRef = useRef<HTMLElement>(null);
  const draftRaw = useSyncExternalStore(subscribeWorkoutStorage, () => sessionDraftSnapshot(sessionId), () => "[]");
  const draftKeys: string[] = JSON.parse(draftRaw);
  const movements = useMemo(() => mergeSavedSessionExercises(
    [...exercises, ...extras.filter((extra) => !exercises.some((exercise) => exercise.exerciseName === extra.exerciseName))]
      .map((exercise) => ({ ...exercise, sets: Math.max(exercise.sets, setCounts.get(exercise.exerciseName) ?? 0) })),
    [...loggedSets, ...draftTargets(sessionId, JSON.parse(draftRaw))]
  ), [exercises, extras, setCounts, loggedSets, sessionId, draftRaw]);
  const targets = movements.flatMap((exercise) => Array.from({ length: exercise.sets }, (_, index) => ({ exerciseName: exercise.exerciseName, setNumber: index + 1 })));
  const isSaved = (target: Target) => loggedSets.some((set) => set.exerciseName === target.exerciseName && set.setNumber === target.setNumber);
  const target = targets.find((candidate) => candidate.exerciseName === selected?.exerciseName && candidate.setNumber === selected?.setNumber)
    ?? targets.find((candidate) => draftKeys.includes(workoutDraftKey(sessionId, candidate.exerciseName, candidate.setNumber)))
    ?? targets.find((candidate) => !isSaved(candidate)) ?? targets[0];
  const currentExercise = movements.find((exercise) => exercise.exerciseName === target?.exerciseName);
  const currentSet = loggedSets.find((set) => set.exerciseName === target?.exerciseName && set.setNumber === target?.setNumber) ?? null;
  const busy = saving || removing;

  useEffect(() => {
    if (!draftKeys.length) return;
    const protectDraft = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", protectDraft);
    return () => window.removeEventListener("beforeunload", protectDraft);
  }, [draftKeys.length]);

  function selectExercise(name: string) {
    if (operationInFlight.current) return;
    setSelected(targets.find((candidate) => candidate.exerciseName === name && !isSaved(candidate)) ?? { exerciseName: name, setNumber: 1 });
    setError(null);
    editorRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }

  function onSaved(_key: string, values: SavedEntry, advance = true) {
    if (!target) return;
    setLoggedSets((current) => [...current.filter((set) => !(set.exerciseName === target.exerciseName && set.setNumber === target.setNumber)), {
      ...target, duration: currentSet?.duration ?? null, isAMRAP: currentSet?.isAMRAP ?? false, ...values,
    }]);
    setNotice("Set saved to this completed workout.");
    setError(null);
    if (!currentSet && advance) {
      const remaining = targets.filter((candidate) => !isSaved(candidate) && !(candidate.exerciseName === target.exerciseName && candidate.setNumber === target.setNumber));
      const next = remaining.find((candidate) => candidate.exerciseName === target.exerciseName) ?? remaining[0];
      if (next) setSelected(next);
    }
  }

  async function removeSet() {
    if (!target || !currentSet || operationInFlight.current) return;
    if (!window.confirm(`Remove saved set ${target.setNumber} of ${target.exerciseName}? The workout will stay completed.`)) return;
    operationInFlight.current = true;
    setRemoving(true);
    setError(null);
    try {
      const data = new FormData();
      data.set("sessionId", sessionId);
      data.set("exerciseName", target.exerciseName);
      data.set("setNumber", String(target.setNumber));
      data.set("expectedSet", JSON.stringify(currentSet));
      data.set("expectedDuration", JSON.stringify(currentSet.duration));
      data.set("expectedAMRAP", String(currentSet.isAMRAP));
      const result = await deleteCompletedWorkoutSet(data);
      if (result.error) throw new Error(result.error);
      setLoggedSets((current) => current.filter((set) => !(set.exerciseName === target.exerciseName && set.setNumber === target.setNumber)));
      writeWorkoutStorage(workoutDraftKey(sessionId, target.exerciseName, target.setNumber), null);
      setNotice("Set removed. The workout is still completed.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not remove this set. Try again.");
    } finally {
      operationInFlight.current = false;
      setRemoving(false);
    }
  }

  function addExercise(event: FormEvent) {
    event.preventDefault();
    if (operationInFlight.current) return;
    const name = exerciseName.trim();
    if (!name || name.length > 240 || isAtHomePrimerExerciseName(name)) {
      setError("Enter a training exercise name, up to 240 characters.");
      return;
    }
    if (!movements.some((exercise) => exercise.exerciseName === name)) {
      setExtras((current) => [...current, {
        id: `added-${crypto.randomUUID()}`, exerciseName: name, sets: 1, reps: "",
        tempo: null, restSeconds: null, targetRPE: null, cues: null, supersetGroup: null, exerciseType: "WORKING",
      }]);
    }
    setSelected({ exerciseName: name, setNumber: 1 });
    setExerciseName("");
    setError(null);
    editorRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }

  return <>
    <PageTitle title="Edit session" action={
      <Button asChild variant="secondary" className="min-h-11"><Link href="/workout/history" aria-label="Back to history" onClick={(event) => {
        if (operationInFlight.current || (draftKeys.length && !window.confirm("You have unsaved drafts on this device. Leave the editor?"))) event.preventDefault();
      }}><ArrowLeft className="size-4" aria-hidden />History</Link></Button>
    } />
    <div className="mb-5 border-b border-rule-strong pb-4">
      <p className="text-caption text-secondary">{new Date(`${trainingDate}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} · Completed</p>
      <h2 className="mt-2 text-body-lg font-medium">{sessionName}</h2>
      <p className="mt-2 text-caption text-secondary">Add missed sets or correct saved values. Each set saves separately; empty sets stay unlogged.</p>
    </div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-caption">
      <p className="text-secondary"><span className="font-medium text-primary tabular-nums">{loggedSets.length}</span> {loggedSets.length === 1 ? "set" : "sets"} saved{draftKeys.length ? ` · ${draftKeys.length} unsaved draft${draftKeys.length === 1 ? "" : "s"}` : ""}</p>
      <p role="status" className="text-accent">{notice}</p>
    </div>
    {error ? <div role="alert" className="mb-4 border-l-2 border-critical-line bg-critical-surface p-3 text-caption text-critical">
      <p>{error}</p><Button type="button" variant="link" disabled={busy} onClick={() => router.refresh()}>Reload saved values</Button>
    </div> : null}
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
      <section ref={editorRef} aria-label="Edit workout sets" className="min-w-0 scroll-mt-24 border border-rule-strong bg-raised p-4 sm:p-6">
        {target && currentExercise ? <>
          <div className="mb-3 flex justify-between gap-3 text-caption text-secondary"><span>Exercise {movements.indexOf(currentExercise) + 1} of {movements.length}</span><span className="font-medium tabular-nums text-primary">Set {target.setNumber}</span></div>
          <label htmlFor="history-exercise" className="sr-only">Choose exercise</label>
          <div className="relative mb-3 min-h-12 rounded-control border border-control-border bg-raised focus-within:outline-2 focus-within:outline-accent">
            <span aria-hidden className="pointer-events-none block py-3 pr-9 pl-3 text-body font-medium text-primary">{target.exerciseName}</span>
            <ChevronDown aria-hidden className="pointer-events-none absolute top-4 right-3 size-4 text-secondary" />
            <select id="history-exercise" value={target.exerciseName} disabled={busy} onChange={(event) => selectExercise(event.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-default">
              {movements.map((exercise) => <option key={exercise.exerciseName} value={exercise.exerciseName}>{exercise.exerciseName}</option>)}
            </select>
          </div>
          {currentExercise.reps ? <p className="mb-4 text-caption text-secondary">Planned: {currentExercise.reps}{currentExercise.targetRPE ? ` · RPE ${currentExercise.targetRPE}` : ""}</p> : null}
          <div className="mb-5 flex flex-wrap gap-2" aria-label="Choose set">
            {Array.from({ length: currentExercise.sets }, (_, index) => index + 1).map((setNumber) => {
              const saved = isSaved({ exerciseName: target.exerciseName, setNumber });
              return <Button key={setNumber} type="button" variant={target.setNumber === setNumber ? "primary" : "secondary"} disabled={busy} aria-pressed={target.setNumber === setNumber} aria-label={`Set ${setNumber}, ${saved ? "saved" : "unlogged"}`} className="min-h-11 min-w-11 gap-1 px-2" onClick={() => { setSelected({ exerciseName: target.exerciseName, setNumber }); setError(null); }}>
                {setNumber}{saved ? <Check className="size-3.5" aria-hidden /> : null}
              </Button>;
            })}
            <Button type="button" variant="link" disabled={busy || currentExercise.sets >= 50} className="min-h-11 px-2" onClick={() => {
              if (operationInFlight.current) return;
              const count = currentExercise.sets + 1;
              setSetCounts((current) => new Map(current).set(target.exerciseName, count));
              setSelected({ exerciseName: target.exerciseName, setNumber: count });
            }}><Plus className="size-4" aria-hidden />Add set</Button>
          </div>
          <SetInput key={`${target.exerciseName}:${target.setNumber}`} sessionId={sessionId} planExerciseId={null} exerciseName={target.exerciseName} setNumber={target.setNumber}
            isFinisher={currentExercise.exerciseType === "FINISHER"} logged={currentSet} previous={null} showPrevious={false} saveMode="history" disabled={removing}
            onSaved={onSaved} onMissing={() => {
              setLoggedSets((current) => current.filter((set) => !(set.exerciseName === target.exerciseName && set.setNumber === target.setNumber)));
              setNotice("Saved values reloaded. This set was removed elsewhere.");
            }} onPendingChange={(pending) => { operationInFlight.current = pending; setSaving(pending); }} />
          {currentSet?.duration != null ? <p className="mt-3 text-caption text-secondary">Recorded duration: {currentSet.duration}s{currentSet.isAMRAP ? " · AMRAP" : ""}. Retained when saving changes.</p> : null}
          {currentSet ? <Button type="button" variant="link" className="mt-4 min-h-11 text-critical" disabled={busy} onClick={() => void removeSet()}>
            {removing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}Remove saved set
          </Button> : null}
        </> : <p className="text-body text-secondary">Add an exercise to enter what you did.</p>}
      </section>
      <aside className="min-w-0">
        <h2 className="border-b border-rule-strong pb-3 text-body font-medium">Exercises</h2>
        <div className="ledger-rows">
          {movements.map((exercise) => {
            const count = loggedSets.filter((set) => set.exerciseName === exercise.exerciseName).length;
            return <button key={exercise.exerciseName} type="button" disabled={busy} aria-pressed={exercise.exerciseName === target?.exerciseName} onClick={() => selectExercise(exercise.exerciseName)} className={cn(
              "flex min-h-14 w-full items-center justify-between gap-3 border-l-2 py-3 pr-2 pl-3 text-left text-caption hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60",
              exercise.exerciseName === target?.exerciseName ? "border-accent bg-accent-subtle" : "border-transparent"
            )}><span className="min-w-0 font-medium text-primary">{exercise.exerciseName}</span><span className="shrink-0 tabular-nums text-secondary">{count}/{exercise.sets}</span></button>;
          })}
        </div>
        <form onSubmit={addExercise} className="mt-5 grid gap-3 border-t border-rule-strong pt-4">
          <label htmlFor="extra-exercise" className="text-caption font-medium text-primary">Did something else?</label>
          <Input id="extra-exercise" aria-label="Additional exercise name" value={exerciseName} onChange={(event) => setExerciseName(event.target.value)} disabled={busy} maxLength={240} required placeholder="Exercise name" className="min-h-12" />
          <Button type="submit" variant="secondary" disabled={busy || !exerciseName.trim()} className="min-h-12"><Plus className="size-4" aria-hidden />Add exercise</Button>
          <p className="text-caption text-tertiary">Adds to this workout when you save its first set.</p>
        </form>
      </aside>
    </div>
  </>;
}
