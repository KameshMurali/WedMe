import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";

import { templateRegistry } from "../src/lib/template-registry";
import { findOverflow } from "./helpers/overflow";

/**
 * THE REVEAL CONTRACT: nothing a guest needs to read may depend on JavaScript.
 *
 * The public site's entrance animations used to come from motion/react, which
 * resolves its `initial` prop into an INLINE STYLE during the server render.
 * The shipped HTML therefore carried the couple's own monogram initials and
 * every "RSVP to this event" button at `style="opacity:0"` — permanently
 * invisible to anyone whose JS never ran. That is the defect this suite exists
 * to keep out, and it is invisible to types, lint and the build: the only thing
 * that catches it is reading the bytes the server actually sends.
 *
 * Four things are asserted, in the order they would fail:
 *
 *   1. SERVER BYTES. Fetched HTML, parsed with DOMParser (which does not run
 *      scripts), must contain no inline opacity:0 on any node carrying text,
 *      and no text-bearing node may have a faded ANCESTOR either.
 *   2. JS OFF. With `javaScriptEnabled: false`, the event headings, the RSVP
 *      links and the monogram must compute opacity 1 and occupy a real box.
 *   3. REDUCED MOTION. Every `.scroll-reveal` sits at its resting state, and
 *      the progress hairline — the one element with no honest resting state —
 *      paints nothing at all.
 *   4. THE CADENCE SURVIVED. Sixteen designs, one shared class: the per-chrome
 *      reveal tokens must still differ, or the port that removed the JS would
 *      also have flattened the product.
 *
 * MEASURED AGAINST A PRODUCTION BUILD ONLY. `next dev` serves a CSP without
 * unsafe-eval here, so React never hydrates and a measurement taken against it
 * is of an unhydrated page. Rather than report a number from the wrong build,
 * every browser test below skips unless PLAYWRIGHT_PORT names a production
 * server:
 *
 *   PLAYWRIGHT_PORT=4100 npx playwright test reveal-contract
 *
 * The static assertions (source files, globals.css structure) need no server
 * and always run.
 *
 * A NOTE ON MEASUREMENT, in the spirit of template-palette.spec.ts. Pixel
 * sampling UNDERSTATES contrast for small letterspaced text, because an
 * antialiased glyph that thin never reaches full colour. The day-badge check
 * below therefore does both: the house pixel method (shoot the element, shoot
 * it again with its own ink forced transparent, compare the glyph pixels
 * against the same coordinates underneath) AND arithmetic over the composited
 * pill, which is the stronger claim — it holds over ANY photograph a couple
 * uploads, not just the demo's.
 */

const PORT = process.env.PLAYWRIGHT_PORT ?? "3000";
const WHY_PRODUCTION =
  `skipped: the server on port ${PORT} is \`next dev\`, whose CSP omits ` +
  "unsafe-eval, so React never hydrates and nothing measured here would be " +
  "true of the shipped page. Run against `next start`:\n" +
  "  npx next build && npx next start -p 4100\n" +
  "  PLAYWRIGHT_EXTERNAL_SERVER=1 PLAYWRIGHT_PORT=4100 npx playwright test reveal-contract";

/**
 * TWO CONDITIONS, BECAUSE EACH ONE ALONE HAS FAILED.
 *
 * 1. An explicit opt-in. This guard first read `PLAYWRIGHT_PORT !== "3000"` and
 *    called that a production server. It is not: playwright.config.ts builds
 *    its `webServer` command from the same variable, so `PLAYWRIGHT_PORT=4100`
 *    starts `next dev -p 4100` — satisfying the guard and running all 116
 *    browser tests against the exact build it exists to reject.
 *    PLAYWRIGHT_EXTERNAL_SERVER cannot be set as a side effect of choosing a
 *    port: it means "a server is already running, do not start one", which is
 *    only true when somebody started `next start` deliberately.
 *
 * 2. No dev markers in the served HTML. The opt-in is still a promise, and a
 *    promise can be wrong, so verify it. This half has to be measured rather
 *    than recalled: the first attempt looked for `react-refresh`,
 *    `__nextjs_original-stack-frame` and `webpack-hmr`, and Next 16's dev
 *    output contains NONE of the three — the probe returned "production" for a
 *    dev server and was worse than the port check it replaced, because it
 *    reported numbers where the old one at least skipped. What this build
 *    actually ships in dev and never in production, counted on both:
 *
 *      hmr-client     dev 4, prod 0   <- the Turbopack HMR client
 *      next-devtools  dev 2, prod 0
 *      turbopack      dev 4, prod 1   <- NOT usable: react-server-dom-turbopack
 *                                        is in the production bundle too
 *
 * Fetched once per worker and memoised: 116 tests, one request. Keep condition
 * 1 first — it is the deterministic half, so a future Next release renaming its
 * chunks can only make the suite skip, never make it lie.
 */
const EXTERNAL_SERVER = Boolean(process.env.PLAYWRIGHT_EXTERNAL_SERVER);

let devServerProbe: Promise<boolean> | undefined;

function isDevServer(request: { get: (url: string) => Promise<{ text: () => Promise<string> }> }) {
  devServerProbe ??= request
    .get("/")
    .then((res) => res.text())
    .then((html) => /hmr-client|next-devtools/.test(html))
    // A server that cannot be reached is not a production server we can
    // measure, so treat the failure as "skip" rather than letting 116 tests
    // fail with a connection error apiece.
    .catch(() => true);
  return devServerProbe;
}

/** Called in each browser-backed describe; the static blocks omit it. */
function productionServerOnly() {
  test.beforeEach(async ({ request }) => {
    test.skip(!EXTERNAL_SERVER, WHY_PRODUCTION);
    test.skip(await isDevServer(request), WHY_PRODUCTION);
  });
}

const DEMO = "/kammonbeginnings";
const TEMPLATE_ROUTES = templateRegistry.map((t) => `/templates/${t.key}`);
const ALL_ROUTES = [DEMO, ...TEMPLATE_ROUTES];

