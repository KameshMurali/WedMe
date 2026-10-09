import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SectionHeading } from "@/components/ui/section-heading";

// A held stage that the eight ceremonies are scrolled THROUGH, one at a time.
//
// It replaces the looping ceremony marquee, which spent the product's best
// structural argument — a wedding is ordered in time — on an infinite loop that
// said nothing and could not be read. The previous attempt at a replacement
// failed review as "one beat, fade-up, repeated eight times. Nothing is caused
// by scrolling; things merely arrive." So the mechanic here is not an entrance:
// the stage is pinned and the LIST moves inside it, in eight discrete holds, so
// the scroll position IS which ceremony you are looking at.
//
// No "use client": every beat is CSS on a scroll timeline. That is also why the
// conveyor is one transform on ONE element rather than eight stacked slides
// cross-fading — eight absolutely-positioned slides need `visibility: hidden`
// to stop the invisible ones swallowing taps meant for the visible one's link,
// and anything visibility-hidden leaves the accessibility tree and risks being
// discounted by a crawler. A conveyor keeps all eight links hit-testable,
// focusable and indexed, and costs one composited layer.
//
// WHY THE PINNED LAYOUT LIVES INSIDE THE MOTION GATE (see the returned CSS):
// the house rule is that the unanimated state must be the finished state. A
// conveyor cannot satisfy that literally — its last keyframe is translated by
// seven slots, not zero. So the rule is honoured where it actually matters:
// the sticky stage, the clipped viewport and the fixed slot heights are all
// declared INSIDE the same @supports + prefers-reduced-motion + min-width
// block as the animation, and can never be separated from it. Firefox, a
// reduced-motion visitor, and every phone get the plain vertical sequence
// below — same DOM, same text, no motion, nothing stranded.

const DEMO_EVENTS_HREF = "/kammonbeginnings/events" as Route;
const TEMPLATES_HREF = "/templates" as Route;
const REGISTER_HREF = "/register" as Route;

type Ceremony = {
  name: string;
  // The large left-hand word. Deliberately repeats across consecutive
  // ceremonies: on day three the word slides out and slides back in unchanged,
  // so the day reads as HELD while the rites pass through it. That is the
  // product's claim made visible, not a duplicate-render bug.
  day: string;
  // The line under the day word. For the three marriage rites it names the
  // TRADITION, not a clock position. Nikkah at midday, Muhurtham at dawn and an
  // 11am Ceremony are alternatives a couple picks between, not a sequence, and
  // labelling them by hour made the one column that must read forward in time
  // run backwards through day three — breaking the single claim this whole
  // pinned mechanic exists to make.
  slot: string;
  what: string;
  product: string;
  // Clock times only, never relative to another day. "The afternoon before" sits
  // 200px from a heading that says "Day one" and under a label that says
  // "Timing", and the reader has to resolve the contradiction themselves.
  timing: string;
  venue: string;
  dress: string;
  rsvp: string;
  // The ceremony's own colour — henna green, turmeric yellow, kumkum red — not
  // a palette rotation. Passed as an inline custom property rather than eight
  // new tokens in globals.css because it is per-item data that nothing outside
  // The per-ceremony colour now lives in globals.css, keyed by nth-child, so
  // the wash keyframes and the stage read one list instead of two.
};

