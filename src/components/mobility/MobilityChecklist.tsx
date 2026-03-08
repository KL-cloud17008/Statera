"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <Badge variant={allDone ? "default" : "secondary"} className={`text-xs ${allDone ? "bg-green-500/20 text-green-400" : ""}`}>
          {allDone ? (
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" /> Done
            </span>
          ) : (
            `${checkedCount}/${totalCount}`
          )}
        </Badge>
      </div>

      {blocks.map((block, blockIndex) => (
        <Card key={block.title}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {block.title}
              </CardTitle>
              <span className="text-[10px] text-muted-foreground">{block.duration}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {block.exercises.map((exercise, exerciseIndex) => {
              const key = `${blockIndex}-${exerciseIndex}`;
              const isDone = checked.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggle(key)}
                  className={`flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors ${isDone ? "bg-green-500/10 opacity-60" : "hover:bg-muted/50 active:bg-muted"}`}
                >
                  <Checkbox checked={isDone} className="mt-0.5 shrink-0" tabIndex={-1} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {exercise.name}
                    </p>
                    <p className="font-medium text-primary/80 text-xs">{exercise.dose}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{exercise.cues}</p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