/**
 * The seven designs that crown the hero with the generated monogram. The list
 * is the union of the four ornament sets in src/components/public/motifs.tsx
 * (kolam, temple, palace, and the four named ORNAMENT_BY_TEMPLATE kinds) —
 * the other nine crown the hero with their own architectural form or let the
 * photograph carry it. Spelled out rather than imported because importing a
 * .tsx of SVG components into a spec buys nothing: if the sets diverge, the
 * monogram census test below says so by name.
 */
const MONOGRAM_TEMPLATES = [
  "kolam-blush",
  "temple-gold",
  "marigold-festive",
  "emerald-pearl",
  "chapel-ivory",
  "crimson-gold",
  "desert-neutral",
] as const;

const GLOBALS_CSS = path.join(__dirname, "..", "src", "app", "globals.css");
const MOTION_PRIMITIVES = path.join(__dirname, "..", "src", "components", "public", "motion-primitives.tsx");
const COUPLE_MONOGRAM = path.join(__dirname, "..", "src", "components", "public", "couple-monogram.tsx");

// --------------------------------------------------------------------------
// Colour arithmetic. Same formula as src/lib/color.ts, re-stated here because
// these inputs are RESOLVED computed values, which arrive as either
// `rgba(r, g, b, a)` or `color(srgb 0..1 0..1 0..1 / a)` — getComputedStyle
// returns color-mix() in the latter form, and a parser that matches only
// `rgb(` silently skips every token-derived colour on the page.
// --------------------------------------------------------------------------

type Rgba = { r: number; g: number; b: number; a: number };

function parseColor(value: string): Rgba | null {
  const srgb = /^color\(srgb\s+([0-9.eE+-]+)\s+([0-9.eE+-]+)\s+([0-9.eE+-]+)(?:\s*\/\s*([0-9.eE+-]+))?\s*\)$/.exec(
    value.trim(),
  );
  if (srgb) {
    return {
      r: Number(srgb[1]) * 255,
      g: Number(srgb[2]) * 255,
      b: Number(srgb[3]) * 255,
      a: srgb[4] === undefined ? 1 : Number(srgb[4]),
    };
  }
  const rgb = /^rgba?\(\s*([0-9.]+)[,\s]+([0-9.]+)[,\s]+([0-9.]+)(?:\s*[,/]\s*([0-9.%]+))?\s*\)$/.exec(value.trim());
  if (rgb) {
    const rawAlpha = rgb[4];
    const a =
      rawAlpha === undefined ? 1 : rawAlpha.endsWith("%") ? Number(rawAlpha.slice(0, -1)) / 100 : Number(rawAlpha);
    return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]), a };
  }
  if (value.trim() === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  return null;
}

