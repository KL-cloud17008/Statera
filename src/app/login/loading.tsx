import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl rounded-[2rem] border border-border bg-background/60 p-3 backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[--radius-surface] bg-muted/30 p-8">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-10 w-64 max-w-full" />
            <Skeleton className="mt-3 h-4 w-full max-w-lg" />
          </div>
          <div className="p-6">
            <div className="flex flex-col items-center">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <Skeleton className="mt-4 h-7 w-48" />
              <Skeleton className="mt-2 h-4 w-56" />
            </div>
            <div className="mt-8 space-y-4">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
