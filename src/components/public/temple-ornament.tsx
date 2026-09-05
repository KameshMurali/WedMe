"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

// Ornament for the South Indian traditional template.
//
// All original SVG, drawn from architectural and decorative forms — gopuram
// towers, toran garlands, peacocks, banana leaves — not traced from any
// reference image and using no third-party artwork.
//
// A note on ambition: painted watercolour invitations get their richness from
// illustration, which code cannot produce at that fidelity. What code CAN do is
// layered, structured ornament — many elements, real depth, colour that carries
// the tradition. That is what this is: heavy on purpose, because a restrained
// version of this theme reads as a different theme.

const TIERS = [
  // [yTop, yBottom, halfWidthTop, halfWidthBottom]
  [180, 220, 46, 50],
  [144, 180, 40, 46],
  [110, 144, 34, 40],
  [80, 110, 28, 34],
  [54, 80, 22, 28],
] as const;

// A gopuram: the stepped temple tower that fronts a South Indian temple.
// Tiers narrow as they rise, each capped by a cornice, topped by a kalasam.
export function GopuramTower({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 224"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {TIERS.map(([yTop, yBottom, hwTop, hwBottom], index) => (
        <g key={yTop}>
          {/* Tier body */}
          <path
            d={`M${50 - hwBottom} ${yBottom} L${50 - hwTop} ${yTop} L${50 + hwTop} ${yTop} L${50 + hwBottom} ${yBottom} Z`}
            fill="currentColor"
            fillOpacity={0.22 + index * 0.07}
          />
          {/* Cornice slab overhanging each tier */}
          <rect
            x={50 - hwTop - 4}
            y={yTop - 5}
            width={(hwTop + 4) * 2}
            height={6}
            rx={1.5}
            fill="currentColor"
            fillOpacity={0.5}
          />
          {/* Shrine niches along the tier */}
          {[-0.55, 0, 0.55].map((offset) => (
            <rect
              key={offset}
              x={50 + offset * hwTop * 1.25 - 3.5}
              y={yTop + (yBottom - yTop) * 0.3}
              width={7}
              height={(yBottom - yTop) * 0.42}
              rx={3.5}
              fill="currentColor"
              fillOpacity={0.44}
            />
          ))}
        </g>
      ))}

      {/* Shikhara — the barrel-vaulted crown */}
      <path
        d="M28 54 C28 36 38 26 50 26 C62 26 72 36 72 54 Z"
        fill="currentColor"
        fillOpacity={0.48}
      />
      {/* Kalasam finials */}
      {[36, 50, 64].map((cx, i) => (
        <g key={cx} fill="currentColor" fillOpacity={0.62}>
          <ellipse cx={cx} cy={i === 1 ? 20 : 24} rx={3.4} ry={4} />
          <rect x={cx - 0.9} y={i === 1 ? 8 : 13} width={1.8} height={9} rx={0.9} />
        </g>
      ))}
    </svg>
  );
}

