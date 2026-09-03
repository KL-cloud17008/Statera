"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { startWorkoutSession } from "@/actions/workout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SessionActionStatus = "start" | "resume" | "view";

const ACTION_COPY = {
  start: {
    label: "Start Session",
    loadingLabel: "Starting...",
    icon: Play,
  },
  resume: {
    label: "Resume Session",
    loadingLabel: "Opening...",
    icon: RotateCcw,
  },
  view: {
    label: "View Session",
    loadingLabel: "Opening...",
    icon: Eye,
  },
} as const;

export function WorkoutSessionActionButton({
  planId,
  status,
  prominent = false,
  fullWidth = false,
  className,
}: {
  planId?: string;
  status: SessionActionStatus;
  prominent?: boolean;
  fullWidth?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const copy = ACTION_COPY[status];
  const Icon = copy.icon;
  const buttonClassName = cn(fullWidth && "w-full", className);

  if (status === "resume") {
    return (
      <Button
        asChild
        variant={prominent ? "primary" : "secondary"}
        size="sm"
        className={buttonClassName}
      >
        <Link href="/workout">
          <Icon className="size-4" aria-hidden />
          {copy.label}
        </Link>
      </Button>
    );
  }

  if (status === "view") {
    return (
      <Button asChild variant="secondary" size="sm" className={buttonClassName}>
        <Link href="/workout/history">
          <Icon className="size-4" aria-hidden />
          {copy.label}
        </Link>
      </Button>
    );
  }

  function handleStart() {
    if (!planId) {
      toast.error("No active plan is available for this training day.");
      return;
    }

    startTransition(async () => {
      const result = await startWorkoutSession(planId);
      if (result.error) {
        toast.error(result.error);
        router.refresh();
        return;
      }

      toast.success(result.warning ?? "Training session started");
      router.push("/workout");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant={prominent ? "primary" : "secondary"}
      size="sm"
      onClick={handleStart}
      disabled={isPending}
      className={buttonClassName}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Icon className="size-4" aria-hidden />
      )}
      {isPending ? copy.loadingLabel : copy.label}
    </Button>
  );
}
