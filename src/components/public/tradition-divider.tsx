"use client";

import { motion, useReducedMotion } from "motion/react";

import { KolamDivider } from "@/components/public/kolam";
import { ornamentKindFor } from "@/components/public/motifs";
import { cn } from "@/lib/utils";

// Per-tradition section dividers.
//
// The self-drawing idea is kept — a line appearing stroke by stroke is the
// nicest moment on these pages — but the FORM has to belong to the tradition.
// A kolam is drawn at the threshold of Hindu homes; putting one on a Nikah or a
// chapel page is the same error as crowning them with a lotus. So each theme
// draws its own figure and the kolam stays where it belongs.
//
// All are single <path> elements (multiple subpaths are fine) so `pathLength`
// animates as one continuous stroke rather than several racing each other.

// Eight-point girih star, drawn as one closed polygon.
function girihStarPath(cx: number, cy: number, outer: number, inner: number, points: number) {
  const coords: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    coords.push(`${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${coords.join(" L")} Z`;
}

const FORMS: Record<string, { path: string; dots: Array<[number, number]> }> = {
  girih: {
    // Star within a star — the interlace of a girih panel.
    path: `${girihStarPath(60, 60, 46, 20, 8)} ${girihStarPath(60, 60, 30, 13, 8)}`,
    dots: [[60, 60]],
  },
  chapel: {
    // Quatrefoil: four lobes about a centre, the tracery unit.
    // Four lobes at N / E / S / W. An earlier version drew two of them at the
    // same centre, so it rendered as a lone circle rather than a quatrefoil.
    path:
      "M60 14 a23 23 0 1 1 0 46 a23 23 0 1 1 0 -46 Z " + // north
      "M60 60 a23 23 0 1 1 0 46 a23 23 0 1 1 0 -46 Z " + // south
      "M60 60 a23 23 0 1 1 46 0 a23 23 0 1 1 -46 0 Z " + // east
      "M14 60 a23 23 0 1 1 46 0 a23 23 0 1 1 -46 0 Z",   // west
    dots: [[60, 60]],
  },
  lantern: {
    // Interlocking squares — the endless knot behind an ice-ray screen.
    path:
      "M24 24 H96 V96 H24 Z " +
      "M60 12 L108 60 L60 108 L12 60 Z " +
      "M42 42 H78 V78 H42 Z",
    dots: [[60, 60]],
  },
  desert: {
    // Eight-petal arabesque rosette, the mashrabiya's turned unit.
    path: Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 8;
      const x = 60 + 26 * Math.cos(a);
      const y = 60 + 26 * Math.sin(a);
      return `M60 60 A26 26 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ") + " M14 60 A46 46 0 1 1 106 60 A46 46 0 1 1 14 60 Z",
    dots: [[60, 60]],
  },
};

function DrawnFigure({ kind, className }: { kind: keyof typeof FORMS | string; className?: string }) {
  const reduceMotion = useReducedMotion();
  const form = FORMS[kind];
  if (!form) return null;

  return (
    <svg
      className={cn("text-[color:var(--primary)]", className)}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      {form.dots.map(([cx, cy]) => (
        <motion.circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="2.6"
          fill="currentColor"
          initial={reduceMotion ? false : { opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3 }}
        />
      ))}
      <motion.path
        d={form.path}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{
          pathLength: { duration: 2.1, ease: "easeInOut", delay: 0.35 },
          opacity: { duration: 0.2, delay: 0.35 },
        }}
      />
    </svg>
  );
}

/**
 * The divider for a template's tradition. Indic templates keep the kolam;
 * everything else draws its own figure. Templates with no ornament get nothing,
 * exactly as before.
 */
export function TraditionDivider({
  templateKey,
  className,
}: {
  templateKey: string;
  className?: string;
}) {
  const kind = ornamentKindFor(templateKey);

  // No ornament kind means an Indic template (kolam / temple / haveli), which
  // is where the kolam actually belongs.
  if (!kind) return <KolamDivider className={className} />;

  return (
    <div className={cn("section-shell mt-20 flex items-center justify-center gap-6", className)}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[color:var(--accent)]/30" />
      <DrawnFigure kind={kind} className="h-28 w-28 flex-none sm:h-32 sm:w-32" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[color:var(--accent)]/30" />
    </div>
  );
}