// Toran: the mango-leaf and marigold garland strung across a doorway. Hangs
// from the top edge and sways, because a strung garland is never quite still.
export function ToranGarland({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  // 12 drops across the width; the swag dips between each anchor.
  const drops = Array.from({ length: 13 }, (_, i) => i);

  return (
    <svg
      className={cn("w-full", className)}
      viewBox="0 0 1200 120"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {/* The hanging cord, dipping between anchors */}
      <path
        d={drops
          .slice(0, -1)
          .map((i) => {
            const x1 = i * 100;
            const x2 = (i + 1) * 100;
            return `${i === 0 ? `M${x1} 6` : ""} Q${(x1 + x2) / 2} 46 ${x2} 6`;
          })
          .join(" ")}
        stroke="currentColor"
        strokeWidth="2"
        strokeOpacity="0.7"
        fill="none"
      />

      {drops.map((i) => {
        const x = i * 100;
        const isLong = i % 2 === 0;
        return (
          <motion.g
            key={i}
            style={{ transformOrigin: `${x}px 6px` }}
            initial={reduceMotion ? false : { rotate: 0 }}
            animate={reduceMotion ? undefined : { rotate: [-1.6, 1.6, -1.6] }}
            transition={{
              duration: 5.5 + (i % 3) * 0.9,
              repeat: Infinity,
              ease: "easeInOut",
              // Offset per drop so the row breathes instead of marching.
              delay: (i % 5) * 0.4,
            }}
          >
            {/* Mango leaves, paired */}
            <path
              d={`M${x} 8 C${x - 11} 22 ${x - 11} 44 ${x} 56 C${x + 11} 44 ${x + 11} 22 ${x} 8 Z`}
              fill="currentColor"
              fillOpacity="0.5"
            />
            <path d={`M${x} 10 L${x} 54`} stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" />

            {isLong ? (
              <>
                {/* Marigold string */}
                {[64, 74, 84].map((cy, k) => (
                  <circle key={cy} cx={x} cy={cy} r={4 - k * 0.4} fill="currentColor" fillOpacity="0.62" />
                ))}
                {/* Bell / tassel */}
                <path
                  d={`M${x - 4} 92 C${x - 4} 100 ${x + 4} 100 ${x + 4} 92 Z`}
                  fill="currentColor"
                  fillOpacity="0.58"
                />
                <circle cx={x} cy={102} r={1.8} fill="currentColor" fillOpacity="0.5" />
              </>
            ) : (
              <circle cx={x} cy={64} r={3.2} fill="currentColor" fillOpacity="0.55" />
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

// Stylised peacock in profile with a fanned tail. Feather eyes shimmer in
// sequence rather than all at once, so it reads as iridescence and not a blink.
export function Peacock({ className, flip = false }: { className?: string; flip?: boolean }) {
  const reduceMotion = useReducedMotion();
  const feathers = [-52, -34, -17, 0, 17, 34, 52];

  return (
    <svg
      className={className}
      viewBox="0 0 160 220"
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* Fanned tail: each feather is a long stem with an eye at the tip */}
      {feathers.map((angle, index) => (
        <g key={angle} transform={`rotate(${angle} 80 190)`}>
          <path
            d="M80 190 C74 140 74 96 80 62"
            stroke="currentColor"
            strokeOpacity="0.32"
            strokeWidth="2.4"
            fill="none"
          />
          <motion.g
            initial={reduceMotion ? false : { opacity: 0.35 }}
            animate={reduceMotion ? undefined : { opacity: [0.35, 0.85, 0.35] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.35,
            }}
          >
            <ellipse cx="80" cy="58" rx="8" ry="11" fill="currentColor" fillOpacity="0.62" />
            <ellipse cx="80" cy="58" rx="4" ry="6" fill="currentColor" fillOpacity="0.75" />
          </motion.g>
        </g>
      ))}

      {/* Body, neck, head, crest */}
      <ellipse cx="80" cy="186" rx="20" ry="26" fill="currentColor" fillOpacity="0.6" />
      <path
        d="M80 168 C76 146 82 128 96 120 C104 116 108 110 106 104"
        stroke="currentColor"
        strokeOpacity="0.62"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="106" cy="100" r="7.5" fill="currentColor" fillOpacity="0.72" />
      <path d="M112 96 L120 90" stroke="currentColor" strokeOpacity="0.72" strokeWidth="3" strokeLinecap="round" />
      {[-10, 0, 10].map((dx) => (
        <g key={dx}>
          <path
            d={`M${106 + dx * 0.3} 93 L${106 + dx} 80`}
            stroke="currentColor"
            strokeOpacity="0.55"
            strokeWidth="1.6"
          />
          <circle cx={106 + dx} cy={78} r="2.2" fill="currentColor" fillOpacity="0.6" />
        </g>
      ))}
    </svg>
  );
}

// Banana leaves arcing in from the top corners — the canopy over a temple
// doorway on a wedding morning.
export function BananaLeaf({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M6 6 C70 14 132 52 186 132 C120 118 54 78 6 6 Z"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path d="M6 6 C70 40 130 84 186 132" stroke="currentColor" strokeOpacity="0.7" strokeWidth="2.5" />
      {/* Leaf ribs */}
      {[0.2, 0.34, 0.48, 0.62, 0.76].map((t) => (
        <path
          key={t}
          d={`M${6 + 180 * t} ${6 + 126 * t} L${6 + 180 * t + 26} ${6 + 126 * t - 6}`}
          stroke="currentColor"
          strokeOpacity="0.32"
          strokeWidth="1.6"
        />
      ))}
    </svg>
  );
}

// The full frame: gopurams either side, torans overhead, peacocks at the base.
// Fixed behind the content, so it frames the whole page rather than one section.
export function TempleFrame() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {/* Banana leaf canopy in the upper corners */}
      <BananaLeaf className="absolute -left-6 top-8 w-40 text-[color:var(--accent)] opacity-90 sm:w-64" />
      <BananaLeaf flip className="absolute -right-6 top-8 w-40 text-[color:var(--accent)] opacity-90 sm:w-64" />

      {/* Gopuram towers flank the page. Desktop only: at phone widths there is
          no side margin to give them, and squeezing the content to fit
          decoration would be a straight downgrade. */}
      <GopuramTower className="absolute bottom-0 left-0 hidden h-[78vh] w-36 text-[color:var(--primary)] opacity-[0.42] lg:block xl:w-44" />
      <GopuramTower
        flip
        className="absolute bottom-0 right-0 hidden h-[78vh] w-36 text-[color:var(--primary)] opacity-[0.42] lg:block xl:w-44"
      />

      {/* Peacocks at the foot of each tower */}
      <Peacock className="absolute bottom-4 left-6 hidden h-56 text-[color:var(--accent)] opacity-[0.72] xl:block" />
      <Peacock
        flip
        className="absolute bottom-4 right-6 hidden h-56 text-[color:var(--accent)] opacity-[0.72] xl:block"
      />
    </div>
  );
}


// Gopuram pair framing a content card from the inside.
//
// The page-level frame alone was not enough: the hero card is a near-opaque
// surface, so anything behind it only showed in the margins and read as a
// ghost. In the reference invitations the towers flank the TEXT — the arch is
// the frame for the content, not wallpaper behind it — so these sit inside the
// card and carry full weight.
export function TempleHeroArch() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <GopuramTower className="absolute left-0 top-0 h-[30rem] w-28 text-[color:var(--primary)] opacity-25 sm:w-40 sm:opacity-[0.55] lg:w-52" />
      <GopuramTower
        flip
        className="absolute right-0 top-0 h-[30rem] w-28 text-[color:var(--primary)] opacity-25 sm:w-40 sm:opacity-[0.55] lg:w-52"
      />
      {/* Peacocks perched at the tower bases, facing inward */}
      <Peacock className="absolute left-8 top-[19rem] hidden h-44 text-[color:var(--accent)] opacity-80 sm:block lg:left-24" />
      <Peacock
        flip
        className="absolute right-8 top-[19rem] hidden h-44 text-[color:var(--accent)] opacity-80 sm:block lg:right-24"
      />
    </div>
  );
}
