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
  1: "Day 1 - Upper A",
  2: "Day 2 - Lower A",
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
        eyebrow="Mobility"
        title={isTrainingDay ? DAY_NAMES[dayOfWeek] ?? "Training Day" : "Mobility-only recovery day"}
        description={
          isTrainingDay
            ? "Primer supports gym days; recovery flow supports mobility-only days. Focus: feet, shins, hips, and back."
            : "Use a longer 20–30 minute recovery session to restore movement tolerance before the next lift day."
        }
      >
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <span>Pre {preCompleted ? "logged" : "open"}</span>
          <span>Post {postCompleted ? "logged" : "open"}</span>
          <span>Undo sitting {undoCount}x</span>
        </div>
      </SectionHeader>

      {isTrainingDay ? (
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
          <RoutineSection
            title="Pre-workout reset"
            summary="Choose the version that matches how you feel, run the sequence, and log it once you're done."
            completed={preCompleted}
            isPending={isPending}
            isCurrentAction={pendingType === "PRE_WORKOUT"}
            actionLabel="Mark pre-workout complete"
            onLog={() => handleLogCompletion("PRE_WORKOUT")}
            headerAside={
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Version</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setVersion("A")}
                    className={cn(
                      "border-b pb-1 transition-colors",
                      version === "A" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
                    )}
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setVersion("B")}
                    className={cn(
                      "border-b pb-1 transition-colors",
                      version === "B" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
                    )}
                  >
                    B
                  </button>
                </div>
              </div>
            }
          >
            <MobilityChecklist blocks={preBlocks} title="Pre-workout sequence" />
          </RoutineSection>

          <div className="space-y-10">
            <RoutineSection
              title="Recovery mobility session"
              summary="This can be done after training or later in the day. Keep intensity easy and breathing controlled."
              completed={postCompleted}
              isPending={isPending}
              isCurrentAction={pendingType === "POST_WORKOUT"}
              actionLabel="Mark post-workout complete"
              onLog={() => handleLogCompletion("POST_WORKOUT")}
              quiet
            >
              <MobilityChecklist blocks={postBlocks} title="Post-workout cooldown" />
            </RoutineSection>

            <RoutineSection
              title="Optional desk reset"
              summary="Use this as the short reset that breaks up desk-heavy blocks during the day."
              completed={false}
              isPending={isPending}
              isCurrentAction={pendingType === "UNDO_SITTING"}
              actionLabel="Log undo-sitting session"
              onLog={() => handleLogCompletion("UNDO_SITTING")}
              meta={undoCount > 0 ? `${undoCount} logged today` : "Aim for two or three short resets."}
              quiet
            >
              <MobilityChecklist blocks={undoBlocks} title="Desk reset" />
            </RoutineSection>
          </div>
        </div>
      ) : (
        <div className="grid gap-10 xl:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.28fr)]">
          <section className="editorial-surface-quiet space-y-5">
            <p className="eyebrow">Rest day</p>
            <p className="text-3xl font-semibold tracking-[-0.06em]">
              Keep only the reset that matters.
            </p>
            <p className="subtle-copy">
              On non-training days the page drops the extra structure and surfaces a single desk
              reset flow instead.
            </p>
          </section>

          <RoutineSection
            title="Optional desk reset"
            summary="Run the short reset any time you have been parked at a desk for too long."
            completed={false}
            isPending={isPending}
            isCurrentAction={pendingType === "UNDO_SITTING"}
            actionLabel="Log undo-sitting session"
            onLog={() => handleLogCompletion("UNDO_SITTING")}
            meta={undoCount > 0 ? `${undoCount} logged today` : "Aim for two or three short resets."}
          >
            <MobilityChecklist blocks={undoBlocks} title="Desk reset" />
          </RoutineSection>
        </div>
      )}
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
  quiet = false,
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
  quiet?: boolean;
}) {
  return (
    <section className={cn(quiet ? "editorial-surface-quiet" : "editorial-surface", "space-y-8")}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="eyebrow">{completed ? "Completed today" : "Ready"}</p>
          <h2>{title}</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{summary}</p>
          {meta ? <p className="text-sm text-muted-foreground">{meta}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {headerAside}
          {completed ? (
            <span className="inline-flex items-center gap-2 text-sm text-foreground/82">
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

      {children}
    </section>
  );
}
