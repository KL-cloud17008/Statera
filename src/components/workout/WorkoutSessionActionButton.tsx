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
  onDark = false,
  fullWidth = false,
  className,
}: {
  planId?: string;
  status: SessionActionStatus;
  prominent?: boolean;
  onDark?: boolean;
  fullWidth?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const copy = ACTION_COPY[status];
  const Icon = copy.icon;
  const buttonClassName = cn(
    "min-h-11 text-center",
    fullWidth && "w-full",
    onDark && "border-white/20 bg-[#edf7ff] text-[#07111f] hover:bg-white",
    className
  );

  if (status === "view") {
    return (
      <Button
        asChild
        variant={prominent ? "default" : "secondary"}
        className={buttonClassName}
      >
        <Link href="/workout/history">
          <Icon className="h-4 w-4" />
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
      variant={onDark || !prominent ? "secondary" : "default"}
      onClick={handleStart}
      disabled={isPending}
      className={buttonClassName}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {isPending ? copy.loadingLabel : copy.label}
    </Button>
  );
}
