import type { Metadata } from "next";
import { LoginPageClient } from "@/components/auth/LoginPageClient";

export const metadata: Metadata = {
  title: "Sign In | Athnaor",
  description: "Sign in to Athnaor to access your fitness dashboard, workouts, steps, and weight trends.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
