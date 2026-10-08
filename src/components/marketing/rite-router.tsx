"use client";

import { useEffect, useRef } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelfDrawingKolam } from "@/components/public/kolam";
import { DrawnFigure } from "@/components/public/tradition-divider";

// The commit boundary of the marketing homepage.
//
// Everything above this band is scrubbed by scroll position: the hero media
// drifts, the ceremony spine is scrolled THROUGH, the guest deck stacks. This
// band is where that stops, because this is where the reader has to choose and
// a surface that is still moving is still being pitched. So the transition INTO
// stillness is the effect: the colour of every tradition above drains out of
// the band over 700ms and leaves a neutral field with eight doors on it.
//
// "Stillness" here means nothing is scrubbed, NOT that nothing moves: five of
// the eight doors carry a self-drawing ornament, and each draws over ~2.5s as
// its own tile enters view. Enter-once motion cannot reverse under a trackpad,
// so it does not undo the beat — but it does land on the decision surface,
// which is the thing to weigh before anyone lengthens those timings.
//
// WHY THIS BEAT IS A CLIENT COMPONENT AND THE OTHERS ARE NOT.
// The ceremony spine and the guest deck are CSS on a scroll timeline and ship
// no JavaScript at all. This one cannot be, and the reason is the point of the
// beat rather than a shortcut: a scroll timeline SCRUBS. Its progress is the scroll position, so
// scrolling back up un-resolves the band and scrolling down resolves it again,
// and the reader making the decision watches the decision surface breathe
// under the trackpad. A resolve has to be one-shot and on its own clock, which
// means a plain CSS transition, which means something has to flip a state once.
//
// The flip is an IntersectionObserver (motion's useInView, `once`), not a
// scroll listener: it reports once and detaches, and the attribute below is
// written at most twice in the life of the page. That is the same mechanism
// Reveal and the drawn ornaments already use, which is what the house rule
// carves out for enter-once work. Nothing here runs per frame on the thread
// that has to answer the first tap.
//
// The settled state is what the SERVER renders, so the pre-resolve state has to
// be INSTALLED by script rather than rendered and then cleared. That inversion
// is deliberate: a reader with no JavaScript, a crawler, or anyone who asked
// for reduced motion gets the finished composition — neutral field, type at UI
// scale, eight working links — and never sees the state the effect starts from.
// The house rule that the unanimated state is the finished state holds here
// literally, not approximately.

const TEMPLATES_HREF = "/templates" as Route;
const REGISTER_HREF = "/register" as Route;
const DEMO_HREF = "/kammonbeginnings" as Route;

type Door = {
  tradition: string;
  // The rites this door is shaped around, plus — where two doors share a rite
  // sequence — the palette that actually distinguishes them. Real DOM text, so
  // the eight traditions this product covers are readable and crawlable
  // without opening anything.
  line: string;
  // The template page this door opens. Every key below is a live entry in
  // src/lib/template-registry.ts, and /templates/[templateKey] generates one
  // static page per registry key with `dynamicParams = false` — so a key that
  // drifted out of the registry 404s loudly instead of quietly rendering
  // somebody else's design. The previous version of this band failed review
  // because a door pointed at `#templates`, an id that existed nowhere in the
  // document; a registry key is checkable, an invented fragment is not.
  opens: string;
  // Every registry key this door covers, the representative included. The
  // count printed on the tile is this array's length rather than a number
  // typed by hand, and the eight arrays together account for all sixteen
  // templates exactly once.
  covers: string[];
  // Only five of the eight traditions have a drawn ornament in this product.
  // The other three carry none rather than borrowing one: a kolam is drawn at
  // the threshold of a Tamil or wider Indic home, and putting it on a
  // destination or editorial door would be the same category error as
  // crowning a Nikkah page with a lotus (see tradition-divider.tsx).
  ornament: "kolam" | "girih" | "chapel" | "lantern" | "desert" | null;
};

