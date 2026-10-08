"use server";

import type { Route } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { verifyPassword } from "@/server/auth/password";
import { prisma } from "@/server/prisma";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { buildUnlockCookie } from "@/server/services/site-access";

export type UnlockState = { error?: string };

const unlockSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  // One field for both modes. A password and an invite code are both just "the
  // thing the couple gave you", and splitting them would leak which kind of
  // protection a site uses to anyone who looks at the form.
  secret: z.string().min(1, "Enter the password or invite code.").max(200),
});

// Deliberately identical for a wrong secret, an unset password, a missing site
// and a site that is not protected at all. Anything more specific tells an
// attacker which of those they are looking at.
const REJECTION = "That password or invite code didn't work.";

export async function unlockSiteAction(
  _prev: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const parsed = unlockSchema.safeParse({
    slug: formData.get("slug"),
    secret: formData.get("secret"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? REJECTION };
  }

  const slug = parsed.data.slug.toLowerCase();

  const site = await prisma.weddingSite.findUnique({
    where: { slug },
    select: {
      id: true,
      publishSettings: { select: { visibility: true, sitePasswordHash: true } },
    },
  });

  if (!site) return { error: REJECTION };

  // Rate limited per site, and FAIL CLOSED. Failing open is right for login,
  // where a database blip must not lock people out of their own account. It is
  // wrong here: an unbounded guess rate against a short household password is
  // exactly how this gate gets walked through, so if the limiter cannot be
  // consulted the answer is no.
  try {
    const rate = await consumeRateLimit({
      action: "site_unlock",
      source: await headers(),
      limit: 10,
      windowMs: 10 * 60 * 1000,
      keyParts: [site.id],
      onError: "closed",
    });
    if (!rate.ok) {
      return { error: "Too many attempts. Please wait a few minutes and try again." };
    }
  } catch {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const visibility = site.publishSettings?.visibility ?? "PUBLIC";
  let granted = false;

  if (visibility === "PASSWORD_PROTECTED") {
    const hash = site.publishSettings?.sitePasswordHash;
    // A protected site with no password set stays closed rather than opening to
    // everyone. That combination is a misconfiguration, and the safe reading of
    // a misconfigured privacy setting is the private one.
    granted = Boolean(hash) && (await verifyPassword(parsed.data.secret, hash!));
  } else if (visibility === "INVITE_ONLY") {
    // Scoped to this site. An InviteGroup.code is globally unique, so an
    // unscoped lookup would let a code from any other wedding on the platform
    // open this one.
    const invite = await prisma.inviteGroup.findFirst({
      where: { weddingSiteId: site.id, code: parsed.data.secret.trim() },
      select: { id: true },
    });
    granted = Boolean(invite);
  } else {
    // Not protected. Nothing to unlock, and saying so would confirm the site
    // exists and is public, so it gets the same answer as a wrong secret.
    return { error: REJECTION };
  }

  if (!granted) return { error: REJECTION };

  const cookie = await buildUnlockCookie(site.id);
  const store = await cookies();
  store.set(cookie.name, cookie.value, cookie.options);

  redirect(`/${slug}` as Route);
}
