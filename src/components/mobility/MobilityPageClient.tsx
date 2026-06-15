"use client";

import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logMobility } from "@/actions/mobility";
import { MobilityChecklist } from "./MobilityChecklist";
import { getPostWorkoutChecklist, getPreWorkoutChecklist, UNDO_SITTING } from "@/lib/mobility";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

const DAY_NAMES: Record<number, string> = {
  1: "Monday - Upper A",
  2: "Tuesday - Lower A",
  4: "Thursday - Upper B",
  5: "Friday - Lower B",
};

export function MobilityPageClient({
  dayOfWeek,
  isTrainingDay,
  completedTypes,
}: {
  dayOfWeek: number;
  isTrainingDay: boolean;
  completedTypes: string[];
}) {
  const router = useRouter();
  const [version, setVersion] = useState<"A" | "B">("A");
  const [pendingType, setPendingType] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const preBlocks = isTrainingDay ? getPreWorkoutChecklist(dayOfWeek, version) : [];
  const postBlocks = getPostWorkoutChecklist(dayOfWeek);
  const undoBlocks = [UNDO_SITTING];

  const preCompleted = completedTypes.includes("PRE_WORKOUT");
  const postCompleted = completedTypes.includes("POST_WORKOUT");
  const undoCount = completedTypes.filter((type) => type === "UNDO_SITTING").length;

  function handleLogCompletion(type: string) {
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
          ? "Pre-workout logged"
          : type === "POST_WORKOUT"
            ? "Post-workout logged"
            : "Undo-sitting logged"
      );
      setPendingType(null);
      router.refresh();
    });
  }

  return (
    <div className="page-shell">
      <SectionHeader
        className="page-hero-sage"
        eyebrow="Mobility protocol"
        title={isTrainingDay ? DAY_NAMES[dayOfWeek] ?? "Training day preparation" : "Mobility-only recovery day"}
        description={
          isTrainingDay
            ? "Use the primer before lifting, the recovery sequence after training or later, and the desk reset when long sitting blocks stack up."
            : "Keep the day recovery-led: one longer movement sequence, optional desk resets, and no competing training dashboard."
        }
      >
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <span>Pre: {preCompleted ? "logged" : "open"}</span>
          <span>Post: {postCompleted ? "logged" : "open"}</span>
          <span>Desk resets: {undoCount}</span>
        </div>
      </SectionHeader>

      <section className="document-panel">
        <div className="grid gap-5 border-b border-border pb-7 md:grid-cols-3">
          <FocusCell label="Feet and ankles" value="Activation" note="Short-foot work, ankle pumps, calf range." />
          <FocusCell label="Hips" value="Access" note="Hip flexors, 90/90 transitions, adductors." />
          <FocusCell label="Back and trunk" value="Control" note="Thoracic rotation, cat-cow, seated bracing breaths." />
        </div>

        {isTrainingDay ? (
          <>
            <RoutineSection
              title="Pre-workout primer"
              summary="Choose the version that matches how you feel, run the sequence, and log it once you are done."
              completed={preCompleted}
              isPending={isPending}
              isCurrentAction={pendingType === "PRE_WORKOUT"}
              actionLabel="Mark pre-workout complete"
              onLog={() => handleLogCompletion("PRE_WORKOUT")}
              headerAside={
                <div className="inline-flex rounded-full border border-border bg-[color-mix(in_srgb,var(--mist)_78%,var(--bone)_22%)] p-1 shadow-[var(--shadow-soft)]">
                  {(["A", "B"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setVersion(item)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                        version === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              }
            >
              <MobilityChecklist blocks={preBlocks} title="Pre-workout sequence" />
            </RoutineSection>

            <RoutineSection
              title="Recovery mobility session"
              summary="This can be done after training or later in the day. Keep intensity easy and breathing controlled."
              completed={postCompleted}
              isPending={isPending}
              isCurrentAction={pendingType === "POST_WORKOUT"}
              actionLabel="Mark post-workout complete"
              onLog={() => handleLogCompletion("POST_WORKOUT")}
            >
              <MobilityChecklist blocks={postBlocks} title="Post-workout cooldown" />
            </RoutineSection>

            <RoutineSection
              title="Optional desk reset"
              summary="Use this as the short reset that breaks up desk-heavy blocks during the day."
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
        ) : (
          <>
            <RoutineSection
              title="Recovery mobility session"
              summary="Run the longer sequence at an easy pace and keep the day free from lifting intensity."
              completed={postCompleted}
              isPending={isPending}
              isCurrentAction={pendingType === "POST_WORKOUT"}
              actionLabel="Mark recovery complete"
              onLog={() => handleLogCompletion("POST_WORKOUT")}
            >
              <MobilityChecklist blocks={postBlocks} title="Recovery sequence" />
            </RoutineSection>

            <RoutineSection
              title="Optional desk reset"
              summary="Run the short reset any time you have been parked at a desk for too long."
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
        )}
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
    <div className="border-t border-border pt-4">
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
    <section className="border-t border-border pt-8 first:border-t-0 first:pt-0">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-3">
          <p className="eyebrow">{completed ? "Completed today" : "Ready"}</p>
          <h2 className="text-3xl">{title}</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{summary}</p>
          {meta ? <p className="text-sm text-muted-foreground">{meta}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {headerAside}
          {completed ? (
            <span className="inline-flex items-center gap-2 text-sm text-foreground">
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
