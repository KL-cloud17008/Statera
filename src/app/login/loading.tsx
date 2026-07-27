import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-panel border border-rule bg-raised p-6">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-4 h-10 w-56 max-w-full" />
        <Skeleton className="mt-3 h-4 w-full" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
