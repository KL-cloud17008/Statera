"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { SessionLogger } from "@/components/workout/SessionLogger";
import { Button } from "@/components/ui/button";
import { Notice, PageTitle } from "@/components/ui/ledger";
import { bindOfflineWorkoutAccount, forgetOfflineWorkout, parseOfflineWorkout, readOfflineWorkoutSnapshot, rememberOfflineWorkout, type ActiveWorkout } from "@/lib/offline-workout";
import { sessionDraftSnapshot, subscribeWorkoutStorage } from "@/lib/workout-entry-state";

export function OfflineWorkoutAccount({ accountId }: { accountId: string | null }) {
  useEffect(() => bindOfflineWorkoutAccount(accountId), [accountId]);
  return null;
}

function subscribeToOfflinePage(change: () => void) {
  const worker = navigator.serviceWorker;
  worker?.addEventListener("controllerchange", change);
  return () => worker?.removeEventListener("controllerchange", change);
}

async function hasOfflinePage() {
  if (!navigator.serviceWorker?.controller) return false;
  try {
    return Boolean(await caches.match("/offline-workout", { ignoreSearch: true }));
  } catch {
    return false;
  }
}

export function OfflineWorkoutControls({ accountId, session, backPainGateActive, footPainGateActive }: { accountId?: string; session: ActiveWorkout | null; backPainGateActive: boolean; footPainGateActive?: boolean }) {
  const raw = useSyncExternalStore(subscribeWorkoutStorage, readOfflineWorkoutSnapshot, () => null);
  const cached = parseOfflineWorkout(raw);
  const preparedId = cached?.session.id;
  const prepared = preparedId != null && preparedId === session?.id;
  const hasPending = preparedId != null && sessionDraftSnapshot(preparedId) !== "[]";
  const worker = useSyncExternalStore(subscribeToOfflinePage, () => navigator.serviceWorker?.controller ?? null, () => null);
  const [workerReady, setWorkerReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (accountId && session && prepared) rememberOfflineWorkout({ accountId, session, backPainGateActive, footPainGateActive });
    else if (!session && preparedId && !hasPending) forgetOfflineWorkout(preparedId);
  }, [accountId, session, backPainGateActive, footPainGateActive, prepared, preparedId, hasPending]);

  useEffect(() => {
    let active = true;
    void hasOfflinePage().then(ready => { if (active) setWorkerReady(ready); });
    return () => { active = false; };
  }, [worker, prepared]);

  if (!accountId) return null;
  if (!prepared && hasPending) return <Notice className="mt-4 flex flex-wrap items-center gap-3">
    <p className="text-caption">A previous workout still has entries on this device.</p>
    <Button asChild variant="secondary" size="sm"><a href="/offline-workout">Review offline sets</a></Button>
  </Notice>;
  if (!session) return null;

  return <div className="mt-4 flex flex-wrap items-center gap-3 text-caption text-secondary">
    {prepared ? <>
      <span role="status">{workerReady ? "Workout available offline on this device." : "Workout copy saved. Keep Training open until offline access is ready."}</span>
      <Button type="button" variant="link" size="sm" className="min-h-11" disabled={hasPending} onClick={() => forgetOfflineWorkout(session.id)}>Remove offline copy</Button>
    </> : <Button type="button" variant="secondary" size="sm" className="min-h-11" onClick={() => setError(!rememberOfflineWorkout({ accountId, session, backPainGateActive, footPainGateActive }))}>Save workout for offline use</Button>}
    {error ? <p role="alert" className="text-ember">Browser storage is unavailable for offline access.</p> : null}
  </div>;
}

export function OfflineWorkoutPageClient() {
  const raw = useSyncExternalStore(subscribeWorkoutStorage, readOfflineWorkoutSnapshot, () => null);
  const snapshot = parseOfflineWorkout(raw);

  useEffect(() => {
    const reconnect = () => window.location.replace("/workout");
    window.addEventListener("online", reconnect);
    return () => window.removeEventListener("online", reconnect);
  }, []);

  return <main className="mx-auto min-h-dvh max-w-5xl px-4 pb-20 pt-6 sm:px-8">
    <PageTitle title={snapshot?.session.sessionName ?? "Training offline"} action={<Button asChild variant="secondary"><a href="/workout">Open Training</a></Button>} />
    {snapshot ? <SessionLogger
      key={snapshot.session.id}
      sessionId={snapshot.session.id}
      sessionName={snapshot.session.sessionName}
      exercises={snapshot.session.exercises}
      existingSets={snapshot.session.sets}
      previousSets={snapshot.session.previousSets}
      startTime={snapshot.session.startTime}
      trainingDate={snapshot.session.trainingDate}
      isStale={snapshot.session.isStale}
      backPainGateActive={snapshot.backPainGateActive}
      footPainGateActive={snapshot.footPainGateActive}
      offlineLogging
      offlineMode
    /> : <Notice className="mt-6">When connected, start a workout in Training and save it for offline use on this device.</Notice>}
  </main>;
}
