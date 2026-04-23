import { Badge } from "@/components/ui/badge";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? <Badge>{eyebrow}</Badge> : null}
      <h2 className="mt-5 font-display text-4xl leading-tight text-[color:var(--text)] sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-8 text-[color:var(--muted)] sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
