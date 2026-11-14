import type { Metadata } from "next";
import { OfflineWorkoutPageClient } from "@/components/workout/OfflineWorkout";

export const metadata: Metadata = { title: "Offline training | Athanor", robots: { index: false } };

export default function OfflineWorkoutPage() {
  return <OfflineWorkoutPageClient />;
}
