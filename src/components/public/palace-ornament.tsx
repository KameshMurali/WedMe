"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

// Ornament for the North Indian template.
//
// Deliberately a DIFFERENT visual language from the South Indian set, not the
// same shapes recoloured. That one is temple architecture: stepped gopuram
// towers, banana leaves, kolam, terracotta and temple teal. This one is palace
// architecture: cusped Mughal arches, pierced jaali screens, hanging jhoomar
// lamps, caparisoned elephants, magenta and gold with a slow sheen.
//
// All original SVG — no traced artwork, no third-party assets.

/**
 * A cusped (multifoil) arch — the single most recognisable North Indian palace
 * form. Lobes bulge INTO the opening, which is what separates it from a plain
 * scalloped curve.
 */
function cuspedArchPath(cusps: number, cx: number, baseY: number, rx: number, ry: number) {
  const points: Array<[number, number]> = [];
  for (let i = 0; i <= cusps; i++) {
    const t = Math.PI - (Math.PI * i) / cusps;
    points.push([cx + rx * Math.cos(t), baseY - ry * Math.sin(t)]);
  }
  // Lobe radius scaled from the arc length between cusps.
  const r = (Math.PI * rx) / cusps / 1.6;
  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 1; i <= cusps; i++) {
    // sweep-flag 0 turns the lobes inward, toward the centre of the opening.
    d += ` A${r.toFixed(1)} ${r.toFixed(1)} 0 0 0 ${points[i][0].toFixed(1)} ${points[i][1].toFixed(1)}`;
  }
  return d;
}

export function MughalArch({ className }: { className?: string }) {
  const outer = cuspedArchPath(9, 150, 300, 140, 210);
  const inner = cuspedArchPath(9, 150, 300, 116, 176);

  return (
    <svg className={className} viewBox="0 0 300 320" fill="none" aria-hidden="true">
      {/* Spandrel fill between the two arches */}
      <path d={`${outer} L266 300 L266 320 L34 320 L34 300 Z`} fill="currentColor" fillOpacity="0.1" />
      <path d={outer} stroke="currentColor" strokeOpacity="0.55" strokeWidth="3" fill="none" />
      <path d={inner} stroke="currentColor" strokeOpacity="0.34" strokeWidth="1.8" fill="none" />

      {/* Springing brackets and a finial at the crown */}
      <rect x="24" y="292" width="24" height="10" rx="3" fill="currentColor" fillOpacity="0.45" />
      <rect x="252" y="292" width="24" height="10" rx="3" fill="currentColor" fillOpacity="0.45" />
      <g fill="currentColor" fillOpacity="0.5">
        <ellipse cx="150" cy="80" rx="5" ry="6.5" />
        <rect x="148.6" y="62" width="2.8" height="14" rx="1.4" />
      </g>
    </svg>
  );
}

// Pierced marble jaali: an eight-point star lattice, tiled at true pixel size.
export function JaaliScreen({ className }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" fill="none" aria-hidden="true">
      <defs>
        <pattern id="jaali" width="44" height="44" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="1.1" fill="none">
            <rect x="8" y="8" width="28" height="28" />
            <rect x="8" y="8" width="28" height="28" transform="rotate(45 22 22)" />
            <circle cx="22" cy="22" r="5.5" />
            <path d="M0 22 H8 M36 22 H44 M22 0 V8 M22 36 V44" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#jaali)" />
    </svg>
  );
}

