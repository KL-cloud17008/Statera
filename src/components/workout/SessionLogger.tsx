"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { completeSession, discardWorkoutSession, logSet } from "@/actions/workout";
import { ExerciseCard, type PlanExercise } from "./ExerciseCard";
import { SetInput } from "./SetInput";
import { RestTimer } from "./RestTimer";
import { ExerciseFormGuide } from "./ExerciseFormGuide";
import { SessionPrepStrip } from "./SessionPrepStrip";
import { Button } from "@/components/ui/button";
import { Notice, Section } from "@/components/ui/ledger";
import { Progress } from "@/components/ui/progress";
import { LOWER_BODY_WARMUP, LOWER_B_BACK_PAIN_READINESS_NOTE, isBackPainGatedExercise, isFootPainGatedExercise } from "@/lib/default-workout-plan";
import { isLoggableTrainingExercise, isTimedTrainingExercise } from "@/lib/training-session";
import { acknowledgeSubmittedDraft, draftTargets, parseWorkoutDraft, queuedWorkoutSets, queuedWorkoutSnapshot, readWorkoutStorage, restStorageKey, sessionDraftSnapshot, startSessionRest, subscribeNetwork, subscribeWorkoutStorage, workoutDraftKey, workoutSetForm, writeWorkoutStorage, type SavedEntry } from "@/lib/workout-entry-state";
import { forgetOfflineWorkout, rememberOfflineSets } from "@/lib/offline-workout";
import { mergeSavedSessionExercises } from "@/lib/workout-session-exercises";
import { getIntroductorySets, formatSetPrescription, previousPerformanceIdentity } from "@/lib/workout-prescription";

type SessionSet = SavedEntry & { exerciseName: string; setNumber: number };
type PrevSet = Pick<SessionSet, "exerciseName" | "setNumber" | "weightUsed" | "repsCompleted" | "duration"> & { actualRPE?: number | null };
type Target = { exerciseName: string; setNumber: number };

