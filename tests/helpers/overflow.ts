import type { Page } from "@playwright/test";

/**
 * Shared horizontal-overflow probe.
 *
 * Extracted so more than one suite can use it: the route matrix in
 * layout-overflow.spec.ts, and the template gallery, which has to check every
 * design rather than only the demo site's template. The ornament side frames
 * are drawn at phone widths now, and a frame that pushes the document sideways
 * would be exactly the regression #43 and #44 were about.
 */
export type Offender = { tag: string; cls: string; over: number; width: number; text: string };

export async function findOverflow(page: Page) {
  return page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;

    // An element sticking out past the viewport is only a BUG when nothing
    // above it clips. The nav pill rail and the gallery thumbnail rail both
    // extend far past the viewport by design and scroll inside their own
    // `overflow-x: auto` containers — they never widen the document. Without
    // this filter they dominate the report and hide the real culprits.
    const isClipped = (el: Element) => {
      let node = el.parentElement;
      while (node && node !== document.documentElement) {
        const overflowX = getComputedStyle(node).overflowX;
        if (overflowX === "hidden" || overflowX === "auto" || overflowX === "scroll") {
          return true;
        }
        node = node.parentElement;
      }
      return false;
    };

    const offenders: Offender[] = [];
    document.querySelectorAll("*").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      const over = Math.round(rect.right - docWidth);
      // 1px of tolerance absorbs sub-pixel rounding in layout.
      if (over <= 1) return;
      if (isClipped(el)) return;
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (typeof el.className === "string" ? el.className : "").slice(0, 120),
        over,
        width: Math.round(rect.width),
        text: (el.textContent ?? "").trim().slice(0, 40),
      });
    });

    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: docWidth,
      // Outermost first: an inner element is usually just being dragged along
      // by its parent, so the shallowest offender is the one to fix.
      offenders: offenders.slice(0, 8),
    };
  });
}
