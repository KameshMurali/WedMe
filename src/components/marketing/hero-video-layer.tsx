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
//   - sized to the screen. A phone has no use for the 1920 master, and on a
//     mobile data plan the difference between the two tiers is most of the
//     cost of the feature.
//   - opacity 0 until `canplay`, so it cross-fades up from the poster instead
//     of flashing a black frame.

type Connection = {
  saveData?: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
};

// effectiveType has FOUR buckets — "slow-2g", "2g", "3g", "4g" — and the first
// version of this guard caught only the slowest two. That made it look
// protective while being close to dead code, because genuine 2g barely exists
// on real networks any more. Chrome derives these buckets from observed
// latency and throughput, and "3g" means round-trips up to 1.4 SECONDS, or as
// little as 70kbps. A measured hotel-wifi profile (1.2Mbps, 400ms RTT) reports
// exactly that, with saveData false — so the old guard let the 692KB mobile
// tier download anyway and the hero showed nothing for about seven seconds.
// That is the connection most guests are actually on.
const LIGHTWEIGHT_TYPES = new Set(["slow-2g", "2g", "3g"]);

// effectiveType is a coarse bucket, so these catch a link that reports "4g"
// while behaving badly. downlink is Mbps and rtt is ms, both deliberately
// rounded by the browser for fingerprinting resistance. The narrow tier is
// ~692KB ≈ 5.5Mbit, so below 1.5Mbps it cannot arrive in a sensible time.
const MIN_DOWNLINK_MBPS = 1.5;
const MAX_RTT_MS = 500;

export type HeroVideoTier = { mp4: string; webm?: string };

// Device pixels, not CSS pixels. A 390px phone at DPR 3 needs 1170 real pixels
// and a 768px tablet at DPR 2 needs 1536, so a CSS-width breakpoint would hand
// the phone the smaller file and the tablet the same one — backwards. Comparing
// against the narrow tier's own width is the question actually being asked:
// "is this screen bigger than the smaller file?"
const NARROW_TIER_WIDTH = 1280;

function prefersLightweight() {
  const connection = (navigator as Navigator & { connection?: Connection }).connection;

  // navigator.connection is Chromium-only: Safari and Firefox report nothing,
  // so this returns false there and those visitors always get the video. That
  // is a real hole and is NOT fixed here — stating it rather than implying the
  // guard is universal. The honest mitigation is that the video is already
  // weightless until after hydration and the poster alone is a complete hero.
  if (!connection) return false;

  if (connection.saveData) return true;
  if (connection.effectiveType && LIGHTWEIGHT_TYPES.has(connection.effectiveType)) return true;

  // downlink of exactly 0 means "unknown", not "no bandwidth", so it must not
  // trip the guard.
  if (typeof connection.downlink === "number" && connection.downlink > 0 && connection.downlink < MIN_DOWNLINK_MBPS) {
    return true;
  }
  if (typeof connection.rtt === "number" && connection.rtt > MAX_RTT_MS) return true;

  return false;
}

function pickTier(wide: HeroVideoTier, narrow: HeroVideoTier): HeroVideoTier {
  const devicePixels = window.innerWidth * (window.devicePixelRatio || 1);
  return devicePixels > NARROW_TIER_WIDTH ? wide : narrow;
}

export function HeroVideoLayer({
  wide,
  narrow,
  className,
}: {
  wide: HeroVideoTier;
  narrow: HeroVideoTier;
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

    const tier = pickTier(wide, narrow);
    const preferWebm = Boolean(tier.webm) && video.canPlayType("video/webm") !== "";
    video.src = preferWebm && tier.webm ? tier.webm : tier.mp4;
    video.load();
  }, [wide, narrow, reduceMotion]);

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
