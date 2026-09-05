"use client";

import { motion, useReducedMotion } from "motion/react";

// Ornament for the Chinese template.
//
// Moon gate, ice-ray lattice, hanging lanterns and stylised clouds. The
// double-happiness character 囍 is deliberately absent: it is a written word,
// and setting someone's writing system as wallpaper is the same misuse the
// earlier motifs avoided with Om and the crescent. Architecture and pattern
// carry the tradition instead.

// Moon gate: the circular doorway in a garden wall.
export function MoonGate({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <circle cx="160" cy="160" r="146" fill="currentColor" fillOpacity="0.07" />
      <circle cx="160" cy="160" r="146" stroke="currentColor" strokeOpacity="0.5" strokeWidth="4" />
      <circle cx="160" cy="160" r="128" stroke="currentColor" strokeOpacity="0.26" strokeWidth="1.8" />
      {/* Coping stones around the rim */}
      {Array.from({ length: 36 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 36;
        const r1 = 146;
        const r2 = 155;
        return (
          <path
            key={i}
            d={`M${160 + r1 * Math.cos(a)} ${160 + r1 * Math.sin(a)} L${160 + r2 * Math.cos(a)} ${160 + r2 * Math.sin(a)}`}
            stroke="currentColor"
            strokeOpacity="0.34"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}

// Ice-ray lattice: the irregular cracked-ice window screen.
export function IceRayLattice({ className }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" fill="none" aria-hidden="true">
      <defs>
        <pattern id="iceray" width="80" height="80" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="1.2" fill="none">
            <path d="M0 26 L22 14 L48 24 L80 10" />
            <path d="M0 54 L18 46 L44 58 L80 48" />
            <path d="M22 14 L18 46 M48 24 L44 58 M0 26 L0 54 M80 10 L80 48" />
            <path d="M22 14 L30 0 M48 24 L58 0 M18 46 L10 80 M44 58 L52 80" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#iceray)" />
    </svg>
  );
}

// Silk lantern on its cord, swaying gently with a warm glow.
export function Lantern({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.svg
      className={className}
      viewBox="0 0 100 210"
      fill="none"
      aria-hidden="true"
      style={{ transformOrigin: "50px 0px" }}
      initial={reduceMotion ? false : { rotate: -2.5 }}
      animate={reduceMotion ? undefined : { rotate: [-2.5, 2.5, -2.5] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <path d="M50 0 V34" stroke="currentColor" strokeOpacity="0.42" strokeWidth="2" />
      {/* Caps */}
      <rect x="34" y="34" width="32" height="8" rx="2.5" fill="currentColor" fillOpacity="0.5" />
      <rect x="34" y="132" width="32" height="8" rx="2.5" fill="currentColor" fillOpacity="0.5" />
      {/* Body */}
      <motion.ellipse
        cx="50"
        cy="87"
        rx="38"
        ry="46"
        fill="currentColor"
        initial={reduceMotion ? { fillOpacity: 0.36 } : { fillOpacity: 0.26 }}
        animate={reduceMotion ? undefined : { fillOpacity: [0.26, 0.5, 0.26] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
      />
      <ellipse cx="50" cy="87" rx="38" ry="46" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2" fill="none" />
      {/* Ribs */}
      {[-22, -11, 0, 11, 22].map((dx) => (
        <path
          key={dx}
          d={`M${50 + dx} 42 C${50 + dx * 1.5} 64 ${50 + dx * 1.5} 110 ${50 + dx} 132`}
          stroke="currentColor"
          strokeOpacity="0.28"
          strokeWidth="1.2"
          fill="none"
        />
      ))}
      {/* Tassel */}
      <path d="M50 140 V158" stroke="currentColor" strokeOpacity="0.42" strokeWidth="2" />
      {[-6, 0, 6].map((dx) => (
        <path key={dx} d={`M50 158 L${50 + dx} 186`} stroke="currentColor" strokeOpacity="0.36" strokeWidth="1.6" />
      ))}
    </motion.svg>
  );
}

// Stylised auspicious cloud (xiangyun), drifting slowly.
export function Cloud({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.svg
      className={className}
      viewBox="0 0 200 90"
      fill="none"
      aria-hidden="true"
      initial={reduceMotion ? false : { x: -14 }}
      animate={reduceMotion ? undefined : { x: [-14, 14, -14] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <path
        d="M16 70 C4 70 0 58 10 52 C4 40 16 30 28 36 C32 20 54 18 60 32 C74 22 92 32 90 48 C108 44 120 56 114 70 Z"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path
        d="M16 70 C4 70 0 58 10 52 C4 40 16 30 28 36 C32 20 54 18 60 32 C74 22 92 32 90 48 C108 44 120 56 114 70"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="2"
        fill="none"
      />
      {/* The spiral curl that marks it as a xiangyun rather than a rain cloud */}
      <path
        d="M40 58 C40 48 54 48 54 58 C54 66 42 66 44 58"
        stroke="currentColor"
        strokeOpacity="0.42"
        strokeWidth="1.8"
        fill="none"
      />
    </motion.svg>
  );
}

export function LanternFrame() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <div className="absolute inset-y-0 left-0 hidden w-28 text-[color:var(--primary)] opacity-[0.15] lg:block xl:w-36">
        <IceRayLattice className="h-full w-full" />
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-28 text-[color:var(--primary)] opacity-[0.15] lg:block xl:w-36">
        <IceRayLattice className="h-full w-full" />
      </div>
    </div>
  );
}

export function LanternHeroArch() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <MoonGate className="absolute left-1/2 top-6 h-[20rem] w-auto -translate-x-1/2 text-[color:var(--primary)] opacity-40 sm:top-8 sm:h-[30rem] sm:opacity-55" />
      <Lantern className="absolute left-[7%] top-0 hidden h-48 text-[color:var(--accent)] opacity-85 sm:block lg:left-[13%]" />
      <Lantern
        delay={1.8}
        className="absolute right-[7%] top-0 hidden h-48 text-[color:var(--accent)] opacity-85 sm:block lg:right-[13%]"
      />
      <Cloud className="absolute left-[4%] top-[19rem] hidden w-40 text-[color:var(--accent)] opacity-55 lg:block" />
      <Cloud delay={4} className="absolute right-[4%] top-[21rem] hidden w-40 text-[color:var(--accent)] opacity-55 lg:block" />
    </div>
  );
}
