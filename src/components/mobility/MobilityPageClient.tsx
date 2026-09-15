"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logMobility } from "@/actions/mobility";
import type { SerializedPainCheckIn } from "@/actions/pain";
import { PainCheckInCard } from "@/components/pain/PainCheckInCard";
import { MobilityChecklist } from "./MobilityChecklist";
import {
  BACK_CARE_DECOMPRESSION,
  getRequiredLaterRecoveryBlocks,
  getRequiredLaterRecoveryTitle,
  getMobilityProgram,
  getRecoverySessionBlocks,
  RIGHT_SOLE_PACE_RULE,
  RIGHT_SOLE_STOP_RULE,
  UNDO_SITTING,
  type RecoveryMode,
} from "@/lib/mobility";
import { Button } from "@/components/ui/button";
import { Figure, Notice, PageTitle, Section } from "@/components/ui/ledger";
import { getPainGuidance, initialRecoveryMode } from "@/lib/movement-guidance";
import { cn } from "@/lib/utils";

export function MobilityPageClient({
  dayOfWeek,
  dayLabel,
  sessionName = null,
  isResumedSession = false,
  completedTypes,
  painCheckIn = null,
  todayFootPain = null,
  timezone,
}: {
  /**
   * The mobility program index, already resolved from the active or next
   * session by the server. It is deliberately NOT the calendar weekday.
   */
  dayOfWeek: number;
  /** Today's actual weekday, for display only. */
  dayLabel?: string;
  /** The session this protocol belongs to, when one is active or programmed. */
  sessionName?: string | null;
  isResumedSession?: boolean;
  completedTypes: string[];
  painCheckIn?: SerializedPainCheckIn | null;
  todayFootPain?: number | null;
  timezone?: string;
}) {
  const router = useRouter();
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [recoveryMode, setRecoveryMode] = useState<RecoveryMode>(initialRecoveryMode(todayFootPain));
  const [isPending, startTransition] = useTransition();

  const program = getMobilityProgram(dayOfWeek);
  const showLaterRecovery = program.logType === "PRE_WORKOUT";
  const laterRecoveryCompleted = completedTypes.includes("POST_WORKOUT");
  const undoBlocks = [UNDO_SITTING];
  const sessionBlocks =
    program.logType === "POST_WORKOUT"
      ? getRecoverySessionBlocks(dayOfWeek, recoveryMode)
      : program.blocks;
  const laterRecoveryBlocks = getRequiredLaterRecoveryBlocks(recoveryMode, dayOfWeek);
  const laterRecoveryTitle = getRequiredLaterRecoveryTitle(recoveryMode, dayOfWeek);
  const painGuidance = getPainGuidance(todayFootPain);
  const symptomNote = painGuidance.attention ? painGuidance.text : undefined;

  const sessionCompleted = completedTypes.includes(program.logType);
  const undoCount = completedTypes.filter((type) => type === "UNDO_SITTING").length;
  const backCareCount = completedTypes.filter((type) => type === "BACK_CARE").length;

  function handleLogCompletion(type: string, version = program.sessionTitle) {
    setPendingType(type);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("type", type);
      formData.set("version", version);
      let result;
      try { result = await logMobility(formData); } catch {
        toast.error("Could not save. Your routine is still here; try again.");
        setPendingType(null);
        return;
      }
      if (result.error) {
        toast.error(result.error);
        setPendingType(null);
        return;
      }

      toast.success(
        type === "PRE_WORKOUT"
          ? "Mobility primer logged"
          : type === "POST_WORKOUT"
            ? "Recovery mobility logged"
            : type === "BACK_CARE"
              ? "Back care logged"
              : "Undo-sitting logged"
      );
      setPendingType(null);
      router.refresh();
    });
  }

  return (
    <>
      {/* The title names the real weekday and the session the protocol serves.
          program.dayName is the weekday the program was authored for, which is
          not the same thing once training days move or a session is resumed. */}
      <PageTitle
        eyebrow={dayLabel ?? program.dayName}
        title="Mobility"
        lead="Preparation and recovery for your training day."
      />

      {symptomNote ? <Notice tone="ember" className="mt-4">{symptomNote}</Notice> : null}

      {isResumedSession && sessionName ? (
        <Notice className="mt-4">
          Showing the mobility protocol for the open session you are resuming
          ({sessionName}), not for today&apos;s calendar day.
        </Notice>
      ) : null}

      <Section className="mt-6">
        <dl className="grid grid-cols-3 gap-4">
          <Figure label="Session" value={sessionCompleted ? "Logged" : "Open"} tone={sessionCompleted ? "accent" : "primary"} />
          <Figure label="Duration" value={program.totalDuration} />
          <Figure label="Desk resets" value={undoCount} />
        </dl>
      </Section>

      <details className="my-4 border-y border-rule" id="pain-check-in">
        <summary className="flex min-h-14 cursor-pointer items-center text-body font-medium focus-visible:outline-2 focus-visible:outline-accent">Pain check-in & movement guidance</summary>
        <p className="pt-3 text-row text-secondary">{program.todayPurpose}</p>
        <p className="py-3 text-row text-secondary">{RIGHT_SOLE_PACE_RULE}</p>
      <Section title="Today's focus">
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-3">
          {program.focus.map((item) => (
            <FocusCell key={item.label} label={item.label} value={item.value} note={item.note} />
          ))}
        </div>
      </Section>

      <Section>
        <PainCheckInCard latest={painCheckIn} timezone={timezone} />
        <p className="mt-4 border-t border-rule pt-3 text-caption text-tertiary">{RIGHT_SOLE_STOP_RULE}</p>
      </Section>

      </details>

      <RoutineSection
        id="session"
        title={program.sessionTitle}
        summary={
          program.logType === "POST_WORKOUT" && recoveryMode === "footFlare"
            ? "Foot comfort routine puts seated ankle motion, calf mobility, supported balance, quiet foot pressure, and supported breathing first."
            : program.adaptationNote
        }
        completed={sessionCompleted}
        isPending={isPending}
        isCurrentAction={pendingType === program.logType}
        actionLabel={program.logType === "PRE_WORKOUT" ? "Mark primer complete" : "Mark recovery complete"}
        onLog={() =>
          handleLogCompletion(
            program.logType,
            program.logType === "POST_WORKOUT" && recoveryMode === "footFlare"
              ? `${program.sessionTitle} - foot comfort routine`
              : program.sessionTitle
          )
        }
        headerAside={
          program.logType === "POST_WORKOUT" ? (
            <RecoveryModeControl value={recoveryMode} onChange={setRecoveryMode} />
          ) : undefined
        }
        meta={program.completionSummary}
        contextNote={program.logType === "POST_WORKOUT" ? symptomNote : undefined}
        hideAction={sessionBlocks.length === 0}
      >
        {sessionBlocks.length > 0 ? (
          <MobilityChecklist blocks={sessionBlocks} title="Today's mobility session" />
        ) : (
          <div>
            <h3>Complete rest</h3>
            <p className="mt-1 text-row text-secondary">
              No mobility block is scheduled today.
            </p>
          </div>
        )}
      </RoutineSection>

        {showLaterRecovery ? (
      <RoutineSection
        id="later-recovery"
        title={laterRecoveryTitle}
        summary={
          recoveryMode === "footFlare"
            ? "Complete later today. Keep it easy. This is tissue-tolerance work, not another workout."
            : "Complete later in the day, at a comfortable pace."
        }
        completed={laterRecoveryCompleted}
        isPending={isPending}
        isCurrentAction={pendingType === "POST_WORKOUT"}
        actionLabel="Mark recovery complete"
        onLog={() => handleLogCompletion("POST_WORKOUT", laterRecoveryTitle)}
        headerAside={<RecoveryModeControl value={recoveryMode} onChange={setRecoveryMode} />}
        meta={
          recoveryMode === "footFlare"
            ? "Effort 1-3/10. Pain 0-2/10 maximum. No aggressive stretching, no digging hard into the sole, and no extra fatigue."
            : "Keep effort at 1-3/10 and pain at 0-2/10. Finish without fatigue."
        }
        contextNote={symptomNote}
      >
        <MobilityChecklist blocks={laterRecoveryBlocks} title="Later recovery" />
      </RoutineSection>
        ) : null}

      <RoutineSection
        id="back-care"
        title="Back care — decompression routine"
        summary="Personal relief routine — available every day, including full rest days. Relief work, not training: gentle effort only, and stop any movement that increases pain or moves symptoms down the leg."
        completed={false}
        isPending={isPending}
        isCurrentAction={pendingType === "BACK_CARE"}
        actionLabel="Log back care"
        onLog={() => handleLogCompletion("BACK_CARE", "Back care — decompression routine")}
        meta={backCareCount > 0 ? `${backCareCount} logged today` : "As needed — no schedule, no required dose."}
      >
        <MobilityChecklist blocks={[BACK_CARE_DECOMPRESSION]} title="Back care — decompression routine" />
      </RoutineSection>

      <RoutineSection
        id="desk-reset"
        title="Optional desk reset"
        summary="Use this short reset when long sitting blocks stack up during the day."
        completed={false}
        isPending={isPending}
        isCurrentAction={pendingType === "UNDO_SITTING"}
        actionLabel="Log desk reset"
        onLog={() => handleLogCompletion("UNDO_SITTING")}
        meta={undoCount > 0 ? `${undoCount} logged today` : "Aim for two or three short resets."}
      >
        <MobilityChecklist blocks={undoBlocks} title="Desk reset" />
      </RoutineSection>
    </>
  );
}

