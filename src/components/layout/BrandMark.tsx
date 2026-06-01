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
      <rect x="10" y="10" width="44" height="44" rx="18" fill="currentColor" opacity="0.07" />
      <path d="M32 14.5L48.5 32L32 49.5L15.5 32L32 14.5Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M32 22V42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M23.5 32H40.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3.2" fill="currentColor" />
    </svg>
  );
}
