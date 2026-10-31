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
  image,
}: {
  kind: OrnamentKind;
  className?: string;
  // A full-bleed photograph behind the ornament, for the two seams in the long
  // ink run at the bottom of the homepage. Those were a hairline and a drawn
  // figure floating in 2,700px of unbroken ground; the photograph makes each
  // one a breather instead of a rule. Omit it and the divider is exactly what
  // it always was.
  image?: string;
}) {
  if (image) {
    return (
      <div aria-hidden="true" className={cn("breather relative mt-20 overflow-hidden", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a static asset
            of known size, far below the fold and lazy. */}
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          width={1760}
          height={754}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* The band has to END in the page's ground at both edges or it reads
            as a pasted-in rectangle. The scrim darkens the middle enough for
            the gold ornament to hold its own over lantern light. */}
        <div className="breather-scrim absolute inset-0" />
        <div className="relative flex h-full items-center justify-center">
          {kind === "kolam" ? (
            <SelfDrawingKolam className="h-24 w-24 flex-none sm:h-28 sm:w-28" />
          ) : (
            <DrawnFigure kind={kind} className="h-24 w-24 flex-none sm:h-28 sm:w-28" />
          )}
        </div>
      </div>
    );
  }

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
