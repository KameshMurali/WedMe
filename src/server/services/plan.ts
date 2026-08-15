import "server-only";

import { planLimits, plans, type PlanKey } from "@/lib/pricing";
import { isAdminUser } from "@/server/auth/session";
import { prisma } from "@/server/prisma";
import { isDemoSiteId } from "@/server/services/demo-site";

// Matches whatever shape isAdminUser accepts ({ role, email }) so the paid-tier
// override always agrees with the rest of the app's admin definition.
export type PlanUser = Parameters<typeof isAdminUser>[0];

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
// Entitlements enter the system either from the Paddle webhook
// (src/app/api/webhooks/paddle/route.ts) or `npm run grant-plan`. Both only
// write Couple.planKey/planExpiresAt — every quota check routes through this
// function, so enforcement updates everywhere at once.
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
// Admins get Forever-tier access automatically so the owner can test paid
// features end-to-end without running grant-plan. Uses isAdminUser (DB role
// ADMIN *or* the ADMIN_EMAILS allowlist) — the same definition that gates the
// admin pages — so an admin granted via `npm run make-admin` isn't silently
// left on the free tier. Regular users fall through to the stored plan.
// Demo-workspace read-only guards run BEFORE any plan logic in the actions,
// so this never unlocks writes there.
export async function getEffectivePlanForUser(
  user: PlanUser,
  siteId: string,
): Promise<PlanKey> {
  if (isAdminUser(user)) {
    return "forever";
  }
  return getWorkspacePlanForSite(siteId);
}

// Same admin override as getEffectivePlanForUser, but keyed on the user rather
// than a site id — for dashboard server components that need plan-derived UI
// caps in parallel with (not after) their site query.
export async function getEffectivePlanForUserId(
  user: PlanUser & { id: string },
): Promise<PlanKey> {
  if (isAdminUser(user)) {
    return "forever";
  }

  try {
    const couple = await prisma.couple.findUnique({
      where: { primaryUserId: user.id },
      select: { planKey: true, planExpiresAt: true },
    });
    return resolvePlanKey(couple?.planKey, couple?.planExpiresAt);
  } catch (error) {
    console.error("getEffectivePlanForUserId failed; defaulting to hello", error);
    return "hello";
  }
}

// Same resolution as getEffectivePlanForUserId, but also returns the expiry so
// the dashboard can show "through <date>" for Together without a second query.
// expiresAt is null for anything that doesn't expire (hello, forever, admins).
export async function getPlanSummaryForUserId(
  user: PlanUser & { id: string },
): Promise<{ planKey: PlanKey; expiresAt: Date | null }> {
  if (isAdminUser(user)) {
    return { planKey: "forever", expiresAt: null };
  }

  try {
    const couple = await prisma.couple.findUnique({
      where: { primaryUserId: user.id },
      select: { planKey: true, planExpiresAt: true },
    });
    const planKey = resolvePlanKey(couple?.planKey, couple?.planExpiresAt);
    // Only surface an expiry that's still in force — resolvePlanKey has already
    // demoted an expired plan to "hello", and showing a past date there would
    // read as though the workspace still had something.
    return {
      planKey,
      expiresAt: planKey === "hello" ? null : (couple?.planExpiresAt ?? null),
    };
  } catch (error) {
    console.error("getPlanSummaryForUserId failed; defaulting to hello", error);
    return { planKey: "hello", expiresAt: null };
  }
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
