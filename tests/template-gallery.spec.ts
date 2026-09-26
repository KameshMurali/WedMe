import { test, expect } from "@playwright/test";

import { templateRegistry } from "../src/lib/template-registry";
import { findOverflow } from "./helpers/overflow";

/**
 * Exercises every template through the dev gallery route (TEMPLATE_GALLERY=1).
 *
 * Two jobs. It asserts the things the chrome work is actually about — that the
 * page backdrop follows the template rather than falling through to a shared
 * default, and that no design pushes the document sideways on a phone now that
 * the ornament frames are drawn below `lg`. And with TEMPLATE_SHOTS=1 it writes
 * the screenshots, which are both how a human verifies the designs really do
 * differ and the source for the picker's thumbnails.
 *
 * IMPORTANT: point this at a PRODUCTION build (`next build && next start`).
 * React's development build needs eval(), and under a strict CSP that fails,
 * hydration dies, and every scroll-triggered reveal freezes in its hidden
 * state — the couple's monogram included. Shots taken from `next dev` in that
 * situation show a half-rendered page and are worse than no shots at all.
 */

const capture = Boolean(process.env.TEMPLATE_SHOTS);

const VIEWPORTS = [
  // 320 is the narrowest phone still in real use, and three of the four
  // original overflow failures showed up only there. It is measured but not
  // shot — a 320px thumbnail is no use to the picker.
  { label: "phone-320", width: 320, height: 844, shoot: false },
  { label: "phone", width: 390, height: 844, shoot: true },
  { label: "desktop", width: 1280, height: 900, shoot: true },
] as const;

for (const template of templateRegistry) {
  for (const viewport of VIEWPORTS) {
    test(`${template.key} @ ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`/dev/template-gallery/${template.key}`);
      await page.waitForLoadState("networkidle");

      // Ornaments animate in on mount and the kolam draws over 2.1s, so settle
      // before measuring or shooting — otherwise a figure is caught half-drawn.
      await page.waitForTimeout(3000);

      // The failure this whole change is about: chrome that ignores the
      // template. Eleven of sixteen designs used to fall through to the
      // champagne default because the switch only named the original five.
      await expect(page.locator(`.chrome-${template.chromeStyle}`).first()).toBeAttached();

      const result = await findOverflow(page);
      expect(
        result.scrollWidth,
        result.offenders.length
          ? `${template.key} overflows:\n` +
            result.offenders.map((o) => `  <${o.tag}> +${o.over}px class="${o.cls}"`).join("\n")
          : `${template.key} overflows`,
      ).toBeLessThanOrEqual(result.clientWidth + 1);

      if (capture && viewport.shoot) {
        await page.screenshot({
          path: `test-results/templates/${viewport.label}/${template.key}.png`,
        });
      }
    });
  }
}
