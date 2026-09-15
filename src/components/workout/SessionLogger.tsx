"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { completeSession, discardWorkoutSession } from "@/actions/workout";
import { ExerciseCard, type PlanExercise } from "./ExerciseCard";
import { SetInput } from "./SetInput";
import { RestTimer } from "./RestTimer";
import { SessionPrepStrip } from "./SessionPrepStrip";
import { Button } from "@/components/ui/button";
import { Notice, Section } from "@/components/ui/ledger";
import { Progress } from "@/components/ui/progress";
import { LOWER_B_BACK_PAIN_READINESS_NOTE, LOWER_B_BACK_SAFE_TITLE } from "@/lib/default-workout-plan";
import { isLoggableTrainingExercise } from "@/lib/training-session";
import { restStorageKey, sessionDraftSnapshot, startSessionRest, subscribeWorkoutStorage, workoutDraftKey, writeWorkoutStorage, type SavedEntry } from "@/lib/workout-entry-state";

type SessionSet = SavedEntry & { exerciseName: string; setNumber: number };
type PrevSet = { exerciseName: string; setNumber: number; weightUsed: number | null; repsCompleted: number | null; actualRPE?: number | null };
type Target = { exerciseName: string; setNumber: number };

export function SessionLogger({ sessionId, sessionName, exercises, existingSets, previousSets, startTime, trainingDate, isStale }: {
  sessionId: string; sessionName: string; exercises: PlanExercise[]; existingSets: SessionSet[];
  previousSets: PrevSet[]; startTime: string; trainingDate: string; isStale: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"complete" | "discard" | null>(null);
  const operationInFlight = useRef(false);
  const saveInFlight = useRef(false);
  const [saving, setSaving] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [loggedSets, setLoggedSets] = useState(existingSets);
  const [previousExistingSets, setPreviousExistingSets] = useState(existingSets);
  if (previousExistingSets !== existingSets) {
    setPreviousExistingSets(existingSets);
    setLoggedSets(existingSets);
  }
  const [selected, setSelected] = useState<Target | null>(null);
  const [advanceFocus, setAdvanceFocus] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const editorRef = useRef<HTMLElement>(null);
  const draftsRaw = useSyncExternalStore(subscribeWorkoutStorage, () => sessionDraftSnapshot(sessionId), () => "[]");
  const draftKeys: string[] = JSON.parse(draftsRaw);
  const loggableExercises = useMemo(() => exercises.filter(isLoggableTrainingExercise), [exercises]);
  const allTargets = buildSessionTargets(loggableExercises);
  const isSaved = (target: Target) => loggedSets.some((set) => set.exerciseName === target.exerciseName && set.setNumber === target.setNumber);
  const firstUnsaved = allTargets.find((target) => !isSaved(target));
  const draftTarget = allTargets.find((target) => draftKeys.includes(workoutDraftKey(sessionId, target.exerciseName, target.setNumber)));
  const target = selected ?? draftTarget ?? firstUnsaved ?? allTargets.at(-1) ?? null;
  const currentExercise = loggableExercises.find((exercise) => exercise.exerciseName === target?.exerciseName);
  const currentIndex = currentExercise ? loggableExercises.indexOf(currentExercise) : -1;
  const savedCount = allTargets.filter(isSaved).length;
  const complete = savedCount === allTargets.length;
  const progressPercent = allTargets.length ? Math.round(savedCount / allTargets.length * 100) : 0;
  const currentLogged = loggedSets.find((set) => set.exerciseName === target?.exerciseName && set.setNumber === target?.setNumber) ?? null;
  const previousSet = previousSets.find((set) => set.exerciseName === target?.exerciseName && set.setNumber === target?.setNumber) ?? null;
  const prefill = target && !currentLogged ? loggedSets.find((set) => set.exerciseName === target.exerciseName && set.setNumber === target.setNumber - 1) ?? null : null;

  useEffect(() => {
    const updateElapsed = () => setElapsedMinutes(Math.max(0, Math.floor((Date.now() - new Date(startTime).getTime()) / 60000)));
    const timer = window.setInterval(updateElapsed, 30000);
    const initialTick = window.setTimeout(updateElapsed, 0);
    return () => { window.clearInterval(timer); window.clearTimeout(initialTick); };
  }, [startTime]);

  useEffect(() => {
    if (!draftKeys.length) return;
    const protectDraft = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", protectDraft);
    return () => window.removeEventListener("beforeunload", protectDraft);
  }, [draftKeys.length]);

  function selectExercise(exercise: PlanExercise, setNumber?: number) {
    if (saveInFlight.current || operationInFlight.current) return;
    const targetSet = setNumber ?? allTargets.find((candidate) => candidate.exerciseName === exercise.exerciseName && !isSaved(candidate))?.setNumber ?? 1;
    setSelected({ exerciseName: exercise.exerciseName, setNumber: targetSet });
    setAdvanceFocus(false);
    editorRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }

  function onSaved(_key: string, values: SavedEntry, advance = true) {
    if (!target || !currentExercise) return;
    const nextSets = [...loggedSets.filter((set) => !(set.exerciseName === target.exerciseName && set.setNumber === target.setNumber)), { ...target, ...values }];
    setLoggedSets((current) => [...current.filter((set) => !(set.exerciseName === target.exerciseName && set.setNumber === target.setNumber)), { ...target, ...values }]);
    const remaining = allTargets.filter((candidate) => !nextSets.some((set) => set.exerciseName === candidate.exerciseName && set.setNumber === candidate.setNumber));
    const pairedExercises = getPairedExercises(loggableExercises, currentExercise);
    const next = (pairedExercises.length
      ? remaining.find((candidate) => pairedExercises.some((exercise) => exercise.exerciseName === candidate.exerciseName))
      : remaining.find((candidate) => candidate.exerciseName === target.exerciseName)) ?? remaining[0];
    if (!currentLogged && advance) {
      if (next) { setSelected(next); setAdvanceFocus(true); }
      const partnerIsNext = currentExercise.restSeconds === 0 && next?.setNumber === target.setNumber &&
        pairedExercises.some((exercise) => exercise.exerciseName === next.exerciseName);
      if (!partnerIsNext) startSessionRest(sessionId, getProgrammedRestSeconds(loggableExercises, currentExercise));
    }
    setSessionError(null);
  }

  async function handleComplete() {
    if (operationInFlight.current || saveInFlight.current) return;
    if (JSON.parse(sessionDraftSnapshot(sessionId)).length) {
      setSessionError("Save or resolve your draft sets before finishing this session.");
      return;
    }
    if (!complete && !window.confirm(`Finish with ${savedCount} of ${allTargets.length} sets saved? Unlogged sets will remain empty.`)) return;
    operationInFlight.current = true;
    setPending("complete");
    setSessionError(null);
    try {
      const result = await completeSession(sessionId);
      if (result.error) throw new Error(result.error);
      writeWorkoutStorage(restStorageKey(sessionId), null);
      toast.success("Session complete");
      router.push("/workout/history");
      router.refresh();
    } catch (cause) {
      setSessionError(cause instanceof Error ? cause.message : "Could not finish the session. Your saved sets are safe; try again.");
    } finally { operationInFlight.current = false; setPending(null); }
  }

  async function handleDiscard() {
    if (operationInFlight.current || saveInFlight.current || !window.confirm("Discard this incomplete session, its saved sets, and drafts?")) return;
    operationInFlight.current = true;
    setPending("discard");
    try {
      const result = await discardWorkoutSession(sessionId);
      if (result.error) throw new Error(result.error);
      draftKeys.forEach((key) => writeWorkoutStorage(key, null));
      writeWorkoutStorage(restStorageKey(sessionId), null);
      router.refresh();
    } catch (cause) {
      setSessionError(cause instanceof Error ? cause.message : "Could not discard the session. Try again.");
    } finally { operationInFlight.current = false; setPending(null); }
  }

  return (
    <div className="mt-5">
      {isStale ? <Notice className="mb-4 flex items-start gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><span>Open session from {formatSessionDate(trainingDate)}. Continue it or discard it to start today’s training.</span></Notice> : null}
      <div className="mb-5 space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-caption text-secondary"><span><span className="font-medium text-primary tabular-nums">{savedCount}/{allTargets.length}</span> sets saved{draftKeys.length ? ` · ${draftKeys.length} draft${draftKeys.length === 1 ? "" : "s"}` : ""}</span><span className="tabular-nums">{elapsedMinutes} min</span></div>
        <Progress value={progressPercent} />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
        <section ref={editorRef} id="current-set" className="scroll-mt-24 border border-rule-strong bg-raised p-4 sm:p-6">
          {target && currentExercise ? <FocusedSetPanel>
            <div className="mb-3 flex items-center justify-between gap-3"><p className="text-caption font-medium text-accent">Exercise {currentIndex + 1} of {loggableExercises.length}</p><span className="text-caption font-medium tabular-nums text-primary">Set {target.setNumber} / {currentExercise.exerciseType === "FINISHER" ? 1 : currentExercise.sets}</span></div>
            <h2 className="text-xl leading-tight font-semibold text-primary sm:text-2xl">{currentExercise.exerciseName}</h2>
            <p className="mt-2 text-caption text-secondary">{currentExercise.reps}{currentExercise.targetRPE ? ` · RPE ${currentExercise.targetRPE}` : ""}{currentExercise.tempo ? ` · Tempo ${currentExercise.tempo}` : ""}</p>
            {currentExercise.cues ? <details className="mt-2 text-caption text-secondary"><summary className="flex min-h-10 cursor-pointer items-center focus-visible:outline-2 focus-visible:outline-accent">Technique &amp; guidance</summary><p className="pb-3 leading-relaxed">{currentExercise.cues}</p></details> : null}
            <SetInput key={`${sessionId}:${currentExercise.id}:${target.setNumber}`} sessionId={sessionId} planExerciseId={currentExercise.id || null} exerciseName={currentExercise.exerciseName} setNumber={target.setNumber} isFinisher={currentExercise.exerciseType === "FINISHER"} logged={currentLogged} previous={previousSet} prefill={prefill} shouldAdvance={advanceFocus} disabled={pending !== null} onPendingChange={(nextSaving) => { saveInFlight.current = nextSaving; setSaving(nextSaving); }} onSaved={onSaved} className="mt-4" />
            <div className="mt-4"><RestTimer sessionId={sessionId} defaultSeconds={getProgrammedRestSeconds(loggableExercises, currentExercise)} /></div>
            <div className="mt-4 flex justify-between gap-2 border-t border-rule pt-3">
              <Button type="button" variant="ghost" className="min-h-12 px-2 text-caption" disabled={currentIndex <= 0 || saving || pending !== null} onClick={() => selectExercise(loggableExercises[currentIndex - 1])}><ChevronLeft className="size-4" />Previous exercise</Button>
              <Button type="button" variant="ghost" className="min-h-12 px-2 text-caption" disabled={currentIndex >= loggableExercises.length - 1 || saving || pending !== null} onClick={() => selectExercise(loggableExercises[currentIndex + 1])}>Next exercise<ChevronRight className="size-4" /></Button>
            </div>
          </FocusedSetPanel> : <p className="text-body text-secondary">There are no working sets in this session.</p>}
        </section>
        <section aria-label="Session exercises">
          <h2 className="mb-2 text-body font-medium">Session exercises</h2>
          {loggableExercises.map((exercise, index) => <ExerciseCard key={exercise.id || exercise.exerciseName} exercise={exercise} index={index} loggedSets={loggedSets.filter((set) => set.exerciseName === exercise.exerciseName)} selectedSet={target?.exerciseName === exercise.exerciseName ? target.setNumber : null} draftSetNumbers={allTargets.filter((candidate) => candidate.exerciseName === exercise.exerciseName && draftKeys.includes(workoutDraftKey(sessionId, candidate.exerciseName, candidate.setNumber))).map((candidate) => candidate.setNumber)} disabled={saving || pending !== null} onSelect={(setNumber) => selectExercise(exercise, setNumber)} />)}
        </section>
      </div>
      <Section>
        {complete ? <p className="mb-4 flex items-center gap-2 text-body font-medium text-accent"><CheckCircle2 className="size-5" />All planned sets saved</p> : null}
        {sessionError ? <div role="alert"><Notice className="mb-4">{sessionError}</Notice></div> : null}
        <div className="flex flex-wrap gap-3"><Button type="button" className="min-h-12 w-full sm:w-auto" onClick={() => void handleComplete()} disabled={pending !== null || saving || draftKeys.length > 0}>{pending === "complete" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Finish session</Button>
          {isStale ? <Button type="button" variant="secondary" className="min-h-12" onClick={() => void handleDiscard()} disabled={pending !== null || saving}>{pending === "discard" ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}Discard old session</Button> : null}
        </div>
        {draftKeys.length ? <p className="mt-3 text-caption text-secondary">Save your draft sets before finishing. They remain available when you return.</p> : null}
      </Section>
      <Section><details><summary className="flex min-h-12 cursor-pointer items-center text-body font-medium focus-visible:outline-2 focus-visible:outline-accent">Session preparation</summary>
        {(sessionName === LOWER_B_BACK_SAFE_TITLE || /Lower A/.test(sessionName)) ? <Notice tone="accent" className="my-4">{LOWER_B_BACK_PAIN_READINESS_NOTE}</Notice> : null}
        <SessionPrepStrip note="Use controlled ramp-up sets before your working sets." />
      </details></Section>
    </div>
  );
}

function FocusedSetPanel({ children }: { children: React.ReactNode }) { return <div>{children}</div>; }

function getPairedExercises(exercises: PlanExercise[], exercise: PlanExercise) {
  if (!exercise.supersetGroup) return [];
  const group = exercises.filter((candidate) => candidate.supersetGroup === exercise.supersetGroup);
  return group.length > 1 && group.some((candidate) => candidate.restSeconds === 0) ? group : [];
}

function buildSessionTargets(exercises: PlanExercise[]): Target[] {
  const targets: Target[] = [];
  const visited = new Set<string>();
  for (const exercise of exercises) {
    if (visited.has(exercise.exerciseName)) continue;
    const paired = getPairedExercises(exercises, exercise);
    const block = paired.length ? paired : [exercise];
    const setCount = (candidate: PlanExercise) => candidate.exerciseType === "FINISHER" ? 1 : candidate.sets;
    for (let setNumber = 1; setNumber <= Math.max(...block.map(setCount)); setNumber++) {
      for (const candidate of block) {
        if (setNumber <= setCount(candidate)) targets.push({ exerciseName: candidate.exerciseName, setNumber });
      }
    }
    block.forEach((candidate) => visited.add(candidate.exerciseName));
  }
  return targets;
}

function getProgrammedRestSeconds(exercises: PlanExercise[], exercise: PlanExercise) {
  if (!exercise.supersetGroup) return exercise.restSeconds ?? 90;
  return exercises.filter((candidate) => candidate.supersetGroup === exercise.supersetGroup).at(-1)?.restSeconds ?? exercise.restSeconds ?? 90;
}
function formatSessionDate(dateString: string) { return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
