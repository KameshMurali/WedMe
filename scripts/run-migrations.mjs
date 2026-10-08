#!/usr/bin/env node
/**
 * Apply pending migrations, but only where a real database is expected.
 *
 * This replaces a bare `prisma migrate deploy` at the front of the build
 * script. That command made EVERY build depend on a reachable database, and on
 * Vercel only production has one: DATABASE_URL and DIRECT_URL are scoped to the
 * production environment, so on a preview build both are undefined,
 * prisma.config.ts falls through to its localhost placeholder, and the build
 * died on the first command:
 *
 *   Error: P1001: Can't reach database server at `localhost:5432`
 *
 * Six consecutive preview deployments failed that way before anyone read the
 * log closely enough to notice it was the migration step and not the app.
 *
 * WHY THE CONDITION IS INVERTED
 *
 * The test is `target && target !== "production"` — skip only when Vercel
 * explicitly tells us this is some OTHER environment. It is deliberately not
 * `target === "production"`, which looks equivalent and is not.
 *
 * VERCEL_ENV is absent in two cases: a local build, and `vercel --prebuilt`,
 * where Vercel does not expose system environment variables at all. Written the
 * other way, both of those would silently skip migrations. On a local build
 * that is merely surprising; on a production deploy it means the schema
 * silently drifts from the code that expects it, and the failure surfaces later
 * as runtime errors against a table or column that was never created.
 *
 * A build that fails is recoverable in two minutes. A production database that
 * quietly missed a migration is not. So an unrecognised environment takes the
 * loud path: it migrates, and if it cannot, it fails the build.
 *
 * For the same reason there is no `|| true` anywhere here. A migration that
 * genuinely fails on production must still stop the deploy, exactly as before.
 */

import { spawnSync } from "node:child_process";

const target = process.env.VERCEL_ENV;

if (target && target !== "production") {
  // Say so out loud. A skip that prints nothing is indistinguishable in the
  // build log from migrations that ran and found nothing to do.
  console.log(
    `[migrations] Skipped: VERCEL_ENV is "${target}", not "production".\n` +
      `[migrations] Only production deploys carry a reachable DATABASE_URL, so a\n` +
      `[migrations] preview build has no database to migrate. The app still builds —\n` +
      `[migrations] src/lib/env.ts only needs DATABASE_URL to be PRESENT and parse,\n` +
      `[migrations] not to be reachable.`,
  );
  process.exit(0);
}

console.log(
  target
    ? `[migrations] VERCEL_ENV is "production" — applying pending migrations.`
    : `[migrations] No VERCEL_ENV set (local build, or a prebuilt deploy where\n` +
        `[migrations] Vercel does not expose system variables). Migrating rather than\n` +
        `[migrations] skipping, because skipping on an unknown environment is the one\n` +
        `[migrations] outcome that cannot be walked back.`,
);

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  console.error(`[migrations] Could not run prisma: ${result.error.message}`);
  process.exit(1);
}

// Propagate the real exit code so a failed migration still fails the build.
// A process killed by a signal reports status null; treat that as failure too.
process.exit(result.status ?? 1);
