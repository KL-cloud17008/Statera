"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logPainCheckIn, type SerializedPainCheckIn } from "@/actions/pain";
import { FOOT_LOAD_RULES } from "@/lib/default-workout-plan";
import { getTodayDateString } from "@/lib/dates";
import { cn } from "@/lib/utils";

const PAIN_VALUES = Array.from({ length: 11 }, (_, value) => value);

function footGuidance(footPain: number) {
  if (footPain >= 5) {
    return FOOT_LOAD_RULES[2];
  }
  if (footPain >= 3) {
    return FOOT_LOAD_RULES[1];
  }
  return FOOT_LOAD_RULES[0];
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
  const [showBack, setShowBack] = useState(loggedToday && latest.lowerBackPain != null);
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
    <div className={cn("micro-panel rounded-[var(--radius-card)] p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-[10px]">Foot pain check-in</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Soles / feet, 0-10. One tap logs today.
          </p>
        </div>
        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Foot pain 0 to 10">
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
            "mt-3 text-xs leading-relaxed",
            footValue >= 3 ? "text-[var(--attention)]" : "text-muted-foreground"
          )}
        >
          {footGuidance(footValue)}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setShowBack((current) => !current)}
        className="text-link mt-3 text-xs font-semibold"
      >
        {showBack ? "- lower back" : "+ lower back (optional)"}
      </button>

      {showBack ? (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lower-back pain 0 to 10">
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
            <p className="mt-2 text-xs text-muted-foreground">Log feet first, then lower back.</p>
          ) : null}
        </div>
      ) : null}

      <p
        className={cn(
          "mt-3 border-t border-border/70 pt-3 text-xs leading-relaxed",
          latest && !loggedToday ? "font-semibold text-foreground" : "text-muted-foreground"
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
        "data-number flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--basalt-0),0_0_0_4px_var(--ring)] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none",
        selected
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-[var(--hairline)] bg-[rgba(240,232,220,0.04)] text-[var(--cream-2)] hover:border-[var(--hairline-strong)] hover:text-[var(--cream)]"
      )}
    >
      {value}
    </button>
  );
}
