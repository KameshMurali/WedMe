import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  // "dark" = dark text for light backgrounds (default). "light" = white text
  // for use on dark/gradient cards where the default would be unreadable.
  tone?: "dark" | "light";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {/* Badge's own bg-[color:var(--accent)]/10 + text-[color:var(--primary)]
          is dark-on-dark inside a tone="light" band. cn() runs twMerge, which
          reads the color: hints, so a className here replaces both conflicting
          classes rather than stacking with them. white/90 on the band's painted
          rgb(44,27,33) measures 13.1:1, and matches the white/80 the
          description below already uses. */}
      {eyebrow ? (
        <Badge className={tone === "light" ? "bg-white/15 text-white/90" : undefined}>{eyebrow}</Badge>
      ) : null}
      <h2
        className={cn(
          "mt-5 font-display text-4xl leading-tight sm:text-5xl",
          tone === "light" ? "text-white" : "text-[color:var(--text)]",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-base leading-8 sm:text-lg",
            tone === "light" ? "text-white/80" : "text-[color:var(--muted)]",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
