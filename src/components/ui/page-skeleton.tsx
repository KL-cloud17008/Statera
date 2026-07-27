import { Skeleton } from "@/components/ui/skeleton";

/**
 * The loading shape of a ledger page: masthead, a summary strip of figures,
 * then a run of rows. It mirrors the real layout so the page does not jump
 * when content arrives.
 */
export function PageSkeleton() {
  return (
    <div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="ledger-section mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        ))}
      </div>

      <div className="ledger-section">
        <Skeleton className="h-3 w-28" />
        <div className="mt-4 space-y-px">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-row w-full rounded-none" />
          ))}
        </div>
      </div>
    </div>
  );
}
