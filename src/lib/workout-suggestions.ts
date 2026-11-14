type Plan = { id: string; dayOfWeek: number; sessionName: string };
type DayStatus = { planId: string; status: "start" | "resume" | "view" };
type Recovery = { energy: number; soreness: number; sleepHours: number | null };

export function suggestWorkout({ plans, statuses, dayOfWeek, active, recovery, footPain, backPain }: {
  plans: Plan[]; statuses: DayStatus[]; dayOfWeek: number; active: boolean;
  recovery: Recovery | null; footPain: number | null; backPain: number | null;
}) {
  if (active) return { title: "Resume your open workout", details: "Return to the workout you started and review your saved sets.", href: "/workout", action: "Resume training" };
  // When the plan wraps after Saturday, Sunday's session starts a fresh week.
  const remaining = [...plans].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const isIncomplete = (plan: Plan) => statuses.find(status => status.planId === plan.id)?.status !== "view";
  const today = remaining.find(plan => plan.dayOfWeek === dayOfWeek && isIncomplete(plan));
  const next = remaining.find(plan => plan.dayOfWeek > dayOfWeek && isIncomplete(plan)) ?? remaining[0];
  const nextLine = next ? `Next in your plan: ${next.sessionName}.` : "Open the full plan to choose your next session.";
  if (today && ((backPain ?? 0) >= 3 || (footPain ?? 0) >= 3)) return {
    title: "Review your readiness before lifting",
    details: "Your pain check-in meets the readiness threshold in your plan. Read today’s movement guidance before starting.",
    href: "/mobility#pain-check-in", action: "Review movement guidance",
  };
  if (today && recovery && (recovery.energy <= 2 || recovery.soreness >= 7 || (recovery.sleepHours ?? 24) < 6)) return {
    title: "Consider a lighter session or rest",
    details: `${today.sessionName} is scheduled. Your recovery check-in suggests keeping any work easy and leaving extra reps in reserve.`,
    href: "/workout", action: "Review today’s session",
  };
  if (today) return { title: today.sessionName, details: "Follow the programmed sets. Add clean reps before increasing load.", href: "/workout", action: "Review today’s session" };
  return { title: "Keep today for recovery", details: nextLine, href: "/workout/plan", action: "See full plan" };
}
