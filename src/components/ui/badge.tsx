import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[color:var(--accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
