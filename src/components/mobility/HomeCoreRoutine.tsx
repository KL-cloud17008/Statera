"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { logHomeCore } from "@/actions/home-core";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/ledger";
import { MobilityChecklist } from "@/components/mobility/MobilityChecklist";
import {
  getHomeCoreBlock, getHomeCoreDayLabel, HOME_CORE_PROGRESSION, HOME_CORE_SCHEDULE,
  HOME_CORE_SAFETY, HOME_CORE_SOURCES, HOME_CORE_VIDEO_REFERENCES,
  type HomeCoreDose, type HomeCoreWeek,
} from "@/lib/home-core";
import { cn } from "@/lib/utils";

export function HomeCoreRoutine({ week }: { week: HomeCoreWeek }) {
  const router = useRouter();
  const [dose, setDose] = useState<HomeCoreDose>(week.todayDose ?? "intro");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const saving = useRef(false);
  const completed = week.completedToday || saved;
  const count = week.completedDates.length + (saved && !week.completedToday ? 1 : 0);
  const block = getHomeCoreBlock(dose);

  function markComplete() {
    if (saving.current || completed) return;
    saving.current = true;
    setError(null);
    startTransition(async () => {
      try {
        const data = new FormData();
        data.set("dose", dose);
        const result = await logHomeCore(data);
        if (result.error) { setError(result.error); return; }
        setSaved(true);
        router.refresh();
      } catch {
        setError("Core completion was not confirmed. Your routine is still here; retry to save it.");
      } finally { saving.current = false; }
    });
  }

  return (
    <Section id="home-core" title="Home core" tone="movement" className="scroll-mt-24" action={<span className="text-caption text-tertiary">{completed ? "Logged today" : getHomeCoreDayLabel(week.dayOfWeek)}</span>}>
      <div className="grid gap-x-8 gap-y-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <p className="text-body font-medium text-primary">{HOME_CORE_SCHEDULE} · 2 sessions a week</p>
          <p className="mt-1 max-w-2xl text-row text-secondary">Start with one set of each movement, then build to two after two comfortable sessions. Keep a day between full sessions if your schedule changes.</p>
          <p className="mt-2 text-caption text-tertiary">{count} {count === 1 ? "session" : "sessions"} logged this calendar week · {block.duration} · No equipment</p>
        </div>
        <Button type="button" variant={completed ? "secondary" : "primary"} onClick={markComplete} disabled={pending || completed} className="w-full md:w-auto md:self-start">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CheckCircle2 className="size-4" aria-hidden />}
          {completed ? "Core logged today" : pending ? "Saving core..." : "Mark core complete"}
        </Button>
      </div>
      {error ? <p role="alert" className="mt-3 text-row text-ember">{error}</p> : null}
      {completed ? <p role="status" className="mt-2 text-caption text-accent">Today’s home core completion is saved.</p> : null}

      <div className="mt-4 grid gap-x-8 gap-y-3 border-y border-rule py-3 md:grid-cols-2">
        <div><p className="text-label text-tertiary">Best time</p><p className="mt-1 text-row text-secondary">After the gym or later at home, while you can still move with control.</p></div>
        <div><p className="text-label text-tertiary">Before the gym</p><p className="mt-1 text-row text-secondary">Use one easy set at effort 3–4/10. Finish fresh enough to brace during your lifts.</p></div>
      </div>

      <div role="group" aria-label="Core routine volume" className="mt-4 flex flex-wrap gap-2">
        {([{ value: "intro", label: "Start: 1 set" }, { value: "full", label: "Build: 2 sets" }] as const).map((option) => (
          <button key={option.value} type="button" aria-pressed={dose === option.value} disabled={pending} onClick={() => setDose(option.value)}
            className={cn("min-h-11 rounded-control border px-3 py-2 text-row font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent", dose === option.value ? "border-ink bg-ink text-on-ink" : "border-control-border bg-raised text-secondary hover:text-primary")}>{option.label}</button>
        ))}
      </div>
      <p className="mt-2 text-caption text-tertiary">Rest 45–60 seconds between sets and exercises; take 20–30 seconds when changing sides. Keep a few clean reps or seconds in reserve.</p>
      <div className="mt-5"><MobilityChecklist key={dose} blocks={[block]} title="Beginner core routine" /></div>

      <details className="mt-5 border-y border-rule py-2">
        <summary className="flex min-h-11 cursor-pointer items-center text-row font-medium text-primary focus-visible:outline-2 focus-visible:outline-accent">Progression & comfort</summary>
        <ul className="my-3 space-y-2 text-row text-secondary">{HOME_CORE_PROGRESSION.map((item) => <li key={item}>{item}</li>)}</ul>
        <p className="pb-3 text-caption text-tertiary">{HOME_CORE_SAFETY} If floor transfers are uncomfortable, use the seated brace and wall options; reduce the dose to what you can control.</p>
      </details>
      <details className="mt-2 border-b border-rule py-2">
        <summary className="flex min-h-11 cursor-pointer items-center text-row font-medium text-primary focus-visible:outline-2 focus-visible:outline-accent">Video references & exercise guidance</summary>
        <p className="mt-2 text-caption text-tertiary">Use the doses, rest and easier variations above when watching your saved videos.</p>
        <ul className="mt-2 space-y-1">{HOME_CORE_VIDEO_REFERENCES.map((video) => <li key={video.href}><a className="inline-flex min-h-11 items-center text-row text-primary underline underline-offset-4" href={video.href} target="_blank" rel="noreferrer">{video.author} — {video.title}</a></li>)}</ul>
        <ul className="mt-3 space-y-1 border-t border-rule py-2">{HOME_CORE_SOURCES.map((source) => <li key={source.href}><a className="inline-flex min-h-11 items-center text-caption text-secondary underline underline-offset-4" href={source.href} target="_blank" rel="noreferrer">{source.title}</a></li>)}</ul>
      </details>
    </Section>
  );
}
