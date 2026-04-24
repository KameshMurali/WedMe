import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifySessionToken } from "@/server/auth/session";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("wedme_session")?.value;
  const session = token ? await verifySessionToken(token).catch(() => null) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
