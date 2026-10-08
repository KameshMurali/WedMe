import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";

// "One link, no accounts" — the guest's journey as three cards that PILE UP.
//
// The whole mechanic is `position: sticky` on three siblings with a top offset
// that grows by --i, so a card that would scroll away instead pins and the next
// one slides over it. No JavaScript, no scroll listener, no measurement: the
// browser does this on the compositor while the main thread stays free to
// answer a tap.
//
// Two things about the markup are load-bearing:
//
// 1. Nothing between this section and the scrolling root may have
//    `overflow: hidden`. An overflow-hidden ancestor silently turns a sticky
//    element back into a static one — the same failure recorded at
//    public/site-shell.tsx:137, where it un-pinned the site header. The
//    marketing page's <main> is clean today; a decorative clipping wrapper
//    added around this section would break the deck with no error anywhere.
//
// 2. The cards deliberately do NOT take `.scroll-reveal` or any other view()
//    timeline. A view progress timeline measures the subject's position inside
//    the scrollport, and a pinned element stops moving inside the scrollport —
//    so its timeline freezes the instant it sticks, stranding the animation at
//    whatever partial progress it had reached. The depth cue in globals.css
//    therefore hangs its timeline on the wrapper, which never pins.

const steps = [
  {
    kicker: "The invitation",
    ordinal: "01",
    title: "One link, dropped in the group chat",
    body: [
      "Your site lives at one address, on whichever of the sixteen designs you pick. You paste it once into the group that already has everyone in it, and that is the whole invitation list: no printed inserts, no spreadsheet of email addresses, no chasing the uncle who changed his number.",
      "Add the Sangeet venue three weeks later and the link already knows. Move the Muhurtham by an hour the night before and nobody has to be told twice.",
    ],
    link: { href: "/register", label: "Start your site" },
  },
  {
    kicker: "The reply",
    ordinal: "02",
    title: "No app. No account. No password.",
    body: [
      "A guest taps the link and is already in. They see only the ceremonies they were invited to, and answer each one on its own: Mehendi yes, Haldi no, Sangeet yes, Nikkah yes, Reception travelling home by then.",
      "Eight ceremonies in order, one form, and a real headcount for every single one — instead of a single number for “the wedding” that no caterer can actually use.",
    ],
    link: { href: "/kammonbeginnings/rsvp", label: "Reply on the live demo site" },
  },
  {
    kicker: "The afterwards",
    ordinal: "03",
    title: "The same link is where it all lands",
    body: [
      "The address on your invitation does not expire when the Walima ends. It becomes the album: photos guests upload straight from their phones, the messages they left, and every event as it actually happened.",
      "Nobody has to be handed a new URL to find the pictures. It is the one already sitting in their chat history.",
    ],
    link: { href: "/kammonbeginnings", label: "See a finished wedding site" },
  },
] as const;

export function GuestStack() {
  const topIndex = steps.length - 1;

  return (
    <section className="section-shell mt-20">
      <div className="scroll-reveal">
        <SectionHeading
          eyebrow="One link, no accounts"
          title="Your guests never make an account."
          description="A wedding website only works if the least technical person in the group chat can use it. So one address does all three jobs: the invitation, the reply, and everything that comes after."
        />
      </div>

      {/*
        --deck-top is the offset the first card pins at. It is a variable rather
        than a literal because it is really "whatever clears the top of the
        viewport" — if this page ever grows a sticky header, that height goes
        here once instead of into three inline tops.
      */}
      <div
        className="guest-deck mt-10 lg:mx-auto lg:max-w-3xl"
        style={{ "--deck-top": "5rem" } as React.CSSProperties}
      >
        {steps.map((step, index) => (
          <article
            key={step.ordinal}
            // Below lg this is a plain stacked list, on purpose. Measured at
            // 320x568 these cards render 679/591/497px tall, so the first two
            // are taller than the viewport: pinning one would park its closing
            // lines permanently off screen with no way to scroll to them. The
            // 1.15rem offsets are also too small at that width to read as a
            // deck rather than as a rendering fault. The stack is a desktop
            // affordance; the phone gets the same words in the same order.
            //
            // The opaque fill and [backdrop-filter:none] are not decoration.
            // .section-card is translucent, which is right for a card sitting
            // alone on the page and wrong for one sitting on top of another —
            // three translucent layers compound into mud and the text loses
            // its contrast. With an opaque fill the blur has nothing left to
            // show, so it is pure per-frame cost on an element that stays
            // painted for the whole section.
            className="guest-deck-card section-card mt-5 min-w-0 bg-[color:var(--surface)] p-6 [backdrop-filter:none] first:mt-0 sm:p-8 lg:mt-8 lg:sticky"
            style={
              {
                "--i": String(index),
                // 1.15rem is the sliver of each covered card left showing
                // above the one that covers it, so it has to stay larger than
                // a hairline and smaller than a line of body text.
                top: "calc(var(--deck-top) + var(--i) * 1.15rem)",
                // The resting scale of a COVERED card. The top card is never
                // covered, so it never recedes. globals.css animates from 1 to
                // this value and also applies it unanimated, so a browser
                // without scroll timelines lands on the same assembled deck.
                "--recede": index === topIndex ? "1" : String(1 - (topIndex - index) * 0.018),
              } as React.CSSProperties
            }
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden="true"
                className="shrink-0 font-display text-2xl leading-none text-[color:var(--accent)]"
              >
                {step.ordinal}
              </span>
              <Badge className="min-w-0">{step.kicker}</Badge>
            </div>

            <h3 className="mt-5 font-display text-3xl leading-tight text-[color:var(--text)] sm:text-4xl">
              {step.title}
            </h3>

            {step.body.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="mt-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base sm:leading-8"
              >
                {paragraph}
              </p>
            ))}

            <div className="mt-6 flex min-w-0 flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={step.link.href}
                className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-[color:var(--primary)] underline-offset-4 hover:underline"
              >
                <span className="min-w-0">{step.link.label}</span>
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
              </Link>

              {index === 0 ? (
                <Link
                  href="/templates"
                  className="min-w-0 text-sm font-semibold text-[color:var(--muted)] underline-offset-4 hover:text-[color:var(--primary)] hover:underline"
                >
                  Browse the sixteen designs
                </Link>
              ) : null}
            </div>
          </article>
        ))}

        {/*
          Runway, so the assembled deck holds on screen for a beat instead of
          releasing the instant the last card pins.

          It is an empty in-flow element and NOT padding-bottom on the wrapper,
          which is what it was first written as. A sticky element is constrained
          to its containing block's CONTENT box, so wrapper padding adds page
          height without adding one pixel of sticky range: measured in Chromium,
          26svh of padding-bottom let the whole stack release 234px early —
          exactly the padding — and the third card never finished pinning at all.
          A child's margin-bottom does not work either; with nothing below it to
          stop the collapse it would collapse out through the wrapper's bottom
          edge and change no height. Real content is the only thing that extends
          the box.

          lg-only, because below lg nothing pins and this would be dead space.
        */}
        <div className="hidden lg:block lg:h-[26svh]" />
      </div>
    </section>
  );
}
