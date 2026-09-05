"use client";

import { motion, useReducedMotion } from "motion/react";

// Ornament for the Islamic template (Nikah / Walima).
//
// Purely geometric and vegetal, never figurative — that is the tradition's own
// convention, not a limitation worked around. No calligraphy either: rendering
// sacred text as decoration is exactly the misuse the earlier motifs work
// avoided.
//
// Vocabulary: girih star tessellation, a pointed two-centred arch, and the
// mosque lamp (qandil) that hangs in the mihrab.

// Ten-point girih star built from two overlaid pentagon-derived rosettes.
function starPoints(cx: number, cy: number, outer: number, inner: number, points: number) {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    coords.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return coords.join(" ");
}

export function GirihScreen({ className }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" fill="none" aria-hidden="true">
      <defs>
        <pattern id="girih" width="60" height="60" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <polygon points={starPoints(30, 30, 26, 11, 10)} />
            <polygon points={starPoints(30, 30, 14, 6, 10)} />
            <path d="M0 0 L12 12 M60 0 L48 12 M0 60 L12 48 M60 60 L48 48" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#girih)" />
    </svg>
  );
}

// Two-centred pointed arch — the mihrab profile.
export function PointedArch({ className }: { className?: string }) {
  const outer =
    "M20 300 L20 190 C20 96 66 30 150 12 C234 30 280 96 280 190 L280 300";
  const inner =
    "M46 300 L46 194 C46 116 84 62 150 46 C216 62 254 116 254 194 L254 300";

  return (
    <svg className={className} viewBox="0 0 300 310" fill="none" aria-hidden="true">
      <path d={`${outer} Z`} fill="currentColor" fillOpacity="0.09" />
      <path d={outer} stroke="currentColor" strokeOpacity="0.55" strokeWidth="3" fill="none" />
      <path d={inner} stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.6" fill="none" />
      {/* Rosette in the spandrel head */}
      <polygon
        points={starPoints(150, 120, 26, 11, 8)}
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1.4"
        fill="none"
      />
      {/* Impost blocks where the arch springs */}
      <rect x="12" y="186" width="20" height="8" rx="2" fill="currentColor" fillOpacity="0.45" />
      <rect x="268" y="186" width="20" height="8" rx="2" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}

// Qandil: the mosque lamp on its chain. Glows rather than swings — these hang
// still in a mihrab, and a swaying one would read as a party lantern.
export function MosqueLamp({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <svg className={className} viewBox="0 0 100 190" fill="none" aria-hidden="true">
      <path d="M50 0 V38" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" />
      <path d="M26 46 H74" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2.5" />
      {/* Body: waisted, flaring to a wide mouth */}
      <path
        d="M32 46 C32 74 20 92 20 116 C20 140 36 152 50 152 C64 152 80 140 80 116 C80 92 68 74 68 46 Z"
        fill="currentColor"
        fillOpacity="0.22"
      />
      <path
        d="M32 46 C32 74 20 92 20 116 C20 140 36 152 50 152 C64 152 80 140 80 116 C80 92 68 74 68 46"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="2"
        fill="none"
      />
      {/* Pierced band */}
      {[36, 50, 64].map((cx) => (
        <circle key={cx} cx={cx} cy={112} r="4" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.3" fill="none" />
      ))}
      {/* The flame inside, breathing slowly */}
      <motion.ellipse
        cx="50"
        cy="126"
        rx="7"
        ry="10"
        fill="currentColor"
        initial={reduceMotion ? { fillOpacity: 0.5 } : { fillOpacity: 0.28 }}
        animate={reduceMotion ? undefined : { fillOpacity: [0.28, 0.68, 0.28] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay }}
      />
      <circle cx="50" cy="160" r="4" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
}

export function GirihFrame() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <div className="absolute inset-y-0 left-0 hidden w-28 text-[color:var(--primary)] opacity-[0.16] lg:block xl:w-36">
        <GirihScreen className="h-full w-full" />
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-28 text-[color:var(--primary)] opacity-[0.16] lg:block xl:w-36">
        <GirihScreen className="h-full w-full" />
      </div>
    </div>
  );
}

export function GirihHeroArch() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <MosqueLamp className="absolute left-[8%] top-0 hidden h-44 text-[color:var(--accent)] opacity-80 sm:block lg:left-[14%]" />
      <MosqueLamp
        delay={1.4}
        className="absolute right-[8%] top-0 hidden h-44 text-[color:var(--accent)] opacity-80 sm:block lg:right-[14%]"
      />
      <PointedArch className="absolute left-1/2 top-4 h-[21rem] w-full max-w-4xl -translate-x-1/2 text-[color:var(--primary)] opacity-45 sm:top-6 sm:h-[32rem] sm:opacity-60" />
    </div>
  );
}
