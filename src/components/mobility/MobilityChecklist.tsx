"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  FOOT_FLARE_RECOVERY_INTRO,
  FOOT_FLARE_RECOVERY_NOT_WORKOUT,
  FOOT_FLARE_RECOVERY_RULES,
  RECOVERY_INTRO,
  RECOVERY_STOP_NOTE,
  type MobilityBlock,
  type MobilityExercise,
  type RecoveryIntroVariant,
} from "@/lib/mobility";
import { cn } from "@/lib/utils";

/**
 * Collapse a full dose descriptor into a compact numeric prescription for the
 * badge ("1-2 sets of 5-10 slow circles each direction per ankle" -> "1-2×5-10/dir").
 * The full descriptor stays available in the expanded details and on hover.
 */
function compactDose(dose: string) {
  const compact = dose
    .toLowerCase()
    .replace(/–/g, "-")
    .replace(/\s*×\s*/g, "×")
    .replace(/(\d[\d.]*(?:-\d[\d.]*)?)\s*(?:sets?|rounds?)\s*(?:of|x)\s*/g, "$1×")
    .replace(/(\d)\s*x\s*(?=\d)/g, "$1×")
    .replace(/\bhold\s+/g, "")
    .replace(/\s*sets\b/g, "")
    .replace(/\s*sec(?:onds?)?\b/g, "s")
    .replace(/\s+min(?:utes?)?\b/g, "min")
    .replace(/\s+(?:slow|easy|gentle|controlled|quiet|calm|long|deep)\b/g, "")
    .replace(/\s*(?:circles?|reps?|repetitions?)\b/g, "")
    .replace(/\s*(?:each|per)\s+direction(?:\s+per\s+\w+)?\b/g, "/dir")
    .replace(/\s*(?:each|per)\s+side\b/g, "/side")
    .replace(/\s*(?:each|per)\s+(?:leg|foot)\b/g, "/leg")
    .replace(/\s*(?:each|per)\s+ankle\b/g, "/ankle")
    .replace(/\s*(?:each|per)\s+(?:arm|hand)\b/g, "/arm")
    .replace(/\s*(?:each|per)\s+stance\b/g, "/stance")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Unrecognized phrasing that stays long keeps the original wording.
  return compact.length > 0 && compact.length <= 24 ? compact : dose;
}

