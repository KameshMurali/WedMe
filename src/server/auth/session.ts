import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { authCookieName } from "@/lib/constants";
import { env } from "@/lib/env";
import { prisma } from "@/server/prisma";

const sessionKey = new TextEncoder().encode(env.AUTH_SECRET);
const sessionMaxAge = 60 * 60 * 24 * 14;

export type SessionPayload = {
  userId: string;
  email: string;
  role: string;
};

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionMaxAge}s`)
    .sign(sessionKey);
}

export async function verifySessionToken(token: string) {
  const verified = await jwtVerify<SessionPayload>(token, sessionKey);
  return verified.payload;
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(authCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAge,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(authCookieName);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      couple: {
        include: {
          weddingSite: {
            include: {
              publishSettings: true,
            },
          },
        },
      },
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}
