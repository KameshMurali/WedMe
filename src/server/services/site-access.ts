import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { env } from "@/lib/env";
import { getSession } from "@/server/auth/session";
import { prisma } from "@/server/prisma";
import { demoSiteId, isDemoSiteSlug } from "@/server/services/demo-site";

/**
 * Whether a visitor may see a wedding site.
 *
 * Until this existed, `visibility` was decorative. `loadPublishedSiteSnapshot`
 * branched on `status` alone, so a PASSWORD_PROTECTED or INVITE_ONLY site
 * rendered in full to anyone who knew the slug, while `sitePasswordHash` was
 * written and never read by anything.
 */

const unlockKey = new TextEncoder().encode(env.AUTH_SECRET);

// A guest who types the password should not have to retype it every time they
// open the site to check a detail, but this is a shared household link, so it
// should not outlive the wedding planning either.
const UNLOCK_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// One cookie per site. The name carries the site id, and so does the signed
// payload, so a credential for one wedding can never open another. That is not
// a theoretical concern here: the invite-code lookup had exactly this bug,
// resolving one couple's code against another couple's site.
function unlockCookieName(siteId: string) {
  return `tnb-unlock-${siteId}`;
}

export async function createUnlockToken(siteId: string) {
  return new SignJWT({ siteId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${UNLOCK_MAX_AGE_SECONDS}s`)
    .sign(unlockKey);
}

export const unlockCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: UNLOCK_MAX_AGE_SECONDS,
} as const;

// Returned as data so a Route Handler can attach it to a NextResponse, which is
// the reliable way to carry a cookie on a redirect.
export async function buildUnlockCookie(siteId: string) {
  return {
    name: unlockCookieName(siteId),
    value: await createUnlockToken(siteId),
    options: unlockCookieOptions,
  };
}

async function hasValidUnlockCookie(siteId: string) {
  const store = await cookies();
  const token = store.get(unlockCookieName(siteId))?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify<{ siteId: string }>(token, unlockKey);
    // Belt and braces: the cookie name already scopes this, but a signed claim
    // that disagrees with the site being requested is never acceptable.
    return payload.siteId === siteId;
  } catch {
    return false;
  }
}

export type SiteAccess =
  | { ok: true; siteId: string }
  | { ok: false; siteId: string; reason: "password" | "invite" };

/**
 * Resolves access for one slug.
 *
 * `cache` so the layout, the page and generateMetadata share a single lookup
 * within a request rather than each hitting the database.
 *
 * Fails CLOSED on an unreadable record. If the visibility of a site cannot be
 * determined, serving it is the one outcome that cannot be walked back.
 */
export const getSiteAccess = cache(async (slug: string): Promise<SiteAccess | null> => {
  const normalized = slug.trim().toLowerCase();

  // The demo wedding is a public showcase that renders from a static snapshot
  // and deliberately works with no database at all. Gating it would both
  // contradict its purpose and, because the lookup below fails closed, lock it
  // out entirely whenever Postgres is unreachable.
  if (isDemoSiteSlug(normalized)) {
    return { ok: true, siteId: demoSiteId };
  }

  let site: {
    id: string;
    couple: { primaryUserId: string | null } | null;
    publishSettings: { visibility: string } | null;
  } | null;

  try {
    site = await prisma.weddingSite.findUnique({
      where: { slug: normalized },
      select: {
        id: true,
        couple: { select: { primaryUserId: true } },
        publishSettings: { select: { visibility: true } },
      },
    });
  } catch (error) {
    console.error("getSiteAccess lookup failed; refusing access", { slug: normalized, error });
    return { ok: false, siteId: "", reason: "password" };
  }

  // No such site. The caller's existing notFound() handling deals with this;
  // returning null keeps that decision where it already lives.
  if (!site) return null;

  const visibility = site.publishSettings?.visibility ?? "PUBLIC";
  if (visibility === "PUBLIC") {
    return { ok: true, siteId: site.id };
  }

  // The couple must never be locked out of their own site, including the
  // owner-preview path for an unpublished draft.
  const session = await getSession();
  if (session?.userId && site.couple?.primaryUserId === session.userId) {
    return { ok: true, siteId: site.id };
  }

  if (await hasValidUnlockCookie(site.id)) {
    return { ok: true, siteId: site.id };
  }

  return {
    ok: false,
    siteId: site.id,
    reason: visibility === "INVITE_ONLY" ? "invite" : "password",
  };
});