function channelLuminance(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

function contrast(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Source-over composite of a translucent colour onto an opaque one. */
function over(top: Rgba, bottom: { r: number; g: number; b: number }) {
  return {
    r: top.a * top.r + (1 - top.a) * bottom.r,
    g: top.a * top.g + (1 - top.a) * bottom.g,
    b: top.a * top.b + (1 - top.a) * bottom.b,
  };
}

// --------------------------------------------------------------------------
// globals.css structure. Brace-matched rather than regexed, because the claim
// being tested is one of NESTING: a scroll-driven rule outside the @supports +
// no-preference gate is exactly house rule 1 broken.
// --------------------------------------------------------------------------

type Span = { start: number; end: number };

function atRuleSpans(css: string, prelude: string): Span[] {
  const spans: Span[] = [];
  let from = 0;
  for (;;) {
    const at = css.indexOf(prelude, from);
    if (at === -1) break;
    const open = css.indexOf("{", at);
    let depth = 0;
    let i = open;
    for (; i < css.length; i += 1) {
      if (css[i] === "{") depth += 1;
      else if (css[i] === "}") {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    spans.push({ start: open, end: i });
    from = i;
  }
  return spans;
}

const inside = (pos: number, spans: Span[]) => spans.some((s) => pos > s.start && pos < s.end);
const lineOf = (css: string, pos: number) => css.slice(0, pos).split("\n").length;

// --------------------------------------------------------------------------
// 1. THE SERVER SHIPS NOTHING INVISIBLE
// --------------------------------------------------------------------------

test.describe("the server ships nothing invisible", () => {
  productionServerOnly();

  for (const route of ALL_ROUTES) {
    test(`${route}: no inline opacity:0 on anything that carries text`, async ({ page, request }) => {
      const response = await request.get(route);
      expect(response.status(), `${route} should render`).toBe(200);
      const html = await response.text();

      // DOMParser does not execute scripts, so this is the SERVER's DOM, not a
      // hydrated one. Navigating the page here would measure the opposite.
      await page.goto("about:blank");
      const report = await page.evaluate((source: string) => {
        const doc = new DOMParser().parseFromString(source, "text/html");
        const OPACITY = /(?:^|;)\s*opacity\s*:\s*([0-9.]+)/;

        const describe = (el: Element) => {
          const cls = typeof el.className === "string" ? el.className : "";
          return `<${el.tagName.toLowerCase()} class="${cls.slice(0, 70)}">`;
        };
        const faded = (el: Element) => {
          const m = OPACITY.exec(el.getAttribute("style") ?? "");
          return m && Number(m[1]) < 1 ? Number(m[1]) : null;
        };

        // Every inline-faded element, with whether it carries text.
        const dimmed = [...doc.querySelectorAll("[style]")]
          .map((el) => ({ el, value: faded(el) }))
          .filter((x) => x.value !== null)
          .map(({ el, value }) => ({
            node: describe(el),
            value,
            ariaHidden: el.getAttribute("aria-hidden"),
            text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80),
          }));

        // The nodes a guest has to be able to read. The monogram counts: it is
        // the couple's own initials, and role="img" is how the whole mark is
        // announced.
        const targets: Element[] = [];
        doc.querySelectorAll("a").forEach((a) => {
          if ((a.textContent ?? "").trim() === "RSVP to this event") targets.push(a);
        });
        doc.querySelectorAll("[role='img'][aria-label]").forEach((m) => targets.push(m));
        doc.querySelectorAll("h1, h2, h3").forEach((h) => {
          if ((h.textContent ?? "").trim()) targets.push(h);
        });

        const stranded: string[] = [];
        for (const target of targets) {
          let node: Element | null = target;
          while (node) {
            const value = faded(node);
            if (value !== null) {
              stranded.push(
                `${describe(target)} "${(target.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40)}" ` +
                  `is faded to ${value} by ${node === target ? "itself" : `ancestor ${describe(node)}`}`,
              );
              break;
            }
            node = node.parentElement;
          }
        }

        return {
          dimmed,
          stranded,
          counts: {
            rsvp: [...doc.querySelectorAll("a")].filter((a) => (a.textContent ?? "").trim() === "RSVP to this event")
              .length,
            monogram: doc.querySelectorAll("[role='img'][aria-label]").length,
            eventHeadings: [...doc.querySelectorAll("h3")].filter((h) => (h.textContent ?? "").trim()).length,
            reveals: doc.querySelectorAll(".scroll-reveal").length,
          },
        };
      }, html);

      // THE ASSERTION. Not "no opacity:0 anywhere" — the client route-change
      // hairline in src/app/layout.tsx is aria-hidden, empty, and opacity:0 IS
      // its idle state. What may never happen again is a node with TEXT in it
      // leaving the server faded.
      const textBearing = report.dimmed.filter((d) => d.text.length > 0);
      expect(
        textBearing,
        `${route} serves text at opacity below 1. This is house rule 2: a ` +
          "motion library that resolves `initial` during the server render " +
          "ships permanently invisible content. Use the CSS .scroll-reveal " +
          `pattern instead.\n${JSON.stringify(textBearing, null, 2)}`,
      ).toEqual([]);

      expect(
        report.stranded,
        `${route} has readable content under a faded ancestor:\n  ${report.stranded.join("\n  ")}`,
      ).toEqual([]);

      // Guards against the inverse regression: a test that passes because the
      // content stopped being rendered at all.
      expect(report.counts.rsvp, `${route} should still render per-event RSVP buttons`).toBeGreaterThanOrEqual(3);
      expect(report.counts.eventHeadings, `${route} should still render event headings`).toBeGreaterThanOrEqual(3);
      expect(report.counts.reveals, `${route} should still use .scroll-reveal`).toBeGreaterThanOrEqual(3);
    });
  }

  test("the monogram is still on the seven designs that crown the hero with it", async ({ page, request }) => {
    const seen: string[] = [];
    await page.goto("about:blank");
    for (const template of templateRegistry) {
      const html = await (await request.get(`/templates/${template.key}`)).text();
      const count = await page.evaluate(
        (source: string) =>
          new DOMParser().parseFromString(source, "text/html").querySelectorAll("[role='img'][aria-label]").length,
        html,
      );
      if (count > 0) seen.push(template.key);
    }
    expect(
      seen.sort(),
      "The monogram census moved. If a design gained or lost its hero mark on " +
        "purpose, update MONOGRAM_TEMPLATES; if it did not, the ornament sets " +
        "in motifs.tsx and the hero no longer agree.",
    ).toEqual([...MONOGRAM_TEMPLATES].sort());
  });
});

// --------------------------------------------------------------------------
// 2. THE PAGE WORKS WITH JAVASCRIPT OFF
// --------------------------------------------------------------------------

/**
 * Next 16 streams these routes: the page body is delivered inside
 * `<div hidden id="S:n">` and an inline bootstrap script relocates it into the
 * `<template id="B:n">` placeholder. With scripting disabled that script never
 * runs, so EVERY element in the body has a 0x0 box — on /templates (which
 * imports none of the changed files), on /kammonbeginnings, and on each design.
 * /privacy and /login, which have no such boundary, render normally.
 *
 * That is a route-level streaming question, not a motion one, and it is
 * reported rather than fixed. So this block removes the framework's `hidden`
 * attribute and then measures: once the content is reachable, is it visible?
 * That is precisely the half the reveal layer owns, and the un-hiding is a
 * no-op the day the streaming boundary changes.
 *
 * ONE CONSEQUENCE, and the reason the selectors below are flat. Each streamed
 * fragment is markup that belongs somewhere ELSE in the final tree, so
 * un-hiding leaves fragments as body-level siblings rather than nested where
 * the script would have put them. /kammonbeginnings ships 22 such containers,
 * and on it the first event card's text column — its heading and its RSVP
 * button — lands outside the `.scroll-reveal` wrapper it belongs to. So every
 * target here is chosen by its OWN identity (an <h3> that has text, a link
 * whose label is "RSVP to this event", the mark announced as role="img"),
 * never by an ancestor relationship that the boundary can cut.
 */
test.describe("with JavaScript off", () => {
  productionServerOnly();
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });

  for (const route of ALL_ROUTES) {
    test(`${route}: event cards, RSVP links and the monogram are visible`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status()).toBe(200);

      const result = await page.evaluate(() => {
        const streamed = [...document.querySelectorAll("body > div[hidden]")];
        streamed.forEach((d) => d.removeAttribute("hidden"));

        const measure = (el: Element) => {
          const rect = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          const inlineOpacity = /(?:^|;)\s*opacity\s*:\s*([0-9.]+)/.exec(el.getAttribute("style") ?? "");
          return {
            text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 40) ||
              el.getAttribute("aria-label") ||
              "",
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            opacity: Number(cs.opacity),
            visibility: cs.visibility,
            display: cs.display,
            inlineOpacity: inlineOpacity ? Number(inlineOpacity[1]) : null,
          };
        };

        return {
          streamedContainers: streamed.length,
          headings: [...document.querySelectorAll("h3")].filter((h) => (h.textContent ?? "").trim()).map(measure),
          rsvp: [...document.querySelectorAll("a")]
            .filter((a) => (a.textContent ?? "").trim() === "RSVP to this event")
            .map(measure),
          monogram: [...document.querySelectorAll("[role='img'][aria-label]")].map(measure),
        };
      });

      expect(result.headings.length, `${route}: event-card headings should be present`).toBeGreaterThanOrEqual(3);
      expect(result.rsvp.length, `${route}: per-event RSVP links should be present`).toBeGreaterThanOrEqual(3);

      // The demo site renders under one template and may or may not be one of
      // the seven that crown the hero with the mark; the census test above is
      // what holds that line across the sixteen designs. Here the only claim is
      // that whatever mark IS rendered is visible.
      const key = route.startsWith("/templates/") ? route.slice("/templates/".length) : null;
      if (key !== null) {
        expect(
          result.monogram.length,
          `${route}: the monogram is the couple's own initials and was the ` +
            "worst of the original inline opacity:0 casualties",
        ).toBe((MONOGRAM_TEMPLATES as readonly string[]).includes(key) ? 1 : 0);
      }

      const everything = [...result.headings, ...result.rsvp, ...result.monogram];
      const invisible = everything.filter(
        (n) =>
          n.opacity !== 1 ||
          n.inlineOpacity !== null ||
          n.visibility === "hidden" ||
          n.display === "none" ||
          n.width <= 0 ||
          n.height <= 0,
      );
      expect(
        invisible,
        `${route} hides content from a guest with no JavaScript. Every node ` +
          "below must compute opacity 1 and occupy a real box without a " +
          `script running.\n${JSON.stringify(invisible, null, 2)}`,
      ).toEqual([]);
    });
  }
});

