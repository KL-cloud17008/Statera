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
    <div className="space-y-6">
      <div className="micro-panel rounded-[var(--radius-card)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{title}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {allDone ? "Everything here is complete." : `${checkedCount} of ${totalCount} completed.`}
            </p>
          </div>
          <div className="text-sm font-semibold text-muted-foreground">
            {allDone ? (
              <span className="inline-flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4" />
                Complete
              </span>
            ) : (
              `${progress}%`
            )}
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
      </div>

      <div className="space-y-6">
        {blocks.map((block, blockIndex) => (
          <section key={block.title} className="grid gap-5 border-t border-border pt-6 first:border-t-0 first:pt-0 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow text-[10px]">Block {blockIndex + 1}</p>
              <h3 className="mt-2 tracking-normal">{block.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{block.duration}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{block.purpose}</p>
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

              <div className="space-y-3">
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
                      className={cn(
                        "interactive-row grid w-full gap-3 rounded-[var(--radius-card)] border px-4 py-4 text-left",
                        isDone ? "completed-row" : "bg-[var(--basalt-2)]"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isDone}
                          onCheckedChange={() => toggle(key)}
                          className="mt-1 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
                            <button
                              type="button"
                              onClick={() => toggle(key)}
                              className="w-full min-w-0 text-left focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--basalt-0),0_0_0_4px_var(--ring)] sm:flex-1"
                            >
                              <p className={cn("text-sm font-semibold tracking-normal", isDone ? "text-muted-foreground line-through" : "text-foreground")}>
                                {exercise.name}
                              </p>
                              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {exercise.cues}
                              </p>
                            </button>

                            <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:shrink-0 sm:flex-col sm:items-end sm:justify-start">
                              <p
                                title={exercise.dose}
                                className="whitespace-nowrap rounded-full border border-[var(--hairline)] bg-[var(--veil-1)] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--cream-3)]"
                              >
                                {compactDose(exercise.dose)}
                              </p>
                              {hasDetails ? (
                                <button
                                  type="button"
                                  aria-expanded={isExpanded}
                                  aria-controls={detailsId}
                                  onClick={() => toggleExpanded(key)}
                                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--veil-1)] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--cream-3)] transition-[background-color,border-color,color,box-shadow] duration-[var(--duration-fast)] hover:border-[var(--hairline-strong)] hover:text-[var(--cream)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--basalt-0),0_0_0_4px_var(--ring)] motion-reduce:transition-none"
                                >
                                  <span>How to do it</span>
                                  <ChevronDown
                                    className={cn(
                                      "h-3.5 w-3.5 transition-transform duration-150 motion-reduce:transition-none",
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
    <div className="micro-panel overflow-hidden rounded-[var(--radius-card)] p-0">
      <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.72fr)]">
        <div>
          <p className="eyebrow text-[10px]">Recovery intensity</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isFootFlare ? FOOT_FLARE_RECOVERY_INTRO : RECOVERY_INTRO}
          </p>
          {isFootFlare ? (
            <p className="mt-3 text-sm font-semibold leading-relaxed text-foreground">
              {FOOT_FLARE_RECOVERY_NOT_WORKOUT}
            </p>
          ) : null}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {rules.map((rule) => (
            <p
              key={rule}
              className="rounded-[var(--radius-tight)] border border-[var(--hairline)] bg-[var(--veil-1)] px-3 py-2 text-xs font-semibold text-foreground"
            >
              {rule}
            </p>
          ))}
        </div>
      </div>
      <p className="border-t border-border/70 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">Safety note: </span>
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
    <div className="grid gap-3 rounded-[var(--radius-card)] border border-[var(--hairline)] bg-[var(--basalt-2)] p-5 md:grid-cols-2">
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
      className="mt-4 rounded-[var(--radius-tight)] border border-[var(--hairline)] bg-[var(--basalt-1)] p-4"
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
      <p className="eyebrow text-[10px]">Intensity</p>
      <div className="mt-2 grid gap-2">
        {[
          exercise.intensity.effort,
          exercise.intensity.pain,
          exercise.intensity.breathing,
          exercise.intensity.goal,
        ].map((item) => (
          <p
            key={item}
            className="rounded-[var(--radius-tight)] border border-[var(--hairline)] bg-[var(--veil-1)] px-3 py-2 text-xs font-semibold leading-relaxed text-foreground"
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
      <p className="eyebrow text-[10px]">{label}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value}</p>
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
      <p className="eyebrow text-[10px]">{label}</p>
      <div className="mt-2 space-y-2">
        {rows.map((row) => {
          if (row.isSectionLabel) {
            return (
              <p key={row.item} className="pt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">
                {row.item.replace(/:$/, "")}
              </p>
            );
          }

          return (
            <div key={`${row.stepNumber}-${row.item}`} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 text-sm leading-relaxed text-muted-foreground">
              <span className="data-number mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--hairline)] bg-[var(--veil-2)] text-[11px] text-foreground">
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
      <p className="eyebrow text-[10px]">{label}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className="grid grid-cols-[0.45rem_minmax(0,1fr)] gap-2 text-sm leading-relaxed text-muted-foreground">
            <span className="mt-[0.65em] h-1 w-1 rounded-full bg-[var(--cream-3)]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
