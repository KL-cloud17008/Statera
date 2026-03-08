"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{title}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {allDone ? "Everything here is complete." : `${checkedCount} of ${totalCount} completed.`}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {allDone ? (
            <span className="inline-flex items-center gap-2 text-foreground/82">
              <Check className="h-4 w-4" />
              Complete
            </span>
          ) : (
            `${checkedCount}/${totalCount}`
          )}
        </div>
      </div>

      <div className="space-y-0 border-t border-border/70">
        {blocks.map((block, blockIndex) => (
          <section key={block.title} className="border-b border-border/60 py-6 last:border-b-0">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <h3 className="tracking-[-0.04em]">{block.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{block.duration}</p>
              </div>
            </div>

            <div className="mt-5 space-y-0 border-t border-border/60">
              {block.exercises.map((exercise, exerciseIndex) => {
                const key = `${blockIndex}-${exerciseIndex}`;
                const isDone = checked.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggle(key)}
                    className={`grid w-full gap-2 border-b border-border/50 py-4 text-left last:border-b-0 ${isDone ? "opacity-55" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox checked={isDone} className="mt-1 shrink-0" tabIndex={-1} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold tracking-[-0.02em] ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {exercise.name}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {exercise.dose}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {exercise.cues}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
