"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logPainCheckIn, type SerializedPainCheckIn } from "@/actions/pain";
import { BACK_PAIN_RULES, FOOT_LOAD_RULES } from "@/lib/default-workout-plan";
import { getTodayDateString } from "@/lib/dates";
import { cn } from "@/lib/utils";

const PAIN_VALUES = Array.from({ length: 11 }, (_, value) => value);

const BACK_REMOVE_RULE =
  "If lower back rises above 3/10, remove back hyperextensions and overhead press first.";
const BACK_RED_FLAG = BACK_PAIN_RULES[5];

function footGuidance(footPain: number) {
  if (footPain >= 5) {
    return FOOT_LOAD_RULES[2];
  }
  if (footPain >= 3) {
    return FOOT_LOAD_RULES[1];
  }
  return FOOT_LOAD_RULES[0];
}

function backGuidance(backPain: number) {
  if (backPain >= 5) {
    return `${BACK_PAIN_RULES[2]} ${BACK_REMOVE_RULE}`;
  }
  if (backPain >= 3) {
    return BACK_REMOVE_RULE;
  }
  return BACK_PAIN_RULES[0];
}

function formatCheckInDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function PainCheckInCard({
  latest,
  timezone,
  className,
}: {
  latest: SerializedPainCheckIn | null;
  timezone?: string;
  className?: string;
}) {
  const router = useRouter();
  const today = getTodayDateString(timezone);
  const loggedToday = latest?.date === today;
  const [footValue, setFootValue] = useState<number | null>(loggedToday ? latest.footPain : null);
  const [backValue, setBackValue] = useState<number | null>(
    loggedToday ? (latest.lowerBackPain ?? null) : null
  );
  const [isPending, startTransition] = useTransition();

  function save(nextFoot: number, nextBack: number | null) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("footPain", String(nextFoot));
      if (nextBack != null) {
        formData.set("lowerBackPain", String(nextBack));
      }

      const result = await logPainCheckIn(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      router.refresh();
    });
  }

  function handleFootTap(value: number) {
    setFootValue(value);
    save(value, backValue);
  }

  function handleBackTap(value: number) {
    if (footValue == null) {
      return;
    }
    setBackValue(value);
    save(footValue, value);
  }

  return (
    <div className={cn("", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-label uppercase text-tertiary">Pain check-in</p>
          <p className="mt-1 text-caption text-tertiary">
            Feet / soles and lower back, 0-10. One tap logs today.
          </p>
        </div>
        {isPending ? <Loader2 className="size-4 animate-spin text-tertiary" aria-label="Saving" /> : null}
      </div>

      <p className="mt-3 text-label uppercase text-tertiary">
        Feet / soles
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label="Foot pain 0 to 10">
        {PAIN_VALUES.map((value) => (
          <PainChip
            key={value}
            value={value}
            selected={footValue === value}
            disabled={isPending}
            onSelect={handleFootTap}
            ariaLabel={`Log foot pain ${value} of 10`}
          />
        ))}
      </div>

      {footValue != null ? (
        <p
          className={cn(
            "mt-2 text-caption",
            footValue >= 3 ? "text-ember" : "text-tertiary"
          )}
        >
          {footGuidance(footValue)}
        </p>
      ) : null}

      <p className="mt-4 text-label uppercase text-tertiary">
        Lower back
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label="Lower-back pain 0 to 10">
        {PAIN_VALUES.map((value) => (
          <PainChip
            key={value}
            value={value}
            selected={backValue === value}
            disabled={isPending || footValue == null}
            onSelect={handleBackTap}
            ariaLabel={`Log lower-back pain ${value} of 10`}
          />
        ))}
      </div>
      {footValue == null ? (
        <p className="mt-2 text-caption text-tertiary">Log feet first, then lower back.</p>
      ) : null}

      {backValue != null ? (
        <>
          <p
            className={cn(
              "mt-2 text-caption",
              backValue >= 3 ? "text-ember" : "text-tertiary"
            )}
          >
            {backGuidance(backValue)}
          </p>
          {backValue >= 3 ? (
            <p className="mt-1.5 text-caption text-tertiary">{BACK_RED_FLAG}</p>
          ) : null}
        </>
      ) : null}

      <p
        className={cn(
          "mt-3 border-t border-rule pt-3 text-caption",
          latest && !loggedToday ? "font-medium text-primary" : "text-tertiary"
        )}
      >
        {latest
          ? `Last logged ${formatCheckInDate(latest.date)}${loggedToday ? " (today)" : ""} — feet ${latest.footPain}/10${
              latest.lowerBackPain != null ? `, lower back ${latest.lowerBackPain}/10` : ""
            }${!loggedToday ? ". No check-in yet today." : ""}`
          : "No pain check-in logged yet."}
      </p>
    </div>
  );
}

function PainChip({
  value,
  selected,
  disabled,
  onSelect,
  ariaLabel,
}: {
  value: number;
  selected: boolean;
  disabled: boolean;
  onSelect: (value: number) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(value)}
      className={cn(
        /* Centred by the flex box, so `.num` supplies figure style only. */
        "num flex size-touch items-center justify-center rounded-control border text-row font-medium",
        "transition-colors duration-(--duration-fast) ease-(--ease-out) motion-reduce:transition-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:cursor-not-allowed disabled:opacity-45",
        selected
          ? "border-transparent bg-ink text-on-ink"
          /* Control edge, not a rule: --rule reads 1.30:1 here and fails the
             3:1 the boundary needs. */
          : "border-control-border bg-raised text-secondary hover:bg-row-hover hover:text-primary"
      )}
    >
      {value}
    </button>
  );
}
