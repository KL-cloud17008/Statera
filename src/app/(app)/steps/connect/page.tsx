import type { Metadata } from "next";
import Link from "next/link";
import { getStepSyncStatus } from "@/actions/step-sync";
import { StepSyncSetup } from "@/components/steps/StepSyncSetup";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/ui/ledger";
import { getOrCreateCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Automatic steps | Athanor" };
export default async function StepSyncPage() {
  if (!await getOrCreateCurrentUser()) return null;
  const status = await getStepSyncStatus();
  return <><PageTitle title="Automatic steps" action={<Button asChild variant="secondary" size="sm"><Link href="/steps">Back to Steps</Link></Button>} /><StepSyncSetup initialStatus={status} /></>;
}
