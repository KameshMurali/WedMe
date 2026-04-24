import { env } from "@/lib/env";

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

  console.info("SMTP delivery requested but not yet configured, falling back to console.");
  console.info("EMAIL_PREVIEW", payload);
  return { delivered: false, preview: payload };
}
