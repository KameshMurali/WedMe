import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client/default";

import { env } from "@/lib/env";
import { plans, type PlanKey } from "@/lib/pricing";

// Grants (or revokes) a paid plan for a couple by account email. Until
// checkout ships this is the ONLY way entitlements enter the system — used for
// founding couples, comps, concierge customers, and QA of every plan gate.
//
//   npm run grant-plan -- user@example.com forever
//   npm run grant-plan -- user@example.com together
//   npm run grant-plan -- user@example.com hello      (revoke back to free)

const email = process.argv[2];
const requestedPlan = process.argv[3];

const validPlanKeys = plans.map((plan) => plan.key);

function isPlanKey(value: string | undefined): value is PlanKey {
  return Boolean(value) && validPlanKeys.includes(value as PlanKey);
}

if (!email || !isPlanKey(requestedPlan)) {
  console.error(`Usage: npm run grant-plan -- <email> <${validPlanKeys.join("|")}>`);
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

// Together is priced for the wedding year: 12 months of full access plus a
// 6-month post-wedding archive window. Forever and hello never expire.
function expiryFor(planKey: PlanKey, activatedAt: Date): Date | null {
  if (planKey !== "together") return null;
  const expires = new Date(activatedAt);
  expires.setMonth(expires.getMonth() + 18);
  return expires;
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, couple: { select: { id: true, planKey: true } } },
  });

  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  if (!user.couple) {
    console.error(
      `User ${email} has no couple workspace yet — have them log in once so the workspace bootstraps, then re-run.`,
    );
    process.exit(1);
  }

  const activatedAt = new Date();
  const planExpiresAt = expiryFor(requestedPlan, activatedAt);

  await prisma.couple.update({
    where: { id: user.couple.id },
    data: {
      planKey: requestedPlan,
      planActivatedAt: requestedPlan === "hello" ? null : activatedAt,
      planExpiresAt,
      planSource: requestedPlan === "hello" ? null : "admin_grant",
    },
  });

  console.log(
    `✓ ${email}: ${user.couple.planKey} → ${requestedPlan}` +
      (planExpiresAt ? ` (expires ${planExpiresAt.toISOString()})` : ""),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
