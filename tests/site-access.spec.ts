import { test, expect } from "@playwright/test";

/**
 * Guards the password / invite-code gate.
 *
 * Before this existed, `visibility` was decorative: `sitePasswordHash` was
 * written with bcrypt and never read by anything, and all eleven public routes
 * served a PASSWORD_PROTECTED site in full to any anonymous visitor.
 *
 * These tests run with no database, which is the whole point. `getSiteAccess`
 * fails CLOSED when it cannot read a site's visibility, so every route for a
 * real slug must land on the unlock page rather than render. That single
 * property is what proves the gate sits above all eleven routes instead of
 * being repeated in ten of them.
 *
 * NOT covered here, because it needs Postgres: that a correct password or
 * invite code actually opens a site, that a PUBLIC site is untouched, and that
 * a cookie minted for one site cannot open another.
 */

const SLUG = "some-private-wedding";

// Every public route under [slug]. If someone adds a twelfth, this list should
// grow with it.
const ROUTES = [
  "",
  "/story",
  "/events",
  "/schedule",
  "/rsvp",
  "/gallery",
  "/experience",
  "/registry",
  "/memories",
  "/wishes",
];

for (const route of ROUTES) {
  test(`${route || "/"} cannot be read without access`, async ({ page }) => {
    await page.goto(`/${SLUG}${route}`);
    await expect(page).toHaveURL(new RegExp(`/unlock/${SLUG}$`));
  });
}

test("the unlock page asks for a secret and names nobody", async ({ page }) => {
  await page.goto(`/unlock/${SLUG}`);

  await expect(page.locator('input[name="secret"]')).toBeVisible();
  await expect(page.getByRole("button", { name: /view the wedding/i })).toBeVisible();

  // A locked site must not tell a stranger whose wedding it is. The slug is
  // unavoidable since it is in the URL they typed, but nothing else should
  // appear: no couple names, no date, no venue.
  const body = await page.locator("body").innerText();
  expect(body).not.toContain("Kamesh");
  expect(body).not.toContain("Monisha");
});

test("the gate is not indexable", async ({ page }) => {
  const response = await page.goto(`/unlock/${SLUG}`);
  expect(response?.status()).toBeLessThan(400);
  const robots = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(robots).toContain("noindex");
});

test("the public demo site is never gated", async ({ page }) => {
  // It renders from a static snapshot and is meant to work with no database at
  // all. Since the lookup fails closed, without an explicit exemption a
  // Postgres blip would take the showcase offline.
  await page.goto("/kammonbeginnings");
  await expect(page).not.toHaveURL(/\/unlock\//);
});
