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
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
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
