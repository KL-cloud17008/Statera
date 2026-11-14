import type { Metadata } from "next";
import Link from "next/link";
import { getLatestPainCheckIn } from "@/actions/pain";
import { getTrainingJournal } from "@/actions/training-journal";
import { getWorkoutPlans, getWorkoutPlanDayStatuses } from "@/actions/workout";
import { Button } from "@/components/ui/button";
import { PageTitle, Section } from "@/components/ui/ledger";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { getTodayDateString, getTrainingDayOfWeek } from "@/lib/dates";
import { prisma } from "@/lib/db";
import { suggestWorkout } from "@/lib/workout-suggestions";

export const metadata: Metadata = { title: "Workout suggestions | Athanor" };

export default async function WorkoutSuggestionsPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) return null;
  const plans = await getWorkoutPlans(user.id);
  const [statuses, journal, latestPain, active] = await Promise.all([
    getWorkoutPlanDayStatuses(user.id, user.timezone),
    getTrainingJournal(""),
    getLatestPainCheckIn(user.id),
    prisma.workoutSession.findFirst({ where: { userId: user.id, completed: false }, select: { id: true } }),
  ]);
  const pain = latestPain?.date === getTodayDateString(user.timezone) ? latestPain : null;
  const recovery = journal?.available ? journal.recovery : null;
  const suggestion = suggestWorkout({
    plans, statuses, dayOfWeek: getTrainingDayOfWeek(new Date(), user.timezone), active: Boolean(active), recovery,
    footPain: pain?.footPain ?? null, backPain: pain?.lowerBackPain ?? null,
  });
  return <>
    <PageTitle title="Workout suggestions" action={<Button asChild variant="secondary"><Link href="/workout">Back to Training</Link></Button>} />
    <Section title={suggestion.title} className="mt-6">
      <p className="max-w-xl text-body text-secondary">{suggestion.details}</p>
      {recovery ? <p className="mt-3 text-caption text-secondary">Today’s check-in · Energy {recovery.energy}/5 · Soreness {recovery.soreness}/10{recovery.sleepHours == null ? "" : ` · ${recovery.sleepHours} h sleep`}</p> : null}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button asChild className="min-h-12"><Link href={suggestion.href}>{suggestion.action}</Link></Button>
        {journal?.available ? <Button asChild variant="secondary" className="min-h-12"><Link href="/workout/journal#recovery">{recovery ? "Review check-in" : "Log recovery"}</Link></Button> : null}
      </div>
    </Section>
  </>;
}
