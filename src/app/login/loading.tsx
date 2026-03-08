import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Skeleton className="h-[420px] w-full max-w-sm rounded-2xl" />
    </div>
  );
}
