import { test, expect } from "@playwright/test";

import { relativeLuminance } from "../src/lib/color";
import { templateRegistry } from "../src/lib/template-registry";

/**
 * Every template's own palette must be legible against itself.
 *
 * Pure arithmetic over the registry: no page, no browser, no database. That is
 * deliberate — this is the one check that must still run when the rest of the
 * suite cannot reach a server, because a palette that fails here fails on every
 * couple's site at once.
 *
 * It exists because three of the sixteen shipped below AA: classic-elegant at
 * 4.43, kolam-blush at 4.08 and atoll-white at 4.47, all on their own surface.
 *
 * A NOTE ON MEASUREMENT, because it cost a round to work out. Sampling these
 * ratios from rendered pixels UNDERSTATES them for small text: kolam-blush's
 * 30px heading measured 12.98 in the browser against 12.98 here - exact - while
 * its 11px letterspaced eyebrow measured 2.70 against 4.08 here, because an
 * antialiased glyph that thin never reaches its full colour. Trust this file
 * for the palette and the browser for layout.
 */

const AA_BODY = 4.5;

function contrast(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la === null || lb === null) throw new Error(`unparseable colour: ${a} / ${b}`);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

test.describe("every palette is legible against itself", () => {
  for (const template of templateRegistry) {
    const { mutedColor, textColor, surfaceColor, backgroundColor } = template.themeDefaults;

    test(`${template.key}: muted text meets AA on its own surface`, () => {
      expect(contrast(mutedColor, surfaceColor)).toBeGreaterThanOrEqual(AA_BODY);
    });

    test(`${template.key}: body text meets AA on surface and background`, () => {
      expect(contrast(textColor, surfaceColor)).toBeGreaterThanOrEqual(AA_BODY);
      expect(contrast(textColor, backgroundColor)).toBeGreaterThanOrEqual(AA_BODY);
    });
  }
});
