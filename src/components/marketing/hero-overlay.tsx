// The landing overture: the wordmark and a platform-info tile standing on two
// CSS 3D planes over the hero, receding at different rates as the page scrolls
// so the footage underneath takes over the movement.
//
// Why CSS 3D and not WebGL. three.js is 130KB gzipped before a line of scene
// code and @react-three/fiber lands at 244KB, which is more JavaScript than the
// rest of this page put together. Weight is not the disqualifying problem
// though: text rasterised into a canvas is not selectable, not in the
// accessibility tree, and NOT INDEXABLE. The wordmark and the three facts below
// are the page's own claim about what this product is, so they have to be real
// DOM text in the server-rendered HTML. They are.
//
// Why this is a Server Component. There is no state and no measurement here:
// the recession is a scroll-progress timeline declared in globals.css, which
// runs off the main thread. A JS scroll listener would do this work on the same
// thread that has to answer the first tap on the hero's own call to action.
//
// This is an OVERLAY LAYER ONLY. It does not own the hero, it paints no
// background of its own, and the hero band is complete without it — poster,
// video, scrim, headline and buttons all still work if every rule below is
// dropped. It expects a relatively positioned parent.

// Kept terse, and that is a MEASURED constraint rather than a style preference.
// The hero's content block is bottom-aligned with `pt-20 sm:pt-24`, so the first
// thing underneath this strip is the "Craft Your Celebration" badge, which
// starts 80px below the top of the band on a phone and 96px from 640px up — NOT
// the headline, which is another 46px further down. The resting strip is what a
// visitor without scroll timelines sees permanently, so it has to fit in that
// gap or it parks on the badge. Measured at 320px it ends at 69px: 11px of
// clearance. The first draft of fact three ("RSVP, photos and messages per
// event") wrapped to a third line, ended at 97.5px, and overlapped by 17.5px.
//
// None of the three may restate the headline they are painted over. Fact one
// read "Eight ceremonies, one link" against an h1 reading "Five ceremonies." and
// "One beautiful link." — two different ceremony counts and the same claim
// twice, overlapping each other for the whole overture, which reads as a bug
// rather than as emphasis. Ordering is the thing this product has that the
// headline does not already say.
const PLATFORM_FACTS = ["Every ceremony, in order", "Sixteen templates", "RSVPs per event"];

// `onMedia` is the hero's own single condition, not a style option. Every colour
// in the hero switches on whether `heroMedia` is non-null, because white type is
// unreadable on the bare bg-hero-mesh gradient and the page's dark ink is
// unreadable on the footage. heroMedia is a deliberate switch — page.tsx says to
// leave it null until the files are actually in public/hero, so that the
// homepage never ships 404s — which means an overlay that hard-codes white goes
// invisible the moment someone follows that instruction. It defaults to the
// media treatment so the no-prop call site keeps today's rendering.
export function HeroOverlay({ onMedia = true }: { onMedia?: boolean }) {
  const ink = onMedia ? "text-white [text-shadow:0_2px_18px_rgba(18,10,13,0.75)]" : "text-[#1f1117]";
  const panel = onMedia
    ? "border-white/15 bg-[rgba(18,10,13,0.72)] text-white/85"
    : "border-black/10 bg-white/80 text-stone-700";

  return (
    // NOT absolutely positioned any more, and that is the fix rather than a
    // refactor. As an `absolute inset-0` layer this painted at the top of the
    // band while the hero's own content block starts 80-96px down, so the two
    // occupied the same region and the facts strip parked on the "Craft Your
    // Celebration" badge — measured at 161x13px of overlap. Every attempt to
    // solve that by shrinking the strip was treating the symptom: a free
    // floating layer over laid-out text has no way to reserve room, so any
    // font fallback, any larger browser default, any longer word re-breaks it.
    //
    // Occupying layout costs the recession nothing. translateZ still moves it
    // against the container's perspective; it simply cannot collide any more.
    <div className="pointer-events-none relative z-10">
      {/* .hero-overture carries the perspective and transform-style. No
          overflow, filter, opacity or will-change on it or on this wrapper:
          each of those forces `transform-style: preserve-3d` to compute to
          `flat` on the element carrying it, which would collapse both planes to
          one depth and turn the recession into a plain slide. will-change is
          the tempting one — it would also pin a composited layer for a
          decoration that is on screen for half a viewport — so it is
          deliberately absent, here and in the CSS. */}
      <div className="hero-overture flex flex-col items-start">
        {/* The near plane. Magnified by translateZ against the container's
            perspective, never by `scale()`: text under a fractional scale
            rasterises blurry in both Blink and WebKit. At rest it carries no
            transform at all, so the state a reader actually stops on is
            pixel-crisp — the blur only exists mid-recession, where it reads as
            depth of field rather than as a defect.

            There is no third size step at lg. At text-3xl the resting strip
            ended 0.4px above the badge at 1024px and wider — a sub-pixel miss,
            which any Cormorant fallback (Georgia is 4% taller in the box) or a
            bumped browser default font size turns into an overlap. */}
        {/* The further plane. It carries its own translucent panel rather than
            bare text because during the overture it passes in front of the hero
            headline, and at 320px there is no arrangement where it does not —
            the band only has 80px above the badge. Light type over light type is
            unreadable whatever the depth says, so the panel is what makes the
            overlap legible.

            A flat fill, not .glass-panel or backdrop-blur: backdrop-filter on an
            element moving in a 3D context repaints the region behind it every
            frame, and it is the one effect that reliably drops this band off the
            compositor.

            sm:py-2 rather than the roomier py-2.5 it started as, for the same
            reason the lg size step is gone: the padding is part of the resting
            strip's height budget against the hero's 96px of top padding. */}
        <ul
          className={`hero-overture-near mb-5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 rounded-[var(--radius)] border px-3 py-1.5 text-[10px] uppercase leading-tight tracking-[0.1em] sm:mb-6 sm:gap-x-3 sm:gap-y-1 sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.16em] ${panel}`}
        >
          {PLATFORM_FACTS.map((fact, index) => (
            // min-w-0 on the flex items, not decoration: a flex child defaults
            // to min-width:auto, whose automatic minimum is the content's
            // min-content width, so a long fact would push this tile wider than
            // its track instead of wrapping. This repo has been bitten by
            // exactly that (see motion-primitives.tsx:56).
            <li key={fact} className="flex min-w-0 items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-[color:var(--accent)]">
                  &middot;
                </span>
              ) : null}
              <span className="min-w-0">{fact}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
