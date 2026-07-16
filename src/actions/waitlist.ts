"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { plans, type CurrencyCode, type PlanKey } from "@/lib/pricing";
import { prisma } from "@/server/prisma";
import { consumeRateLimit } from "@/server/security/rate-limit";
import { sendEmail } from "@/server/services/email";

const waitlistSchema = z.object({
  email: z.string().trim().min(1, "Please enter your email.").email("Enter a valid email address."),
  planKey: z.enum(["hello", "together", "forever"]),
  currency: z.enum(["INR", "USD", "GBP", "EUR", "AED"]),
  source: z.string().max(120).optional(),
});

export type WaitlistState = { error?: string; success?: string };

export async function joinWaitlistAction(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const parsed = waitlistSchema.safeParse({
    email: formData.get("email"),
    planKey: formData.get("planKey"),
    currency: formData.get("currency"),
    source: formData.get("source") || undefined,
  });

  // Rate-limit by email + IP so the form can't be hammered.
  try {
    const rate = await consumeRateLimit({
      action: "waitlist_signup",
      source: await headers(),
      limit: 6,
      windowMs: 15 * 60 * 1000,
      keyParts: [parsed.success ? parsed.data.email : "invalid"],
    });
    if (!rate.ok) {
      return { error: "Too many requests. Please try again in a few minutes." };
    }
  } catch {
    // If rate-limiting fails, fail open — capturing the signup matters more.
  }

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please review your details." };
  }

  const { email, planKey, currency, source } = parsed.data;

  try {
    // Upsert so re-submitting the same email+plan is idempotent (no dup spam,
    // no error shown to the user).
    await prisma.waitlistSignup.upsert({
      where: { email_planKey: { email, planKey } },
      update: { currency, source: source ?? null },
      create: { email, planKey, currency, source: source ?? null },
    });
  } catch (error) {
    console.error("joinWaitlistAction persist failed", error);
    return { error: "We couldn't save your spot just now. Please try again." };
  }

  // Confirmation email — best effort, never blocks the success response.
  try {
    const plan = plans.find((p) => p.key === planKey);
    const planName = plan?.name ?? "your plan";
    const appUrl = process.env.APP_URL ?? "https://wed.tonewbeginning.com";
    await sendEmail({
      to: email,
      subject: `You're on the ${planName} founding-couple list ✨`,
      text: [
        `Thanks for your interest in ToNewBeginning ${planName}.`,
        "",
        "You're on the founding-couple waitlist. When we open paid plans, you'll be",
        "first to know, and you'll get founding-couple pricing locked in.",
        "",
        `In the meantime, you can keep building your free wedding workspace: ${appUrl}/dashboard`,
        "",
        "— The ToNewBeginning team",
      ].join("\n"),
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#2b1a18;line-height:1.6;">
          <p style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#9a7a6a;margin:0;">Founding couple list</p>
          <h1 style="font-size:24px;margin:10px 0 0;">You're on the ${escapeHtml(planName)} list ✨</h1>
          <p style="font-size:15px;color:#6b554f;">
            Thanks for your interest in ToNewBeginning <strong>${escapeHtml(planName)}</strong>.
            When we open paid plans, you'll be first to know, with founding-couple pricing locked in.
          </p>
          <p style="font-size:15px;color:#6b554f;">
            In the meantime, keep building your free wedding workspace:
            <a href="${escapeHtml(appUrl)}/dashboard" style="color:#7a4b3a;">${escapeHtml(appUrl)}/dashboard</a>
          </p>
          <p style="font-size:14px;color:#9a7a6a;margin-top:24px;">With love,<br/>The ToNewBeginning team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("joinWaitlistAction email failed", error);
  }

  return { success: "You're on the list! Check your inbox for a confirmation." };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
