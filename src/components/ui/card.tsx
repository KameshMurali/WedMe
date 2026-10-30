import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  // Accepted so a caller can publish CSS custom properties on the card — the
  // template gallery gives each card that template's own tokens, which is how
  // sixteen cards wear sixteen palettes with no per-template CSS.
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("section-card p-6 sm:p-8", className)} style={style}>
      {children}
    </div>
  );
}
