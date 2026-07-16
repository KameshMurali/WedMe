"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type GalleryAsset = {
  id: string;
  url: string;
  title: string | null;
  caption: string | null;
  altText: string | null;
};

// Minimum horizontal swipe distance (in px) to count as a frame change.
const SWIPE_THRESHOLD = 40;

export function GallerySpotlight({ assets }: { assets: GalleryAsset[] }) {
  const [active, setActive] = useState(0);
  const total = assets.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const thumbnailRailRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (index: number) => {
      if (!total) return;
      // Wrap around so the rail feels continuous.
      const next = ((index % total) + total) % total;
      setActive(next);
    },
    [total],
  );

  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);
  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Keyboard navigation — arrows + Home/End for jumps. Only triggers when the
  // gallery is in view, so it doesn't fight with other on-page interactions.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const inView =
        rect.bottom > 0 &&
        rect.top < (window.innerHeight || document.documentElement.clientHeight);
      if (!inView) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(total - 1);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, goTo, total]);

  // Keep the active thumbnail centered in the rail. We scroll the rail div
  // directly (horizontal only) instead of calling scrollIntoView, because
  // scrollIntoView with block:"nearest" also scrolls the PAGE vertically when
  // the thumbnail is below the viewport — causing an unexpected jump to the
  // bottom of the page whenever the user changes photos.
  useEffect(() => {
    const rail = thumbnailRailRef.current;
    const target = thumbnailRefs.current[active];
    if (!rail || !target) return;
    const railRect = rail.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const scrollLeft =
      rail.scrollLeft + targetRect.left - railRect.left - (rail.clientWidth - target.clientWidth) / 2;
    rail.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
  }, [active]);

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const dx = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx < 0) goNext();
    else goPrev();
  }

  if (!total) return null;

  const current = assets[active];
  // Preload immediate neighbors so navigation feels instant.
  const neighborIndexes = new Set([
    (active - 1 + total) % total,
    (active + 1) % total,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Wedding gallery"
    >
      {/* Hero frame
          object-contain inside a constrained-height container lets every
          image render at its NATURAL aspect ratio — landscapes fill width,
          portraits fill height, no crop. The neutral surface acts as a
          clean photo frame around any letterbox/pillarbox bars. */}
      <div
        className="group relative overflow-hidden rounded-[calc(var(--radius)-0.2rem)] rich-shadow"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="relative flex items-center justify-center bg-[color:var(--surface)] sm:min-h-[60vh]"
          style={{ minHeight: "55vh", maxHeight: "82vh" }}
        >
          {assets.map((asset, index) => (
            <Image
              key={asset.id}
              src={asset.url}
              alt={asset.altText ?? asset.title ?? "Wedding photo"}
              // Intrinsic-style sizing: we don't know the natural dimensions
              // up front, so we pass large bounds and let the browser shrink
              // to fit via object-contain + max-h on the wrapper.
              width={2400}
              height={1600}
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority={index === active}
              loading={index === active || neighborIndexes.has(index) ? "eager" : "lazy"}
              className={cn(
                "max-h-[82vh] w-auto max-w-full object-contain transition-opacity duration-500 ease-out",
                // Only the active image takes layout space; non-active are
                // absolute-positioned and invisible so they preload but don't
                // affect the container height.
                index === active
                  ? "relative opacity-100"
                  : "pointer-events-none absolute inset-0 m-auto opacity-0",
              )}
            />
          ))}

          {/* Prev / Next buttons. Always available on touch + small screens;
              on desktop they fade in on hover so the image breathes. */}
          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[color:var(--text)] shadow-md backdrop-blur transition hover:bg-white sm:left-5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[color:var(--text)] shadow-md backdrop-blur transition hover:bg-white sm:right-5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>

        {/* Caption strip — sits OUTSIDE the image area so the photo is never
            covered. Frame counter on the left, title + caption alongside. */}
        <div className="flex flex-col gap-2 border-t border-black/8 bg-white/85 px-5 py-4 backdrop-blur sm:flex-row sm:items-baseline sm:gap-5 sm:px-7">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <div className="flex-1">
            {current?.title ? (
              <p className="font-display text-xl text-[color:var(--text)] sm:text-2xl">
                {current.title}
              </p>
            ) : null}
            {current?.caption ? (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                {current.caption}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Thumbnail rail */}
      {total > 1 ? (
        <div
          ref={thumbnailRailRef}
          className="mt-5 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:thin] [-ms-overflow-style:none]"
          role="tablist"
          aria-label="Choose a photo"
        >
          {assets.map((asset, index) => {
            const isActive = index === active;
            return (
              <button
                key={asset.id}
                ref={(el) => {
                  thumbnailRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Photo ${index + 1}${asset.title ? `: ${asset.title}` : ""}`}
                onClick={() => goTo(index)}
                className={cn(
                  "relative h-20 w-28 flex-none overflow-hidden rounded-2xl border bg-black/[0.04] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:h-24 sm:w-32",
                  isActive
                    ? "border-[color:var(--primary)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_30%,transparent)]"
                    : "border-black/8 opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={asset.url}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover object-top"
                />
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Affordance hint — small, only on devices with hover (desktop) */}
      <p className="mt-3 hidden text-center text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)] sm:block">
        Tap, swipe, click, or use arrow keys
      </p>
    </div>
  );
}
