import type { Metadata } from "next";
import { getStepsEntries } from "@/actions/steps";
import { StepsPageClient } from "@/components/steps/StepsPageClient";
import { getOrCreateCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = {
  title: "Steps | ATHANOR",
  description: "Track daily steps, goal progress, weekly bars, and a monthly movement heatmap.",
};

export default async function StepsPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  const entries = await getStepsEntries(user.id, 180);
  const serialized = entries.map((entry) => ({
    id: entry.id,
    date: entry.date.toISOString().split("T")[0],
    steps: entry.steps,
  }));

  return <StepsPageClient entries={serialized} timezone={user.timezone} />;
}