// EIGHT, and the CSS knows it. The conveyor keyframes in globals.css end at
// translateY(-700%) and split the pin into eight hardcoded hold-and-swap pairs.
// A ninth entry here does not extend the stage — it parks permanently
// off-screen and every hold after it lands between two slides. Either change
// those keyframes in the same commit or do not change this length.
const ceremonies: Ceremony[] = [
  {
    name: "Mehendi",
    day: "Day one",
    slot: "Afternoon",
    what: "Henna is drawn on the bride's hands and feet while the women of both families sit around her.",
    product: "Set it at the house, on an afternoon of its own, with a guest list of its own — not a line buried in one wedding-day invitation.",
    timing: "From 3pm, into the evening",
    venue: "The family home",
    dress: "Light cotton, washable",
    rsvp: "Close family and friends",
  },
  {
    name: "Haldi",
    day: "Day two",
    slot: "Morning",
    what: "Turmeric paste is put on the couple by their families — a blessing, and a mess.",
    product: "Mark it family-only and the invitation never reaches the three-hundred-person list.",
    timing: "From 10am",
    venue: "At home, in the courtyard",
    dress: "Old clothes you can ruin",
    rsvp: "Family only",
  },
  {
    name: "Sangeet",
    day: "Day two",
    slot: "Evening, late",
    what: "The music night: rehearsed family dances, unrehearsed ones, and the loudest dinner of the week.",
    product: "A ballroom address with a map link, and a dress code guests can actually read on a phone.",
    timing: "From 7pm, dinner at 9",
    venue: "Hotel ballroom",
    dress: "Full festive",
    rsvp: "Everyone invited",
  },
  {
    name: "Nikkah",
    day: "Day three",
    slot: "The marriage, in Islamic rite",
    what: "The Islamic marriage contract is read and signed in front of witnesses.",
    product: "Its own start time, so nobody arrives an hour after the signing.",
    timing: "Midday, prompt",
    venue: "Masjid or hall",
    dress: "Modest, formal",
    rsvp: "Both families and witnesses",
  },
  {
    name: "Muhurtham",
    day: "Day three",
    slot: "The marriage, in Hindu rite",
    what: "The Hindu wedding rites, performed in the auspicious hour the families have fixed.",
    product: "A dawn start time guests can add to their calendar the night before.",
    timing: "The fixed hour, often at dawn",
    venue: "Kalyana mandapam",
    dress: "Silk, traditional",
    rsvp: "Full guest list",
  },
  {
    name: "Ceremony",
    day: "Day three",
    slot: "The marriage, in Western rite",
    what: "The vows themselves — church, registry, garden or shoreline, whatever form yours takes.",
    product: "One RSVP for this alone, independent of everything else that weekend.",
    timing: "11am, seated by 10:45",
    venue: "Church, registry or garden",
    dress: "Formal",
    rsvp: "Full guest list",
  },
  {
    name: "Reception",
    day: "Day three",
    slot: "Evening",
    what: "The dinner that follows: seating, speeches, and the first evening as a married couple.",
    product: "Per-event headcount for the caterer, exportable as a CSV the same afternoon.",
    timing: "Drinks at 7, dinner at 8",
    venue: "Banquet hall",
    dress: "Black tie optional",
    rsvp: "Everyone, with meal choice",
  },
  {
    name: "Walima",
    day: "Day four",
    slot: "Evening",
    what: "The reception hosted by the groom's family after the Nikkah, announcing the marriage publicly.",
    product: "Hosted by the other family, on the one site you both share.",
    timing: "From 7:30pm",
    venue: "The groom's family's hall",
    dress: "Festive formal",
    rsvp: "The groom's family's list",
  },
];

// The three claims that used to be HeroShowcase — a band of floating tiles
// between the hero and this heading, carrying feature nouns ("Structured
// events", "Guest memories", "Template engine") and routing nowhere. They say
// more here, flying up the right half while the headline holds on the left,
// and deleting that band removes a screen of page nobody was reading.
//
// Rewritten from nouns into answers. A tile beside "One site, every ceremony"
// has to earn that sentence, and "Structured events" restated the paragraph it
// now sits next to.
const INTRO_PROOFS = [
  {
    title: "Guests answer per event",
    body: "One reply covers the whole wedding: a guest ticks the three functions they are coming to and skips the two they are not. You get a headcount per ceremony, not a number for the week.",
  },
  {
    title: "The order survives the plan",
    body: "Mehendi on Thursday, Walima on Sunday, and every venue, dress code and start time attached to the right one — so nobody opens WhatsApp to ask what time the Haldi is.",
  },
  {
    title: "It outlives the wedding",
    body: "The same link becomes where the photographs, the messages and the guest uploads live, so the thing you sent before the wedding is the thing you keep after it.",
  },
];

// THE CEREMONY NAME IS NOT A LINK, AND MUST NOT BECOME ONE.
//
// The eight slides are absolutely positioned inside a clipped stage and seven
// of them sit up to 2.5 screens outside it. A focusable element in there cannot
// be scrolled into view: the browser scrolls the DOCUMENT toward it, scrolling
// advances the view() timeline, the timeline re-translates the list, and the
// element moves again. It is a feedback loop, and scroll-padding cannot fix it
// because the target's position is a function of the scroll offset.
//
// Measured on the shipped desktop layout before this was removed: Tab hops of
// +1041, -2069, +3246, -2226, +3525 and -2273 px, with forward Tab scrolling
// the page BACKWARDS on three of seven hops and five of seven leaving the
// focused link entirely off screen — one of them 2.3 screens above the
// viewport. That is a WCAG 2.2 AA failure of SC 2.4.11, Focus Not Obscured.
//
// Nothing was lost by removing them: all eight pointed at the same href, and it
// is still linked below the stage where focus behaves normally.