export function SessionLogger({ sessionId, sessionName, exercises, existingSets, previousSets, startTime, trainingDate, isStale, backPainGateActive = false, footPainGateActive = false, offlineLogging = false, offlineMode = false }: {
  sessionId: string; sessionName: string; exercises: PlanExercise[]; existingSets: SessionSet[];
  previousSets: PrevSet[]; startTime: string; trainingDate: string; isStale: boolean; backPainGateActive?: boolean; footPainGateActive?: boolean; offlineLogging?: boolean; offlineMode?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"complete" | "discard" | null>(null);
  const operationInFlight = useRef(false);
  const saveInFlight = useRef(false);
  const syncInFlight = useRef(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [confirmedSets, setLoggedSets] = useState(existingSets);
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
  const queueRaw = useSyncExternalStore(subscribeWorkoutStorage, () => offlineLogging ? queuedWorkoutSnapshot(sessionId) : "[]", () => "[]");
  const online = useSyncExternalStore(subscribeNetwork, () => navigator.onLine !== false, () => true);
  const draftKeys: string[] = JSON.parse(draftsRaw);
  const queued = useMemo(() => JSON.parse(queueRaw) as ReturnType<typeof queuedWorkoutSets>, [queueRaw]);
  const queuedKeys = queued.map(item => item.key);
  const unsavedKeys = draftKeys.filter(key => !queuedKeys.includes(key));
  const loggedSets = useMemo(() => queued.reduce<SessionSet[]>((sets, { exerciseName, setNumber, values }) => [
    ...sets.filter(set => set.exerciseName !== exerciseName || set.setNumber !== setNumber), { exerciseName, setNumber, ...values },
  ], confirmedSets), [confirmedSets, queued]);
  const volumeKey = `athanor:curl-target:${sessionId}`;
  const targetConfirmed = useSyncExternalStore(subscribeWorkoutStorage, () => readWorkoutStorage(volumeKey) === "confirmed", () => false);
  const loggableExercises = useMemo(() => {
    const gated = ({ exerciseName }: PlanExercise) =>
      (backPainGateActive && isBackPainGatedExercise(exerciseName)) ||
      (footPainGateActive && isFootPainGatedExercise(exerciseName));
    const planned = exercises.filter(isLoggableTrainingExercise).filter((exercise) => !gated(exercise)).map((exercise) => ({
      ...exercise, sets: targetConfirmed ? exercise.sets : getIntroductorySets(exercise),
      restSeconds: footPainGateActive && exercise.supersetGroup === "Squat and calves" ? 165 : exercise.restSeconds,
    }));
    return mergeSavedSessionExercises(planned, [...loggedSets, ...draftTargets(sessionId, JSON.parse(draftsRaw))])
      .map((exercise) => gated(exercise) ? { ...exercise, cues: "Skip further sets at today’s logged pain level. Existing entries are available for review." } : exercise);
  }, [exercises, targetConfirmed, loggedSets, sessionId, draftsRaw, backPainGateActive, footPainGateActive]);
  const hasIntro = exercises.some((exercise) => getIntroductorySets(exercise) < exercise.sets);
  const allTargets = buildSessionTargets(loggableExercises);
  const isSaved = (target: Target) => loggedSets.some((set) => set.exerciseName === target.exerciseName && set.setNumber === target.setNumber);
  const firstUnsaved = allTargets.find((target) => !isSaved(target));
  const draftTarget = allTargets.find((target) => unsavedKeys.includes(workoutDraftKey(sessionId, target.exerciseName, target.setNumber)));
  const target = (selected && allTargets.find((candidate) => candidate.exerciseName === selected.exerciseName && candidate.setNumber === selected.setNumber)) || draftTarget || firstUnsaved || allTargets.at(-1) || null;
  const currentExercise = loggableExercises.find((exercise) => exercise.exerciseName === target?.exerciseName);
  const currentIndex = currentExercise ? loggableExercises.indexOf(currentExercise) : -1;
  const currentBlock = currentExercise ? getPairedExercises(loggableExercises, currentExercise) : [];
  const roundMembers = currentBlock.filter(exercise => target && target.setNumber <= (exercise.exerciseType === "FINISHER" ? 1 : exercise.sets));
  const remainingAfterSave = allTargets.filter(candidate => !isSaved(candidate) && !(candidate.exerciseName === target?.exerciseName && candidate.setNumber === target?.setNumber));
  const nextTarget = (currentBlock.length
    ? remainingAfterSave.find(candidate => currentBlock.some(exercise => exercise.exerciseName === candidate.exerciseName))
    : remainingAfterSave.find(candidate => candidate.exerciseName === target?.exerciseName)) ?? remainingAfterSave[0];
  const savedCount = allTargets.filter(isSaved).length;
  const confirmedCount = allTargets.filter(target => confirmedSets.some(set => set.exerciseName === target.exerciseName && set.setNumber === target.setNumber)).length;
  const complete = savedCount === allTargets.length;
  const progressPercent = allTargets.length ? Math.round(savedCount / allTargets.length * 100) : 0;
  const currentLogged = loggedSets.find((set) => set.exerciseName === target?.exerciseName && set.setNumber === target?.setNumber) ?? null;
  const previousSet = target ? previousSets.find((set) => previousPerformanceIdentity(set.exerciseName) === previousPerformanceIdentity(target.exerciseName) && set.setNumber === target.setNumber) ?? null : null;
  const prefill = target && !currentLogged ? loggedSets.find((set) => set.exerciseName === target.exerciseName && set.setNumber === target.setNumber - 1) ?? null : null;

  useEffect(() => {
    const updateElapsed = () => setElapsedMinutes(Math.max(0, Math.floor((Date.now() - new Date(startTime).getTime()) / 60000)));
    const timer = window.setInterval(updateElapsed, 30000);
    const initialTick = window.setTimeout(updateElapsed, 0);
    return () => { window.clearInterval(timer); window.clearTimeout(initialTick); };
  }, [startTime]);

  useEffect(() => {
    if (draftKeys.length === queued.length) return;
    const protectDraft = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", protectDraft);
    return () => window.removeEventListener("beforeunload", protectDraft);
  }, [draftKeys.length, queued.length]);

  useEffect(() => {
    if (!offlineLogging || offlineMode || !online || !queued.length) return;
    const retryWhenVisible = () => {
      if (document.visibilityState === "visible") void syncQueuedSets();
    };
    const firstAttempt = window.setTimeout(retryWhenVisible, 1000);
    const retry = window.setInterval(retryWhenVisible, 25_000);
    return () => { window.clearTimeout(firstAttempt); window.clearInterval(retry); };
    // Re-read persisted submissions on every retry, including edits from another tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offlineLogging, offlineMode, online, sessionId, queued.length]);

  useEffect(() => {
    if (offlineLogging && !offlineMode) rememberOfflineSets(sessionId, confirmedSets);
  }, [confirmedSets, sessionId, offlineLogging, offlineMode]);

  async function syncQueuedSets() {
    if (syncInFlight.current || saveInFlight.current || operationInFlight.current || navigator.onLine === false || offlineMode) return;
    const batch = queuedWorkoutSets(sessionId);
    if (!batch.length) return;
    syncInFlight.current = true;
    setSyncing(true);
    setSessionError(null);
    try {
      for (const { key, draft, values, exerciseName, setNumber } of batch) {
        const current = parseWorkoutDraft(readWorkoutStorage(key));
        if (current?.revision !== draft.revision || current.status !== "queued") continue;
        const result = await logSet(workoutSetForm(sessionId, exerciseName, setNumber, draft, values));
        if (result.error) {
          if (/sign in|not authenticated/i.test(result.error)) { setSessionError("Sign in to sync the sets on this device."); return; }
          const latest = parseWorkoutDraft(readWorkoutStorage(key));
          if (latest?.revision === draft.revision) {
            writeWorkoutStorage(key, JSON.stringify({ ...draft, status: "error", error: result.error, conflict: result.conflict ? { savedSet: result.savedSet ?? null } : undefined }));
          }
          setSessionError("A set needs review. Your entry is still on this device.");
          continue;
        }
        const saved = result.savedSet ?? values;
        acknowledgeSubmittedDraft(key, draft.revision, saved);
        setLoggedSets(currentSets => [...currentSets.filter(set => set.exerciseName !== exerciseName || set.setNumber !== setNumber), { exerciseName, setNumber, ...saved }]);
      }
    } catch {
      setSessionError("Sync could not be confirmed. Queued sets are still on this device.");
    } finally {
      syncInFlight.current = false;
      setSyncing(false);
    }
  }

  function selectExercise(exercise: PlanExercise, setNumber?: number) {
    if (saveInFlight.current || operationInFlight.current || syncInFlight.current) return;
    const targetSet = setNumber ?? allTargets.find((candidate) => candidate.exerciseName === exercise.exerciseName && !isSaved(candidate))?.setNumber ?? 1;
    setSelected({ exerciseName: exercise.exerciseName, setNumber: targetSet });
    setAdvanceFocus(false);
    editorRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }

  function onSaved(_key: string, values: SavedEntry, advance = true, queuedLocally = false) {
    if (!target || !currentExercise) return;
    const nextSets = [...loggedSets.filter((set) => !(set.exerciseName === target.exerciseName && set.setNumber === target.setNumber)), { ...target, ...values }];
    if (!queuedLocally) setLoggedSets((current) => [...current.filter((set) => !(set.exerciseName === target.exerciseName && set.setNumber === target.setNumber)), { ...target, ...values }]);
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
    if (operationInFlight.current || saveInFlight.current || syncInFlight.current || offlineMode || !online) return;
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
      writeWorkoutStorage(`${restStorageKey(sessionId)}:alerted`, null);
      forgetOfflineWorkout(sessionId);
      toast.success("Session complete");
      router.push(offlineLogging ? `/workout/history/${sessionId}#check-in` : "/workout/history");
      router.refresh();
    } catch (cause) {
      setSessionError(cause instanceof Error ? cause.message : "Could not finish the session. Your saved sets are safe; try again.");
    } finally { operationInFlight.current = false; setPending(null); }
  }

  async function handleDiscard() {
    if (operationInFlight.current || saveInFlight.current || syncInFlight.current || offlineMode || !online || !window.confirm("Discard this incomplete session, its saved sets, and drafts?")) return;
    operationInFlight.current = true;
    setPending("discard");
    try {
      const result = await discardWorkoutSession(sessionId);
      if (result.error) throw new Error(result.error);
      draftKeys.forEach((key) => writeWorkoutStorage(key, null));
      writeWorkoutStorage(restStorageKey(sessionId), null);
      writeWorkoutStorage(`${restStorageKey(sessionId)}:alerted`, null);
      forgetOfflineWorkout(sessionId);
      router.refresh();
    } catch (cause) {
      setSessionError(cause instanceof Error ? cause.message : "Could not discard the session. Try again.");
    } finally { operationInFlight.current = false; setPending(null); }
  }

  return (
    <div className="mt-5">
      {offlineMode || !online || queued.length ? <Notice className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span role="status">{queued.length ? `${queued.length} ${queued.length === 1 ? "set" : "sets"} on this device awaiting sync.` : "Offline. Save workout sets on this device."}</span>
        {queued.length > 0 && !offlineMode ? <Button type="button" variant="secondary" disabled={!online || syncing || saving || pending !== null} onClick={() => void syncQueuedSets()}>{syncing ? "Syncing…" : "Sync sets now"}</Button> : null}
      </Notice> : null}
      {hasIntro ? <Notice className="mb-4">Working hamstring curls: {exercises.filter((exercise) => getIntroductorySets(exercise) < exercise.sets).map(formatSetPrescription).join(", ")} sets. Introductory volume stays active until you confirm tolerable recovery, normal gait and stable performance. No automatic increase.
        {!targetConfirmed ? <Button type="button" variant="secondary" className="mt-3 min-h-12" disabled={saving || pending !== null} onClick={() => {
          if (window.confirm("Have you confirmed tolerable recovery, normal gait and stable performance? Enable the optional final working hamstring curl set for this session?")) writeWorkoutStorage(volumeKey, "confirmed");
        }}>Confirm recovery & enable target set</Button> : <p>Target set enabled for this session.</p>}
      </Notice> : null}
      {/Lower [AB]/.test(sessionName) ? <Notice className="mb-4">{LOWER_BODY_WARMUP}</Notice> : null}
      {offlineMode && footPainGateActive ? <Notice className="mb-4">Foot pain 3/10 or higher was logged. Skip loaded carries and seated calf raises.</Notice> : null}
      {loggableExercises.some((exercise) => exercise.id.startsWith("retained-")) ? <Notice className="mb-4">The plan was updated. Earlier saved sets and drafts remain under their original exercise names; they have not been reassigned. Unlogged sets can be left empty when finishing.</Notice> : null}
      {isStale ? <Notice className="mb-4 flex items-start gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><span>Open session from {formatSessionDate(trainingDate)}. Continue it or discard it to start today’s training.</span></Notice> : null}
      <div className="mb-5 space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-caption text-secondary"><span><span className="font-medium text-primary tabular-nums">{confirmedCount}/{allTargets.length}</span> sets synced{queued.length ? ` · ${queued.length} queued` : ""}{unsavedKeys.length ? ` · ${unsavedKeys.length} draft${unsavedKeys.length === 1 ? "" : "s"}` : ""}</span><span className="tabular-nums">{elapsedMinutes} min</span></div>
        <Progress value={progressPercent} />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
        <section ref={editorRef} id="current-set" className="scroll-mt-24 border border-rule-strong bg-raised p-4 sm:p-6">
          {target && currentExercise ? <FocusedSetPanel>
            <div className="mb-3 flex items-center justify-between gap-3"><p className="text-caption font-medium text-accent">Exercise {currentIndex + 1} of {loggableExercises.length}</p><span className="text-caption font-medium tabular-nums text-primary">Set {target.setNumber} / {currentExercise.exerciseType === "FINISHER" ? 1 : currentExercise.sets}</span></div>
            <h2 className="text-xl leading-tight font-semibold text-primary sm:text-2xl">{currentExercise.exerciseName}</h2>
            <p className="mt-2 text-caption text-secondary">{currentExercise.reps}{currentExercise.targetRPE ? ` · RPE ${currentExercise.targetRPE}` : ""}{currentExercise.tempo ? ` · Tempo ${currentExercise.tempo}` : ""}</p>
            {roundMembers.length > 1 ? <p className="mt-2 border-l-2 border-accent pl-3 text-caption text-secondary">{roundMembers.length === 2 ? "Superset" : "Triset"} · Round {target.setNumber} · Movement {roundMembers.indexOf(currentExercise) + 1} of {roundMembers.length}</p> : null}
            <ExerciseFormGuide key={currentExercise.id} name={currentExercise.exerciseName} cues={currentExercise.cues} />
            <SetInput key={`${sessionId}:${currentExercise.id}:${target.setNumber}`} sessionId={sessionId} planExerciseId={currentExercise.id || null} exerciseName={currentExercise.exerciseName} setNumber={target.setNumber} isFinisher={currentExercise.exerciseType === "FINISHER"} timed={isTimedTrainingExercise(currentExercise)} logged={currentLogged} previous={previousSet} prefill={prefill} shouldAdvance={advanceFocus} disabled={pending !== null || syncing} offlineLogging={offlineLogging} offlineMode={offlineMode} onPendingChange={(nextSaving) => { saveInFlight.current = nextSaving; setSaving(nextSaving); }} onSaved={onSaved} className="mt-4" />
            {nextTarget && !currentLogged ? <p className="mt-3 text-caption text-secondary">After saving: <span className="font-medium text-primary">{nextTarget.exerciseName}</span> · Set {nextTarget.setNumber}</p> : null}
            <div className="mt-4"><RestTimer sessionId={sessionId} defaultSeconds={getProgrammedRestSeconds(loggableExercises, currentExercise)} /></div>
            <div className="mt-4 flex items-center gap-2 border-t border-rule pt-3">
              <Button type="button" variant="ghost" aria-label="Previous exercise" className="min-h-12 min-w-12 px-2" disabled={currentIndex <= 0 || saving || syncing || pending !== null} onClick={() => selectExercise(loggableExercises[currentIndex - 1])}><ChevronLeft className="size-4" /></Button>
              <label className="min-w-0 flex-1" htmlFor="session-exercise-jump"><span className="sr-only">Jump to exercise</span>
              <select id="session-exercise-jump" className="h-12 w-full min-w-0 rounded-control border border-control-border bg-raised px-3 text-row text-primary" value={currentExercise.exerciseName} disabled={saving || syncing || pending !== null} onChange={event => {
                const exercise = loggableExercises.find(item => item.exerciseName === event.target.value);
                if (exercise) selectExercise(exercise);
              }}>
                {loggableExercises.map((exercise, index) => <option key={exercise.id || exercise.exerciseName} value={exercise.exerciseName}>{index + 1}. {exercise.exerciseName} · {loggedSets.filter(set => set.exerciseName === exercise.exerciseName).length}/{exercise.sets} logged</option>)}
              </select>
              </label>
              <Button type="button" variant="ghost" aria-label="Next exercise" className="min-h-12 min-w-12 px-2" disabled={currentIndex >= loggableExercises.length - 1 || saving || syncing || pending !== null} onClick={() => selectExercise(loggableExercises[currentIndex + 1])}><ChevronRight className="size-4" /></Button>
            </div>
          </FocusedSetPanel> : <p className="text-body text-secondary">There are no working sets in this session.</p>}
        </section>
        <section aria-label="Session exercises">
          <h2 className="mb-2 text-body font-medium">Session exercises</h2>
          {loggableExercises.map((exercise, index) => <ExerciseCard key={exercise.id || exercise.exerciseName} exercise={exercise} index={index} loggedSets={loggedSets.filter((set) => set.exerciseName === exercise.exerciseName)} selectedSet={target?.exerciseName === exercise.exerciseName ? target.setNumber : null} draftSetNumbers={allTargets.filter(candidate => candidate.exerciseName === exercise.exerciseName && unsavedKeys.includes(workoutDraftKey(sessionId, candidate.exerciseName, candidate.setNumber))).map(candidate => candidate.setNumber)} queuedSetNumbers={queued.filter(set => set.exerciseName === exercise.exerciseName).map(set => set.setNumber)} disabled={saving || syncing || pending !== null} onSelect={(setNumber) => selectExercise(exercise, setNumber)} />)}
        </section>
      </div>
      <Section>
        {complete ? <p className="mb-4 flex items-center gap-2 text-body font-medium text-accent"><CheckCircle2 className="size-5" />{queued.length ? "All planned sets recorded on this device" : "All planned sets saved"}</p> : null}
        {sessionError ? <div role="alert"><Notice className="mb-4">{sessionError}</Notice></div> : null}
        <div className="flex flex-wrap gap-3"><Button type="button" className="min-h-12 w-full sm:w-auto" onClick={() => void handleComplete()} disabled={pending !== null || saving || syncing || draftKeys.length > 0 || offlineMode || !online}>{pending === "complete" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}Finish session</Button>
          {isStale && !offlineMode ? <Button type="button" variant="secondary" className="min-h-12" onClick={() => void handleDiscard()} disabled={pending !== null || saving || syncing || !online}>{pending === "discard" ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}Discard old session</Button> : null}
        </div>
        {queued.length || offlineMode || !online ? <p className="mt-3 text-caption text-secondary">Reconnect to sync your sets and finish this workout.</p> : draftKeys.length ? <p className="mt-3 text-caption text-secondary">Save your draft sets before finishing. They remain available when you return.</p> : null}
      </Section>
      <Section><details><summary className="flex min-h-12 cursor-pointer items-center text-body font-medium focus-visible:outline-2 focus-visible:outline-accent">Session preparation</summary>
        {exercises.some((exercise) => isBackPainGatedExercise(exercise.exerciseName)) ? <Notice tone="accent" className="my-4">{LOWER_B_BACK_PAIN_READINESS_NOTE}</Notice> : null}
        <SessionPrepStrip note="Use controlled ramp-up sets before your working sets." />
      </details></Section>
    </div>
  );
}

function FocusedSetPanel({ children }: { children: React.ReactNode }) { return <div>{children}</div>; }

function getPairedExercises(exercises: PlanExercise[], exercise: PlanExercise) {
  if (!exercise.supersetGroup) return [];
  const group = exercises.filter((candidate) => candidate.supersetGroup === exercise.supersetGroup);
  return group.length > 1 ? group : [];
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
