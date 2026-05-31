import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("h-6 w-6 shrink-0", className)}
    >
      <rect x="9" y="9" width="46" height="46" rx="16" fill="currentColor" opacity="0.08" />
      <path d="M32 13L50 32L32 51L14 32L32 13Z" stroke="currentColor" strokeWidth="3.25" strokeLinejoin="round" />
      <path d="M32 20V44" stroke="currentColor" strokeWidth="3.25" strokeLinecap="round" />
      <path d="M22 32H42" stroke="currentColor" strokeWidth="3.25" strokeLinecap="round" />
      <circle cx="32" cy="32" r="4.25" fill="currentColor" />
    </svg>
  );
}