const doors: Door[] = [
  {
    tradition: "South Indian & Tamil",
    line: "Mehendi · Muhurtham · Reception",
    opens: "temple-gold",
    covers: ["temple-gold", "kolam-blush"],
    ornament: "kolam",
  },
  {
    tradition: "North Indian",
    line: "Mehendi · Haldi · Sangeet · Reception",
    opens: "marigold-festive",
    covers: ["marigold-festive", "traditional-celebration"],
    ornament: null,
  },
  {
    tradition: "Nikkah & Walima",
    line: "Nikkah · Walima · emerald and pearl",
    opens: "emerald-pearl",
    covers: ["emerald-pearl"],
    ornament: "girih",
  },
  {
    tradition: "Khaleeji",
    line: "Nikkah · Walima · sand, oud and brass",
    opens: "desert-neutral",
    covers: ["desert-neutral"],
    ornament: "desert",
  },
  {
    tradition: "Church ceremony",
    line: "Ceremony · Reception · ivory and stained glass",
    opens: "chapel-ivory",
    covers: ["chapel-ivory"],
    ornament: "chapel",
  },
  {
    tradition: "Chinese tea ceremony",
    line: "Tea ceremony · banquet · crimson and gold",
    opens: "crimson-gold",
    covers: ["crimson-gold"],
    ornament: "lantern",
  },
  {
    tradition: "Destination",
    line: "Ceremony · Reception, somewhere with a view",
    opens: "shoreline-blue",
    covers: ["shoreline-blue", "olive-grove", "palm-and-teak", "atoll-white"],
    ornament: null,
  },
  {
    tradition: "Modern & editorial",
    line: "Ceremony · Reception, no ornament",
    opens: "minimal-luxury",
    covers: ["classic-elegant", "floral-romantic", "minimal-luxury", "cinematic-modern"],
    ornament: null,
  },
];

