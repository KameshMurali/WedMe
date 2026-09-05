"use client";

import { motion, useReducedMotion } from "motion/react";

// Ornament for the Arabic / Khaleeji template.
//
// Distinct from the Islamic (Nikah) set on purpose: that one is the mihrab —
// girih stars, a pointed arch, the mosque lamp. This one is domestic and
// regional — the horseshoe arch of a majlis doorway, a turned mashrabiya
// screen, date palms and a dune horizon. Geometry and plant forms only.

// Horseshoe arch: springs wider than its span before closing — the profile
// that separates it from a plain round arch.
export function HorseshoeArch({ className }: { className?: string }) {
  const outer =
    "M40 310 L40 176 C40 92 92 34 160 34 C228 34 280 92 280 176 L280 310";
  const inner =
    "M66 310 L66 178 C66 108 106 60 160 60 C214 60 254 108 254 178 L254 310";

  return (
    <svg className={className} viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <path d={`${outer} Z`} fill="currentColor" fillOpacity="0.08" />
      <path d={outer} stroke="currentColor" strokeOpacity="0.52" strokeWidth="3" fill="none" />
      <path d={inner} stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.6" fill="none" />
      {/* Stepped merlon crest along the top of the wall */}
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={`M${20 + i * 35} 22 l8 -12 l8 12`}
          stroke="currentColor"
          strokeOpacity="0.34"
          strokeWidth="2"
          fill="none"
        />
      ))}
      <rect x="32" y="172" width="18" height="8" rx="2" fill="currentColor" fillOpacity="0.42" />
      <rect x="270" y="172" width="18" height="8" rx="2" fill="currentColor" fillOpacity="0.42" />
    </svg>
  );
}

// Mashrabiya: the turned-wood lattice over a window.
export function MashrabiyaScreen({ className }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" fill="none" aria-hidden="true">
      <defs>
        <pattern id="mashrabiya" width="48" height="48" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="1.1" fill="none">
            <circle cx="24" cy="24" r="13" />
            <circle cx="24" cy="24" r="5" />
            <circle cx="0" cy="0" r="13" />
            <circle cx="48" cy="0" r="13" />
            <circle cx="0" cy="48" r="13" />
            <circle cx="48" cy="48" r="13" />
            <path d="M24 11 V0 M24 37 V48 M11 24 H0 M37 24 H48" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mashrabiya)" />
    </svg>
  );
}

// Date palm — fronds arcing from a ringed trunk, swaying at the crown.
export function DatePalm({ className, flip = false, delay = 0 }: { className?: string; flip?: boolean; delay?: number }) {
  const reduceMotion = useReducedMotion();
  const fronds = [-72, -44, -18, 18, 44, 72];

  return (
    <svg
      className={className}
      viewBox="0 0 180 260"
      fill="none"
      aria-hidden="true"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* Trunk with its scar rings */}
      <path d="M90 258 C86 200 88 140 90 96" stroke="currentColor" strokeOpacity="0.5" strokeWidth="11" strokeLinecap="round" />
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={`M${83 + (i % 2)} ${230 - i * 15} h14`}
          stroke="currentColor"
          strokeOpacity="0.32"
          strokeWidth="2"
        />
      ))}

      {/* Crown of fronds, breathing rather than flapping */}
      <motion.g
        style={{ transformOrigin: "90px 96px" }}
        initial={reduceMotion ? false : { rotate: -1.5 }}
        animate={reduceMotion ? undefined : { rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay }}
      >
        {fronds.map((angle) => (
          <g key={angle} transform={`rotate(${angle} 90 96)`}>
            {/* A frond is a filled, tapering blade with a serrated edge. The
                first version drew a thin midrib with tick-mark leaflets, and at
                this size it read as a bare winter branch rather than foliage —
                palms need mass, not lines. */}
            <path
              d="M90 96 C84 66 80 38 88 10 C96 34 98 64 94 96 Z"
              fill="currentColor"
              fillOpacity="0.34"
            />
            <path
              d="M90 96 C86 62 82 36 88 12"
              stroke="currentColor"
              strokeOpacity="0.5"
              strokeWidth="2.2"
              fill="none"
            />
            {/* Serration along both edges reads as separated leaflets */}
            {[0.16, 0.3, 0.44, 0.58, 0.72, 0.86].map((t) => {
              const y = 96 - t * 84;
              const spread = 6 + (1 - Math.abs(t - 0.5) * 2) * 7;
              return (
                <path
                  key={t}
                  d={`M${88 - t * 2} ${y} l-${spread} -5 M${88 - t * 2} ${y} l${spread} -5`}
                  stroke="currentColor"
                  strokeOpacity="0.42"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        ))}
        {/* Date clusters under the crown */}
        {[-16, 16].map((dx) => (
          <circle key={dx} cx={90 + dx} cy={104} r="6" fill="currentColor" fillOpacity="0.4" />
        ))}
      </motion.g>
    </svg>
  );
}

// Dune horizon: soft overlapping ridges along the foot of the page.
export function DuneHorizon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 160" fill="none" aria-hidden="true" preserveAspectRatio="none">
      <path d="M0 120 C180 70 300 130 460 96 C620 62 720 118 900 88 C1040 64 1120 104 1200 86 L1200 160 L0 160 Z" fill="currentColor" fillOpacity="0.16" />
      <path d="M0 140 C200 100 340 152 520 124 C700 96 820 142 1000 118 C1100 104 1150 128 1200 118 L1200 160 L0 160 Z" fill="currentColor" fillOpacity="0.24" />
    </svg>
  );
}

export function DesertFrame() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <div className="absolute inset-y-0 left-0 hidden w-24 text-[color:var(--primary)] opacity-[0.15] lg:block xl:w-32">
        <MashrabiyaScreen className="h-full w-full" />
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-24 text-[color:var(--primary)] opacity-[0.15] lg:block xl:w-32">
        <MashrabiyaScreen className="h-full w-full" />
      </div>
      <div className="absolute inset-x-0 bottom-0 text-[color:var(--accent)] opacity-50">
        <DuneHorizon className="h-24 w-full sm:h-32" />
      </div>
    </div>
  );
}

export function DesertHeroArch() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <HorseshoeArch className="absolute left-1/2 top-4 h-[21rem] w-full max-w-4xl -translate-x-1/2 text-[color:var(--primary)] opacity-45 sm:top-6 sm:h-[32rem] sm:opacity-60" />
      <DatePalm className="absolute left-1 top-[8rem] hidden h-56 text-[color:var(--accent)] opacity-60 sm:block lg:left-8 lg:h-64" />
      <DatePalm
        flip
        delay={2.5}
        className="absolute right-1 top-[8rem] hidden h-56 text-[color:var(--accent)] opacity-60 sm:block lg:right-8 lg:h-64"
      />
    </div>
  );
}
