import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return <div role="status" aria-label="Loading page" className="space-y-8">
    <span className="sr-only">Loading…</span>
    <Skeleton className="h-9 w-48" />
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">{Array.from({length:4},(_,index)=><div key={index} className="space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-28" /></div>)}</div>
    <div className="space-y-3">{Array.from({length:6},(_,index)=><Skeleton key={index} className="h-12 w-full" />)}</div>
  </div>;
}
