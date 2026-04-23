import { z } from "zod";

export const registerFieldMessages = {
  partnerOneName: {
    required: "Please enter the first partner's name.",
    min: "The first partner's name should be at least 2 characters.",
    max: "The first partner's name should be 80 characters or fewer.",
  },
  partnerTwoName: {
    required: "Please enter the second partner's name.",
    min: "The second partner's name should be at least 2 characters.",
    max: "The second partner's name should be 80 characters or fewer.",
  },
  brandName: {
    required: "Please enter your wedding brand or site title.",
    min: "The wedding brand should be at least 3 characters.",
    max: "The wedding brand should be 120 characters or fewer.",
    invalid:
      "Use only alphabets, numbers, spaces, and special characters like - _ # @.",
  },
  email: {
    required: "Please enter your email address.",
    max: "The email address should be 254 characters or fewer.",
    invalid: "Please enter a valid email address like name@example.com.",
  },
  slug: {
    required: "Please choose a custom wedding URL.",
    min: "The custom URL should be at least 3 characters.",
    max: "The custom URL should be 40 characters or fewer.",
    invalid: "Use only lowercase letters, numbers, hyphens, or underscores for the URL.",
  },
  weddingDate: {
    required: "Please select your wedding date.",
  },
  password: {
    required: "Please create a password.",
    min: "Password must be at least 10 characters.",
    max: "Password must be 100 characters or fewer.",
    lowercase: "Password must include at least one lowercase letter.",
    uppercase: "Password must include at least one uppercase letter.",
    number: "Password must include at least one number.",
    special: "Password must include at least one special character like - _ # @.",
  },
  confirmPassword: {
    required: "Please confirm your password.",
    mismatch: "Password confirmation does not match.",
  },
} as const;

export const registerFieldNames = [
  "partnerOneName",
  "partnerTwoName",
  "brandName",
  "email",
  "slug",
  "weddingDate",
  "password",
  "confirmPassword",
] as const;

export type RegisterFieldName = (typeof registerFieldNames)[number];

const brandNamePattern = /^[A-Za-z0-9\s\-_#@]+$/;
const slugPattern = /^[a-z0-9_-]+$/;
const passwordSpecialPattern = /[-_#@!$%^&*]/;

const registerBaseSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, registerFieldMessages.email.required)
    .max(254, registerFieldMessages.email.max)
    .email(registerFieldMessages.email.invalid)
    .transform((value) => value.toLowerCase()),
  partnerOneName: z
    .string()
    .trim()
    .min(1, registerFieldMessages.partnerOneName.required)
    .min(2, registerFieldMessages.partnerOneName.min)
    .max(80, registerFieldMessages.partnerOneName.max),
  partnerTwoName: z
    .string()
    .trim()
    .min(1, registerFieldMessages.partnerTwoName.required)
    .min(2, registerFieldMessages.partnerTwoName.min)
    .max(80, registerFieldMessages.partnerTwoName.max),
  brandName: z
    .string()
    .trim()
    .min(1, registerFieldMessages.brandName.required)
    .min(3, registerFieldMessages.brandName.min)
    .max(120, registerFieldMessages.brandName.max)
    .regex(brandNamePattern, registerFieldMessages.brandName.invalid),
  slug: z
    .string()
    .trim()
    .min(1, registerFieldMessages.slug.required)
    .min(3, registerFieldMessages.slug.min)
    .max(40, registerFieldMessages.slug.max)
    .regex(slugPattern, registerFieldMessages.slug.invalid)
    .transform((value) => value.toLowerCase()),
  weddingDate: z.string().trim().min(1, registerFieldMessages.weddingDate.required),
  password: z
    .string()
    .min(1, registerFieldMessages.password.required)
    .min(10, registerFieldMessages.password.min)
    .max(100, registerFieldMessages.password.max)
    .regex(/[a-z]/, registerFieldMessages.password.lowercase)
    .regex(/[A-Z]/, registerFieldMessages.password.uppercase)
    .regex(/[0-9]/, registerFieldMessages.password.number)
    .regex(passwordSpecialPattern, registerFieldMessages.password.special),
  confirmPassword: z.string().min(1, registerFieldMessages.confirmPassword.required),
});

export const registerSchema = registerBaseSchema
  .refine((value) => value.password === value.confirmPassword, {
    message: registerFieldMessages.confirmPassword.mismatch,
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address like name@example.com."),
  password: z.string().min(8, "Please enter your password."),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address like name@example.com."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: registerBaseSchema.shape.password,
    confirmPassword: z.string().min(1, registerFieldMessages.confirmPassword.required),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: registerFieldMessages.confirmPassword.mismatch,
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export function mapRegisterValidationErrors(fieldErrors: z.ZodIssue[]) {
  return fieldErrors.reduce<Record<string, string>>((accumulator, issue) => {
    const field = issue.path[0];
    if (typeof field === "string" && !accumulator[field]) {
      accumulator[field] = issue.message;
    }
    return accumulator;
  }, {});
}
