import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CircleDot, Footprints, RotateCcw, ShieldCheck, Spline, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Figure, PageTitle, Section } from "@/components/ui/ledger";
import {
  BACK_CARE_DECOMPRESSION,
  FOOT_FLARE_RECOVERY_INTRO,
  FOOT_FLARE_RECOVERY_NOT_WORKOUT,
  FOOT_FLARE_RECOVERY_RULES,
  RECOVERY_INTRO,
  RECOVERY_STOP_NOTE,
  REQUIRED_LATER_RECOVERY,
  getAllMobilityPrograms,
  getRequiredLaterRecoveryBlocks,
  type MobilityBlock,
  type MobilityExercise,
} from "@/lib/mobility";

export const metadata: Metadata = {
  title: "Flexibility & Balance | Athanor",
  description:
    "The reference for each mobility block — its purpose, standards, and progression logic. Perform the work on the Mobility page.",
};

/**
 * The reference/system surface.
 *
 * This page explains what each block is FOR and how it progresses. It
 * deliberately does not reproduce per-drill dosage — that lives on Mobility,
 * which is the working surface — and it carries no logging controls. Every
 * block links into the matching Mobility section to actually perform it.
 */
export default function FlexibilityBalancePage() {
  const programs = getAllMobilityPrograms();
  const allBlocks = programs.flatMap((program) => program.blocks);
  const dailyMinimum = allBlocks.find((block) => block.id === "daily-lower-leg-base") ?? allBlocks[0];

  if (!dailyMinimum) {
    return null;
  }

  const balanceDrills = uniqueExercises(
    allBlocks
      .flatMap((block) => block.exercises)
      .filter((exercise) =>
        /balance/i.test(`${exercise.category ?? ""} ${exercise.name} ${exercise.goal}`)
      )
  );
  const footFlareBlock = getRequiredLaterRecoveryBlocks("footFlare", 1)[0] ?? dailyMinimum;

  return (
    <>
      <PageTitle
        eyebrow="Movement quality"
        title="Movement quality system."
        lead="A six-part movement-quality map for ankle range, foot control, hips, thoracic motion, balance, and recovery. Doses and logging live on Mobility."
      />

      {/* Figures print directly on the canvas. Ink chrome is reserved for the
          rail and the masthead — a dark block mid-page is the card-era idiom
          the ledger grammar removed. */}
      <Section className="mt-6">
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Figure label="Daily minimum" value={dailyMinimum.duration} detail="Lower-leg base" />
          <Figure label="Balance" value={balanceDrills.length} detail="Supported drills" />
          <Figure label="Later recovery" value="8-16 min" detail="Every training day" />
          <Figure label="Foot flare" value={footFlareBlock.duration} detail="When soles flare" />
        </dl>
      </Section>

      <Section title="Choose the layer">
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-4">
          <ContextLine label="Before lower-body" value="Daily base + hip / hinge prep" href="/mobility#session" />
          <ContextLine label="Before upper-body" value="Daily base + thoracic / shoulder mobility" href="/mobility#session" />
          <ContextLine label="After long walking" value="Ankle motion + gentle calf / soleus reset" href="/mobility#later-recovery" />
          <ContextLine label="Rest day" value="10-15 min, no fatigue or conditioning" href="/mobility#session" />
        </div>
      </Section>

      <ReferenceBlock
        icon={CircleDot}
        eyebrow="Ankle range"
        title="Controlled range before load"
        purpose={dailyMinimum.purpose}
        standards={[
          "Runs every day, training or rest.",
          "Comfort work, not training — it should never add fatigue.",
          `Time budget: ${dailyMinimum.duration}.`,
        ]}
        progression={collectProgression(dailyMinimum)}
        drillCount={dailyMinimum.exercises.length}
        href="/mobility#session"
        hrefLabel="Run today's protocol"
      />

      <ReferenceBlock
        icon={ShieldCheck}
        eyebrow="Foot control / balance"
        title="Supported control before challenge"
        purpose="Balance work stays supported, low risk, and repeatable. It builds ankle and hip control for walking load, not a wobble-board challenge."
        standards={[
          "Always within reach of support.",
          "Progress support first, then duration — never instability first.",
          "Stop on any sharp pain, dizziness, or loss of control.",
        ]}
        progression={[
          "Two hands on support, then one hand, then fingertips.",
          "Hold longer at a given level before removing support.",
          "Eyes open throughout; do not close the eyes to add difficulty.",
        ]}
        drillCount={balanceDrills.length}
        href="/mobility#session"
        hrefLabel="Run today's protocol"
      />

      <ReferenceBlock
        icon={RotateCcw}
        eyebrow="Recovery"
        /* Pinned copy: tests/workout-plan.test.mjs asserts this exact heading. */
        title="Weekday recovery blocks"
        purpose={RECOVERY_INTRO}
        standards={[
          "Separate same-day block — not immediately after training.",
          "Effort 1-3/10, pain 0-2/10 maximum, no fatigue.",
          "Required means consistently completed, not intense.",
        ]}
        safety={RECOVERY_STOP_NOTE}
        progression={collectProgression(REQUIRED_LATER_RECOVERY)}
        drillCount={REQUIRED_LATER_RECOVERY.exercises.length}
        href="/mobility#later-recovery"
        hrefLabel="Open later recovery"
      />

      <ReferenceBlock
        icon={Footprints}
        eyebrow="Walking resilience"
        title={footFlareBlock.title}
        purpose={FOOT_FLARE_RECOVERY_INTRO}
        standards={[...FOOT_FLARE_RECOVERY_RULES]}
        safety={FOOT_FLARE_RECOVERY_NOT_WORKOUT}
        trigger="Activates when recent step load is high or logged sole pain reaches 5/10. Foot pain at 3/10 already reduces step load."
        progression={collectProgression(footFlareBlock)}
        drillCount={footFlareBlock.exercises.length}
        href="/mobility#later-recovery"
        hrefLabel="Open later recovery"
      />

      <ReferenceBlock
        icon={Spline}
        eyebrow="Recovery / back care"
        title={BACK_CARE_DECOMPRESSION.title}
        purpose={BACK_CARE_DECOMPRESSION.purpose}
        standards={[
          "Available every day, including full rest days.",
          "Relief work, not training — gentle effort only.",
          "No schedule and no required dose.",
        ]}
        safety={BACK_CARE_DECOMPRESSION.adaptationNote}
        progression={[
          "Stop any movement that increases pain or moves symptoms down the leg.",
          "Scale range and support before adding time.",
        ]}
        drillCount={BACK_CARE_DECOMPRESSION.exercises.length}
        href="/mobility#back-care"
        hrefLabel="Open back care"
      />
    </>
  );
}

