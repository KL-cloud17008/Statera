import { SESSION_PREP_ITEMS } from "@/lib/training-session";

/**
 * The non-loggable arrival protocol. It deliberately carries no Weight/Reps/RPE
 * columns — that is what separates prep from the working-set ledger — so it
 * renders as plain captioned items rather than as ledger rows.
 *
 * Shared by the session logger, the day preview, and the full plan; the copy
 * differs by context and is supplied by the caller.
 */
export function SessionPrepStrip({ note }: { note: string }) {
  return (
    <>
      <p className="text-body text-secondary">{note}</p>
      <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-4">
        {SESSION_PREP_ITEMS.map((item) => (
          <div key={item.label} className="border-t border-rule pt-3">
            <p className="text-row font-medium text-primary">{item.label}</p>
            <p className="mt-1 text-caption text-tertiary">{item.detail}</p>
          </div>
        ))}
      </div>
    </>
  );
}
