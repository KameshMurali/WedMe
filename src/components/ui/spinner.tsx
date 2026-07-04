import { cn } from "@/lib/utils";

// Branded spinner for inline "loading…" states.
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-[color:var(--primary)]/25 border-t-[color:var(--primary)]",
        className,
      )}
    />
  );
}