// --------------------------------------------------------------------------
// 3. REDUCED MOTION LEAVES EVERYTHING AT ITS RESTING STATE
// --------------------------------------------------------------------------

// One per chromeStyle plus both guest routes: the cadence tokens differ per
// chrome, and a resting-state bug could hide in whichever one is untested.
const REDUCED_MOTION_ROUTES = [
  DEMO,
  `${DEMO}/events`,
  "/templates/classic-elegant", // wash
  "/templates/minimal-luxury", // grid
  "/templates/cinematic-modern", // vignette
  "/templates/temple-gold", // radiant
  "/templates/chapel-ivory", // veil
  "/templates/olive-grove", // horizon
];

test.describe("prefers-reduced-motion: reduce", () => {
  productionServerOnly();
  test.use({ contextOptions: { reducedMotion: "reduce" }, viewport: { width: 390, height: 844 } });

  for (const route of REDUCED_MOTION_ROUTES) {
    test(`${route}: every revealed block is at rest`, async ({ page }) => {
      await page.goto(route, { waitUntil: "load" });
      await page.waitForTimeout(400);

      const state = await page.evaluate(() => {
        const identity = (t: string) => t === "none" || t === "" || t === "matrix(1, 0, 0, 1, 0, 0)";
        const reveals = [...document.querySelectorAll(".scroll-reveal")];
        const hairline = document.querySelector(".scroll-progress-hairline");
        const hairlineStyle = hairline ? getComputedStyle(hairline) : null;
        return {
          total: reveals.length,
          notAtRest: reveals
            .map((el) => ({ el, cs: getComputedStyle(el) }))
            .filter(({ cs }) => Number(cs.opacity) !== 1 || !identity(cs.transform))
            .map(({ el, cs }) => ({
              node: (typeof el.className === "string" ? el.className : "").slice(0, 60),
              opacity: cs.opacity,
              transform: cs.transform,
              animationName: cs.animationName,
            })),
          runningAnimations: document.getAnimations().length,
          hairline: hairline
            ? {
                display: hairlineStyle!.display,
                animationName: hairlineStyle!.animationName,
                width: Math.round(hairline.getBoundingClientRect().width),
              }
            : null,
          drift: [...document.querySelectorAll(".hero-ornament-drift")].map((el) => ({
            animationName: getComputedStyle(el).animationName,
            transform: getComputedStyle(el).transform,
          })),
        };
      });

      expect(state.total, `${route} should have revealed blocks to check`).toBeGreaterThan(0);
      expect(
        state.notAtRest,
        `${route}: a guest who asked for reduced motion is reading content ` +
          "that is not at its resting state. Every keyframe must run TO the " +
          `finished state and be nulled under reduce.\n${JSON.stringify(state.notAtRest, null, 2)}`,
      ).toEqual([]);

      // Nothing may be animating at all: an animation that holds an element
      // below opacity 1 is the failure mode, and zero animations is the only
      // state in which that is impossible.
      expect(state.runningAnimations, `${route}: no animation should run under reduce`).toBe(0);

      // The hairline is the one element with no honest resting state.
      if (state.hairline) {
        expect(
          state.hairline.display,
          `${route}: an undriven progress hairline claims the page was read to the end`,
        ).toBe("none");
        expect(state.hairline.animationName).toBe("none");
        expect(state.hairline.width).toBe(0);
      }

      for (const layer of state.drift) {
        expect(layer.animationName, `${route}: ornament drift should be nulled under reduce`).toBe("none");
        expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(layer.transform);
      }
    });
  }
});

// --------------------------------------------------------------------------
// 4. THE CSS LAYER IS LIVE WHERE THERE WAS NOTHING — AND LANDS ITS INK EARLY
// --------------------------------------------------------------------------

