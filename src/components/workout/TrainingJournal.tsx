"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { deleteSupplement, saveRecoveryCheckIn, saveSupplement, saveWorkoutCheckIn } from "@/actions/training-journal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "@/components/ui/ledger";
import { JOURNAL_NOTES_LIMIT, SUPPLEMENT_AMOUNT_LIMIT, SUPPLEMENT_NAME_LIMIT, type JournalEntry, type JournalResult, type RecoveryEntry, type SupplementEntry, type WorkoutCheckInValues } from "@/lib/training-journal";

const selectClass = "h-12 w-full rounded-control border border-control-border bg-raised px-3 text-body text-primary";

function Rating({ name, label, min = 1, max, value }: { name: string; label: string; min?: number; max: number; value?: number }) {
  return <label className="grid gap-2 text-caption text-secondary">
    {label}
    <select name={name} required defaultValue={value ?? ""} className={selectClass}>
      <option value="" disabled>Choose</option>
      {Array.from({ length: max - min + 1 }, (_, index) => index + min).map(rating => <option key={rating} value={rating}>{rating}</option>)}
    </select>
  </label>;
}

function Notes({ value }: { value?: string | null }) {
  return <label className="grid gap-2 text-caption text-secondary">Notes <Textarea name="notes" rows={2} maxLength={JOURNAL_NOTES_LIMIT} defaultValue={value ?? ""} placeholder="Optional" /></label>;
}

