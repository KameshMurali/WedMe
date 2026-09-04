"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

// A pulli kolam that draws itself.
//
// This is the one animation here that is the gesture rather than an effect
// applied to it: a kolam is drawn stroke by stroke at dawn, around a grid of
// pulli (dots), so animating the stroke is what the thing actually is. The dots
// are placed first, then the looping line is drawn through them — the same
// order a person would follow.
//
// Under reduced motion it renders COMPLETE, not faster. A half-drawn kolam is
// worse than a still one.

// A four-fold symmetric loop kolam: four petals turned around a centre pulli,
// written as ONE continuous path so `pathLength` reads as a single confident
// stroke rather than four racing each other. Coordinates are explicit rather
// than rotated by transform, because motion writes transforms to CSS and a CSS
// transform overrides an SVG transform attribute.
const KOLAM_PATH =
  "M60 60 C40 50 40 18 60 12 C80 18 80 50 60 60 Z " +
  "M60 60 C70 40 102 40 108 60 C102 80 70 80 60 60 Z " +
  "M60 60 C80 70 80 102 60 108 C40 102 40 70 60 60 Z " +
  "M60 60 C50 80 18 80 12 60 C18 40 50 40 60 60 Z";

const DOTS = [
  [60, 60],
  [60, 24],
  [96, 60],
  [60, 96],
  [24, 60],
];

export function SelfDrawingKolam({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      className={cn("text-[color:var(--primary)]", className)}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      {DOTS.map(([cx, cy], index) => (
        <motion.circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="2.6"
          fill="currentColor"
          initial={reduceMotion ? false : { opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3, delay: index * 0.07 }}
        />
      ))}
      <motion.path
        d={KOLAM_PATH}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        // pathLength normalises the path to 0..1 regardless of its real length,
        // so the draw-on timing stays identical if the path is ever redrawn.
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{
          pathLength: { duration: 2.1, ease: "easeInOut", delay: 0.45 },
          opacity: { duration: 0.2, delay: 0.45 },
        }}
      />
    </svg>
  );
}

// Section divider: a drawn kolam centred between two hairlines.
export function KolamDivider({ className }: { className?: string }) {
  return (
    <div className={cn("section-shell mt-20 flex items-center justify-center gap-6", className)}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[color:var(--accent)]/30" />
      <SelfDrawingKolam className="h-28 w-28 flex-none sm:h-32 sm:w-32" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[color:var(--accent)]/30" />
    </div>
  );
}

// Scalloped kolam strips down the viewport edges, echoing the printed border on
// a Tamil invitation. Desktop only — at phone widths there is no margin to
// spare, and a decorative strip that squeezes the content would be a straight
// downgrade.
export function KolamEdgeBorder() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-0 right-0 z-0 hidden lg:block"
    >
      {(["left-0", "right-0 rotate-180"] as const).map((position) => (
        <svg
          key={position}
          className={cn(
            "absolute inset-y-0 w-10 text-[color:var(--accent)] opacity-[0.16]",
            position,
          )}
          width="40"
          height="100%"
          fill="none"
        >
          <defs>
            <pattern id={`kolam-edge-${position.split(" ")[0]}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <g stroke="currentColor" strokeWidth="1" fill="none">
                <path d="M8 0 C22 8 22 32 8 40" />
                <path d="M20 0 C34 8 34 32 20 40" />
                <circle cx="14" cy="20" r="1.6" fill="currentColor" stroke="none" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#kolam-edge-${position.split(" ")[0]})`} />
        </svg>
      ))}
    </div>
  );
}