test.describe("prefers-reduced-motion: no-preference", () => {
  productionServerOnly();
  test.use({ contextOptions: { reducedMotion: "no-preference" }, viewport: { width: 390, height: 844 } });

  for (const route of [DEMO, `${DEMO}/events`, "/templates/classic-elegant"]) {
    test(`${route}: scroll timelines are actually driving something`, async ({ page }) => {
      await page.goto(route, { waitUntil: "load" });
      await page.waitForTimeout(400);

      const live = await page.evaluate(() => {
        const timelined = [...document.querySelectorAll("*")]
          .map((el) => ({ el, timeline: getComputedStyle(el).animationTimeline }))
          .filter(({ timeline }) => timeline && timeline !== "auto" && timeline !== "none");
        return {
          animations: document.getAnimations().length,
          timelined: timelined.length,
          timelines: [...new Set(timelined.map((t) => t.timeline))].sort(),
          names: [...new Set(timelined.map((t) => getComputedStyle(t.el).animationName))].sort(),
        };
      });

      // Baseline before this change was 0 and 0 on every guest and template
      // page: the reveal ran in JS or not at all.
      expect(live.animations, `${route}: no scroll-driven animation is running`).toBeGreaterThan(0);
      expect(live.timelined, `${route}: nothing carries a non-auto animation-timeline`).toBeGreaterThan(0);
      expect(live.timelines.some((t) => t.includes("view()") || t.includes("scroll("))).toBe(true);
      expect(live.names, `${route}: scroll-reveal should be among the live animations`).toContain("scroll-reveal");
    });
  }

  for (const route of [`${DEMO}/events`, "/templates/temple-gold"]) {
    test(`${route}: every block is fully inked at the moment it is read`, async ({ page }) => {
      await page.goto(route, { waitUntil: "load" });
      await page.waitForTimeout(300);

      const count = await page.locator(".scroll-reveal").count();
      expect(count).toBeGreaterThan(0);

      const faded: string[] = [];
      for (let i = 0; i < count; i += 1) {
        // Put this block's OWN heading at the vertical centre — the moment a
        // guest is reading it. `instant` matters: a smooth scroll samples
        // mid-glide and reports a half-faded block that is the test's own
        // artefact, not the page's.
        await page.evaluate((index) => {
          const el = document.querySelectorAll(".scroll-reveal")[index];
          const anchor = el.querySelector("h1, h2, h3, p, a") ?? el;
          const rect = anchor.getBoundingClientRect();
          window.scrollTo({
            top: window.scrollY + rect.top - window.innerHeight / 2 + rect.height / 2,
            behavior: "instant" as ScrollBehavior,
          });
        }, i);
        await page.waitForTimeout(80);
        const reading = await page.evaluate((index) => {
          const el = document.querySelectorAll(".scroll-reveal")[index];
          return { opacity: Number(getComputedStyle(el).opacity), cls: (el.className as string).slice(0, 50) };
        }, i);
        if (reading.opacity < 1) faded.push(`block ${i} (${reading.cls}) at opacity ${reading.opacity}`);
      }

      expect(
        faded,
        `${route}: a block was still fading while its own heading sat at the ` +
          "centre of the screen. The guest pages are ~12k px tall at 390 and a " +
          "single event card is taller than the viewport, so a range measured " +
          "in `cover` must land its opacity well before the range ends.\n  " +
          faded.join("\n  "),
      ).toEqual([]);
    });
  }
});

// --------------------------------------------------------------------------
// 5. THE SIXTEEN STILL ARRIVE DIFFERENTLY
// --------------------------------------------------------------------------

test.describe("per-template reveal cadence", () => {
  productionServerOnly();
  test.use({ viewport: { width: 1280, height: 900 } });

  test("sixteen designs, one class, and no two chromes share a cadence", async ({ page }) => {
    const rows: {
      key: string;
      chrome: string;
      variant: string;
      triple: string;
      textWrap: { h1: string; h2: string | null; measure: string };
    }[] = [];

    for (const template of templateRegistry) {
      await page.goto(`/templates/${template.key}`, { waitUntil: "domcontentloaded" });
      const row = await page.evaluate(() => {
        const scope = document.querySelector(".theme-scope");
        if (!scope) throw new Error("no .theme-scope on the page");
        const cs = getComputedStyle(scope);
        const read = (name: string) => cs.getPropertyValue(name).trim();

        // `.measure` is part of the shell ladder and nothing carries it yet, so
        // the only honest way to read its value is to put a probe in the scope.
        const probe = document.createElement("div");
        probe.className = "measure";
        scope.appendChild(probe);
        const measureWrap = getComputedStyle(probe).textWrap;
        probe.remove();

        const h1 = document.querySelector(".theme-scope h1");
        const h2 = document.querySelector(".theme-scope h2");
        return {
          chrome: (scope as HTMLElement).dataset.chrome ?? "",
          variant: (scope as HTMLElement).dataset.heroVariant ?? "",
          triple: `${read("--reveal-lift")} / ${read("--reveal-span")} / ${read("--reveal-stagger")}`,
          textWrap: {
            h1: h1 ? getComputedStyle(h1).textWrap : "",
            h2: h2 ? getComputedStyle(h2).textWrap : null,
            measure: measureWrap,
          },
        };
      });
      rows.push({ key: template.key, ...row });
    }

    // The data attributes must come from the registry, not from a key list, so
    // a seventeenth template inherits a cadence instead of needing one added.
    for (const template of templateRegistry) {
      const row = rows.find((r) => r.key === template.key)!;
      expect(row.chrome, `${template.key}: data-chrome should mirror the registry`).toBe(template.chromeStyle);
      expect(row.variant, `${template.key}: data-hero-variant should mirror the registry`).toBe(template.heroVariant);
      expect(row.triple, `${template.key}: reveal tokens must resolve to real lengths`).not.toContain("/  /");
    }

    const distinct = new Set(rows.map((r) => r.triple));
    expect(
      distinct.size,
      "Porting the guest reveal onto one shared class must not flatten the " +
        `product. Cadences seen:\n${rows.map((r) => `  ${r.key.padEnd(24)} ${r.chrome.padEnd(10)} ${r.triple}`).join("\n")}`,
    ).toBeGreaterThanOrEqual(4);

    // The sharper claim: no single cadence appears under two different chromes.
    const byTriple = new Map<string, Set<string>>();
    for (const row of rows) {
      if (!byTriple.has(row.triple)) byTriple.set(row.triple, new Set());
      byTriple.get(row.triple)!.add(row.chrome);
    }
    const shared = [...byTriple.entries()]
      .filter(([, chromes]) => chromes.size > 1)
      .map(([triple, chromes]) => `${triple} is shared by ${[...chromes].join(" + ")}`);
    expect(
      shared,
      "Two chromeStyle groups arrive identically. A bare [data-hero-variant] " +
        "rule causes exactly this, because `destination` spans veil+horizon " +
        `and \`cinematic\` spans vignette+radiant.\n  ${shared.join("\n  ")}`,
    ).toEqual([]);

    // Headings balance; the measure classes get `pretty`. Asserted here rather
    // than in its own page load because it is the same sixteen pages.
    const wrapFailures = rows
      .filter((r) => r.textWrap.h1 !== "balance" || (r.textWrap.h2 !== null && r.textWrap.h2 !== "balance") || r.textWrap.measure !== "pretty")
      .map((r) => `${r.key}: h1=${r.textWrap.h1} h2=${r.textWrap.h2} .measure=${r.textWrap.measure}`);
    expect(wrapFailures, `text-wrap did not resolve as declared:\n  ${wrapFailures.join("\n  ")}`).toEqual([]);
  });
});

