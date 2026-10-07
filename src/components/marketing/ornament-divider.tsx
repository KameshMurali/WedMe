import { SelfDrawingKolam } from "@/components/public/kolam";
import { DrawnFigure } from "@/components/public/tradition-divider";
import { cn } from "@/lib/utils";

// Section divider for the marketing homepage.
//
// The product owns a set of hand-drawn ornaments that draw themselves stroke by
// stroke — and the homepage, which is where it sells sixteen culturally
// specific designs, showed none of them. It showed flat gradient colour bars.
//
// The tradition ROTATES between dividers rather than repeating one. The page
// copy says "Indian, South Asian, fusion, and Western" in as many words, so
// using a single tradition's ornament as brand furniture would pick a side the
// copy explicitly does not pick. Three dividers, three vocabularies, which is
// also just more interesting to scroll past.
//
// Each figure already renders COMPLETE under reduced motion rather than faster,
// so there is nothing to guard here.

export type OrnamentKind = "kolam" | "girih" | "chapel" | "lantern" | "desert";

export function OrnamentDivider({
  kind,
  className,
}: {
  kind: OrnamentKind;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("section-shell mt-20 flex items-center justify-center gap-6", className)}
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[color:var(--accent)]/30" />
      {kind === "kolam" ? (
        <SelfDrawingKolam className="h-24 w-24 flex-none sm:h-28 sm:w-28" />
      ) : (
        <DrawnFigure kind={kind} className="h-24 w-24 flex-none sm:h-28 sm:w-28" />
      )}
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[color:var(--accent)]/30" />
    </div>
  );
}
