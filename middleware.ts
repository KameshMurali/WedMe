import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { authCookieName } from "@/lib/constants";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Keep middleware tiny for the Edge runtime. We only gate on cookie presence here;
  // every dashboard page and server action still performs full session validation.
  const token = request.cookies.get(authCookieName)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
