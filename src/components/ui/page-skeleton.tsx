import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="page-shell">
      <div className="page-hero">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-64 max-w-full" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-[1.5rem]" />
          ))}
        </div>
        <Skeleton className="h-[23rem] rounded-[1.75rem]" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Skeleton className="h-[20rem] rounded-[1.5rem]" />
        <div className="grid gap-4">
          <Skeleton className="h-44 rounded-[1.5rem]" />
          <Skeleton className="h-56 rounded-[1.5rem]" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-[1.35rem]" />
        ))}
      </div>
    </div>
  );
}
