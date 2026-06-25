"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { resetCurrentWorkoutPlan } from "@/actions/workout";
import { Button } from "@/components/ui/button";

export function WorkoutPlanResetButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleReset() {
    const confirmed = window.confirm(
      "Start a fresh copy of the current 4-day training plan? Any open session will be closed."
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await resetCurrentWorkoutPlan();
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Started new 4-day plan");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleReset}
      disabled={isPending}
      className="max-w-full whitespace-normal text-left sm:whitespace-nowrap"
    >
      <RotateCcw className="h-4 w-4" />
      {isPending ? (
        "Starting plan..."
      ) : (
        <>
          <span className="sm:hidden">Start new plan</span>
          <span className="hidden sm:inline">Start new 4-day plan</span>
        </>
      )}
    </Button>
  );
}
