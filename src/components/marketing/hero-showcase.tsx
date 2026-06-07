"use client";

import { CalendarRange, ImageIcon, Palette, Sparkles } from "lucide-react";
import { motion, useReducedMotion, type TargetAndTransition, type Variants } from "motion/react";

const cards = [
  {
    icon: CalendarRange,
    title: "Structured events",
    body: "Mehendi to reception, each with timing, venue, dress code, and guidance.",
    accent: "from-[#f6d7d0] to-[#fff5ef]",
  },
  {
    icon: ImageIcon,
    title: "Guest memories",
    body: "Moderated uploads, wishes, and a cinematic post-event gallery.",
    accent: "from-[#e7d3c4] to-[#fbf3ec]",
  },
  {
    icon: Palette,
    title: "Template engine",
    body: "One content model, many premium visual directions — switch any time.",
    accent: "from-[#e3d6f0] to-[#f7f0fb]",
  },
];

// Decorative sparkle positions (percent of the container box).
const sparkles = [
  { top: "8%", left: "12%", size: 16, delay: 0 },
  { top: "22%", left: "86%", size: 22, delay: 0.6 },
  { top: "70%", left: "8%", size: 18, delay: 1.1 },
  { top: "88%", left: "78%", size: 14, delay: 1.6 },
  { top: "46%", left: "94%", size: 12, delay: 0.9 },
];

export function HeroShowcase() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.14, delayChildren: 0.1 },
    },
  };

  const cardIn: Variants = {
    hidden: { opacity: 0, y: 28, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
  };

  return (
    <div className="relative w-full max-w-xl lg:max-w-lg">
      {/* Soft glow behind the stack */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_30%_20%,rgba(199,155,102,0.28),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(123,88,66,0.18),transparent_55%)] blur-2xl"
      />

      {/* Floating sparkles */}
      {!reduce
        ? sparkles.map((s, i) => (
            <motion.div
              key={i}
              aria-hidden
              className="pointer-events-none absolute text-[color:var(--accent)]"
              style={{ top: s.top, left: s.left }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 0.9, 0.5, 0.9], scale: [0.6, 1, 0.85, 1], rotate: [0, 15, -10, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: s.delay }}
            >
              <Sparkles style={{ width: s.size, height: s.size }} />
            </motion.div>
          ))
        : null}

      {/* Card stack */}
      <motion.div
        className="relative flex flex-col gap-4"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {cards.map((card, index) => {
          const Icon = card.icon;
          // Gentle, staggered infinite float (disabled for reduced motion).
          const float: TargetAndTransition | undefined = reduce
            ? undefined
            : {
                y: [0, index % 2 === 0 ? -10 : -6, 0],
                transition: {
                  duration: 5.5 + index,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.4,
                },
              };

          return (
            <motion.div key={card.title} variants={cardIn} className="group">
              <motion.div
                animate={float}
                whileHover={reduce ? undefined : { y: -4, scale: 1.02 }}
                className={`relative overflow-hidden rounded-[1.6rem] border border-white/60 bg-white/80 p-5 shadow-[0_20px_60px_rgba(43,26,24,0.10)] backdrop-blur ${
                  index === 1 ? "lg:ml-10" : index === 2 ? "lg:ml-4" : ""
                }`}
              >
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${card.accent} opacity-70 blur-xl`}
                />
                <div className="relative flex items-start gap-4">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-[color:var(--primary)]/10 text-[color:var(--primary)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-[color:var(--text)]">{card.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{card.body}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
