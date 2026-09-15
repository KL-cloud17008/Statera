"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <section className="max-w-lg py-8" role="alert">
    <h1>Couldn’t load this page</h1>
    <p className="mt-3 text-body text-secondary">Check your connection and try again. A failed request does not confirm that an entry was saved.</p>
    <div className="mt-6 flex flex-wrap gap-3">
      <Button variant="primary" disabled={pending} onClick={() => startTransition(() => {
        router.refresh();
        reset();
      })}>{pending ? "Retrying…" : "Try again"}</Button>
      <Button asChild><Link href="/">Dashboard</Link></Button>
    </div>
  </section>;
}