export function CeremonySequence() {
  return (
    <section className="section-shell mt-24 lg:mt-32">
      {/* Pinned headline, scrolling proof column. The left half holds while the
          three tiles travel up the right, which is the one shape that lets a
          long claim and its evidence occupy the same screen instead of two.
          Below lg there is no second column to scroll past, so the whole thing
          collapses to heading-then-tiles in normal flow. */}
      <div className="intro-split lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
      <div className="intro-hold scroll-reveal">
        {/* Kept under ~26 characters on purpose. Badge is an inline-flex pill
            with rounded-full, so an eyebrow wider than the 288px content box at
            320px does not overflow — it wraps, and a two-line fully-rounded
            pill looks broken. "Four days, eight ceremonies" measured 288/288
            and wrapped; this is 241px. */}
        <SectionHeading
          eyebrow="Four days, eight rites"
          title="One site, every ceremony"
          description="A multi-day wedding is not one party with a long guest list. From Mehendi to Walima, every ceremony carries its own timing, venue, dress code and RSVP — so guests answer per event and read one multi-day timeline instead of a paragraph of dates. No couple holds all eight: Nikkah, Muhurtham and the Ceremony are the same moment in three traditions. Keep the ones you are holding, and the order stays."
        />
      </div>

      <ol className="intro-proofs mt-10 grid min-w-0 gap-5 lg:mt-0">
        {INTRO_PROOFS.map((proof, index) => (
          <li
            key={proof.title}
            // --i drives the stagger, so one rule times all three rather than
            // three near-identical rules with hand-written offsets.
            style={{ "--i": index } as React.CSSProperties}
            className="intro-proof min-w-0 rounded-[var(--radius)] border border-[color:var(--border)] panel-soft p-6 sm:p-7"
          >
            <h3 className="font-display text-2xl text-[color:var(--text)] sm:text-3xl">{proof.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{proof.body}</p>
          </li>
        ))}
      </ol>
      </div>

      {/* The surplus height on .ceremony-track IS the scroll budget: at lg it is
          280svh of page spent on one animation, the way a product page gives up
          three screens to a single idea. Below lg it collapses to nothing and
          the stage is ordinary flow.

          gap-10 belongs on the <ol> rather than as padding on the items because
          the pinned block resets exactly this property to 0 — the conveyor
          translates in whole slides (-100%) and only lands on a slide boundary
          if the rows are flush. A margin here would survive that reset and
          desynchronise every hold after the first. */}
      <div className="ceremony-track mt-10 lg:mt-14">
        <div className="ceremony-stage">
          <div className="ceremony-viewport">
            <ol
              className="ceremony-list grid min-w-0 gap-10"
              aria-label="The eight ceremonies, in running order"
            >
              {ceremonies.map((ceremony, index) => (
                <li
                  key={ceremony.name}
                  // min-w-0 on this and on both grid cells is load-bearing, not
                  // styling: a grid item's automatic minimum size is its
                  // min-content width, so one long value in the detail list
                  // pushes the column past its track and the whole page scrolls
                  // sideways at 320px. This repo has already shipped that bug
                  // once (see motion-primitives.tsx:56).
                  className="ceremony-step grid min-w-0 gap-6 border-t pt-10 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16"
                >
                  <div className="ceremony-when min-w-0">
                    <p className="font-royal text-4xl leading-none text-[color:var(--primary)] sm:text-5xl lg:text-6xl">
                      {ceremony.day}
                    </p>
                    <p className="mt-3 text-sm text-[color:var(--muted)]">{ceremony.slot}</p>
                    <div
                      className="ceremony-field mt-6 h-20 w-full sm:h-28 lg:mt-8 lg:h-64 xl:h-72"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="ceremony-copy min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)] tabular-nums">
                      {String(index + 1).padStart(2, "0")} / {String(ceremonies.length).padStart(2, "0")}
                    </p>
                    {/* Plain text, NOT a link. See the note at the top of this
                        file — a focusable element inside the pinned stage
                        cannot be scrolled into view, and the arrow went with it
                        because an up-right arrow on unclickable text is a false
                        affordance. */}
                    <h3 className="mt-3 font-display text-4xl leading-tight lg:text-5xl">
                      {ceremony.name}
                    </h3>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--muted)]">
                      {ceremony.what}
                    </p>{" "}
                    <p className="mt-3 max-w-xl text-base leading-7 text-[color:var(--text)]">
                      {ceremony.product}
                    </p>

                    <dl className="ceremony-details mt-6 grid min-w-0 grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                      {(
                        [
                          ["Timing", ceremony.timing],
                          ["Venue", ceremony.venue],
                          ["Dress code", ceremony.dress],
                          ["RSVP", ceremony.rsvp],
                        ] as const
                      ).map(([label, value]) => (
                        <div key={label} className="ceremony-detail min-w-0">
                          <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                            {label}
                          </dt>
                          <dd className="mt-1 text-sm leading-6 text-[color:var(--text)]">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Hidden until the pinned layout exists, because without the conveyor
              it is a full bar that reports nothing. */}
          <div className="ceremony-rail" aria-hidden="true">
            <span className="ceremony-rail-fill" />
          </div>
        </div>
      </div>

      <div className="scroll-reveal mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-semibold">
        <Link
          href={DEMO_EVENTS_HREF}
          className="inline-flex items-center gap-1.5 text-[color:var(--primary)] hover:underline"
        >
          See all eight on the live demo <ArrowUpRight className="h-4 w-4 shrink-0" />
        </Link>
        <Link href={TEMPLATES_HREF} className="inline-flex items-center gap-1.5 hover:underline">
          Sixteen designs to hold them <ArrowUpRight className="h-4 w-4 shrink-0" />
        </Link>
        <Link href={REGISTER_HREF} className="inline-flex items-center gap-1.5 hover:underline">
          Start yours free <ArrowUpRight className="h-4 w-4 shrink-0" />
        </Link>
      </div>
    </section>
  );
}