// --------------------------------------------------------------------------
// 6. THE DAY BADGE HOLDS CONTRAST OVER A PHOTOGRAPH NOBODY HAS SEEN
// --------------------------------------------------------------------------

test.describe("event-card day badge", () => {
  productionServerOnly();
  // reduce, so the pill is at its resting opacity when it is shot; a reveal
  // caught mid-animation would be measured at the animation's opacity.
  test.use({ contextOptions: { reducedMotion: "reduce" }, viewport: { width: 1440, height: 900 } });

  for (const template of templateRegistry) {
    test(`${template.key}: the day label is legible on its pill`, async ({ page }) => {
      await page.goto(`/templates/${template.key}`, { waitUntil: "load" });
      // The ornamented designs re-render their hero motifs as they hydrate, so
      // settle before taking a handle on anything: a node grabbed mid-render
      // detaches under the screenshot.
      await page.waitForLoadState("networkidle").catch(() => undefined);
      await page.waitForTimeout(800);

      const BADGE = ".scroll-reveal:has(a[href$='/rsvp']) .panel-solid";
      const badge = page.locator(BADGE).first();
      await expect(badge).toBeVisible();
      // Scrolled by selector rather than by handle: scrollIntoViewIfNeeded
      // waits for stability on a node that may still be replaced.
      await page.evaluate((sel: string) => {
        document.querySelector(sel)?.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
      }, BADGE);
      await page.waitForTimeout(250);

      // (a) ARITHMETIC, and the stronger claim of the two: the pill is
      // translucent, so composite it over BLACK and over WHITE. Compositing is
      // linear per channel and luminance is monotone in each, so those two are
      // the extremes of every photograph a couple could upload. If the ink's
      // luminance fell BETWEEN them, some photograph would drive the ratio to
      // 1:1 — so both extremes must land on the same side of the ink.
      const resolved = await badge.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { color: cs.color, background: cs.backgroundColor, text: (el.textContent ?? "").trim() };
      });
      const ink = parseColor(resolved.color);
      const pill = parseColor(resolved.background);
      expect(ink, `unparseable ink: ${resolved.color}`).not.toBeNull();
      expect(pill, `unparseable pill: ${resolved.background}`).not.toBeNull();

      const onBlack = over(pill!, { r: 0, g: 0, b: 0 });
      const onWhite = over(pill!, { r: 255, g: 255, b: 255 });
      const inkL = luminance(ink!);
      const sameSide = (luminance(onBlack) > inkL) === (luminance(onWhite) > inkL);
      expect(
        sameSide,
        `${template.key}: the pill is translucent enough (alpha ${pill!.a}) that the ` +
          "upload underneath can cross the ink's own luminance — somewhere " +
          "between a dark and a light photograph the label disappears. This is " +
          "the Badge default (an --accent/10 ground carrying --primary ink); " +
          "the day label needs the same opaque material as its sibling pill.",
      ).toBe(true);

      const worstCase = Math.min(contrast(ink!, onBlack), contrast(ink!, onWhite));
      expect(
        worstCase,
        `${template.key}: day label "${resolved.text}" measures ${worstCase.toFixed(2)}:1 ` +
          "against the worst photograph that could sit under its pill",
      ).toBeGreaterThanOrEqual(4.5);

      // (b) THE HOUSE PIXEL METHOD, on the demo's real photograph: shoot the
      // pill, shoot it again with its own ink forced transparent, and compare
      // the glyph pixels against the same coordinates underneath. Remember it
      // UNDERSTATES letterspaced text, so a measured pass is a true pass.
      const before = (await badge.screenshot({ animations: "disabled" })).toString("base64");
      await badge.evaluate((el) => (el as HTMLElement).style.setProperty("color", "transparent", "important"));
      await page.waitForTimeout(60);
      const after = (await badge.screenshot({ animations: "disabled" })).toString("base64");

      const sampled = await page.evaluate(async ([a, b]: [string, string]) => {
        const load = (data: string) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("decode failed"));
            img.src = `data:image/png;base64,${data}`;
          });
        const [withInk, withoutInk] = await Promise.all([load(a), load(b)]);
        const canvas = document.createElement("canvas");
        canvas.width = withInk.width;
        canvas.height = withInk.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(withInk, 0, 0);
        const inked = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(withoutInk, 0, 0);
        const bare = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        // The most fully covered glyph pixel, which is the closest a thin
        // antialiased letter gets to its declared colour.
        let best = -1;
        let glyph: number[] | null = null;
        let ground: number[] | null = null;
        let covered = 0;
        for (let i = 0; i < inked.length; i += 4) {
          const delta =
            Math.abs(inked[i] - bare[i]) + Math.abs(inked[i + 1] - bare[i + 1]) + Math.abs(inked[i + 2] - bare[i + 2]);
          if (delta > 8) covered += 1;
          if (delta > best) {
            best = delta;
            glyph = [inked[i], inked[i + 1], inked[i + 2]];
            ground = [bare[i], bare[i + 1], bare[i + 2]];
          }
        }
        return { width: canvas.width, height: canvas.height, covered, glyph, ground };
      }, [before, after] as [string, string]);

      expect(sampled.width, `${template.key}: the badge has no box to measure`).toBeGreaterThan(0);
      expect(
        sampled.covered,
        `${template.key}: forcing the label's colour transparent changed no ` +
          "pixels, so there was no text drawn in the pill to measure",
      ).toBeGreaterThan(20);

      const measured = contrast(
        { r: sampled.glyph![0], g: sampled.glyph![1], b: sampled.glyph![2] },
        { r: sampled.ground![0], g: sampled.ground![1], b: sampled.ground![2] },
      );
      expect(
        measured,
        `${template.key}: day label measures ${measured.toFixed(2)}:1 by the pixel ` +
          `method (ink rgb(${sampled.glyph}) on rgb(${sampled.ground}), ` +
          `${sampled.covered} glyph pixels)`,
      ).toBeGreaterThanOrEqual(4.5);
    });
  }
});

