// Per-template decorative motifs, drawn as original SVG.
//
// These are ORNAMENT, not iconography. Each one is an abstract geometric or
// floral pattern drawn from a tradition's decorative art — kolam lattices,
// arabesque tessellation, marigold garlands — deliberately NOT sacred symbols
// (no Om, cross, crescent or 囍). Sacred marks used as page furniture read as
// careless to the people they belong to, and a guest looking for the venue
// address is not helped by them either.
//
// Everything here is tiled, low-contrast and decorative, so it is marked
// aria-hidden and never carries meaning a screen reader would need.

type MotifProps = { className?: string };

// Deliberately no viewBox on these SVGs. A viewBox scales the whole drawing to
// the container, which stretched the 40px pattern tiles into huge blobs across
// a full-width hero. Without one, patternUnits="userSpaceOnUse" tiles at true
// pixel size at any container width, so the motif stays a fine texture.

// South Indian: kolam / rangoli — a dot lattice joined by looping curves.
function KolamMotif({ className }: MotifProps) {
  return (
    <svg className={className} width="100%" height="100%" fill="none" aria-hidden="true">
      <defs>
        <pattern id="kolam" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1.6" fill="currentColor" />
          <circle cx="0" cy="0" r="1.6" fill="currentColor" />
          <circle cx="40" cy="0" r="1.6" fill="currentColor" />
          <circle cx="0" cy="40" r="1.6" fill="currentColor" />
          <circle cx="40" cy="40" r="1.6" fill="currentColor" />
          <path
            d="M20 4 C30 10 30 30 20 36 C10 30 10 10 20 4 Z"
            stroke="currentColor"
            strokeWidth="0.9"
            fill="none"
          />
          <path
            d="M4 20 C10 10 30 10 36 20 C30 30 10 30 4 20 Z"
            stroke="currentColor"
            strokeWidth="0.9"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kolam)" />
    </svg>
  );
}

// North Indian: marigold garland — strung blooms, the genda phool of a shaadi.
function MarigoldMotif({ className }: MotifProps) {
  return (
    <svg className={className} width="100%" height="100%" fill="none" aria-hidden="true">
      <defs>
        <pattern id="marigold" width="30" height="30" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="0.8" fill="none">
            <circle cx="15" cy="15" r="6" />
            <circle cx="15" cy="15" r="3.2" />
            {[0, 45, 90, 135].map((angle) => (
              <line
                key={angle}
                x1={15 - 6 * Math.cos((angle * Math.PI) / 180)}
                y1={15 - 6 * Math.sin((angle * Math.PI) / 180)}
                x2={15 + 6 * Math.cos((angle * Math.PI) / 180)}
                y2={15 + 6 * Math.sin((angle * Math.PI) / 180)}
              />
            ))}
            <path d="M0 15 H9 M21 15 H30" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#marigold)" />
    </svg>
  );
}

// Islamic: girih-style eight-point tessellation — pure geometry, no figuration.
function ArabesqueMotif({ className }: MotifProps) {
  return (
    <svg className={className} width="100%" height="100%" fill="none" aria-hidden="true">
      <defs>
        <pattern id="arabesque" width="40" height="40" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="0.9" fill="none">
            <rect x="8" y="8" width="24" height="24" transform="rotate(45 20 20)" />
            <rect x="8" y="8" width="24" height="24" />
            <circle cx="20" cy="20" r="5" />
            <path d="M0 0 L8 8 M40 0 L32 8 M0 40 L8 32 M40 40 L32 32" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#arabesque)" />
    </svg>
  );
}

// Christian: chapel tracery — pointed arches and trefoils from window stonework.
function TraceryMotif({ className }: MotifProps) {
  return (
    <svg className={className} width="100%" height="100%" fill="none" aria-hidden="true">
      <defs>
        <pattern id="tracery" width="40" height="48" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="0.9" fill="none">
            <path d="M20 44 V22 C20 12 12 10 12 20 M20 22 C20 12 28 10 28 20" />
            <path d="M8 44 C8 26 20 18 20 18 C20 18 32 26 32 44" />
            <circle cx="20" cy="12" r="3.4" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#tracery)" />
    </svg>
  );
}

// Chinese: interlocking lattice, after window screens and the endless knot.
function LatticeMotif({ className }: MotifProps) {
  return (
    <svg className={className} width="100%" height="100%" fill="none" aria-hidden="true">
      <defs>
        <pattern id="lattice" width="32" height="32" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <path d="M4 4 H28 V28 H4 Z" />
            <path d="M12 4 V12 H4 M28 12 H20 V4 M4 20 H12 V28 M20 28 V20 H28" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lattice)" />
    </svg>
  );
}

// Arabic / Khaleeji: repeating pointed arcade, after mashrabiya screens.
function ArcadeMotif({ className }: MotifProps) {
  return (
    <svg className={className} width="100%" height="100%" fill="none" aria-hidden="true">
      <defs>
        <pattern id="arcade" width="36" height="36" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="0.9" fill="none">
            <path d="M4 32 V20 C4 10 18 4 18 4 C18 4 32 10 32 20 V32" />
            <path d="M11 32 V22 C11 16 18 13 18 13 C18 13 25 16 25 22 V32" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#arcade)" />
    </svg>
  );
}

const motifsByTemplate: Record<string, (props: MotifProps) => React.ReactElement> = {
  "temple-gold": KolamMotif,
  "marigold-festive": MarigoldMotif,
  "emerald-pearl": ArabesqueMotif,
  "chapel-ivory": TraceryMotif,
  "crimson-gold": LatticeMotif,
  "desert-neutral": ArcadeMotif,
};

// Returns null for the five original templates, which were designed without
// ornament and shouldn't gain any retroactively.
export function TemplateMotif({
  templateKey,
  className,
}: {
  templateKey: string;
  className?: string;
}) {
  const Motif = motifsByTemplate[templateKey];
  if (!Motif) return null;
  return <Motif className={className} />;
}

export function hasMotif(templateKey: string): boolean {
  return templateKey in motifsByTemplate;
}
