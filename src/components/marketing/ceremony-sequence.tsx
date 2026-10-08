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
  // this component reads.
  tint: string;
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
    tint: "#5a7247",
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
    tint: "#e0a526",
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
    tint: "#b4466f",
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
    tint: "#1f6b63",
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
    tint: "#b03a2e",
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
    tint: "#8e9bb0",
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
    tint: "#2d3a63",
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
    tint: "#a9762f",
  },
];

export function CeremonySequence() {
  return (
    <section className="section-shell mt-24 lg:mt-32">
      <div className="scroll-reveal">
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
            <ol className="ceremony-list grid min-w-0 gap-10">
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
                  style={{ "--ceremony-tint": ceremony.tint } as React.CSSProperties}
                >
                  <div className="min-w-0">
                    <p className="font-display text-4xl leading-none text-[color:var(--primary)] sm:text-5xl lg:text-6xl">
                      {ceremony.day}
                    </p>
                    <p className="mt-3 text-sm text-[color:var(--muted)]">{ceremony.slot}</p>
                    <div
                      className="ceremony-field mt-6 h-20 w-full sm:h-28 lg:mt-8 lg:h-40"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)] tabular-nums">
                      {String(index + 1).padStart(2, "0")} / {String(ceremonies.length).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 font-display text-4xl leading-tight lg:text-5xl">
                      <Link
                        href={DEMO_EVENTS_HREF}
                        className="inline-flex items-baseline gap-2 rounded-md outline-none hover:text-[color:var(--primary)] focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] focus-visible:ring-offset-2"
                      >
                        {ceremony.name}
                        <ArrowUpRight className="h-5 w-5 shrink-0 text-[color:var(--accent)]" />
                      </Link>
                    </h3>
                    <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--muted)]">
                      {ceremony.what}
                    </p>
                    <p className="mt-3 max-w-xl text-base leading-7 text-[color:var(--text)]">
                      {ceremony.product}
                    </p>

                    <dl className="mt-6 grid min-w-0 grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                      {(
                        [
                          ["Timing", ceremony.timing],
                          ["Venue", ceremony.venue],
                          ["Dress code", ceremony.dress],
                          ["RSVP", ceremony.rsvp],
                        ] as const
                      ).map(([label, value]) => (
                        <div key={label} className="min-w-0">
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
