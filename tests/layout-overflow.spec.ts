import { expect, test } from "@playwright/test";

import { findOverflow } from "./helpers/overflow";

/**
 * Guards against horizontal overflow on the public site.
 *
 * This exists because of a specific, easily-reintroduced bug (fixed in #43):
 * grid and flex items default to `min-width: auto`, whose automatic minimum
 * size is the content's MIN-CONTENT width — so a track refuses to shrink below
 * it and the page scrolls sideways on narrow phones. Wrapping a grid child in
 * a plain <div> is enough to trigger it, which is exactly how it was introduced
 * (a motion wrapper replaced a card that had set `overflow-hidden`, and
 * overflow-hidden is what had been zeroing that automatic minimum).
 *
 * Types, lint and the build all pass while this is broken. Only measurement
 * catches it, which is why it is a browser test rather than a lint rule.
 */

const DEMO = "/kammonbeginnings";

// The demo slug renders from a static snapshot with no database, so these are
// safe to hit in CI without a Postgres service.
const ROUTES = [
  DEMO,
  `${DEMO}/story`,
  `${DEMO}/events`,
  `${DEMO}/schedule`,
  `${DEMO}/rsvp`,
  `${DEMO}/gallery`,
  `${DEMO}/experience`,
  `${DEMO}/registry`,
  `${DEMO}/memories`,
  `${DEMO}/wishes`,
  "/",
  "/pricing",
  "/terms",
  "/privacy",
  "/login",
  "/register",
];

// 320 is the narrowest phone still in real use (iPhone SE). It stays in the
// matrix because three of the four original failures appeared ONLY at 320 —
// testing 390 alone would have shipped them.
const WIDTHS = [320, 390, 768] as const;

for (const width of WIDTHS) {
  test.describe(`viewport ${width}px`, () => {
    test.use({ viewport: { width, height: 844 } });

    for (const route of ROUTES) {
      test(`${route} has no horizontal overflow`, async ({ page }) => {
        const response = await page.goto(route, { waitUntil: "domcontentloaded" });
        expect(response?.status(), `${route} should render`).toBeLessThan(400);

        // Let scroll-triggered reveals and any layout settling finish, so we
        // measure the page a guest actually sees.
        await page.waitForTimeout(600);

        const result = await findOverflow(page);

        const detail = result.offenders.length
          ? `\n\nOffending elements (outermost first — fix the first one):\n` +
            result.offenders
              .map((o) => `  <${o.tag}> overflows by ${o.over}px (width ${o.width}px) "${o.text}"\n      class="${o.cls}"`)
              .join("\n") +
            `\n\nUsually the fix is min-w-0 on a grid/flex child. See #43.`
          : "";

        expect(
          result.scrollWidth,
          `${route} at ${width}px scrolls horizontally ` +
            `(scrollWidth ${result.scrollWidth} > viewport ${result.clientWidth}).${detail}`,
        ).toBeLessThanOrEqual(result.clientWidth);
      });
    }
  });
}
