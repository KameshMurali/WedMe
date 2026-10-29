/**
 * Capture the sixteen template thumbnails the homepage grid and the /templates
 * index show.
 *
 *   npx next build && npx next start -p 3400   # ONE server, fresh build
 *   node --experimental-strip-types shots.mjs
 *
 * POINT IT AT A FRESH PRODUCTION BUILD, AND AT ONLY ONE SERVER.
 *
 * An early run produced sixteen unstyled pages — Times serif, blue underlined
 * links, ornaments as grey blobs — and the only reason it was caught is that
 * someone opened the WebPs and looked. Every automated check passed: the files
 * existed, the <img> tags loaded, nothing 404'd.
 *
 * The cause was not this script. A second `next build` had run against the same
 * .next while a `next start` was still serving from it. A build replaces
 * .next/static wholesale and mints a new chunk hash, so the HTML that server
 * had already rendered pointed at a stylesheet that no longer existed:
 *
 *   /_next/static/chunks/08pb5ab-75ij4.css -> HTTP 500, 21 bytes
 *
 * The page still returned 200. `waitUntil: "networkidle"` was satisfied. A
 * failed stylesheet is not a failed navigation, so Playwright had nothing to
 * complain about and screenshotted the unstyled document quite happily. Hence
 * assertStyled() below: it turns a silent wrong answer into a loud missing one.
 */

import { chromium } from "@playwright/test";
import sharp from "sharp";
import fs from "node:fs";

import { templateRegistry } from "./src/lib/template-registry.ts";

const ORIGIN = process.env.SHOTS_ORIGIN ?? "http://127.0.0.1:3400";
const OUT_DIR = "public/templates";

const OUT_WIDTH = 960; // ~2x the largest box a card gets
const RATIO = 16 / 9;
const BASE_WIDTH = 1280;
const MIN_WIDTH = 1280;
const MAX_WIDTH = 2400;

/**
 * Fail if the stylesheet did not apply.
 *
 * Checks a custom property rather than a colour: `--primary` is defined by the
 * template's theme block and by nothing else, so an empty string means the CSS
 * is genuinely absent rather than merely different from what we expected. The
 * font check is a second, independent signal — an unstyled document falls back
 * to the browser's default serif.
 */
async function assertStyled(page, key) {
  const state = await page.evaluate(() => {
    const scope = document.querySelector(".theme-scope");
    if (!scope) return { missing: true };
    const cs = getComputedStyle(scope);
    const heading = document.querySelector(".theme-scope h1, .theme-scope h2");
    return {
      primary: cs.getPropertyValue("--primary").trim(),
      headingFont: heading ? getComputedStyle(heading).fontFamily : "",
      sheets: document.styleSheets.length,
    };
  });

  if (state.missing) throw new Error(`${key}: no .theme-scope on the page`);
  if (!state.primary) {
    throw new Error(
      `${key}: --primary is unset, so the template stylesheet never applied.\n` +
        `  stylesheets=${state.sheets}\n` +
        `  Almost certainly a stale .next: rebuild, then restart the server.`,
    );
  }
  if (/^(Times|serif)/i.test(state.headingFont)) {
    throw new Error(`${key}: headings fell back to ${state.headingFont} — fonts did not load`);
  }
  return state;
}

/**
 * Reduce the page to the one thing a thumbnail should show: the hero.
 *
 * Two layers of chrome sit above it and neither can be scrolled past. The
 * marketing band (name, description, palette swatches) is page scaffolding, and
 * the site header is `position: sticky`, so it rides the viewport at every
 * offset — an earlier round scrolled and got a frame that was 40% header on
 * every design, which is 40% of the frame spent on the part that does NOT
 * distinguish them. Removing both leaves the hero at the top of the document.
 *
 * Returns the height the composition actually needs: down to the bottom of the
 * hero's button row, which sits below the couple's names on every design.
 */
const STRIP = () => {
  // Guard: this runs once per page, but MEASURE runs again after each resize,
  // and an earlier version combined the two. On the second call
  // `section:first-child` was no longer the marketing band — the band was
  // already gone, so it was the live preview — and the whole design was
  // deleted. Every thumbnail came out a 1KB flat rectangle.
  if (document.documentElement.dataset.stripped === "1") return;
  document.documentElement.dataset.stripped = "1";

  document.querySelector("body > main > section:first-child")?.remove();
  const live = document.querySelector("body > main > section");
  live?.querySelector("p")?.remove(); // "A live preview, with sample content"
  live?.classList.remove("mt-12");
  // Removes the preview-only "Back to Home" bar along with it.
  document.querySelector(".theme-scope > header")?.remove();
  window.scrollTo(0, 0);
};

