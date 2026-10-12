import { expect, test } from "@playwright/test";

import { contrastWithInk, readableInkOn } from "../src/lib/color";
import { templateRegistry } from "../src/lib/template-registry";

/**
 * Every template's primary call to action must be readable.
 *
 * This existed as a real defect rather than a hypothetical: the solid Button
 * hardcoded `text-white`, which is correct for a deep primary and invisible on
 * a pale one. cinematic-modern's primary is #f2d4ab, so its main call to action
 * measured 1.42:1 — against the 4.5:1 WCAG 2.2 asks for body-sized text.
 *
 * Nothing else catches it. Types, lint and the build all pass with an
 * unreadable button, and layout-overflow.spec.ts only measures scrollWidth.
 *
 * The ink is now chosen per palette by readableInkOn(), and this asserts the
 * arithmetic directly against the registry rather than against a rendered page,
 * so it runs in milliseconds and names the offending template.
 */
test("every template primary carries readable ink", () => {
  const failures: string[] = [];

  for (const template of templateRegistry) {
    const primary = template.themeDefaults.primaryColor;
    const ratio = contrastWithInk(primary);
    if (ratio < 4.5) {
      failures.push(
        `${template.key}: primary ${primary} with ink ${readableInkOn(primary)} ` +
          `is ${ratio.toFixed(2)}:1, under 4.5:1`,
      );
    }
  }

  expect(
    failures,
    "A primary that cannot carry readable text at EITHER ink is a palette " +
      "problem, not a component one — darken or lighten the primary itself. " +
      "atoll-white needed exactly that: #3d857f scored 4.32:1 on white and " +
      "3.95:1 on near-black, so no ink could save it.",
  ).toEqual([]);
});

test("readableInkOn picks the better ink, not merely a plausible one", () => {
  // A pale primary must take dark ink. This is the cinematic-modern case.
  expect(readableInkOn("#f2d4ab")).toBe("#1b1114");
  // A deep primary must take white.
  expect(readableInkOn("#0f5c46")).toBe("#ffffff");
  // Unparseable falls back to white rather than throwing, matching the
  // light-first bias the rest of the colour code takes.
  expect(readableInkOn("not a colour")).toBe("#ffffff");
  expect(readableInkOn(null)).toBe("#ffffff");
});
