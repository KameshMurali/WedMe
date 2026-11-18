import { cn } from "@/lib/utils";

// Scroll-driven motion for the public wedding site.
//
// THIS FILE USED TO BE motion/react, and that was the defect. Every primitive
// here resolved its `initial` prop into an inline style during the SERVER
// render, so the published pages shipped event cards carrying "RSVP to this
// event" — and, on the twelve ornamented designs, the couple's own monogram
// initials — at inline opacity:0. Without JS they were permanently invisible.
// These pages are read by guests on venue wifi and older phones, often by
// people who just want the address.
//
// So the house's own CSS motion contract, already proven on the marketing side,
// now runs here too: .scroll-reveal in globals.css, declared inside
// @supports (animation-timeline: view()) nested in prefers-reduced-motion:
// no-preference, with every keyframe running TO the resting state. The class
// inherits three things no JS path can have — the @supports gate, the
// reduced-motion `animation: none !important` null, and a resting state that IS
// the finished state. Nothing below starts hidden from the server, at all.
//
// The cadence is NOT shared: .scroll-reveal reads --reveal-lift / --reveal-span
// / --reveal-stagger, which site-shell.tsx re-declares per template chrome. One
// class, sixteen arrivals — otherwise this port would be the change that makes
// the sixteen designs more alike.
//
// There is no "use client" here any more. All three primitives are plain
// elements, so they render on the server and ship no JS of their own.

// Staggered entrance for lists — events, milestones, gallery tiles.
//
// The group itself no longer animates: it only existed to orchestrate motion's
// variant propagation, and `min-w-0` (see StaggerItem) is the one thing about it
// that was ever load-bearing.
export function StaggerGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("min-w-0", className)}>{children}</div>;
}

// One item inside a StaggerGroup. Safe to use outside one too — it then just
// reveals on its own as it scrolls into view.
//
// min-w-0 is load-bearing, not styling. As a grid item this wrapper defaults to
// `min-width: auto`, whose automatic minimum size is the content's MIN-CONTENT
// width — so a wide child forces its grid column past the track size and the
// page scrolls sideways. The cards this wraps previously sat in the grid
// directly and set `overflow-hidden`, which zeroes that automatic minimum; the
// wrapper has `overflow: visible` and reintroduced it. A wrapper whose only job
// is animation must stay layout-neutral, so it opts out explicitly.
//
// `--i` shifts the animation RANGE per sibling rather than adding a delay,
// because a scroll-driven animation has no time axis for a delay to live on.
//
// WHICH IS WHY IT MUST BE CAPPED. A delay only makes a late item late; a range
// shift moves the window the reveal happens IN, so an unbounded `--i` pushes
// that window off the top of the screen and the item is never fully opaque
// while a guest can see it. Measured on the radiant chrome (the widest cadence,
// 6% per step): at --i=3 a card reaches full opacity with its heading 60% down
// the viewport, at --i=10 at the top edge, at --i=16 half a viewport ABOVE it.
// Real couples hit this — the multi-ceremony designs are exactly the ones with
// twenty-plus events — and the demo's five never did, which is why it took a
// forced probe to find. Capped here in the primitive rather than at the call
// site so no future caller has to rediscover it; page.tsx already passes
// `index % 4`, which is 0-3 and crosses this untouched.
const MAX_STAGGER_STEPS = 3;

export function StaggerItem({
  children,
  className,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <div
      className={cn("scroll-reveal min-w-0", className)}
      style={
        {
          "--i": Math.min(Math.max(index, 0), MAX_STAGGER_STEPS),
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

// Slow vertical drift as the section scrolls past. Used for the hero ornament,
// where a little depth reads as craft rather than noise. The movement itself is
// .hero-ornament-drift in globals.css, off the main thread and off the server
// render; this is now just the element it hangs on.
export function ParallaxLayer({
  children,
  className,
  distance = 40,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  return (
    <div
      className={cn("hero-ornament-drift", className)}
      style={{ "--ornament-drift": `${distance}px` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

// Thin reading-progress bar pinned to the top of the page.
//
// A progress bar is the one thing here with no honest resting state: unanimated,
// a full-width hairline says the page has been read to the end. So the class
// defaults to display:none and is only shown inside the scroll-timeline gate —
// a browser that cannot drive it, or a guest who asked for reduced motion, gets
// no hairline rather than a lie.
export function ScrollProgressBar({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "scroll-progress-hairline fixed inset-x-0 top-0 z-50 h-[3px] bg-[color:var(--accent)]",
        className,
      )}
    />
  );
}
