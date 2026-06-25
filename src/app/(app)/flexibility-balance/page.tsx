import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CircleDot, Footprints, RotateCcw, ShieldCheck, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import {
  getAllMobilityPrograms,
  getRecoverySessionBlocks,
  getRequiredLaterRecoveryBlocks,
  type MobilityBlock,
  type MobilityExercise,
} from "@/lib/mobility";

export const metadata: Metadata = {
  title: "Flexibility & Balance | Athanor",
  description: "Review the daily minimum, balance drills, recovery-day work, and foot/ankle resilience protocol.",
};

export default function FlexibilityBalancePage() {
  const programs = getAllMobilityPrograms();
  const dailyMinimum = programs[0].blocks.find((block) => block.id === "daily-lower-leg-base") ?? programs[0].blocks[0];
  const balanceDrills = uniqueExercises(
    programs
      .flatMap((program) => program.blocks)
      .flatMap((block) => block.exercises)
      .filter((exercise) => /balance/i.test(`${exercise.category ?? ""} ${exercise.name} ${exercise.goal}`))
  );
  const recoveryDayBlocks = [
    ...getRecoverySessionBlocks(3).slice(0, 2),
    ...getRecoverySessionBlocks(6).slice(0, 2),
  ];
  const footAnkleBlock = getRequiredLaterRecoveryBlocks("footFlare", 1)[0] ?? dailyMinimum;

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Flexibility & Balance"
        title="Movement quality map."
        description="Daily lower-leg base, supported balance, recovery-day blocks, and foot/ankle resilience."
        action={
          <Link href="/mobility" className="text-link inline-flex items-center gap-2 text-sm font-semibold">
            Open Mobility logging
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <section className="document-panel">
        <div className="command-deck grid gap-5 rounded-[var(--radius-panel)] p-6 md:grid-cols-4" data-animated="true">
          <OverviewMetric label="Daily Minimum" value={dailyMinimum.duration} />
          <OverviewMetric label="Balance" value={`${balanceDrills.length} drills`} />
          <OverviewMetric label="Recovery" value="Wed / Sat" />
          <OverviewMetric label="Foot Load" value={footAnkleBlock.duration} />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <ProtocolBlock
            icon={CircleDot}
            eyebrow="Daily minimum block"
            title={dailyMinimum.title}
            summary={dailyMinimum.purpose}
            badge={dailyMinimum.duration}
          >
            <MovementList exercises={dailyMinimum.exercises.slice(0, 7)} />
          </ProtocolBlock>

          <ProtocolBlock
            icon={ShieldCheck}
            eyebrow="Balance drills"
            title="Supported control before challenge"
            summary="Balance work stays supported, low risk, and repeatable. Progress support and duration before instability."
            badge={`${balanceDrills.length} drills`}
          >
            <MovementList exercises={balanceDrills.slice(0, 4)} />
          </ProtocolBlock>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <ProtocolBlock
            icon={RotateCcw}
            eyebrow="Recovery-day block"
            title="Wednesday and Saturday recovery"
            summary="Recovery days keep the same calm intent: restore range, breathing, and tissue tolerance without adding conditioning."
            badge="12-20 min"
          >
            <div className="grid gap-3">
              {recoveryDayBlocks.map((block) => (
                <BlockSummary key={block.id} block={block} />
              ))}
            </div>
          </ProtocolBlock>

          <ProtocolBlock
            icon={Footprints}
            eyebrow="Foot/ankle resilience"
            title={footAnkleBlock.title}
            summary={footAnkleBlock.purpose}
            badge={footAnkleBlock.duration}
          >
            <MovementList exercises={footAnkleBlock.exercises.slice(0, 6)} />
          </ProtocolBlock>
        </div>
      </section>
    </div>
  );
}

function ProtocolBlock({
  icon: Icon,
  eyebrow,
  title,
  summary,
  badge,
  children,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  summary: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <article className="prime-panel grid gap-5 rounded-[var(--radius-card)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="text-3xl">{title}</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{summary}</p>
        </div>
        <div className="duna-mark-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground/82">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <Badge variant="outline">{badge}</Badge>
      {children}
    </article>
  );
}

function MovementList({ exercises }: { exercises: MobilityExercise[] }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {exercises.map((exercise) => (
        <div key={exercise.id} className="interactive-row grid gap-3 px-2 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,auto)] sm:items-start">
          <div>
            <p className="font-medium text-foreground">{exercise.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{exercise.goal}</p>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-right">{exercise.dose}</p>
        </div>
      ))}
    </div>
  );
}

function BlockSummary({ block }: { block: MobilityBlock }) {
  return (
    <div className="micro-panel rounded-[var(--radius-card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-medium text-foreground">{block.title}</p>
        <Badge variant="secondary">{block.duration}</Badge>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{block.purpose}</p>
    </div>
  );
}

function OverviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="black-glass rounded-[var(--radius-card)] p-4">
      <p className="eyebrow text-[10px]">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function uniqueExercises(exercises: MobilityExercise[]) {
  const seen = new Set<string>();
  return exercises.filter((exercise) => {
    if (seen.has(exercise.name)) {
      return false;
    }
    seen.add(exercise.name);
    return true;
  });
}