// --------------------------------------------------------------------------
// 7. NO HORIZONTAL OVERFLOW
// --------------------------------------------------------------------------

/**
 * layout-overflow.spec.ts covers the demo site and the marketing routes;
 * template-gallery.spec.ts covers /dev/template-gallery. The sixteen PUBLIC
 * /templates/<key> pages — which is where a couple actually looks at a design,
 * and which render the same hero, monogram and event grid — were covered by
 * neither. StaggerItem's min-w-0 is the documented 320px overflow path (#43),
 * and the wrapper was replaced wholesale in this change set.
 */
const WIDTHS = [320, 390, 768] as const;

for (const width of WIDTHS) {
  test.describe(`template pages at ${width}px`, () => {
    productionServerOnly();
    test.use({ viewport: { width, height: 844 } });

    for (const template of templateRegistry) {
      test(`/templates/${template.key} has no horizontal overflow`, async ({ page }) => {
        const response = await page.goto(`/templates/${template.key}`, { waitUntil: "domcontentloaded" });
        expect(response?.status()).toBeLessThan(400);
        await page.waitForTimeout(400);

        const result = await findOverflow(page);
        const detail = result.offenders.length
          ? "\n\nOffending elements (outermost first):\n" +
            result.offenders
              .map((o) => `  <${o.tag}> +${o.over}px (width ${o.width}px) "${o.text}"\n      class="${o.cls}"`)
              .join("\n") +
            "\n\nUsually the fix is min-w-0 on a grid/flex child. See #43."
          : "";
        expect(
          result.scrollWidth,
          `/templates/${template.key} at ${width}px scrolls horizontally ` +
            `(scrollWidth ${result.scrollWidth} > viewport ${result.clientWidth}).${detail}`,
        ).toBeLessThanOrEqual(result.clientWidth + 1);
      });
    }
  });
}

test.describe("the events grid keeps its automatic minimum zeroed", () => {
  productionServerOnly();
  test.use({ viewport: { width: 320, height: 844 } });

  for (const route of [`${DEMO}/events`, DEMO, "/templates/temple-gold"]) {
    test(`${route}: every event-card wrapper is layout-neutral at 320px`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(400);

      const wrappers = await page.evaluate(() =>
        [...document.querySelectorAll(".scroll-reveal:has(a[href$='/rsvp'])")].map((el) => ({
          cls: (typeof el.className === "string" ? el.className : "").slice(0, 60),
          minWidth: getComputedStyle(el).minWidth,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
        })),
      );

      expect(wrappers.length, `${route}: event-card wrappers should exist`).toBeGreaterThanOrEqual(3);
      const notNeutral = wrappers.filter((w) => w.minWidth !== "0px" || w.scrollWidth > w.clientWidth);
      expect(
        notNeutral,
        "A grid child defaults to `min-width: auto`, whose automatic minimum is " +
          "the content's MIN-CONTENT width, so the track refuses to shrink and " +
          "the page scrolls sideways at 320px. A wrapper whose only job is " +
          `animation must opt out explicitly.\n${JSON.stringify(notNeutral, null, 2)}`,
      ).toEqual([]);
    });
  }
});

// --------------------------------------------------------------------------
// 8. STATIC CONTRACT. No server, no browser — these hold even when the rest
//    of the suite cannot reach one, which is the same argument
//    template-palette.spec.ts makes for itself.
// --------------------------------------------------------------------------

