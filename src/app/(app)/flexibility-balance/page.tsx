import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CircleDot, Footprints, RotateCcw, ShieldCheck, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Figure, PageTitle, Row, Rows, Section, Sub } from "@/components/ui/ledger";
import {
  getAllMobilityPrograms,
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
  const allBlocks = programs.flatMap((program) => program.blocks);
  const dailyMinimum =
    allBlocks.find((block) => block.id === "daily-lower-leg-base") ??
    allBlocks[0];

  if (!dailyMinimum) {
    return null;
  }
  const balanceDrills = uniqueExercises(
    programs
      .flatMap((program) => program.blocks)
      .flatMap((block) => block.exercises)
      .filter((exercise) => /balance/i.test(`${exercise.category ?? ""} ${exercise.name} ${exercise.goal}`))
  );
  const recoveryDayBlocks = [
    ...getRequiredLaterRecoveryBlocks("standard", 5).slice(0, 1),
  ];
  const footAnkleBlock = getRequiredLaterRecoveryBlocks("footFlare", 1)[0] ?? dailyMinimum;

  return (
    <>
      <PageTitle
        eyebrow="Flexibility & Balance"
        title="Movement quality map."
        lead="Daily lower-leg base, supported balance, recovery-day blocks, and foot/ankle resilience."
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href="/mobility">
              Open Mobility logging
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <Section className="mt-6">
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Figure label="Daily Minimum" value={dailyMinimum.duration} />
          <Figure label="Balance" value={`${balanceDrills.length} drills`} />
          <Figure label="Recovery" value="Weekdays" />
          <Figure label="Foot Load" value={footAnkleBlock.duration} />
        </dl>
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
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
      </Section>

      <Section>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <ProtocolBlock
            icon={RotateCcw}
            eyebrow="Required later recovery"
            title="Weekday recovery blocks"
            summary="Each strength day has a low-intensity later block. Saturday and Sunday stay full rest."
            badge="8-16 min"
          >
            <div className="flex flex-1 flex-col gap-4">
              {recoveryDayBlocks.map((block) => (
                <div key={block.id} className="flex flex-1 flex-col gap-4">
                  <BlockSummary block={block} />
                  <MovementList exercises={block.exercises.slice(0, 6)} />
                </div>
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
      </Section>
    </>
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
    <article className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label uppercase text-tertiary">{eyebrow}</p>
          <p className="mt-1 text-body font-medium text-primary">{title}</p>
        </div>
        {/* Decorative: the eyebrow already names the block. */}
        <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-faint" strokeWidth={1.5} />
      </div>
      <p className="mt-2 max-w-2xl text-row text-secondary">{summary}</p>
      <Badge variant="secondary" className="mt-3 self-start">{badge}</Badge>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </article>
  );
}

/* Movement, then dose. The dose folds onto a second line below sm. */
const MOVEMENT_COLUMNS = "minmax(0,1fr)";
const MOVEMENT_COLUMNS_MD = "minmax(0,1fr) minmax(8rem,auto)";

function MovementList({ exercises }: { exercises: MobilityExercise[] }) {
  return (
    <Rows className="flex-1" columns={MOVEMENT_COLUMNS} mdColumns={MOVEMENT_COLUMNS_MD}>
      {exercises.map((exercise) => (
        <Row
          key={exercise.id}
          columns={MOVEMENT_COLUMNS}
          mdColumns={MOVEMENT_COLUMNS_MD}
          className="items-start"
        >
          <div className="min-w-0">
            <p className="text-row font-medium text-primary">{exercise.name}</p>
            <p className="mt-0.5 text-caption text-tertiary">{exercise.goal}</p>
            <Sub className="mt-0.5 block">{exercise.dose}</Sub>
          </div>
          <span className="hidden text-caption text-secondary md:block md:text-right">
            {exercise.dose}
          </span>
        </Row>
      ))}
    </Rows>
  );
}

function BlockSummary({ block }: { block: MobilityBlock }) {
  return (
    <div className="border-t border-rule pt-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-row font-medium text-primary">{block.title}</p>
        <Badge variant="secondary">{block.duration}</Badge>
      </div>
      <p className="mt-1 text-caption text-tertiary">{block.purpose}</p>
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
