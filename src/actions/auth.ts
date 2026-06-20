"use server";

import type { Prisma, UserRole } from "@prisma/client";
import type { Route } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { initialActionState, type ActionState } from "@/lib/action-state";
import { env } from "@/lib/env";
import {
  reservedSlugs,
  resolveWorkspaceResumePath,
  sectionLabels,
  sectionOrder,
  workspaceResumeCookieName,
} from "@/lib/constants";
import { findTemplateByKey } from "@/lib/template-registry";
import {
  forgotPasswordSchema,
  loginSchema,
  mapRegisterValidationErrors,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { clearSessionCookie, getSession, setSessionCookie } from "@/server/auth/session";
import { generatePlainToken, hashToken } from "@/server/auth/tokens";
import { prisma } from "@/server/prisma";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { demoSessionUser, matchesDemoCredentials } from "@/server/services/demo-site";
import { sendEmail } from "@/server/services/email";
import { buildWelcomeEmail } from "@/server/services/email-templates";
import { ensureTemplatePresetByKey } from "@/server/services/template-presets";

async function redirectToWorkspace(): Promise<never> {
  const cookieStore = await cookies();
  const resumePath = cookieStore.get(workspaceResumeCookieName)?.value;
  const safeResumePath = resolveWorkspaceResumePath(resumePath) as Route;
  redirect(safeResumePath);
}

function mapRegisterPersistenceError(error: unknown): ActionState {
  if (
    error instanceof Error &&
    "code" in error &&
    error.code === "P2002" &&
    "meta" in error &&
    error.meta &&
    typeof error.meta === "object" &&
    "target" in error.meta &&
    Array.isArray(error.meta.target)
  ) {
    const targets = error.meta.target.map(String);

    if (targets.includes("email")) {
      return {
        error: "An account with this email already exists.",
        fieldErrors: {
          email: "An account with this email already exists.",
        },
      };
    }

    if (targets.includes("slug")) {
      return {
        error: "That wedding URL is already taken.",
        fieldErrors: {
          slug: "That wedding URL is already taken.",
        },
      };
    }
  }

  return {
    error: "We couldn’t create the workspace right now. Please try again in a moment.",
  };
}

export async function registerAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const fieldErrors = mapRegisterValidationErrors(parsed.error.issues);

    return {
      error: parsed.error.issues[0]?.message ?? "Please check the registration form.",
      fieldErrors,
    };
  }

  const { email, partnerOneName, partnerTwoName, brandName, slug, weddingDate, password } = parsed.data;

  if (reservedSlugs.includes(slug)) {
    return {
      error: "Please choose a different wedding URL slug.",
      fieldErrors: {
        slug: "Please choose a different wedding URL slug.",
      },
    };
  }

  try {
    const [existingUser, existingSlug] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.weddingSite.findUnique({ where: { slug } }),
    ]);

    if (existingUser) {
      return {
        error: "An account with this email already exists.",
        fieldErrors: {
          email: "An account with this email already exists.",
        },
      };
    }

    if (existingSlug) {
      return {
        error: "That wedding URL is already taken.",
        fieldErrors: {
          slug: "That wedding URL is already taken.",
        },
      };
    }
  } catch (error) {
    console.error("registerAction preflight failed", error);
    return {
      error: "We couldn’t validate this workspace right now. Please try again in a moment.",
    };
  }

  const template = findTemplateByKey("classic-elegant");
  let passwordHash: string;
  let verificationToken: string;

  try {
    passwordHash = await hashPassword(password);
    verificationToken = generatePlainToken();
  } catch (error) {
    console.error("registerAction setup failed", error);
    return {
      error: "We couldn’t prepare this workspace right now. Please try again in a moment.",
    };
  }

  let created: { user: { id: string; email: string; role: UserRole } };

  try {
    created = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const user = await transaction.user.create({
        data: {
          email,
          passwordHash,
        },
      });

      const couple = await transaction.couple.create({
        data: {
          primaryUserId: user.id,
          partnerOneName,
          partnerTwoName,
          brandName,
          weddingDate: new Date(weddingDate),
        },
      });

      const templatePreset = await ensureTemplatePresetByKey(template.key, transaction);

      await transaction.weddingSite.create({
        data: {
          coupleId: couple.id,
          templatePresetId: templatePreset.id,
          slug,
          brandName,
          headline: `${partnerOneName} & ${partnerTwoName} are getting married`,
          subtitle: "A joyful celebration filled with family, rituals, music, and beautiful memories.",
          tagline: "Welcome to our wedding website",
          weddingDate: new Date(weddingDate),
          theme: {
            create: template.themeDefaults,
          },
          publishSettings: {
            create: {
              status: "DRAFT",
              visibility: "PUBLIC",
              isRsvpOpen: true,
              isUploadsOpen: true,
              isMessagesOpen: true,
              lastDraftSavedAt: new Date(),
            },
          },
          sectionConfigs: {
            create: sectionOrder.map((type, index) => ({
              type,
              label: sectionLabels[type],
              position: index,
              enabled: true,
            })),
          },
        },
      });

      await transaction.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(verificationToken),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      });

      return { user };
    });
  } catch (error) {
    console.error("registerAction failed", error);
    return mapRegisterPersistenceError(error);
  }

  try {
    const appUrl = env.APP_URL;
    const welcome = buildWelcomeEmail({
      brandName,
      partnerOneName,
      partnerTwoName,
      slug,
      weddingDate: new Date(weddingDate),
      verificationUrl: `${appUrl}/verify-email/${verificationToken}`,
      appUrl,
    });

    await sendEmail({
      to: email,
      subject: welcome.subject,
      text: welcome.text,
      html: welcome.html,
    });
  } catch (error) {
    // Welcome email is best-effort: registration must succeed even if delivery fails.
    console.error("registerAction email send failed", error);
  }

  try {
    await setSessionCookie({
      userId: created.user.id,
      email: created.user.email,
      role: created.user.role,
    });
  } catch (error) {
    console.error("registerAction session setup failed", error);
    return {
      error: "Your workspace was created, but we couldn’t start your session. Please log in to continue.",
    };
  }

  redirect("/dashboard");
}

