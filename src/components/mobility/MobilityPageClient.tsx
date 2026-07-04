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
  getRequiredLaterRecoveryBlocks,
  getRequiredLaterRecoveryTitle,
  getMobilityProgram,
  getRecoverySessionBlocks,
  UNDO_SITTING,
  type RecoveryMode,
} from "@/lib/mobility";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

export function MobilityPageClient({
  dayOfWeek,
  completedTypes,
  highStepLoad,
  recentStepTotal,
  painCheckIn = null,
  todayFootPain = null,
  timezone,
}: {
  dayOfWeek: number;
  completedTypes: string[];
  highStepLoad?: boolean;
  recentStepTotal?: number;
  painCheckIn?: SerializedPainCheckIn | null;
  todayFootPain?: number | null;
  timezone?: string;
}) {
  const router = useRouter();
  const [pendingType, setPendingType] = useState<string | null>(null);
  // Logged sole pain >= 5/10 activates foot-flare recovery alongside the
  // existing step-load threshold (foot-load rules).
  const highFootPain = todayFootPain != null && todayFootPain >= 5;
  const [recoveryMode, setRecoveryMode] = useState<RecoveryMode>(
    highStepLoad || highFootPain ? "footFlare" : "standard"
  );
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
  const highStepLoadNote = highFootPain
    ? `Sole pain ${todayFootPain}/10 logged today. Required foot-flare recovery is active; keep it easy and foot-focused.`
    : highStepLoad
      ? `High step load detected${
          recentStepTotal ? ` (${recentStepTotal.toLocaleString()} steps across the last 3 days)` : ""
        }. Required foot-flare recovery is active; keep it easy and foot-focused.`
      : todayFootPain != null && todayFootPain >= 3
        ? `Foot pain ${todayFootPain}/10 logged today. Reduce step load, split walking into smaller chunks, no gym walking.`
        : undefined;

  const sessionCompleted = completedTypes.includes(program.logType);
  const undoCount = completedTypes.filter((type) => type === "UNDO_SITTING").length;

  function handleLogCompletion(type: string, version = program.sessionTitle) {
    setPendingType(type);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("type", type);
      formData.set("version", version);
      const result = await logMobility(formData);
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
            : "Undo-sitting logged"
      );
      setPendingType(null);
      router.refresh();
    });
  }

  return (
    <div className="page-shell">
      <SectionHeader
        className="page-hero-muted"
        eyebrow="Mobility protocol"
        title={`${program.dayName} — ${program.trainingRole}`}
        description={program.todayPurpose}
      >
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <span>Session: {sessionCompleted ? "logged" : "open"}</span>
          <span>Duration: {program.totalDuration}</span>
          <span>Desk resets: {undoCount}</span>
        </div>
      </SectionHeader>

      <section className="document-panel">
        <div className="grid gap-4 border-b border-border pb-7 md:grid-cols-3">
          {program.focus.map((item) => (
            <FocusCell key={item.label} label={item.label} value={item.value} note={item.note} />
          ))}
        </div>

        <PainCheckInCard latest={painCheckIn} timezone={timezone} />

        <RoutineSection
          title={program.sessionTitle}
          summary={
            program.logType === "POST_WORKOUT" && recoveryMode === "footFlare"
              ? "Required foot-flare recovery puts seated ankle motion, calf mobility, supported balance, quiet foot pressure, and supported breathing first."
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
                ? `${program.sessionTitle} - required foot-flare recovery`
                : program.sessionTitle
            )
          }
          headerAside={
            program.logType === "POST_WORKOUT" ? (
              <RecoveryModeControl value={recoveryMode} onChange={setRecoveryMode} />
            ) : undefined
          }
          meta={program.completionSummary}
          contextNote={program.logType === "POST_WORKOUT" ? highStepLoadNote : undefined}
          hideAction={sessionBlocks.length === 0}
        >
          {sessionBlocks.length > 0 ? (
            <MobilityChecklist blocks={sessionBlocks} title="Today's mobility session" />
          ) : (
            <div className="micro-panel rounded-[var(--radius-card)] p-5">
              <p className="eyebrow">Complete rest</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                No mobility block is scheduled today.
              </p>
            </div>
          )}
        </RoutineSection>

        {showLaterRecovery ? (
          <RoutineSection
            title={laterRecoveryTitle}
            summary={
              recoveryMode === "footFlare"
                ? "Complete later today. Keep it easy. This is tissue-tolerance work, not another workout."
                : "This does not have to be done immediately after training. Complete it later the same day after walking home, food, shower, or before bed. It is part of the training system, not extra work."
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
                : "Required means consistently completed, not intense. Effort 1-3/10, pain 0-2/10 maximum, no fatigue."
            }
            contextNote={highStepLoadNote}
          >
            <MobilityChecklist blocks={laterRecoveryBlocks} title="Required later recovery" />
          </RoutineSection>
        ) : null}

        <RoutineSection
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
      </section>
    </div>
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
    <div className="micro-panel rounded-[var(--radius-card)] p-4">
      <p className="eyebrow text-[10px]">{label}</p>
      <p className="mt-2 text-2xl font-medium text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note}</p>
    </div>
  );
}

function RoutineSection({
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
    <section className="prime-panel p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-3">
          <p className="eyebrow">{completed ? "Completed today" : "Ready protocol"}</p>
          <h2 className="text-3xl">{title}</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{summary}</p>
          {meta ? <p className="text-sm text-muted-foreground">{meta}</p> : null}
          {contextNote ? (
            <p className="status-note status-note-attention inline-flex max-w-3xl px-3 py-2 text-xs font-semibold leading-relaxed">
              {contextNote}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {headerAside}
          {hideAction ? null : completed ? (
            <span className="completed-row inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Logged
            </span>
          ) : (
            <Button type="button" onClick={onLog} disabled={isPending} className="gap-2">
              {isPending && isCurrentAction ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {actionLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-7">{children}</div>
    </section>
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
      label: "Foot flare recovery",
      note: "Required when soles are irritated or step load is high",
    },
  ];

  return (
    <div className="micro-panel w-full min-w-0 rounded-[var(--radius-card)] p-3 sm:w-auto sm:min-w-[21rem]">
      <p className="eyebrow text-[10px]">Recovery mode</p>
      <div
        className="mt-2 grid grid-cols-2 gap-1 rounded-full border border-border/80 bg-white/60 p-1"
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
                "min-h-9 rounded-full px-3 py-2 text-xs font-semibold leading-tight transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--electric-blue)_48%,transparent),0_0_0_5px_var(--ring)] motion-reduce:transition-none",
                isActive
                  ? "bg-primary text-primary-foreground shadow-[rgba(238,246,255,0.12)_0_1px_0_inset]"
                  : "text-muted-foreground hover:bg-[color-mix(in_srgb,var(--cream-paper)_72%,transparent)] hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {options.find((option) => option.value === value)?.note}
      </p>
    </div>
  );
}