export function MobilityChecklist({
  blocks,
  title,
}: {
  blocks: MobilityBlock[];
  title: string;
}) {
  const allExercises = blocks.flatMap((block) => block.exercises);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const totalCount = allExercises.length;
  const checkedCount = checked.size;
  const allDone = checkedCount === totalCount && totalCount > 0;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  function toggle(key: string) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function toggleExpanded(key: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3>{title}</h3>
        <span className="num text-caption text-secondary">
          {allDone ? (
            <span className="inline-flex items-center gap-1.5 text-accent">
              <Check className="size-3.5" />
              Complete
            </span>
          ) : (
            `${checkedCount}/${totalCount} · ${progress}%`
          )}
        </span>
      </div>
      <Progress value={progress} className="mt-2" />

      <div className="mt-6 space-y-6">
        {blocks.map((block, blockIndex) => (
          <section key={block.title} className="grid gap-4 border-t border-rule pt-5 first:border-t-0 first:pt-0 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-6">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-label uppercase text-tertiary">Block {blockIndex + 1}</p>
              <p className="mt-1 text-row font-medium text-primary">{block.title}</p>
              <p className="num num-left mt-0.5 text-caption text-tertiary">{block.duration}</p>
              <p className="mt-2 text-caption text-tertiary">{block.purpose}</p>
            </div>

            <div className="space-y-4">
              {block.recoveryIntro ? (
                <RecoveryIntro variant={block.recoveryIntroVariant ?? "standard"} />
              ) : null}
              {block.previousDayReason || getBlockAdaptationNote(block) ? (
                <BlockContext
                  previousDayReason={block.previousDayReason}
                  adaptationNote={getBlockAdaptationNote(block)}
                />
              ) : null}

              <div className="ledger-rows">
                {block.exercises.map((exercise, exerciseIndex) => {
                  const key = `${block.id}-${exercise.id}-${exerciseIndex}`;
                  const detailsId = `mobility-details-${key}`;
                  const isDone = checked.has(key);
                  const isExpanded = expanded.has(key);
                  const hasDetails = Boolean(
                    exercise.category ||
                      exercise.goal ||
                      exercise.setup ||
                      exercise.howTo?.length ||
                      exercise.breathingCue ||
                      exercise.beginnerPointers?.length ||
                      exercise.commonMistakes?.length ||
                      exercise.scaleDown?.length ||
                      exercise.progression?.length ||
                      exercise.completionTarget ||
                      exercise.painRule ||
                      exercise.intensity
                  );

                  return (
                    <div
                      key={key}
                      className={cn("w-full py-3 text-left", isDone && "opacity-90")}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isDone}
                          onCheckedChange={() => toggle(key)}
                          className="mt-1 shrink-0"
                          aria-label={exercise.name}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-4">
                            <button
                              type="button"
                              onClick={() => toggle(key)}
                              className="w-full min-w-0 rounded-control text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:flex-1"
                            >
                              <p className={cn("text-row font-medium", isDone ? "text-tertiary line-through" : "text-primary")}>
                                {exercise.name}
                              </p>
                              <p className="mt-0.5 text-caption text-tertiary">
                                {exercise.cues}
                              </p>
                            </button>

                            <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:shrink-0 sm:flex-col sm:items-end sm:justify-start">
                              <p
                                title={exercise.dose}
                                className="num whitespace-nowrap rounded-pill border border-rule bg-sunken px-2 py-0.5 text-label uppercase text-secondary"
                              >
                                {compactDose(exercise.dose)}
                              </p>
                              {hasDetails ? (
                                <button
                                  type="button"
                                  aria-expanded={isExpanded}
                                  aria-controls={detailsId}
                                  onClick={() => toggleExpanded(key)}
                                  className="inline-flex min-h-8 items-center gap-1.5 rounded-pill border border-control-border bg-raised px-2.5 py-1 text-label uppercase text-secondary transition-colors duration-(--duration-fast) ease-(--ease-out) hover:bg-row-hover hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
                                >
                                  <span>How to do it</span>
                                  <ChevronDown
                                    className={cn(
                                      "size-3.5 transition-transform duration-(--duration-fast) motion-reduce:transition-none",
                                      isExpanded && "rotate-180"
                                    )}
                                  />
                                </button>
                              ) : null}
                            </div>
                          </div>

                          {hasDetails && isExpanded ? (
                            <MovementDetails exercise={exercise} detailsId={detailsId} />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function RecoveryIntro({
  variant,
}: {
  variant: RecoveryIntroVariant;
}) {
  const isFootFlare = variant === "footFlare";
  const rules = isFootFlare
    ? FOOT_FLARE_RECOVERY_RULES
    : [
        "Effort: 1-3/10",
        "Pain: 0-2/10 maximum",
        "Breathing: calm enough to breathe through the nose",
        "Goal: finish looser and calmer with no fatigue",
      ];

  return (
    <div className="border-y border-rule py-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,0.72fr)]">
        <div>
          <p className="text-label uppercase text-tertiary">Recovery intensity</p>
          <p className="mt-1 text-row text-secondary">
            {isFootFlare ? FOOT_FLARE_RECOVERY_INTRO : RECOVERY_INTRO}
          </p>
          {isFootFlare ? (
            <p className="mt-2 text-row font-medium text-primary">
              {FOOT_FLARE_RECOVERY_NOT_WORKOUT}
            </p>
          ) : null}
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
          {rules.map((rule) => (
            <p
              key={rule}
              className="rounded-control bg-sunken px-2.5 py-1.5 text-caption text-secondary"
            >
              {rule}
            </p>
          ))}
        </div>
      </div>
      {/* The stop rule is a pain gate, so it takes the ember notice rather
          than sitting as quiet footer copy. */}
      <p className="mt-3 rounded-control border-l-2 border-ember-line bg-ember-surface px-3 py-2 text-row text-ember">
        <span className="font-medium">Safety note: </span>
        {RECOVERY_STOP_NOTE}
      </p>
    </div>
  );
}

// The RecoveryIntro panel already renders RECOVERY_STOP_NOTE as its safety
// footer, so a block whose adaptationNote is that same paragraph would repeat
// it verbatim — show it once.
function getBlockAdaptationNote(block: MobilityBlock) {
  if (block.recoveryIntro && block.adaptationNote === RECOVERY_STOP_NOTE) {
    return undefined;
  }
  return block.adaptationNote;
}

function BlockContext({
  previousDayReason,
  adaptationNote,
}: {
  previousDayReason?: string;
  adaptationNote?: string;
}) {
  return (
    <div className="grid gap-4 border-y border-rule py-4 md:grid-cols-2">
      {previousDayReason ? (
        <DetailCopy label="Previous-day reset" value={previousDayReason} />
      ) : null}
      {adaptationNote ? (
        <DetailCopy label="How to use this block" value={adaptationNote} />
      ) : null}
    </div>
  );
}

function MovementDetails({
  exercise,
  detailsId,
}: {
  exercise: MobilityExercise;
  detailsId: string;
}) {
  return (
    <div
      id={detailsId}
      className="mt-3 rounded-control border border-rule bg-sunken p-4"
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
        <div className="space-y-4">
          <DetailCopy label="Prescribed dose" value={exercise.dose} />
          {exercise.category ? <DetailCopy label="Category" value={exercise.category} /> : null}
          <DetailCopy label="Goal" value={exercise.goal} />
          {exercise.setup ? <DetailCopy label="Setup" value={exercise.setup} /> : null}
          {exercise.breathingCue ? <DetailCopy label="Breathing cue" value={exercise.breathingCue} /> : null}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <DetailCopy label="Completion target" value={exercise.completionTarget} />
            {exercise.painRule ? <DetailCopy label="Pain rule" value={exercise.painRule} /> : null}
            <IntensityBox exercise={exercise} />
          </div>
        </div>
        <div className="space-y-4">
          <NumberedSteps label="How to do it" items={exercise.howTo} />
          <DetailList label="Pointers" items={exercise.beginnerPointers} />
          <DetailList label="Common mistakes" items={exercise.commonMistakes} />
          <DetailList label="Scale down" items={exercise.scaleDown} />
          <DetailList label="Progression" items={exercise.progression} />
        </div>
      </div>
    </div>
  );
}

function IntensityBox({
  exercise,
}: {
  exercise: MobilityExercise;
}) {
  return (
    <div>
      <p className="text-label uppercase text-tertiary">Intensity</p>
      <div className="mt-2 grid gap-2">
        {[
          exercise.intensity.effort,
          exercise.intensity.pain,
          exercise.intensity.breathing,
          exercise.intensity.goal,
        ].map((item) => (
          <p
            key={item}
            className="rounded-control bg-raised px-2.5 py-1.5 text-caption text-secondary"
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function DetailCopy({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-label uppercase text-tertiary">{label}</p>
      <p className="mt-1 text-row text-secondary">{value}</p>
    </div>
  );
}

function NumberedSteps({
  label,
  items,
}: {
  label: string;
  items?: string[];
}) {
  if (!items?.length) {
    return null;
  }

  const rows = items.reduce<{
    stepNumber: number;
    rows: Array<{ item: string; isSectionLabel: boolean; stepNumber: number }>;
  }>(
    (acc, item) => {
      const isSectionLabel = item.startsWith("Part ");
      if (isSectionLabel) {
        return {
          stepNumber: acc.stepNumber,
          rows: [...acc.rows, { item, isSectionLabel, stepNumber: 0 }],
        };
      }

      const nextStepNumber = acc.stepNumber + 1;
      return {
        stepNumber: nextStepNumber,
        rows: [...acc.rows, { item, isSectionLabel, stepNumber: nextStepNumber }],
      };
    },
    { stepNumber: 0, rows: [] }
  ).rows;

  return (
    <div>
      <p className="text-label uppercase text-tertiary">{label}</p>
      <div className="mt-2 space-y-2">
        {rows.map((row) => {
          if (row.isSectionLabel) {
            return (
              <p key={row.item} className="pt-1 text-label uppercase text-primary">
                {row.item.replace(/:$/, "")}
              </p>
            );
          }

          return (
            <div key={`${row.stepNumber}-${row.item}`} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 text-row text-secondary">
              <span className="num mt-0.5 flex size-5 items-center justify-center rounded-pill border border-rule bg-sunken text-label text-primary">
                {row.stepNumber}
              </span>
              <p>{row.item}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailList({
  label,
  items,
}: {
  label: string;
  items?: string[];
}) {
  if (!items?.length) {
    return null;
  }

  return (
    <div>
      <p className="text-label uppercase text-tertiary">{label}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="grid grid-cols-[0.45rem_minmax(0,1fr)] gap-2 text-row text-secondary">
            <span className="mt-[0.65em] size-1 rounded-pill bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
