"use client";

import { motion, useReducedMotion } from "motion/react";

// Ornament for the Christian template.
//
// Architectural rather than devotional: tracery, a rose window, a colonnade.
// No cross used as page furniture — the same reasoning that kept Om and the
// crescent out of the earlier motifs. A church's own decorative language is its
// stonework and its glass, and that is what this draws on.

// Gothic tracery arch: a pointed arch subdivided by lancets and a quatrefoil.
export function TraceryArch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 320" fill="none" aria-hidden="true">
      {/* Outer pointed arch */}
      <path
        d="M24 310 L24 170 C24 92 82 30 150 14 C218 30 276 92 276 170 L276 310"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="3"
        fill="none"
      />
      <path
        d="M24 310 L24 170 C24 92 82 30 150 14 C218 30 276 92 276 170 L276 310 Z"
        fill="currentColor"
        fillOpacity="0.07"
      />
      {/* Paired lancets beneath the head */}
      <path
        d="M62 310 L62 196 C62 158 88 130 114 122 C140 130 150 158 150 196"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d="M150 196 C150 158 160 130 186 122 C212 130 238 158 238 196 L238 310"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.8"
        fill="none"
      />
      {/* Quatrefoil in the tracery head */}
      <g stroke="currentColor" strokeOpacity="0.42" strokeWidth="1.6" fill="none">
        {[[150, 74], [128, 96], [150, 118], [172, 96]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="15" />
        ))}
      </g>
      {/* Capitals */}
      <rect x="16" y="166" width="20" height="8" rx="2" fill="currentColor" fillOpacity="0.42" />
      <rect x="264" y="166" width="20" height="8" rx="2" fill="currentColor" fillOpacity="0.42" />
    </svg>
  );
}

// Rose window: radiating lights around a central oculus. Petals brighten in
// sequence, the way light moves across glass rather than blinking.
export function RoseWindow({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const lights = Array.from({ length: 12 }, (_, i) => i);

  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <circle cx="100" cy="100" r="94" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="72" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.6" />
      {lights.map((i) => {
        const a = (Math.PI * 2 * i) / lights.length - Math.PI / 2;
        const cx = 100 + 52 * Math.cos(a);
        const cy = 100 + 52 * Math.sin(a);
        return (
          <motion.g
            key={i}
            initial={reduceMotion ? { opacity: 0.4 } : { opacity: 0.22 }}
            animate={reduceMotion ? undefined : { opacity: [0.22, 0.62, 0.22] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.24 }}
          >
            <circle cx={cx} cy={cy} r="17" fill="currentColor" fillOpacity="0.5" />
            <circle cx={cx} cy={cy} r="17" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.3" fill="none" />
          </motion.g>
        );
      })}
      <circle cx="100" cy="100" r="19" fill="currentColor" fillOpacity="0.35" />
      <circle cx="100" cy="100" r="19" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.6" fill="none" />
      {lights.map((i) => {
        const a = (Math.PI * 2 * i) / lights.length - Math.PI / 2;
        return (
          <path
            key={`spoke-${i}`}
            d={`M${100 + 19 * Math.cos(a)} ${100 + 19 * Math.sin(a)} L${100 + 35 * Math.cos(a)} ${100 + 35 * Math.sin(a)}`}
            stroke="currentColor"
            strokeOpacity="0.32"
            strokeWidth="1.4"
          />
        );
      })}
    </svg>
  );
}

// Colonnade: the arcade running down a nave aisle.
export function Colonnade({ className }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" fill="none" aria-hidden="true">
      <defs>
        <pattern id="colonnade" width="72" height="160" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="1.4" fill="none">
            {/* Column shaft with fluting */}
            <rect x="26" y="46" width="20" height="98" />
            <path d="M32 50 V140 M40 50 V140" strokeWidth="0.8" />
            {/* Capital and base */}
            <rect x="21" y="40" width="30" height="8" rx="2" />
            <rect x="19" y="144" width="34" height="9" rx="2" />
            {/* Arch springing between columns */}
            <path d="M36 40 C36 16 72 16 72 40 M36 40 C36 16 0 16 0 40" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#colonnade)" />
    </svg>
  );
}

export function ChapelFrame() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      <div className="absolute inset-y-0 left-0 hidden w-24 text-[color:var(--primary)] opacity-[0.17] lg:block xl:w-32">
        <Colonnade className="h-full w-full" />
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-24 text-[color:var(--primary)] opacity-[0.17] lg:block xl:w-32">
        <Colonnade className="h-full w-full" />
      </div>
    </div>
  );
}

export function ChapelHeroArch() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <TraceryArch className="absolute left-1/2 top-4 h-[21rem] w-full max-w-4xl -translate-x-1/2 text-[color:var(--primary)] opacity-45 sm:top-6 sm:h-[32rem] sm:opacity-60" />
      <RoseWindow className="absolute left-1/2 top-6 hidden h-32 -translate-x-1/2 text-[color:var(--accent)] opacity-70 sm:block sm:h-40" />
    </div>
  );
}