function ReferenceBlock({
  icon: Icon,
  eyebrow,
  title,
  purpose,
  standards,
  progression,
  safety,
  trigger,
  drillCount,
  href,
  hrefLabel,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  purpose: string;
  standards: string[];
  progression: string[];
  safety?: string;
  trigger?: string;
  drillCount: number;
  href: string;
  hrefLabel: string;
}) {
  return (
    <Section>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label uppercase text-tertiary">{eyebrow}</p>
          <h2 className="mt-1 normal-case tracking-normal text-body font-medium text-primary">
            {title}
          </h2>
        </div>
        {/* Decorative: the eyebrow already names the block. */}
        <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-faint" strokeWidth={1.5} />
      </div>

      <p className="mt-2 max-w-2xl text-row text-secondary">{purpose}</p>

      {trigger ? (
        <p className="mt-3 max-w-2xl rounded-control border-l-2 border-ember-line bg-ember-surface px-3 py-2 text-row text-ember">
          {trigger}
        </p>
      ) : null}

      <div className="mt-5 grid gap-x-8 gap-y-5 md:grid-cols-2">
        <PrincipleList title="Standard" items={standards} />
        <PrincipleList title="Progression" items={progression} />
      </div>

      {safety ? (
        <p className="mt-4 max-w-2xl border-t border-rule pt-3 text-caption text-tertiary">
          <span className="font-medium text-primary">Safety: </span>
          {safety}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule pt-3">
        <Badge variant="secondary">
          {drillCount} {drillCount === 1 ? "drill" : "drills"}
        </Badge>
        {/* Doses and logging live on Mobility; this is the way in. */}
        <Link
          href={href}
          className="inline-flex min-h-touch items-center gap-1.5 text-row font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {hrefLabel}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </Section>
  );
}

function PrincipleList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <h3>{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-row text-secondary">
            <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-pill bg-accent" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContextLine({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <div className="border-t border-rule pt-3">
      <p className="text-label uppercase text-tertiary">{label}</p>
      <p className="mt-1 text-row font-medium text-primary">{value}</p>
      <Link href={href} className="mt-2 inline-flex min-h-touch items-center gap-1 text-caption text-secondary underline-offset-4 hover:text-primary hover:underline">
        Open protocol <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}

/**
 * Block-level progression logic, gathered from the drills' own progression and
 * scale-down notes. This is the principle, not the prescription — no dose is
 * carried across.
 */
function collectProgression(block: MobilityBlock): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const exercise of block.exercises) {
    for (const note of [...(exercise.progression ?? []), ...exercise.scaleDown]) {
      const trimmed = note.trim();
      if (!trimmed || seen.has(trimmed)) {
        continue;
      }
      seen.add(trimmed);
      out.push(trimmed);
    }
  }

  return out.slice(0, 4);
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
