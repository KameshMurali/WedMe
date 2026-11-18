import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Set when a server is ALREADY running and Playwright must not start one.
// tests/reveal-contract.spec.ts has to measure a production build (`next dev`
// serves a CSP without unsafe-eval, so React never hydrates and the reveals
// read as permanently hidden), and the `webServer` block below can only start
// `next dev`. Without this the config would try to start dev on the port the
// production server already holds.
const EXTERNAL_SERVER = Boolean(process.env.PLAYWRIGHT_EXTERNAL_SERVER);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: EXTERNAL_SERVER ? undefined : {
    // `next dev`, NOT `npm run build && next start`: the build script begins
    // with `prisma migrate deploy`, which needs a live database. Dev does not.
    //
    // No database is required for these tests at all. The demo slug falls back
    // to a static snapshot, and every other public route still renders with
    // Prisma unreachable (it logs and degrades). The dummy DATABASE_URL and
    // AUTH_SECRET below exist only to satisfy the Zod parse in src/lib/env.ts,
    // which would otherwise refuse to start.
    command: `npx next dev -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://u:p@127.0.0.1:5432/none",
      DIRECT_URL: process.env.DIRECT_URL ?? "postgresql://u:p@127.0.0.1:5432/none",
      AUTH_SECRET: process.env.AUTH_SECRET ?? "playwright-layout-test-secret",
      APP_URL: BASE_URL,
      // Opens /dev/template-gallery/[key], which 404s by default. The gallery
      // is how every template gets checked rather than just the demo site's.
      TEMPLATE_GALLERY: "1",
    },
  },
});