// Jhoomar: the hanging lamp over a haveli courtyard. Sways from its chain.
export function Jhoomar({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();
  const drops = [-42, -28, -14, 0, 14, 28, 42];

  return (
    <motion.svg
      className={className}
      viewBox="0 0 120 200"
      fill="none"
      aria-hidden="true"
      style={{ transformOrigin: "60px 0px" }}
      initial={reduceMotion ? false : { rotate: -2 }}
      animate={reduceMotion ? undefined : { rotate: [-2, 2, -2] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {/* Chain */}
      <path d="M60 0 V44" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2" />
      {[12, 24, 36].map((cy) => (
        <circle key={cy} cx="60" cy={cy} r="3" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.4" fill="none" />
      ))}

      {/* Domed body */}
      <path d="M28 92 C28 64 42 48 60 48 C78 48 92 64 92 92 Z" fill="currentColor" fillOpacity="0.34" />
      <path d="M24 92 H96" stroke="currentColor" strokeOpacity="0.5" strokeWidth="3" />
      <ellipse cx="60" cy="46" rx="5" ry="6" fill="currentColor" fillOpacity="0.5" />

      {/* Fringe of hanging drops */}
      {drops.map((dx) => {
        const x = 60 + dx;
        const len = 108 + (1 - Math.abs(dx) / 46) * 26;
        return (
          <g key={dx}>
            <path d={`M${x} 94 V${len}`} stroke="currentColor" strokeOpacity="0.34" strokeWidth="1.2" />
            <circle cx={x} cy={len + 4} r="3.4" fill="currentColor" fillOpacity="0.5" />
          </g>
        );
      })}
    </motion.svg>
  );
}

// Caparisoned elephant — the ceremonial one that leads a baraat.
//
// Drawn as ONE continuous outline rather than stacked body/head/trunk shapes.
// Two earlier attempts layered separate parts in the same flat colour, and at
// this size and opacity they merged into an undifferentiated blob. A silhouette
// only reads if its OUTLINE carries the animal — so the trunk, the domed back
// and the leg gaps are cut into a single path, and decoration is laid on after.
const ELEPHANT_BODY =
  "M168 62 C168 44 150 34 128 34 C110 34 96 38 86 46 " + // back and shoulder
  "C76 38 62 36 52 44 C42 52 38 64 40 76 " + // head dome
  "C34 88 28 104 30 120 C31 132 38 140 46 141 " + // trunk down
  "C50 141 52 137 50 133 C44 128 42 118 46 106 " + // trunk tip curling
  "C50 96 58 90 66 88 " + // back up the trunk's inner edge
  "L70 118 L70 146 L84 146 L84 116 " + // front leg
  "L112 120 L112 146 L126 146 L126 118 " + // second leg
  "C146 116 162 104 166 88 " + // belly to rump
  "C170 80 170 70 168 62 Z";

export function Elephant({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 155"
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d={ELEPHANT_BODY} fill="currentColor" fillOpacity="0.55" />
      {/* Ear, set darker so it separates from the head instead of merging */}
      <ellipse cx="74" cy="70" rx="21" ry="24" fill="currentColor" fillOpacity="0.75" />
      <ellipse cx="74" cy="70" rx="13" ry="15" fill="currentColor" fillOpacity="0.4" />
      {/* Tusk, forward of the trunk */}
      <path
        d="M52 92 C46 100 44 108 47 115"
        stroke="currentColor"
        strokeOpacity="0.9"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="52" cy="60" r="2.4" fill="currentColor" fillOpacity="0.95" />
      {/* Jhool — the embroidered blanket over the back */}
      <path d="M96 50 C120 44 148 50 162 64 L156 92 C134 82 112 80 96 86 Z" fill="currentColor" fillOpacity="0.85" />
      {[106, 122, 138].map((x) => (
        <circle key={x} cx={x} cy={90} r="3.2" fill="currentColor" fillOpacity="0.6" />
      ))}
      {/* Headdress */}
      <path d="M46 44 C58 32 76 34 86 44" stroke="currentColor" strokeOpacity="0.8" strokeWidth="3.5" fill="none" />
      <circle cx="66" cy="34" r="5" fill="currentColor" fillOpacity="0.85" />
    </svg>
  );
}

// The "flashy" the palette asks for, kept to one slow pass: a gold highlight
// travelling across the hero every few seconds. Sheen rather than sparkle —
// glitter at speed is what makes a page look cheap rather than rich.
export function GoldSheen({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[color:var(--accent)]/22 to-transparent"
        initial={{ x: "-40%" }}
        animate={{ x: "340%" }}
        transition={{ duration: 5.5, repeat: Infinity, repeatDelay: 6, ease: "easeInOut" }}
      />
    </div>
  );
}

// Page-level palace frame: jaali down the sides, jhoomars overhead.
export function PalaceFrame() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <div className="absolute inset-y-0 left-0 hidden w-24 text-[color:var(--primary)] opacity-[0.18] lg:block xl:w-32">
        <JaaliScreen className="h-full w-full" />
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-24 text-[color:var(--primary)] opacity-[0.18] lg:block xl:w-32">
        <JaaliScreen className="h-full w-full" />
      </div>
    </div>
  );
}

// Arch framing the hero content, with elephants at the base facing inward.
// Inside the card, for the same reason the temple towers are: the card surface
// is near-opaque, so anything behind it reads as a ghost at the margins.
export function PalaceHeroArch() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Jhoomars hang inside the hero. At page top they sat behind the sticky
          header and were never visible. */}
      <Jhoomar className="absolute left-[6%] top-0 hidden h-48 text-[color:var(--accent)] opacity-80 sm:block lg:left-[12%]" />
      <Jhoomar
        delay={1.6}
        className="absolute right-[6%] top-0 hidden h-48 text-[color:var(--accent)] opacity-80 sm:block lg:right-[12%]"
      />

      {/* Wider and taller: the arch should frame the whole hero opening, not
          hug the monogram. */}
      <MughalArch className="absolute left-1/2 top-4 h-[21rem] w-full max-w-5xl -translate-x-1/2 text-[color:var(--primary)] opacity-45 sm:top-6 sm:h-[34rem] sm:opacity-65" />

      {/* Elephants at the arch springing line. Anchoring them to the card
          bottom put them far below the fold — the card runs well past the
          viewport. */}
      <Elephant className="absolute left-2 top-[21rem] hidden h-32 text-[color:var(--primary)] opacity-45 sm:block lg:left-10 lg:h-40" />
      <Elephant
        flip
        className="absolute right-2 top-[21rem] hidden h-32 text-[color:var(--primary)] opacity-45 sm:block lg:right-10 lg:h-40"
      />
      <GoldSheen />
    </div>
  );
}