test.describe("the motion contract, read off the source", () => {
  test("the reveal primitives carry no JS motion library and no hidden initial state", () => {
    for (const file of [MOTION_PRIMITIVES, COUPLE_MONOGRAM]) {
      const source = readFileSync(file, "utf8");
      const name = path.basename(file);
      expect(source, `${name} must not import motion/react: its \`initial\` prop is resolved into an inline style during the SERVER render`).not.toMatch(
        /from\s+["']motion\/react["']/,
      );
      expect(source, `${name} must not import framer-motion either`).not.toMatch(/from\s+["']framer-motion["']/);
      // The specific shape of the defect: a hidden start state declared in TSX.
      const code = source
        .split("\n")
        .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
        .join("\n");
      expect(code, `${name} declares an opacity-0 start state in component code`).not.toMatch(
        /opacity\s*:\s*0\b/,
      );
    }
    // A server component ships no JS of its own; "use client" here would put
    // the reveal back on the hydration path.
    expect(
      readFileSync(MOTION_PRIMITIVES, "utf8"),
      "motion-primitives.tsx should stay a server component",
    ).not.toMatch(/^\s*["']use client["']/m);
  });

  test("every scroll-driven rule sits inside the @supports + no-preference gate", () => {
    const css = readFileSync(GLOBALS_CSS, "utf8");
    const supports = atRuleSpans(css, "@supports (animation-timeline: view())");
    const noPreference = atRuleSpans(css, "@media (prefers-reduced-motion: no-preference)");
    expect(supports.length, "globals.css should still gate scroll-driven motion").toBeGreaterThan(0);

    // `(?<!\()` skips the @supports condition itself, which contains the same
    // text as the declaration it guards.
    const declarations = [...css.matchAll(/(?<!\()animation-timeline\s*:/g)];
    expect(declarations.length, "there should be animation-timeline declarations to check").toBeGreaterThan(0);

    const ungated = declarations
      .filter((m) => !(inside(m.index!, supports) && inside(m.index!, noPreference)))
      .map((m) => `line ${lineOf(css, m.index!)}: ${css.slice(m.index!, m.index! + 60).split("\n")[0]}`);
    expect(
      ungated,
      "House rule 1: a scroll-driven rule outside @supports (animation-timeline: " +
        "view()) nested in @media (prefers-reduced-motion: no-preference) runs " +
        `where it cannot be honoured.\n  ${ungated.join("\n  ")}`,
    ).toEqual([]);

    // The hairline is the inverse case: its default must sit OUTSIDE the gate
    // and paint nothing, and only the gated rule may show it. The `:where(...)`
    // form is matched too — see the cascade check below for why it is there.
    const hairlineRules = [...css.matchAll(/(:where\()?\.scroll-progress-hairline\)?\s*\{/g)].map((m) => ({
      index: m.index!,
      line: lineOf(css, m.index!),
      gated: inside(m.index!, supports) && inside(m.index!, noPreference),
      zeroSpecificity: Boolean(m[1]),
      body: css.slice(m.index!, css.indexOf("}", m.index!)),
    }));
    const ungatedHairline = hairlineRules.filter((r) => !r.gated);
    expect(ungatedHairline.length, "the hairline needs an ungated default").toBeGreaterThan(0);
    for (const rule of ungatedHairline) {
      expect(
        rule.body,
        `globals.css line ${rule.line}: an undriven full-width hairline claims the ` +
          "page was read to the end, so the ungated default must hide it",
      ).toMatch(/display\s*:\s*none/);
    }
    for (const rule of hairlineRules.filter((r) => r.gated)) {
      expect(rule.body, `globals.css line ${rule.line}: the gated rule is what reveals the hairline`).toMatch(
        /display\s*:\s*block/,
      );
    }

    // AND NOW THE CASCADE, WHICH IS WHAT ACTUALLY BROKE.
    //
    // Everything above passed while the hairline was display:none on every page
    // in every browser. Both rules were present and both said the right thing —
    // but the ungated default sat 57 lines BELOW the gated one at identical
    // specificity (0,1,0), @supports contributes none, and neither was in a
    // cascade layer. The later rule won, unconditionally, and a shipped feature
    // was silently deleted. Present and correct is not the same as reachable.
    //
    // So: a default that comes after the rule meant to beat it must be
    // zero-specificity, which is what :where() is for.
    for (const rule of ungatedHairline) {
      const gatedEarlier = hairlineRules.filter((r) => r.gated && r.index < rule.index);
      if (gatedEarlier.length === 0) continue;
      expect(
        rule.zeroSpecificity,
        `globals.css line ${rule.line}: this display:none default is LATER in the file than ` +
          `the gated rule at line ${gatedEarlier[0].line} that is supposed to reveal the hairline, ` +
          "and at equal specificity the later rule wins — so the hairline would never paint. " +
          "Either move this default above the gated rule, or wrap it in :where() to drop it to " +
          "zero specificity so the gate wins wherever either one is moved to.",
      ).toBe(true);
    }
  });

  test("every reveal keyframe runs TO the resting state", () => {
    const css = readFileSync(GLOBALS_CSS, "utf8");
    for (const name of ["scroll-reveal", "hero-ornament-drift"]) {
      const at = css.indexOf(`@keyframes ${name}`);
      expect(at, `@keyframes ${name} should exist`).toBeGreaterThan(-1);
      const open = css.indexOf("{", at);
      let depth = 0;
      let end = open;
      for (; end < css.length; end += 1) {
        if (css[end] === "{") depth += 1;
        else if (css[end] === "}") {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      const body = css.slice(open, end);
      const to = /(?:^|[{;\s])to\s*\{([^}]*)\}/.exec(body);
      expect(to, `@keyframes ${name} needs an explicit \`to\` block`).not.toBeNull();
      expect(
        to![1],
        `@keyframes ${name} must END at the resting state, so a browser that ` +
          "ignores the animation shows finished content (house rule 1)",
      ).toMatch(/opacity\s*:\s*1|transform\s*:\s*translateY\(0\)/);
      // And it must not come to rest faded or displaced.
      expect(to![1], `@keyframes ${name} rests below full opacity`).not.toMatch(/opacity\s*:\s*0(\.\d+)?\s*;/);
    }
  });

  test("reduced motion nulls every scroll-driven class", () => {
    const css = readFileSync(GLOBALS_CSS, "utf8");
    const reduceBlocks = atRuleSpans(css, "@media (prefers-reduced-motion: reduce)");
    expect(reduceBlocks.length).toBeGreaterThan(0);
    const reduce = reduceBlocks.map((s) => css.slice(s.start, s.end)).join("\n");

    for (const cls of ["scroll-reveal", "hero-ornament-drift", "hero-media-drift"]) {
      expect(
        reduce,
        `.${cls} is not in the reduced-motion null list, so a guest who asked ` +
          "for less motion still gets a scroll-driven animation",
      ).toMatch(new RegExp(`\\.${cls}\\s*[,{]`));
    }
    expect(reduce, "the null list must actually null the animations").toMatch(/animation\s*:\s*none\s*!important/);
  });

  test("the cadence tokens are declared on :root and re-declared per chrome", () => {
    const css = readFileSync(GLOBALS_CSS, "utf8");
    for (const token of ["--reveal-lift", "--reveal-span", "--reveal-stagger"]) {
      expect(css, `${token} needs a :root default so the marketing call sites are unchanged`).toMatch(
        new RegExp(`${token}\\s*:`),
      );
    }
    const chromes = [...new Set(templateRegistry.map((t) => t.chromeStyle))];
    const missing = chromes.filter((chrome) => !css.includes(`.theme-scope[data-chrome="${chrome}"]`));
    expect(
      missing,
      `every chromeStyle needs its own cadence or it falls through to the house ` +
        `default and two designs arrive identically: ${missing.join(", ")}`,
    ).toEqual([]);
  });
});
