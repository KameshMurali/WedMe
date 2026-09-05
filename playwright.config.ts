import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const BASE_URL = `http://127.0.0.1:${PORT}`;

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

  webServer: {
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
    },
  },
});
