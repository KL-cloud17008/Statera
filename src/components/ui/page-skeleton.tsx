import { Skeleton } from "@/components/ui/skeleton";

/**
 * The loading shape of a ledger page: masthead, a summary strip of figures,
 * then a run of rows. It mirrors the real layout so the page does not jump
 * when content arrives.
 */
export function PageSkeleton() {
  return (
    <div>
      <div className="grid gap-5 border-t-4 border-ink pt-5 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8">
        <Skeleton className="h-3 w-24" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      </div>

      <div className="mt-10 grid gap-4 border-t border-rule-strong pt-4 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8">
        <Skeleton className="h-3 w-24" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2 border-l-2 border-rule-strong pl-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-20" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-4 border-t border-rule-strong pt-4 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8">
        <Skeleton className="h-3 w-28" />
        <div className="space-y-px">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-row w-full rounded-none" />
          ))}
        </div>
      </div>
    </div>
  );
}
