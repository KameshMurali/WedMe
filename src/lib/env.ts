import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  STORAGE_DRIVER: z.enum(["local", "s3", "blob"]).default("local"),
  LOCAL_UPLOAD_DIR: z.string().default("public/uploads"),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default("ToNewBeginning.com <noreply@tonewbeginning.com>"),
  // Treat an empty string the same as unset so a blank Vercel value falls back
  // to the default instead of failing the enum parse.
  EMAIL_DELIVERY_MODE: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(["console", "smtp", "resend"]).default("console"),
  ),
  RESEND_API_KEY: z.string().optional(),
  // Comma-separated list of emails granted admin access (waitlist viewer, etc.)
  // without needing a DB role change. e.g. "you@example.com,ops@example.com".
  ADMIN_EMAILS: z.string().optional(),
  // Google Search Console HTML-tag verification token. When set, the root
  // layout emits <meta name="google-site-verification">. Optional — leave unset
  // if verifying via DNS instead. Empty string is treated as unset.
  GOOGLE_SITE_VERIFICATION: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().optional(),
  ),
});

export const env = environmentSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  APP_URL: process.env.APP_URL,
  STORAGE_DRIVER: process.env.STORAGE_DRIVER,
  LOCAL_UPLOAD_DIR: process.env.LOCAL_UPLOAD_DIR,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM,
  EMAIL_DELIVERY_MODE: process.env.EMAIL_DELIVERY_MODE,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
});