function FocusCell({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="border-t border-rule pt-3">
      <p className="text-label text-tertiary">{label}</p>
      <p className="mt-1 text-row font-medium text-primary">{value}</p>
      <p className="mt-1 text-caption text-tertiary">{note}</p>
    </div>
  );
}

function RoutineSection({
  id,
  title,
  summary,
  completed,
  isPending,
  isCurrentAction,
  actionLabel,
  onLog,
  children,
  headerAside,
  meta,
  contextNote,
  hideAction = false,
}: {
  id?: string;
  title: string;
  summary: string;
  completed: boolean;
  isPending: boolean;
  isCurrentAction: boolean;
  actionLabel: string;
  onLog: () => void;
  children: ReactNode;
  headerAside?: ReactNode;
  meta?: ReactNode;
  contextNote?: string;
  hideAction?: boolean;
}) {
  return (
    <Section id={id} title={title} action={<span className="text-caption text-tertiary">{completed ? "Logged" : "Ready"}</span>}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <p className="mt-2 max-w-2xl text-row text-secondary">{summary}</p>
          {meta ? <p className="mt-1 max-w-2xl text-caption text-tertiary">{meta}</p> : null}
          {/* Guidance comes from reported symptoms, never from step totals. */}
          {contextNote ? <Notice className="mt-3 max-w-2xl">{contextNote}</Notice> : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {headerAside}
          {hideAction ? null : completed ? (
            <span className="inline-flex items-center gap-2 rounded-control border border-accent-line bg-accent-subtle px-3 py-2 text-row font-medium text-accent">
              <CheckCircle2 className="size-4" />
              Logged
            </span>
          ) : (
            <Button type="button" variant="primary" onClick={onLog} disabled={isPending}>
              {isPending && isCurrentAction ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              {actionLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </Section>
  );
}

function RecoveryModeControl({
  value,
  onChange,
}: {
  value: RecoveryMode;
  onChange: (mode: RecoveryMode) => void;
}) {
  const options: Array<{ value: RecoveryMode; label: string; note: string }> = [
    {
      value: "standard",
      label: "Standard",
      note: "General easy mobility",
    },
    {
      value: "footFlare",
      label: "Foot comfort",
      note: "Optional gentle motion when comfortable",
    },
  ];

  return (
    <div className="w-full min-w-0 sm:w-auto sm:min-w-[19rem]">
      <p className="text-label text-tertiary">Recovery mode</p>
      <div
        className="mt-1.5 grid grid-cols-2 gap-0.5 rounded-pill border border-rule bg-sunken p-0.5"
        aria-label="Recovery mode"
      >
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                "min-h-9 rounded-pill px-3 py-2 text-caption font-medium leading-tight",
                "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                /* Was bg-primary/text-primary-foreground; primary-foreground
                   has no theme mapping, so the active label inherited body
                   colour — near-black on near-black. */
                isActive ? "bg-ink text-on-ink" : "text-secondary hover:text-primary"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-caption text-tertiary">
        {options.find((option) => option.value === value)?.note}
      </p>
    </div>
  );
}