const MEASURE = () => {
  const hero = document.querySelector(".theme-scope section");
  if (!hero) return null;
  const bottoms = [...hero.querySelectorAll("a")]
    .filter((a) => /Our Story|RSVP|Events|Gallery|Reply/i.test(a.textContent || ""))
    .map((a) => a.getBoundingClientRect().bottom);
  const heroHeight = hero.getBoundingClientRect().height;
  // +48 so the buttons are not flush against the bottom edge.
  const needed = bottoms.length ? Math.max(...bottoms) + 48 : heroHeight;
  return Math.round(Math.min(needed, heroHeight));
};

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: BASE_WIDTH, height: 1400 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

// A stylesheet that 500s is what caused the unstyled run. Watch for it directly
// rather than inferring it afterwards.
const assetFailures = [];
page.on("response", (res) => {
  if (res.status() >= 400 && /\.(css|woff2?)(\?|$)/.test(res.url())) {
    assetFailures.push(`${res.status()} ${res.url()}`);
  }
});

fs.mkdirSync(OUT_DIR, { recursive: true });

let total = 0;
for (const template of templateRegistry) {
  assetFailures.length = 0;

  await page.setViewportSize({ width: BASE_WIDTH, height: 1400 });
  await page.goto(`${ORIGIN}/templates/${template.key}`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  // The kolam and the tradition figures draw over 2.1s on a 0.35s delay. A
  // figure caught half-drawn looks like a rendering bug rather than a design.
  await page.waitForTimeout(3200);

  const state = await assertStyled(page, template.key);
  if (assetFailures.length) {
    throw new Error(`${template.key}: assets failed to load\n  ${assetFailures.join("\n  ")}`);
  }

  // WIDEN THE FRAME RATHER THAN CROPPING IT.
  //
  // The heroes are not the same height. The couple's names land 277px down on
  // minimal-luxury and 854px down on kolam-blush, because the ornament designs
  // carry a monogram arch above the names and the destination designs do not.
  // A single 16:9 crop therefore cannot work: sized for the short designs it
  // cuts kolam-blush's names in half, and sized for the tall ones it leaves the
  // short designs mostly empty background.
  //
  // So the frame is derived per design instead. Take the height the
  // composition needs, then widen the VIEWPORT to whatever makes that height
  // 16:9. The layout is centred inside max-w-7xl, so a wider viewport adds
  // margin rather than reflowing the design, and the result is a complete
  // composition at a uniform aspect ratio — no crop, no letterbox, no squash.
  await page.evaluate(STRIP);
  let height = await page.evaluate(MEASURE);
  if (!height) throw new Error(`${template.key}: no hero section`);

  // Two passes: widening the viewport can reflow text to a shorter height, so
  // measure again at the new width and settle there.
  let width = BASE_WIDTH;
  for (let pass = 0; pass < 2; pass++) {
    width = Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, height * RATIO)));
    await page.setViewportSize({ width, height: Math.max(height, 400) });
    await page.waitForTimeout(400);
    const remeasured = await page.evaluate(MEASURE);
    if (remeasured) height = remeasured;
  }
  // The frame is the ratio; the measured height only chooses the scale.
  const frame = { width, height: Math.round(width / RATIO) };
  await page.setViewportSize(frame);
  // The ornament layer is `position: fixed`, so it re-lays-out against the
  // viewport on every resize. Give it a frame to settle.
  await page.waitForTimeout(700);

  const raw = await page.screenshot({ clip: { x: 0, y: 0, ...frame } });
  const out = `${OUT_DIR}/${template.key}.webp`;
  await sharp(raw)
    .resize({ width: OUT_WIDTH, height: Math.round(OUT_WIDTH / RATIO), fit: "fill" })
    .webp({ quality: 74 })
    .toFile(out);

  const kb = Math.round(fs.statSync(out).size / 1024);
  total += kb;
  console.log(
    `${template.key.padEnd(24)} ${String(kb).padStart(3)}KB  frame ${frame.width}x${frame.height}  --primary: ${state.primary}`,
  );
}

console.log(`\n${templateRegistry.length} previews, ${total}KB total`);
await browser.close();
