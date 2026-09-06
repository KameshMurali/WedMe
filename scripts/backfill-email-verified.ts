import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client/default";

import { env } from "@/lib/env";

/**
 * Stamps every existing user as email-verified.
 *
 * This exists to be run ONCE, before REQUIRE_EMAIL_VERIFICATION is ever turned
 * on. Verification has never been enforced, so no existing couple has had any
 * reason to click the link in their welcome email — flipping the flag without
 * running this first would lock every one of them out of their own wedding
 * site, including sites that are already published and shared with guests.
 *
 * It only ever fills in a NULL, so it is safe to run twice and it never
 * overwrites a real verification timestamp with today's date.
 *
 * Usage:
 *   npm run backfill-verified            # report what would change
 *   npm run backfill-verified -- --apply # actually write
 */

const apply = process.argv.includes("--apply");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

async function main() {
  const [total, unverified] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { emailVerifiedAt: null } }),
  ]);

  console.log(`Users total:      ${total}`);
  console.log(`Unverified:       ${unverified}`);

  if (unverified === 0) {
    console.log("\nNothing to do - every user already has emailVerifiedAt set.");
    return;
  }

  if (!apply) {
    // Dry run by default. A script whose whole job is to prevent a lockout
    // should not be able to write on a mistyped command.
    console.log(
      `\nDRY RUN. ${unverified} user(s) would be stamped as verified.` +
        `\nRe-run with --apply to write:\n  npm run backfill-verified -- --apply`,
    );
    return;
  }

  const result = await prisma.user.updateMany({
    where: { emailVerifiedAt: null },
    data: { emailVerifiedAt: new Date() },
  });

  console.log(`\n✓ Stamped ${result.count} user(s) as email-verified.`);
  console.log("It is now safe to set REQUIRE_EMAIL_VERIFICATION=true and redeploy.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
