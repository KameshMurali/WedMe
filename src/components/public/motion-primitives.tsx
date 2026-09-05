"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import { cn } from "@/lib/utils";

// Scroll-driven motion for the public wedding site.
//
// Every primitive here checks useReducedMotion and degrades to a plain static
// render — not a shortened animation, none at all. These pages are read by
// guests on venue wifi and older phones, often by people who just want the
// address, so motion is decoration that must never gate the content: nothing
// below starts hidden unless it is also guaranteed to be revealed.

// Staggered entrance for lists — events, milestones, gallery tiles.
export function StaggerGroup({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={cn("min-w-0", className)}>{children}</div>;

  return (
    <motion.div
      className={cn("min-w-0", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

// One item inside a StaggerGroup. Safe to use outside one too — it then just
// animates on its own as it scrolls into view.
//
// min-w-0 is load-bearing, not styling. As a grid item this wrapper defaults to
// `min-width: auto`, whose automatic minimum size is the content's MIN-CONTENT
// width — so a wide child forces its grid column past the track size and the
// page scrolls sideways. The cards this wraps previously sat in the grid
// directly and set `overflow-hidden`, which zeroes that automatic minimum; the
// wrapper has `overflow: visible` and reintroduced it. A wrapper whose only job
// is animation must stay layout-neutral, so it opts out explicitly.
export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={cn("min-w-0", className)}>{children}</div>;

  return (
    <motion.div
      className={cn("min-w-0", className)}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
      }}
    >
      {children}
    </motion.div>
  );
}

// Slow vertical drift as the section scrolls past. Used for the hero ornament,
// where a little depth reads as craft rather than noise.
export function ParallaxLayer({
  children,
  className,
  distance = 60,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Hooks must run unconditionally, so the transform is always created and the
  // reduced-motion check happens at render.
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  if (reduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// Thin reading-progress bar pinned to the top of the page. Springy rather than
// linear so it feels attached to the scroll instead of chasing it.
export function ScrollProgressBar({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-[color:var(--accent)]",
        className,
      )}
    />
  );
}

// Letter-by-letter rise for the couple's names. Splits on characters but keeps
// whole words unbreakable, so a long name wraps sensibly instead of shattering.
export function RevealText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <span className={className}>{text}</span>;

  return (
    <motion.span
      className={cn("inline-block", className)}
      initial="hidden"
      animate="visible"
      aria-label={text}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.035, delayChildren: delay } },
      }}
    >
      {text.split(" ").map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
          {word.split("").map((char, charIndex) => (
            <motion.span
              key={`${char}-${charIndex}`}
              aria-hidden="true"
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: "0.4em" },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
            >
              {char}
            </motion.span>
          ))}
          {wordIndex < text.split(" ").length - 1 ? <span className="inline-block">&nbsp;</span> : null}
        </span>
      ))}
    </motion.span>
  );
}
