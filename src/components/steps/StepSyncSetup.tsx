"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createStepPairingCode, disconnectStepSync, getStepSyncStatus } from "@/actions/step-sync";
import { Button } from "@/components/ui/button";
import { Row, Rows, Section } from "@/components/ui/ledger";

type Status = Awaited<ReturnType<typeof getStepSyncStatus>>;
export function StepSyncSetup({ initialStatus }: { initialStatus: Status }) {
  const [status, setStatus] = useState(initialStatus);
  const [pairing, setPairing] = useState<{ code: string; expiresAt: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const guard = useRef(false);
  async function run(operation: () => Promise<void>) {
    if (guard.current) return;
    guard.current = true; setBusy(true); setError("");
    try { await operation(); } catch { setError("Could not confirm the change. Check your connection and retry."); }
    finally { guard.current = false; setBusy(false); }
  }
  async function refresh() {
    const latest = await getStepSyncStatus();
    if (!latest) throw new Error("Not signed in");
    if (latest.pairedAt !== status?.pairedAt) setPairing(null);
    setStatus(latest);
  }
  return <>
    <Section title="Samsung Health → Athanor">
      <p className="max-w-2xl text-secondary">Your phone reads Samsung Health steps through Health Connect and sends daily totals to Athanor. Pair it once, then leave automatic uploads on.</p>
      <ol className="mt-6 grid gap-6 md:grid-cols-3">
        <li><p className="mb-2 text-label text-tertiary">01 · Install</p><h3 className="font-medium">Athanor Steps for Android</h3>
          <p className="mt-2 text-caption text-secondary">Download on your phone and allow your browser to install this app when Android asks.</p>
          <Button asChild className="mt-3" variant="primary"><a href="/downloads/athanor-steps.apk" download>Download Android app</a></Button></li>
        <li><p className="mb-2 text-label text-tertiary">02 · Allow steps</p><h3 className="font-medium">Open Athanor Steps</h3>
          <p className="mt-2 text-caption text-secondary">Allow steps and background reading in Health Connect. Keep Samsung Health allowed to write steps.</p></li>
        <li><p className="mb-2 text-label text-tertiary">03 · Pair</p><h3 className="font-medium">Enter a one-time code</h3>
          <p className="mt-2 text-caption text-secondary">Create a code below and enter it in the Android app. Your Athanor password stays on the website.</p></li>
      </ol>
    </Section>
    <Section title="Connection" action={<Button variant="secondary" size="sm" disabled={busy} onClick={() => run(refresh)}>Refresh status</Button>}>
      <Rows columns="minmax(0,1fr) minmax(0,1fr)">
        <Row columns="minmax(0,1fr) minmax(0,1fr)"><span className="text-secondary">Phone</span><span className="text-right">{status?.paired ? status.deviceLabel || "Android phone paired" : "Not paired"}</span></Row>
        <Row columns="minmax(0,1fr) minmax(0,1fr)"><span className="text-secondary">Last upload</span><span className="text-right">{status?.paired && status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleString(undefined, { timeZone: status.timezone }) : "No upload yet"}</span></Row>
        <Row columns="minmax(0,1fr) minmax(0,1fr)"><span className="text-secondary">Daily totals use</span><span className="break-words text-right">{status?.timezone || "Your account time zone"}</span></Row>
      </Rows>
      <p className="mt-3 text-caption text-secondary">Match your phone’s time zone in <Link className="underline underline-offset-4" href="/settings">Settings</Link> before pairing. The Android app will ask you to confirm if they differ.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="primary" disabled={busy} onClick={() => run(async () => {
          const result = await createStepPairingCode();
          if (result.error || !result.code || !result.expiresAt) { setError(result.error || "Could not create a code."); return; }
          setPairing({ code: result.code, expiresAt: result.expiresAt });
        })}>{busy ? "Working…" : status?.paired ? "Pair another phone" : "Create pairing code"}</Button>
        {status?.paired || pairing ? <Button variant="secondary" disabled={busy} onClick={() => run(async () => {
          const result = await disconnectStepSync(); if (result.error) { setError(result.error); return; }
          setPairing(null); await refresh();
        })}>Disconnect phone</Button> : null}
      </div>
      {pairing ? <div className="mt-5 border-l-2 border-accent py-2 pl-4" role="status">
        <p className="text-caption text-secondary">Enter in Athanor Steps</p>
        <output aria-label="Pairing code" className="mt-2 block font-mono text-2xl tracking-wider sm:text-3xl">{pairing.code}</output>
        <p className="mt-2 text-caption text-secondary">One use · expires {new Date(pairing.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. {status?.paired ? "Your current phone stays connected until the new code is used." : "Refresh status after pairing."}</p>
      </div> : null}
      {error ? <p role="alert" className="mt-4 text-critical">{error}</p> : null}
    </Section>
    <Section title="What gets saved">
      <ul className="max-w-2xl list-disc space-y-2 pl-5 text-secondary">
        <li>Samsung Health daily totals from the day you pair onward. Earlier tracker history stays unchanged.</li>
        <li>Uploads replace the last phone total for a date; they never add it twice. Existing manual totals and later corrections take priority.</li>
        <li>Automatic uploads run approximately hourly when Android allows, with up to seven days of catch-up. Battery restrictions, missing permissions or no internet can delay them.</li>
        <li>Only steps are shared. Disconnect here at any time; already saved totals stay in your history.</li>
      </ul>
    </Section>
  </>;
}
