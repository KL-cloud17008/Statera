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
      <path d="M32 7.5L51.5 20.75V43.25L32 56.5L12.5 43.25V20.75L32 7.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M32 15.5L44 32L32 48.5L20 32L32 15.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M20 32H44" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M32 15.5V48.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="32" cy="32" r="2.8" fill="currentColor" />
    </svg>
  );
}
