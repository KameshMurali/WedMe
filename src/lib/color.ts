// Colour maths for theme decisions.
//
// This has to run on the server (the public site's shell is a server
// component), so it is deliberately pure and DOM-free. The customizer's
// normalizeToHex helper cannot be reused here: it resolves colours by painting
// them onto a <canvas>, which only exists in the browser.

// Accepts #rgb, #rrggbb and #rrggbbaa (alpha ignored — a theme background is
// composited over the page, so its opaque value is what a guest reads text on).
function parseHex(value: string): { r: number; g: number; b: number } | null {
  const hex = value.trim().replace(/^#/, "");

  if (!/^[0-9a-fA-F]+$/.test(hex)) return null;

  if (hex.length === 3) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }

  if (hex.length === 6 || hex.length === 8) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  return null;
}

// WCAG relative luminance. Returns 0 (black) to 1 (white).
export function relativeLuminance(value: string): number | null {
  const rgb = parseHex(value);
  if (!rgb) return null;

  const channel = (raw: number) => {
    const c = raw / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

// Whether a page painted in this colour needs the dark-theme treatment.
//
// The threshold sits well below mid-grey: everything the registry ships is
// either near-white (luminance > 0.85) or near-black (< 0.03), so the exact
// cutoff only matters for a colour a couple picks by hand in the customizer.
// 0.22 puts the boundary at roughly a mid-tone jewel colour — a deep emerald or
// burgundy background reads as dark, which is the answer a guest would give.
//
// Fails LIGHT on an unparseable value. Light is the treatment fifteen of the
// sixteen templates want, and the light nav is legible on a light page; getting
// it wrong the other way puts white-on-white text in the header.
export function isDarkColor(value: string | null | undefined): boolean {
  if (!value) return false;
  const luminance = relativeLuminance(value);
  if (luminance === null) return false;
  return luminance < 0.22;
}
