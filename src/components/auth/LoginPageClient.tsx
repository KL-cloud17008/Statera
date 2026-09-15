"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { signIn, signUp } from "@/actions/auth";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPageClient() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      const action = isSignUp ? signUp : signIn;
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result && "success" in result && result.success) {
        setSuccess(result.success);
        setIsSignUp(false);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-panel border border-rule bg-raised">
          <section className="flex flex-col bg-raised p-6 sm:p-8">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <div className="mb-8 flex items-center gap-3"><BrandMark className="size-6 text-accent" /><span className="text-xl font-semibold tracking-tight">Athanor</span></div>
                {/* The page's one h1 lives here — the ink panel is decoration. */}
                <h1>{isSignUp ? "Create your account" : "Welcome back"}</h1>
                <p className="mt-2 text-body text-secondary">
                  {isSignUp ? "Keep your training records in one place." : "Sign in to your training log."}
                </p>
              </div>

              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" autoCapitalize="none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="Password" required minLength={6} autoComplete={isSignUp ? "new-password" : "current-password"} />
                  {isSignUp ? <p className="text-caption text-tertiary">Must be at least 6 characters.</p> : null}
                </div>

                {error ? (
                  <div className="flex items-start gap-2 rounded-control border-l-2 border-critical-line bg-critical-surface px-3 py-2 text-row text-critical" role="alert" aria-live="polite">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                ) : null}

                {success ? (
                  <div className="flex items-start gap-2 rounded-control border-l-2 border-accent-line bg-accent-subtle px-3 py-2 text-row text-accent" role="status" aria-live="polite">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                    <p>{success}</p>
                  </div>
                ) : null}

                <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  {isSignUp ? "Create account" : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 text-row text-secondary">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="font-medium text-primary underline-offset-4 transition-colors duration-(--duration-fast) hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
