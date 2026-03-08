import type { Metadata } from "next";
import { LoginPageClient } from "@/components/auth/LoginPageClient";

export const metadata: Metadata = {
  title: "Sign In | ATHANOR",
  description: "Sign in to ATHANOR to access your fitness dashboard, workouts, steps, and weight trends.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
