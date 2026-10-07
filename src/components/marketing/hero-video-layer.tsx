"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

// The video half of the editorial hero. The POSTER is rendered server-side by
// page.tsx and stays the LCP element; this only ever layers motion on top of a
// hero that is already complete without it.
//
// A video above the fold is the most expensive thing you can put there, so it
// is loaded defensively:
//
//   - the element ships with preload="none" and NO src. The source is attached
//     imperatively in an effect, which cannot run until after hydration, so the
//     video can never compete with the poster for bandwidth during first paint.
//   - never attached at all under reduced motion, under Save-Data, or on 2g.
//     Those visitors keep the poster, which is the whole picture anyway.
//   - paused off-screen (the same useInView pattern hero-showcase.tsx uses for
//     its float loops) so scrolling past returns the page to idle.
//   - opacity 0 until `canplay`, so it cross-fades up from the poster instead
//     of flashing a black frame.

type Connection = { saveData?: boolean; effectiveType?: string };

function prefersLightweight() {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;
  if (!connection) return false;
  if (connection.saveData) return true;
  return connection.effectiveType === "2g" || connection.effectiveType === "slow-2g";
}

export function HeroVideoLayer({
  mp4,
  webm,
  className,
}: {
  mp4: string;
  webm?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const inView = useInView(ref, { amount: 0.1 });
  const [ready, setReady] = useState(false);

  // Attaching the source here, rather than as <source> children, is what keeps
  // it off the critical path: the element is in the markup but weightless until
  // this runs. The effect only writes to the DOM — there is no setState in it,
  // so it cannot cascade a render.
  //
  // reduceMotion is null on the first client render while motion reads the
  // media query, so this waits for a real boolean rather than arming on a
  // falsy initial value.
  useEffect(() => {
    const video = ref.current;
    if (!video || reduceMotion !== false || prefersLightweight()) return;
    if (video.src) return;

    const preferWebm = Boolean(webm) && video.canPlayType("video/webm") !== "";
    video.src = preferWebm && webm ? webm : mp4;
    video.load();
  }, [mp4, webm, reduceMotion]);

  useEffect(() => {
    const video = ref.current;
    if (!video || !video.src) return;
    if (inView) {
      // play() rejects on some mobile browsers when their gesture heuristics
      // are unhappy. There is nothing to recover — the poster is still there —
      // so swallow it rather than throwing an unhandled rejection.
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, ready]);

  return (
    <video
      ref={ref}
      aria-hidden="true"
      muted
      loop
      playsInline
      preload="none"
      onCanPlay={() => setReady(true)}
      className={className}
      style={{ opacity: ready ? 1 : 0, transition: "opacity 900ms ease-out" }}
    />
  );
}
