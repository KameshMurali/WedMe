import { env } from "@/lib/env";
import nodemailer from "nodemailer";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(payload: EmailPayload) {
  if (env.EMAIL_DELIVERY_MODE === "console") {
    console.info("EMAIL_PREVIEW", payload);
    return { delivered: false, preview: payload };
  }

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
