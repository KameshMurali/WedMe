import type { Page } from "@playwright/test";

/**
 * Finds SVG `<defs>` references that resolve to nothing, and `<defs>` ids that
 * more than one element in the document claims.
 *
 * Both failures are invisible. A `fill="url(#missing)"` paints nothing and logs
 * nothing; two `<pattern>` elements sharing an id are invalid, and every
 * reference to that id silently resolves to whichever came first. The pierced
 * jaali screens on the North Indian palace template were blank for the first
 * reason: a rename reached the reference, `url(#${patternId})`, but left the
 * definition's `<pattern id="jaali">` hardcoded, so both side screens pointed
 * at ids no element had.
 *
 * Run against every template because each one brings its own ornament set, and
 * every *Frame renders its screen twice, left and right — which is precisely
 * why those ids are prop-driven rather than hardcoded in the first place.
 */
export type SvgDefsReport = { dangling: string[]; duplicated: string[] };

// The attributes that can carry a url(#id) reference to a <defs> child.
const REF_ATTRS = [
  "fill",
  "stroke",
  "clip-path",
  "mask",
  "filter",
  "marker-start",
  "marker-mid",
  "marker-end",
];

export async function findSvgDefsProblems(page: Page): Promise<SvgDefsReport> {
  return page.evaluate((refAttrs) => {
    const dangling = new Set<string>();

    document.querySelectorAll("svg *").forEach((el) => {
      for (const attr of refAttrs) {
        const value = el.getAttribute(attr);
        if (!value) continue;
        const match = /url\(["']?#([^"')]+)["']?\)/.exec(value);
        if (!match) continue;
        // SVG ids share the document id space, so getElementById is the same
        // lookup the renderer does.
        if (!document.getElementById(match[1])) {
          dangling.add(`<${el.tagName.toLowerCase()} ${attr}="${value}">`);
        }
      }
    });

    const counts = new Map<string, number>();
    document.querySelectorAll("svg defs > *[id]").forEach((el) => {
      const id = el.getAttribute("id") ?? "";
      counts.set(id, (counts.get(id) ?? 0) + 1);
    });

    return {
      dangling: [...dangling],
      duplicated: [...counts]
        .filter(([, count]) => count > 1)
        .map(([id, count]) => `#${id} defined ${count}x`),
    };
  }, REF_ATTRS);
}
