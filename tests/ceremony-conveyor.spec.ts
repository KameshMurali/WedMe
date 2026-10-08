import { expect, test } from "@playwright/test";

/**
 * The pinned conveyor absolutely positions eight slides inside a clipped stage,
 * seven of them up to 2.5 screens outside it. Anything FOCUSABLE in there is a
 * WCAG 2.2 AA failure of SC 2.4.11 (Focus Not Obscured) that no layout
 * assertion can see: the browser scrolls the document to bring the focused
 * element into view, scrolling advances the view() timeline, the timeline
 * re-translates the list, and the chase never converges.
 *
 * Measured on the shipped layout before it was fixed: Tab hops of +1041, -2069,
 * +3246, -2226, +3525 and -2273 px, with forward Tab scrolling the page
 * BACKWARDS and five of seven hops leaving the focused link entirely off
 * screen. `scroll-padding` cannot fix it — the target's position is a function
 * of the scroll offset.
 *
 * The fix is that the conveyor holds no focusable elements at all. All eight
 * ceremony names pointed at one href, and that href is still linked below the
 * stage. This guards the invariant, because the obvious future edit is to make
 * the ceremony name a link again.
 *
 * Types, lint and the build all passed while this was broken, and
 * layout-overflow.spec.ts only measures scrollWidth. Nothing else sees it.
 */

const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

// 1280x900 pins via the desktop gate, 390x844 via the phone gate, and 320x844
// falls below the 360px floor and gets the plain list. The invariant holds at
// every width, because the markup carries no link at any width.
for (const { width, height, label } of [
  { width: 1280, height: 900, label: "desktop pin" },
  { width: 390, height: 844, label: "phone pin" },
  { width: 320, height: 844, label: "below the phone floor" },
]) {
  test(`the ceremony conveyor holds nothing focusable @ ${label}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");

    const stage = page.locator(".ceremony-viewport");
    await expect(stage).toHaveCount(1);

    expect(
      await stage.locator(FOCUSABLE).count(),
      "The clipped conveyor must contain no focusable element: scroll-into-view " +
        "cannot converge inside it, so focusing one scrolls the page away from " +
        "the reader. Link the ceremonies below the stage instead.",
    ).toBe(0);
  });
}

test("all eight ceremonies are present as real text", async ({ page }) => {
  // The conveyor hides seven of eight visually, so the guarantee that matters
  // for a crawler and a screen reader is that every name is in the DOM at first
  // paint rather than revealed by script.
  await page.goto("/");
  const list = page.locator(".ceremony-list");
  await expect(list).toHaveCount(1);
  const text = (await list.innerText()).toLowerCase();
  for (const name of [
    "mehendi",
    "haldi",
    "sangeet",
    "nikkah",
    "muhurtham",
    "ceremony",
    "reception",
    "walima",
  ]) {
    expect(text, `"${name}" must be real DOM text inside the conveyor`).toContain(name);
  }
});
