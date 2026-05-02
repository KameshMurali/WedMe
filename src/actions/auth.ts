"use server";

import type { Prisma, UserRole } from "@prisma/client";
import type { Route } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { initialActionState, type ActionState } from "@/lib/action-state";
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
import { clearSessionCookie, setSessionCookie } from "@/server/auth/session";
import { generatePlainToken, hashToken } from "@/server/auth/tokens";
import { prisma } from "@/server/prisma";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { demoSessionUser, matchesDemoCredentials } from "@/server/services/demo-site";
import { sendEmail } from "@/server/services/email";
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
          locationSummary: "Dubai, United Arab Emirates",
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
    await sendEmail({
      to: email,
      subject: `Welcome to ${brandName}`,
      text: `Your ToNewBeginning.com workspace is ready. Verify your email by visiting ${process.env.APP_URL ?? "http://localhost:3000"}/verify-email/${verificationToken}`,
      html: `<p>Your ToNewBeginning.com workspace is ready.</p><p><a href="${process.env.APP_URL ?? "http://localhost:3000"}/verify-email/${verificationToken}">Verify your email</a></p>`,
    });
  } catch (error) {
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

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (user) {
    const plainToken = generatePlainToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(plainToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    await sendEmail({
      to: user.email,
      subject: "Reset your ToNewBeginning.com password",
      text: `Reset your password: ${process.env.APP_URL ?? "http://localhost:3000"}/reset-password/${plainToken}`,
      html: `<p><a href="${process.env.APP_URL ?? "http://localhost:3000"}/reset-password/${plainToken}">Reset your password</a></p>`,
    });
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

  await ensureWeddingSiteForUser(tokenRecord.user.id);

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
