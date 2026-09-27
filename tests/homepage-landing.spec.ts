import { test, expect } from "@playwright/test";

/**
 * Guards what a visitor sees when they arrive on the homepage.
 *
 * This exists because of a specific regression: the waitlist band at the foot
 * of the page renders its email input immediately (`defaultOpen`), and the
 * input carried an unconditional `autoFocus`. Browsers scroll a focused element
 * into view, so landing on the site jumped the viewport past the entire page to
 * an email field. Someone arriving from a link was asked to sign up before they
 * had seen anything.
 *
 * Types, lint and the build all pass while this is broken. Only measuring the
 * scroll position catches it.
 */

const WIDTHS = [
  { label: "phone", width: 390, height: 844 },
  { label: "desktop", width: 1280, height: 900 },
] as const;

for (const viewport of WIDTHS) {
  test(`homepage opens at the top @ ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Autofocus scrolling happens on first paint; give the browser a frame or
    // two to do it before asserting that it did not.
    await page.waitForTimeout(800);

    expect(await page.evaluate(() => window.scrollY)).toBe(0);

    // Nothing should have stolen focus on load.
    const focusedName = await page.evaluate(
      () => (document.activeElement as HTMLInputElement | null)?.name ?? null,
    );
    expect(focusedName).not.toBe("email");
  });
}

test("nothing on the homepage claims autofocus", async ({ page }) => {
  // The same invariant at the markup level, which is where the fault actually
  // lives: autoFocus is a plain HTML attribute honoured by the browser before
  // any JavaScript runs, which is why the jump happened even on a page whose
  // hydration had failed.
  //
  // Asserted server-side rather than by clicking the /pricing form, because a
  // click test needs working hydration and this repo is checked in an
  // environment whose CSP blocks the eval() React's development build needs.
  // A test that only passes in CI is worse than one that tests less.
  await page.goto("/");
  const autofocused = await page.locator("[autofocus]").count();
  expect(autofocused).toBe(0);
});
