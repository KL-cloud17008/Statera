"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import type { MobilityBlock } from "@/lib/mobility";

export function MobilityChecklist({
  blocks,
  title,
}: {
  blocks: MobilityBlock[];
  title: string;
}) {
  const allExercises = blocks.flatMap((block) => block.exercises);
  const [checked, setChecked] = useState<Set<string>>(new Set());

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

  return (
    <div className="space-y-6">
      <div className="warm-row rounded-[var(--radius-card)] p-5">
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
          <section key={block.title} className="grid gap-5 border-t border-border pt-6 first:border-t-0 first:pt-0 lg:grid-cols-[15rem_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow text-[10px]">Block {blockIndex + 1}</p>
              <h3 className="mt-2 tracking-normal">{block.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{block.duration}</p>
            </div>

            <div className="space-y-3">
              {block.exercises.map((exercise, exerciseIndex) => {
                const key = `${blockIndex}-${exerciseIndex}`;
                const isDone = checked.has(key);
                return (
                  <div
                    key={key}
                    className={`interactive-row grid w-full gap-2 rounded-[var(--radius-card)] border px-4 py-4 text-left ${isDone ? "completed-row" : "bg-[color-mix(in_srgb,var(--cream-paper)_58%,var(--bone)_42%)]"}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isDone}
                        onCheckedChange={() => toggle(key)}
                        className="mt-1 shrink-0"
                      />
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--ember)_48%,transparent),0_0_0_5px_var(--ring)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <p className={`text-sm font-semibold tracking-normal ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                            {exercise.name}
                          </p>
                          <p className="rounded-full border border-border bg-[color-mix(in_srgb,var(--cream-paper)_64%,transparent)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            {exercise.dose}
                          </p>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {exercise.cues}
                        </p>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
