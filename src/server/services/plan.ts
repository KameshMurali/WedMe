import "server-only";

import { planLimits, plans, type PlanKey } from "@/lib/pricing";
import { isAdminEmail } from "@/server/auth/session";
import { prisma } from "@/server/prisma";
import { isDemoSiteId } from "@/server/services/demo-site";

const knownPlanKeys = new Set<PlanKey>(plans.map((plan) => plan.key));

// Pure resolver shared by every plan lookup: validates the stored key and
// applies expiry. Fail-closed to the free tier — an unknown or expired plan
// always resolves to "hello".
export function resolvePlanKey(
  storedKey: string | null | undefined,
  expiresAt: Date | null | undefined,
  now: Date = new Date(),
): PlanKey {
  if (!storedKey || !knownPlanKeys.has(storedKey as PlanKey)) {
    return "hello";
  }
  if (expiresAt && expiresAt.getTime() < now.getTime()) {
    return "hello";
  }
  return storedKey as PlanKey;
}

// Resolves the active plan for a workspace from the persisted Couple record.
//
// Checkout isn't wired yet (checkoutEnabled === false), so entitlements only
// enter the system via `npm run grant-plan` — but every quota check routes
// through this function, so a future payment webhook only has to write
// Couple.planKey/planExpiresAt and enforcement updates everywhere at once.
export async function getWorkspacePlanForSite(siteId: string): Promise<PlanKey> {
  // Demo workspace short-circuits BEFORE any DB access.
  if (isDemoSiteId(siteId)) {
    return "hello";
  }

  try {
    const site = await prisma.weddingSite.findUnique({
      where: { id: siteId },
      select: {
        couple: {
          select: {
            planKey: true,
            planExpiresAt: true,
          },
        },
      },
    });

    return resolvePlanKey(site?.couple?.planKey, site?.couple?.planExpiresAt);
  } catch (error) {
    console.error("getWorkspacePlanForSite failed; defaulting to hello", error);
    return "hello";
  }
}

// User-aware resolver for gates where the requireUser() result is in scope.
// Admin accounts (ADMIN_EMAILS) get Forever-tier access automatically so the
// owner can test paid features end-to-end without running grant-plan. Regular
// users fall through to the stored plan. Demo-workspace read-only guards run
// BEFORE any plan logic in the actions, so this never unlocks writes there.
export async function getEffectivePlanForUser(
  userEmail: string,
  siteId: string,
): Promise<PlanKey> {
  if (isAdminEmail(userEmail)) {
    return "forever";
  }
  return getWorkspacePlanForSite(siteId);
}

export function getPlanLimits(plan: PlanKey) {
  return planLimits[plan];
}

// Grandfathered event cap: sites that already exceed the plan limit keep what
// they have (can edit/reduce, but not add beyond their current count). New
// sites are held to the plan limit. Returns null for unlimited plans.
export function effectiveEventCap(plan: PlanKey, currentCount: number): number | null {
  const max = planLimits[plan].maxEvents;
  if (max === null) return null;
  return Math.max(max, currentCount);
}
