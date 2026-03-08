import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="editorial-panel w-full max-w-5xl p-3 sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="page-hero min-h-[28rem] p-8">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-11 w-72 max-w-full" />
            <Skeleton className="mt-3 h-4 w-full max-w-xl" />
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-24 rounded-[1.25rem]" />
              <Skeleton className="h-24 rounded-[1.25rem]" />
              <Skeleton className="h-24 rounded-[1.25rem]" />
            </div>
          </div>
          <div className="editorial-panel-quiet p-6 sm:p-7">
            <Skeleton className="mx-auto h-14 w-14 rounded-[1.2rem]" />
            <Skeleton className="mx-auto mt-5 h-4 w-28" />
            <Skeleton className="mx-auto mt-3 h-10 w-52 max-w-full" />
            <Skeleton className="mx-auto mt-3 h-4 w-full max-w-sm" />
            <div className="mt-8 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
