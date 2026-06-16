"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logMobility } from "@/actions/mobility";
import { MobilityChecklist } from "./MobilityChecklist";
import { getMobilityProgram, UNDO_SITTING } from "@/lib/mobility";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";

export function MobilityPageClient({
  dayOfWeek,
  completedTypes,
}: {
  dayOfWeek: number;
  completedTypes: string[];
}) {
  const router = useRouter();
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const program = getMobilityProgram(dayOfWeek);
  const sessionBlocks = program.blocks;
  const undoBlocks = [UNDO_SITTING];

  const sessionCompleted = completedTypes.includes(program.logType);
  const undoCount = completedTypes.filter((type) => type === "UNDO_SITTING").length;

  function handleLogCompletion(type: string) {
    setPendingType(type);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("type", type);
      formData.set("version", program.sessionTitle);
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
        title={`${program.dayName} - ${program.trainingRole}`}
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

        <RoutineSection
          title={program.sessionTitle}
          summary={program.adaptationNote}
          completed={sessionCompleted}
          isPending={isPending}
          isCurrentAction={pendingType === program.logType}
          actionLabel={program.logType === "PRE_WORKOUT" ? "Mark primer complete" : "Mark recovery complete"}
          onLog={() => handleLogCompletion(program.logType)}
          meta={program.completionSummary}
        >
          <MobilityChecklist blocks={sessionBlocks} title="Today's mobility session" />
        </RoutineSection>

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
    <div className="warm-row rounded-[var(--radius-card)] p-4">
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
  meta?: string;
}) {
  return (
    <section className="border-t border-border pt-9 first:border-t-0 first:pt-0">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-3">
          <p className="eyebrow">{completed ? "Completed today" : "Ready protocol"}</p>
          <h2 className="text-3xl">{title}</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{summary}</p>
          {meta ? <p className="text-sm text-muted-foreground">{meta}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {headerAside}
          {completed ? (
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
