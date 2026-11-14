import type { Metadata } from "next";
import { LoginPageClient } from "@/components/auth/LoginPageClient";
import { OfflineWorkoutAccount } from "@/components/workout/OfflineWorkout";

export const metadata: Metadata = {
  title: "Sign In | Athanor",
  description: "Sign in to Athanor to access your fitness dashboard, training, steps, and weight trends.",
};

export default function LoginPage() {
  return <><OfflineWorkoutAccount accountId={null} /><LoginPageClient /></>;
}