export async function loginAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please enter a valid email and password." };
  }

  let user:
    | {
        id: string;
        email: string;
        role: UserRole;
        passwordHash: string;
      }
    | null
    | undefined;

  try {
    const loginHeaders = await headers();
    const rateLimit = await consumeRateLimit({
      action: "login",
      source: loginHeaders,
      limit: 5,
      windowMs: 10 * 60 * 1000,
      keyParts: [parsed.data.email],
    });

    if (!rateLimit.ok) {
      return {
        error: `Too many login attempts. Please wait ${rateLimit.retryAfterSeconds} seconds and try again.`,
      };
    }

    user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
  } catch (error) {
    console.error("loginAction pre-auth failed", error);

    if (matchesDemoCredentials(parsed.data.email, parsed.data.password)) {
      await setSessionCookie(demoSessionUser);
      await redirectToWorkspace();
      return initialActionState;
    }

    return {
      error: "We couldn’t complete sign-in right now. Please try again in a moment.",
    };
  }

  if (!user) {
    if (matchesDemoCredentials(parsed.data.email, parsed.data.password)) {
      await setSessionCookie(demoSessionUser);
      await redirectToWorkspace();
      return initialActionState;
    }

    return { error: "We couldn’t find an account with that email." };
  }

  let isValid = false;

  try {
    isValid = await verifyPassword(parsed.data.password, user.passwordHash);
  } catch (error) {
    console.error("loginAction password verification failed", error);

    if (matchesDemoCredentials(parsed.data.email, parsed.data.password)) {
      await setSessionCookie(demoSessionUser);
      await redirectToWorkspace();
      return initialActionState;
    }

    return {
      error: "We couldn’t complete sign-in right now. Please try again in a moment.",
    };
  }

  if (!isValid) {
    return { error: "Incorrect password. Please try again." };
  }

  try {
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("loginAction session setup failed", error);
    return {
      error: "We couldn’t start your session right now. Please try again in a moment.",
    };
  }

  await redirectToWorkspace();
  return initialActionState;
}

export async function requestPasswordResetAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please enter a valid email address." };
  }

  try {
    const resetHeaders = await headers();
    const rateLimit = await consumeRateLimit({
      action: "password-reset",
      source: resetHeaders,
      limit: 3,
      windowMs: 15 * 60 * 1000,
      keyParts: [parsed.data.email],
    });

    if (!rateLimit.ok) {
      return {
        error: `Too many requests. Please wait ${rateLimit.retryAfterSeconds} seconds and try again.`,
      };
    }
  } catch (error) {
    console.error("requestPasswordResetAction rate-limit check failed", error);
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (user) {
    try {
      const plainToken = generatePlainToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(plainToken),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
      });

      const resetUrl = `${env.APP_URL}/reset-password/${plainToken}`;
      await sendEmail({
        to: user.email,
        subject: "Reset your ToNewBeginning.com password",
        text: `Reset your ToNewBeginning.com password using this link (valid for 1 hour): ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
        html: `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#2b1a18;line-height:1.6;">
            <h1 style="font-size:22px;margin:0 0 12px;">Reset your password</h1>
            <p style="font-size:15px;color:#6b554f;">Click the button below to choose a new password. This link is valid for 1 hour.</p>
            <p style="margin:20px 0;">
              <a href="${resetUrl}" style="display:inline-block;background:#7a4b3a;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:999px;">Reset password</a>
            </p>
            <p style="font-size:13px;color:#9a7a6a;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("requestPasswordResetAction failed", error);
    }
  }

  return {
    success: "If an account exists for that email, a password reset link has been prepared.",
  };
}

export async function resetPasswordAction(
  _previousState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please review the new password details." };
  }

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash: hashToken(parsed.data.token),
    },
    include: {
      user: true,
    },
  });

  if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt < new Date()) {
    return { error: "This reset link is no longer valid." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await setSessionCookie({
    userId: tokenRecord.user.id,
    email: tokenRecord.user.email,
    role: tokenRecord.user.role,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

// Re-issues the session cookie (same payload, fresh expiry) so the user
// can extend their session from the idle-timeout dialog without re-login.
export async function extendSessionAction(): Promise<
  { ok: true } | { ok: false; reason: "expired" | "error" }
> {
  try {
    const session = await getSession();
    if (!session) return { ok: false, reason: "expired" };
    await setSessionCookie({
      userId: session.userId,
      email: session.email,
      role: session.role,
    });
    return { ok: true };
  } catch (error) {
    console.error("extendSessionAction failed", error);
    return { ok: false, reason: "error" };
  }
}
