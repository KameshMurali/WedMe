import { cn } from "@/lib/utils";

// Shimmering placeholder block. Compose several to mirror a real layout so
// route transitions feel instant instead of frozen.
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-2xl bg-[color:var(--primary)]/8",
        className,
      )}
    />
  );
}
