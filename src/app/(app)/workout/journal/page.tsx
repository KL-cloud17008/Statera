import type { Metadata } from "next";
import Link from "next/link";
import { getTrainingJournal } from "@/actions/training-journal";
import { TrainingJournal } from "@/components/workout/TrainingJournal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notice, PageTitle } from "@/components/ui/ledger";

export const metadata: Metadata = { title: "Training journal | Athanor" };

export default async function TrainingJournalPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const journal = await getTrainingJournal(date ?? "");
  if (!journal) return null;
  return <>
    <PageTitle title="Training journal" action={<Button asChild variant="secondary"><Link href="/workout">Back to Training</Link></Button>} />
    {journal.available ? <>
      <form action="/workout/journal" className="mt-6 flex flex-wrap items-end gap-3">
        <label className="grid gap-2 text-caption text-secondary">Journal date <Input type="date" name="date" required max={journal.today} defaultValue={journal.date} className="min-h-12 min-w-40" /></label>
        <Button type="submit" variant="secondary" className="min-h-12">Open date</Button>
      </form>
      <TrainingJournal key={journal.date} date={journal.date} recovery={journal.recovery} supplements={journal.supplements} />
    </> : <Notice className="mt-6">The training journal is temporarily unavailable.</Notice>}
  </>;
}
