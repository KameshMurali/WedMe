import { Resend } from "resend";

import { env } from "@/lib/env";

type SmtpTransport = {
  sendMail: (message: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  }) => Promise<unknown>;
};

// Nodemailer does not always ship usable type declarations in this deployment path,
// so load it via Node require and constrain only the surface we use.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodemailer = require("nodemailer") as {
  createTransport: (options: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  }) => SmtpTransport;
};

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

// Lazily instantiate the Resend client so missing creds in console-mode dev
// don't break the import.
let resendClient: Resend | null = null;
function getResend() {
  if (!env.RESEND_API_KEY) {
    throw new Error("Resend delivery is enabled, but RESEND_API_KEY is missing.");
  }
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendEmail(payload: EmailPayload) {
  // Resolve the effective delivery mode. Safety net: in production, if a
  // Resend key is configured but the mode somehow resolved to "console"
  // (e.g. EMAIL_DELIVERY_MODE was left blank/misconfigured), prefer Resend
  // rather than silently dropping real emails. Local dev keeps console mode.
  let mode = env.EMAIL_DELIVERY_MODE;
  if (
    mode === "console" &&
    env.RESEND_API_KEY &&
    (process.env.NODE_ENV === "production" || process.env.VERCEL)
  ) {
    console.warn("sendEmail: EMAIL_DELIVERY_MODE was 'console' in production; using Resend instead.");
    mode = "resend";
  }

  if (mode === "console") {
    console.info("EMAIL_PREVIEW", payload);
    return { delivered: false, preview: payload };
  }

  if (mode === "resend") {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: env.SMTP_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });
    if (error) {
      throw new Error(`Resend send failed: ${error.message ?? "unknown error"}`);
    }
    return { delivered: true };
  }

  // mode === "smtp"
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
    throw new Error("SMTP delivery is enabled, but SMTP_HOST, SMTP_USER, or SMTP_PASSWORD is missing.");
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  await transport.sendMail({
    from: env.SMTP_FROM,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  return { delivered: true };
}