export function RiteRouter() {
  const bandRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  // `amount: "some"` with a shrunk root, NOT a fraction of the band. A
  // fraction is an intersectionRatio threshold, and this band is taller than a
  // phone in landscape — at 390x400 it measures 2106px, so a quarter of it can
  // never be on screen at once and the threshold never fires. Measured: the
  // band stayed in the pre-resolve state permanently, the saturated field
  // stranded under the reader making the decision. The negative bottom margin
  // does the job a fraction was meant to do: the resolve waits until the band
  // has climbed an eighth of the way up the screen, at any band height.
  const inView = useInView(bandRef, { once: true, amount: "some", margin: "0px 0px -12% 0px" });

  // data-rite-state is NEVER rendered. React emits the band without it, which
  // is the settled state, and the two effects below are the only writers: one
  // adds "arriving", one removes it again. Keeping it out of the render tree
  // is what makes the settled state unconditional — there is no path, failed
  // hydration included, where the markup carries a state the CSS has to undo —
  // and it is also why neither effect calls setState: a state flip here would
  // re-render the whole band to change one attribute, which is what
  // react-hooks/set-state-in-effect is pointing at.
  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;

    // The CSS is the real reduced-motion guard — every rule that moves sits
    // behind prefers-reduced-motion: no-preference — so this is belt and
    // braces. It still clears, because useReducedMotion reports null on the
    // first pass and the real preference only on the second.
    if (reduceMotion) {
      band.removeAttribute("data-rite-state");
      return;
    }

    // Only install the pre-resolve state while the band is still off screen.
    // Measured synchronously here rather than read off `inView`, because
    // IntersectionObserver reports on a later frame: trusting it would, for
    // anyone who deep-links or lands mid-page, flash the saturated field into
    // their face and then take it away. That is an entrance, which is the one
    // thing this beat must not be.
    if (band.getBoundingClientRect().top < window.innerHeight) return;

    band.dataset.riteState = "arriving";
  }, [reduceMotion]);

  // Removing the attribute rather than setting it to "settled" returns the
  // element to exactly the shape the server sent, so there is only ever one
  // state to reason about in the stylesheet: "arriving", or absent.
  //
  // The observer is the normal path. `scrollend` is the net under it, and the
  // net is load-bearing because IntersectionObserver reports threshold
  // CROSSINGS, not positions. An instant jump from above this band to below it
  // — find-in-page, End, a programmatic scrollTo with behavior "instant" —
  // moves the band out of the viewport between two frames, so no frame ever
  // observes it intersecting and `once: true` never fires. The attribute then
  // outlives the gesture, and a reader who scrolls back up finds the saturated
  // field under the doors with the heading stuck at scale(1.5) across its own
  // paragraph: the stranded start state the house rule exists to forbid,
  // reached without any animation having run.
  //
  // `scrollend` fires once when a gesture settles, not once per frame, so this
  // is not the continuous scroll listener the house rule bans, and it detaches
  // the moment it is no longer needed. The test is deliberately the band being
  // fully ABOVE the viewport rather than the observer's 12%: a band merely
  // peeking in is the observer's business, and duplicating that number here
  // would give it two places to drift. Browsers without `scrollend` keep
  // exactly today's behaviour.
  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;

    if (inView) {
      band.removeAttribute("data-rite-state");
      return;
    }

    const controller = new AbortController();
    document.addEventListener(
      "scrollend",
      () => {
        if (band.getBoundingClientRect().bottom > 0) return;
        band.removeAttribute("data-rite-state");
        controller.abort();
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, [inView]);

  return (
    <section ref={bandRef} className="rite-drain rite-band mt-20 border-y py-14 lg:mt-28 lg:py-20">
      <div className="rite-field" aria-hidden="true" />

      <div className="section-shell relative">
        <Badge>Pick your rite</Badge>

        {/* Deliberately NOT SectionHeading. That component is locked to
            text-4xl/5xl, which is this page's narrative scale — the scale the
            hero and the ceremony spine are written at. This band is not
            narrative, it is the control surface, so its heading rests one step
            below everything above it. The resolve is that step being taken:
            the type arrives at display scale and drops to this. */}
        {/* Does not restate the badge above it. "Pick your rite" / "Pick the
            rite that is yours" was the same sentence twice, two lines apart,
            and it also collided with the grid that follows this band, whose
            heading already opens on "Pick a feeling". The heading earns its
            place by naming the ACTION instead, and the paragraph says what
            distinguishes this band from that grid: these doors are grouped by
            rite, the grid below is grouped by feeling. */}
        <h2 className="rite-title mt-5 max-w-[22ch] font-display text-2xl leading-tight text-[color:var(--text)] sm:text-3xl">
          Open the tradition your ceremony belongs to.
        </h2>

        <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
          Eight doors, sixteen designs behind them — grouped by the rites a tradition actually holds
          rather than by colour. The design is only the surface, so a door is not a commitment:
          switching later leaves your events, your guests and your photos exactly where they are.
        </p>

        {/* min-w-0 on every grid child. A grid item's automatic minimum size is
            its min-content width, so one unbreakable string in a tile refuses
            to let the track shrink and the whole document scrolls sideways at
            320px. This repo has shipped that bug once already — see the comment
            at motion-primitives.tsx:56. */}
        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {doors.map((door, index) => (
            <li key={door.tradition} className="min-w-0">
              <Link
                href={`/templates/${door.opens}` as Route}
                className="panel-soft flex h-full min-w-0 flex-col gap-4 rounded-[1.4rem] border p-5 outline-none transition-colors duration-200 hover:border-[color:var(--accent)] hover:bg-[color:var(--surface)] focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]"
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  {/* The slot keeps its height whether or not the tradition has
                      a figure — the ornaments draw themselves when they scroll
                      into view, so a slot that collapsed while empty would also
                      shift the tile under the reader as the ink lands. The
                      three doors with no figure get a hairline instead of
                      nothing: an empty 44px square reads as an image that
                      failed to load. */}
                  <div className="flex h-11 w-11 shrink-0 items-center">
                    {door.ornament === "kolam" ? (
                      <SelfDrawingKolam className="h-11 w-11" />
                    ) : door.ornament ? (
                      <DrawnFigure kind={door.ornament} className="h-11 w-11" />
                    ) : (
                      <span aria-hidden="true" className="rite-mark" />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums tracking-[0.18em] text-[color:var(--accent)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="min-w-0">
                  <h3 className="font-display text-xl leading-tight text-[color:var(--text)]">
                    {door.tradition}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{door.line}</p>
                </div>

                <p className="mt-auto inline-flex min-w-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--primary)]">
                  {door.covers.length} {door.covers.length === 1 ? "design" : "designs"}
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold">
          <Button asChild>
            <Link href={TEMPLATES_HREF}>See all sixteen designs</Link>
          </Button>
          <Link
            href={DEMO_HREF}
            className="inline-flex items-center gap-1.5 text-[color:var(--primary)] hover:underline"
          >
            Look at a finished one <ArrowUpRight className="h-4 w-4 shrink-0" />
          </Link>
          <Link href={REGISTER_HREF} className="inline-flex items-center gap-1.5 hover:underline">
            Start yours free <ArrowUpRight className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
