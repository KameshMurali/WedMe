import { NextResponse, type NextRequest } from "next/server";

import { buildSessionCookie } from "@/server/auth/session";
import { hashToken } from "@/server/auth/tokens";
import { prisma } from "@/server/prisma";

/**
 * Email verification link target.
 *
 * This was a Server Component page that called setSessionCookie() during
 * render. Next.js forbids writing cookies from a render, so every single click
 * on a verification email threw:
 *
 *   Error: Cookies can only be modified in a Server Action or Route Handler.
 *
 * and the couple got the generic "Something went wrong" screen straight after
 * creating their account. A Route Handler is allowed to set cookies, so the
 * whole flow lives here now and the "link no longer valid" UI moved to
 * /verify-email/expired.
 *
 * The cookie is attached to the NextResponse rather than written through
 * next/headers, which is the reliable way to carry a cookie on a redirect.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  // Anything that is not a clean, unused, unexpired token ends up here. A
  // verification link is one of the first things a new couple ever clicks, so
  // it must not be able to produce a stack trace.
  const invalid = NextResponse.redirect(new URL("/verify-email/expired", request.url));

  let verificationToken;
  try {
    verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
  } catch (error) {
    console.error("verify-email: token lookup failed", error);
    return invalid;
  }

  if (
    !verificationToken ||
    verificationToken.usedAt ||
    verificationToken.expiresAt <= new Date()
  ) {
    return invalid;
  }

  try {
    await prisma.$transaction([
      prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);
  } catch (error) {
    console.error("verify-email: marking verified failed", error);
    return invalid;
  }

  // Sign them in and send them straight to the dashboard, which is the whole
  // point of clicking the link.
  const cookie = await buildSessionCookie({
    userId: verificationToken.user.id,
    email: verificationToken.user.email,
    role: verificationToken.user.role,
  });

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
