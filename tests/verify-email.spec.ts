import { test, expect } from "@playwright/test";

/**
 * Guards the email verification link.
 *
 * /verify-email/[token] used to be a Server Component page that called
 * setSessionCookie() during render. Next.js forbids writing cookies from a
 * render, so every click on a verification email threw
 *
 *   Error: Cookies can only be modified in a Server Action or Route Handler.
 *
 * and showed the generic "Something went wrong" screen. It is the first link a
 * new couple ever clicks, immediately after creating their account.
 *
 * These tests run without a database, which is the point: the token lookup
 * fails, and the route must still land the visitor on a sensible page rather
 * than an error. The success path (valid token, cookie set, redirect to the
 * dashboard) needs a real database and is not covered here.
 */

// 64 hex characters, the shape hashToken produces.
const TOKEN = "26c72057efe09d1cb71c035fe9e22b6c54e843e8ea779e9c118fb88b1cc9aabb";

test("a verification link never shows an error page", async ({ page }) => {
  const response = await page.goto(`/verify-email/${TOKEN}`);

  expect(response?.status(), "must not be a server error").toBeLessThan(500);
  await expect(page).toHaveURL(/\/verify-email\/expired$/);

  const body = await page.locator("body").innerText();
  expect(body).not.toContain("Something went wrong");
  expect(body).toContain("Verification link expired");
});

test("the expired page offers a way onward", async ({ page }) => {
  await page.goto("/verify-email/expired");
  // A dead end here means a couple who cannot get into the account they just
  // created, so both escape routes matter.
  await expect(page.getByRole("link", { name: /go to login/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /back to home/i })).toBeVisible();
});
