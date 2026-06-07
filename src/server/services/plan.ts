import "server-only";

import { planLimits, type PlanKey } from "@/lib/pricing";

// Resolves the active plan for a workspace.
//
// Billing isn't wired yet (checkoutEnabled === false), so every workspace is
// on the free Hello plan. When Stripe lands, read the persisted plan from the
// WeddingSite/subscription record here — every quota check already routes
// through this function, so enforcement updates in one place.
export function getWorkspacePlanKey(_siteId?: string): PlanKey {
  return "hello";
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
