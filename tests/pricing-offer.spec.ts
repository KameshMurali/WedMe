import { test, expect } from "@playwright/test";

import {
  applyLaunchOffer,
  buildOfferSchema,
  checkoutEnabled,
  findPlan,
  formatLaunchOfferEnd,
  isLaunchOfferActive,
  launchOffer,
  plans,
} from "../src/lib/pricing";

/**
 * Guards the launch-offer display logic.
 *
 * This exists because of a specific bug: applyLaunchOffer branched only on the
 * offer WINDOW, never on whether Paddle could actually apply the discount. With
 * checkout unconfigured, the Forever card rendered "$69", a struck-through
 * "$99" and "save 30%" directly beside a "Coming Soon" pill and copy saying
 * payments were not open. Nothing failed, nothing logged, and types and build
 * passed the whole time.
 *
 * The `chargeable` argument is injectable precisely so this can be tested:
 * paddleConfig reads NEXT_PUBLIC_* values that are inlined at build time and
 * cannot be varied from a test process.
 */

const forever = findPlan("forever");
const together = findPlan("together");

const DURING = new Date(launchOffer.endsAt.getTime() - 86_400_000);
const AFTER = new Date(launchOffer.endsAt.getTime() + 86_400_000);
const BASE = forever.prices.USD.amount; // 99
const DISCOUNTED = Math.round(BASE * 0.7); // 69

test("shows the discount only when the window is open AND it can be charged", () => {
  expect(applyLaunchOffer(BASE, forever, DURING, true)).toBe(DISCOUNTED);
});

test("shows full price when the discount cannot be charged", () => {
  // The bug. Window open, but no Paddle discount exists to honour it, so a
  // reduced number on the card would be a false claim about what is payable.
  expect(applyLaunchOffer(BASE, forever, DURING, false)).toBe(BASE);
});

test("shows full price once the window has closed, chargeable or not", () => {
  expect(applyLaunchOffer(BASE, forever, AFTER, true)).toBe(BASE);
  expect(applyLaunchOffer(BASE, forever, AFTER, false)).toBe(BASE);
});

test("leaves plans without a launch percentage alone", () => {
  const amount = together.prices.USD.amount;
  expect(together.launchOfferPct).toBeUndefined();
  expect(applyLaunchOffer(amount, together, DURING, true)).toBe(amount);
});

test("the offer window itself is still open, so these cases are live", () => {
  // If this fails the offer has lapsed and the cases above stopped being the
  // ones that actually run in production.
  expect(isLaunchOfferActive()).toBe(true);
});

test("the countdown date is derived, not hardcoded", () => {
  // Was the string "Ends 31 Jul" while launchOffer.endsAt said 31 December.
  const formatted = formatLaunchOfferEnd();
  const expected = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(launchOffer.endsAt);
  expect(formatted).toBe(expected);
  expect(formatted).not.toContain("Jul");
});

test("structured data matches the prices actually shown", () => {
  const offers = buildOfferSchema("USD");
  expect(offers).toHaveLength(plans.length);

  for (const [index, offer] of offers.entries()) {
    const plan = plans[index];
    const visible = applyLaunchOffer(plan.prices.USD.amount, plan);
    // The mismatch search engines penalise: a structured price that disagrees
    // with the one on the page. Both now run through the same function.
    expect(offer.price).toBe(String(visible));
    expect(offer.priceCurrency).toBe("USD");
  }
});

test("structured data does not claim InStock while checkout is closed", () => {
  const offers = buildOfferSchema("USD");
  const expected = checkoutEnabled
    ? "https://schema.org/InStock"
    : "https://schema.org/PreOrder";

  for (const offer of offers) {
    expect(offer.availability).toBe(expected);
  }
});