function JournalForm({ revision, fields, save, remove, label, children, onSaved, createEntry = false }: {
  revision?: string; fields: Record<string, string>; save: (form: FormData) => Promise<JournalResult & { entry?: SupplementEntry }>;
  remove?: (form: FormData) => Promise<JournalResult>; label: string; children: ReactNode;
  onSaved?: (entry: SupplementEntry | null) => void; createEntry?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean }>();
  const busy = useRef(false);
  const newId = useRef<string | null>(null);
  const [savedRevision, setSavedRevision] = useState(revision);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    const removing = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "remove";
    if (removing && !window.confirm("Remove this supplement entry?")) return;
    const data = new FormData(form);
    for (const [key, value] of Object.entries(fields)) data.set(key, value);
    if (savedRevision) data.set("revision", savedRevision);
    if (createEntry) data.set("id", newId.current ??= crypto.randomUUID());
    busy.current = true;
    setPending(true);
    setMessage(undefined);
    try {
      const result = await (removing && remove ? remove : save)(data) as JournalResult & { entry?: SupplementEntry };
      if (result.error) { setMessage({ text: result.error, error: true }); return; }
      if (newId.current) {
        newId.current = null;
        form.reset();
      }
      if (result.revision) setSavedRevision(result.revision);
      setMessage({ text: removing ? "Entry removed" : "Saved" });
      if (removing) onSaved?.(null);
      else if (result.entry) onSaved?.(result.entry);
    } catch {
      setMessage({ text: "The save could not be confirmed. Try again when connected.", error: true });
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return <form onSubmit={submit} aria-label={label} aria-busy={pending}>
    <fieldset disabled={pending} className="grid gap-4">
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" className="min-h-12">{pending ? "Saving…" : label}</Button>
        {remove ? <Button type="submit" value="remove" formNoValidate variant="ghost" className="min-h-12">Remove entry</Button> : null}
        {message ? <p role={message.error ? "alert" : "status"} className={message.error ? "text-caption text-ember" : "text-caption text-accent"}>{message.text}</p> : null}
      </div>
    </fieldset>
  </form>;
}

export function WorkoutCheckIn({ sessionId, entry }: { sessionId: string; entry: JournalEntry<WorkoutCheckInValues> | null }) {
  return <Section title="Workout check-in" id="check-in" className="mt-6 scroll-mt-24">
    <JournalForm key={entry?.revision} revision={entry?.revision} fields={{ sessionId }} save={saveWorkoutCheckIn} label="Save workout check-in">
      <div className="max-w-60"><Rating name="effort" label="Overall effort · 1 easy, 10 maximal" max={10} value={entry?.effort} /></div>
      <Notes value={entry?.notes} />
    </JournalForm>
  </Section>;
}

function SupplementFields({ entry }: { entry?: SupplementEntry }) {
  return <>
    <label className="grid gap-2 text-caption text-secondary">Supplement name <Input name="name" required maxLength={SUPPLEMENT_NAME_LIMIT} defaultValue={entry?.name ?? ""} className="min-h-12" /></label>
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <label className="grid gap-2 text-caption text-secondary">Amount taken <Input name="amount" maxLength={SUPPLEMENT_AMOUNT_LIMIT} defaultValue={entry?.amount ?? ""} placeholder="Optional" className="min-h-12" /></label>
      <label className="grid gap-2 text-caption text-secondary">Time taken <Input name="time" type="time" defaultValue={entry?.time ?? ""} className="min-h-12" /></label>
    </div>
    <Notes value={entry?.notes} />
  </>;
}

export function TrainingJournal({ date, recovery, supplements }: { date: string; recovery: RecoveryEntry | null; supplements: SupplementEntry[] }) {
  const [entries, setEntries] = useState(supplements);

  function updateSupplement(entry: SupplementEntry | null, id = entry?.id) {
    setEntries(current => {
      const updated = current.filter(item => item.id !== id);
      if (entry) updated.push(entry);
      return updated.sort((a, b) => (a.time ?? "24:00").localeCompare(b.time ?? "24:00") || a.revision.localeCompare(b.revision));
    });
  }

  return <div className="grid items-start gap-x-8 lg:grid-cols-2">
    <Section title="Recovery check-in" id="recovery" className="mt-6 scroll-mt-24">
      <JournalForm key={recovery?.revision ?? date} revision={recovery?.revision} fields={{ date }} save={saveRecoveryCheckIn} label="Save recovery check-in">
        <div className="grid grid-cols-2 gap-4">
          <Rating name="energy" label="Energy · 1 low, 5 high" max={5} value={recovery?.energy} />
          <Rating name="soreness" label="Soreness · 0 none, 10 high" min={0} max={10} value={recovery?.soreness} />
        </div>
        <label className="grid gap-2 text-caption text-secondary">Sleep · hours <Input name="sleepHours" type="number" min={0} max={24} step="any" inputMode="decimal" defaultValue={recovery?.sleepHours ?? ""} placeholder="Optional" className="min-h-12" /></label>
        <Notes value={recovery?.notes} />
      </JournalForm>
    </Section>
    <Section title="Supplements" id="supplements" className="mt-6 scroll-mt-24">
      <JournalForm key={date} fields={{ date }} save={saveSupplement} label="Log supplement" createEntry onSaved={updateSupplement}><SupplementFields /></JournalForm>
      {entries.length ? <ul aria-label="Logged supplements" className="mt-5 divide-y divide-rule border-y border-rule">
        {entries.map(entry => <li key={entry.id} className="py-2">
          <details>
            <summary className="min-h-12 cursor-pointer py-3 text-row"><span className="font-medium">{entry.name}</span>{entry.amount || entry.time ? <span className="ml-2 text-caption text-secondary">{[entry.amount, entry.time].filter(Boolean).join(" · ")}</span> : null}</summary>
            <div className="pb-4 pt-2"><JournalForm key={entry.revision} revision={entry.revision} fields={{ date, id: entry.id }} save={saveSupplement} remove={deleteSupplement} label="Update supplement" onSaved={saved => updateSupplement(saved, entry.id)}><SupplementFields entry={entry} /></JournalForm></div>
          </details>
        </li>)}
      </ul> : <p className="mt-5 text-caption text-secondary">No supplements logged for this date.</p>}
    </Section>
  </div>;
}
