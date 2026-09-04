"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

// The couple's monogram, generated from their names rather than uploaded.
//
// The public snapshot only carries `coupleNames` as one joined string
// ("Kamesh & Monisha") — site-snapshot.ts joins partnerOne/partnerTwo before
// the data ever reaches here — so the two initials have to be parsed back out.
// Every fallback below exists because that string is user-controlled and can be
// a single brand name, a one-word nickname, or contain no separator at all.

const SEPARATORS = /\s*(?:&|\+|\band\b|\bweds\b)\s*/i;

export function deriveInitials(coupleNames: string): { first: string; second: string | null } {
  const cleaned = (coupleNames ?? "").trim();
  if (!cleaned) return { first: "", second: null };

  const parts = cleaned
    .split(SEPARATORS)
    .map((part) => part.trim())
    .filter(Boolean);

  const initialOf = (value: string) => {
    // Intl-safe first character: a Tamil or emoji grapheme can be multiple code
    // units, so [0] would slice one in half and render a replacement glyph.
    const [first] = Array.from(value);
    return (first ?? "").toLocaleUpperCase();
  };

  if (parts.length >= 2) {
    return { first: initialOf(parts[0]), second: initialOf(parts[1]) };
  }

  // No separator: fall back to the first letters of the first two words.
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return { first: initialOf(words[0]), second: initialOf(words[1]) };
  }

  // Single word — one initial, no ampersand, no empty second letter slot.
  return { first: initialOf(cleaned), second: null };
}

// Original lotus, drawn as a ring of petals so it can bloom outward from the
// centre. Not traced from the reference image.
function LotusBloom({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const petals = [-64, -32, 0, 32, 64];

  return (
    <svg className={className} viewBox="0 0 100 72" fill="none" aria-hidden="true">
      {petals.map((angle, index) => (
        // The rotation lives on a STATIC <g>, never on the animated element.
        // motion writes transforms to CSS, and a CSS transform overrides an
        // SVG transform attribute entirely — putting rotate() on the motion
        // element collapsed all five petals onto one unrotated stack.
        <g key={angle} transform={`rotate(${angle} 50 66)`}>
          <motion.path
            d="M50 66 C40 48 40 28 50 10 C60 28 60 48 50 66 Z"
            fill="currentColor"
            fillOpacity={index === 2 ? 0.85 : 0.5}
            initial={reduceMotion ? false : { scaleY: 0.15, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ once: true }}
            style={{ transformOrigin: "50px 66px" }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
              // Petals open from the centre outward, not left to right.
              delay: 0.3 + Math.abs(index - 2) * 0.1,
            }}
          />
        </g>
      ))}
    </svg>
  );
}

// Small leaf sprig tucked against the second initial.
function LeafSprig({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 60" fill="none" aria-hidden="true">
      <path d="M20 58 C20 40 20 20 20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 40 C10 36 6 26 8 18 C18 20 22 30 20 40 Z" fill="currentColor" fillOpacity="0.75" />
      <path d="M20 28 C30 24 34 14 32 6 C22 8 18 18 20 28 Z" fill="currentColor" fillOpacity="0.6" />
    </svg>
  );
}

export function CoupleMonogram({
  coupleNames,
  className,
}: {
  coupleNames: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const { first, second } = deriveInitials(coupleNames);

  if (!first) return null;

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
  };

  // Latin capitals can be kerned into each other for the classic interlocked
  // monogram look. Non-Latin scripts cannot — Tamil glyphs are wider, carry
  // different side bearings, and overlap into an illegible blob. So the overlap
  // is applied only when both initials are Latin.
  const isLatin = (value: string) => /^[A-Za-z]$/.test(value);
  const interlock = isLatin(first) && (second === null || isLatin(second));

  return (
    // One role="img" for the whole mark: a screen reader should hear the
    // couple's names, not two stray letters and a flower.
    //
    // Laid out as a vertical crest — lotus above, initials below — rather than
    // tucking the lotus beside the first letter. Beside it, the lotus sat
    // behind the glyph in the identical --primary colour and was invisible, and
    // any side placement that clears a Latin "S" collides with a wider Tamil
    // or Devanagari glyph. A crest is script-independent.
    <motion.div
      role="img"
      aria-label={coupleNames}
      className={cn("relative inline-flex flex-col items-center", className)}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
    >
      <LotusBloom className="h-auto w-20 text-[color:var(--primary)] sm:w-24" />

      <div
        className={cn(
          "relative -mt-1 flex items-center justify-center",
          interlock ? null : "gap-2",
        )}
      >
        <motion.span
          aria-hidden="true"
          variants={reduceMotion ? undefined : letterVariants}
          className="font-display text-[6rem] leading-[0.85] text-[color:var(--primary)] sm:text-[8rem]"
        >
          {first}
        </motion.span>

        {second ? (
          <motion.span
            aria-hidden="true"
            variants={reduceMotion ? undefined : letterVariants}
            className={cn(
              "font-display leading-[0.85] text-[color:var(--accent)]",
              "text-[6rem] sm:text-[8rem]",
              interlock ? "-ml-4 sm:-ml-6" : null,
            )}
          >
            {second}
          </motion.span>
        ) : null}

        {second ? (
          <span className="pointer-events-none absolute -right-5 bottom-2 w-6 text-[color:var(--accent)] sm:-right-7 sm:w-8">
            <LeafSprig className="h-auto w-full" />
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
