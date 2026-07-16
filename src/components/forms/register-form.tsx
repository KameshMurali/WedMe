"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";

import { registerAction } from "@/actions/auth";
import { FormMessage } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";
import {
  mapRegisterValidationErrors,
  registerFieldMessages,
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-rose-700">
      {message}
    </p>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-stone-900">
      {children} <span aria-hidden="true" className="text-rose-600">*</span>
    </label>
  );
}

type RegisterFieldName = keyof RegisterFormValues;

// Order matters: used to scroll the FIRST invalid field into view on submit.
const fieldOrder: string[] = [
  "partnerOneName",
  "partnerTwoName",
  "brandName",
  "email",
  "slug",
  "weddingDate",
  "password",
  "confirmPassword",
];

const initialFormValues: RegisterFormValues = {
  partnerOneName: "",
  partnerTwoName: "",
  brandName: "",
  email: "",
  slug: "",
  weddingDate: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialActionState);
  const [formValues, setFormValues] = useState<RegisterFormValues>(initialFormValues);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [editedFields, setEditedFields] = useState<Record<string, boolean>>({});

  const visibleServerErrors = Object.fromEntries(
    Object.entries(state.fieldErrors ?? {}).filter(([field]) => !editedFields[field]),
  );

  const fieldErrors = {
    ...visibleServerErrors,
    ...clientErrors,
  };

  function clearFieldError(name: RegisterFieldName) {
    setClientErrors((current) => {
      if (!current[name]) return current;

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function updateField(name: RegisterFieldName, value: string) {
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
    setEditedFields((current) => ({
      ...current,
      [name]: true,
    }));

    clearFieldError(name);

    if (name === "password" || name === "confirmPassword") {
      setEditedFields((current) => ({
        ...current,
        confirmPassword: true,
      }));
      clearFieldError("confirmPassword");
    }
  }

  function validateSingleField(name: RegisterFieldName) {
    const parsed = registerSchema.safeParse(formValues);
    const nextErrors = parsed.success ? {} : mapRegisterValidationErrors(parsed.error.issues);

    setClientErrors((current) => {
      const updated = { ...current };

      if (nextErrors[name]) {
        updated[name] = nextErrors[name];
      } else {
        delete updated[name];
      }

      if (name === "confirmPassword" || (name === "password" && formValues.confirmPassword.length > 0)) {
        if (nextErrors.confirmPassword) {
          updated.confirmPassword = nextErrors.confirmPassword;
        } else {
          delete updated.confirmPassword;
        }
      }

      return updated;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const parsed = registerSchema.safeParse(formValues);

    if (!parsed.success) {
      event.preventDefault();
      const nextErrors = mapRegisterValidationErrors(parsed.error.issues);
      setClientErrors(nextErrors);

      // On mobile the error messages render far above the submit button —
      // without this, tapping "Create workspace" appears to do nothing.
      const firstInvalid = fieldOrder.find((name) => nextErrors[name]);
      if (firstInvalid) {
        const element = document.querySelector<HTMLElement>(`[name="${firstInvalid}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
        element?.focus({ preventScroll: true });
      }
      return;
    }

    setEditedFields({});
    setClientErrors({});
  }

  const errorCount = Object.keys(fieldErrors).length;

  return (
    <form action={formAction} className="space-y-4" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="register-partner-one">Partner one name</FieldLabel>
          <Input
            id="register-partner-one"
            aria-describedby={fieldErrors.partnerOneName ? "partnerOneName-error" : undefined}
            aria-invalid={Boolean(fieldErrors.partnerOneName)}
            autoComplete="given-name"
            name="partnerOneName"
            placeholder="Partner one name"
            required
            value={formValues.partnerOneName}
            onChange={(event) => updateField("partnerOneName", event.target.value)}
            onBlur={() => validateSingleField("partnerOneName")}
          />
          <FieldError id="partnerOneName-error" message={fieldErrors.partnerOneName} />
        </div>
        <div>
          <FieldLabel htmlFor="register-partner-two">Partner two name</FieldLabel>
          <Input
            id="register-partner-two"
            aria-describedby={fieldErrors.partnerTwoName ? "partnerTwoName-error" : undefined}
            aria-invalid={Boolean(fieldErrors.partnerTwoName)}
            autoComplete="family-name"
            name="partnerTwoName"
            placeholder="Partner two name"
            required
            value={formValues.partnerTwoName}
            onChange={(event) => updateField("partnerTwoName", event.target.value)}
            onBlur={() => validateSingleField("partnerTwoName")}
          />
          <FieldError id="partnerTwoName-error" message={fieldErrors.partnerTwoName} />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="register-brand">Wedding brand name</FieldLabel>
        <Input
          id="register-brand"
          aria-describedby={fieldErrors.brandName ? "brandName-error" : undefined}
          aria-invalid={Boolean(fieldErrors.brandName)}
          name="brandName"
          placeholder="e.g. KamMonBeginnings"
          required
          value={formValues.brandName}
          onChange={(event) => updateField("brandName", event.target.value)}
          onBlur={() => validateSingleField("brandName")}
        />
        <FieldError id="brandName-error" message={fieldErrors.brandName} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
        <div>
          <FieldLabel htmlFor="register-email">Email address</FieldLabel>
          <Input
            id="register-email"
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            autoCapitalize="none"
            autoComplete="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            value={formValues.email}
            onChange={(event) => updateField("email", event.target.value)}
            onBlur={() => validateSingleField("email")}
          />
          <FieldError id="email-error" message={fieldErrors.email} />
        </div>
        <div>
          <FieldLabel htmlFor="register-slug">Custom URL slug</FieldLabel>
          <Input
            id="register-slug"
            aria-describedby={fieldErrors.slug ? "slug-error" : undefined}
            aria-invalid={Boolean(fieldErrors.slug)}
            autoCapitalize="none"
            name="slug"
            placeholder="yourwedding"
            required
            value={formValues.slug}
            onChange={(event) => updateField("slug", event.target.value)}
            onBlur={() => validateSingleField("slug")}
          />
          <FieldError id="slug-error" message={fieldErrors.slug} />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="register-wedding-date">Wedding date</FieldLabel>
        <Input
          id="register-wedding-date"
          aria-describedby={fieldErrors.weddingDate ? "weddingDate-error" : undefined}
          aria-invalid={Boolean(fieldErrors.weddingDate)}
          name="weddingDate"
          type="date"
          required
          value={formValues.weddingDate}
          onChange={(event) => updateField("weddingDate", event.target.value)}
          onBlur={() => validateSingleField("weddingDate")}
        />
        <FieldError id="weddingDate-error" message={fieldErrors.weddingDate} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="register-password">Create password</FieldLabel>
          <Input
            id="register-password"
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            aria-invalid={Boolean(fieldErrors.password)}
            autoComplete="new-password"
            name="password"
            type="password"
            placeholder="Create password"
            required
            value={formValues.password}
            onChange={(event) => updateField("password", event.target.value)}
            onBlur={() => validateSingleField("password")}
          />
          <FieldError id="password-error" message={fieldErrors.password} />
          <p className="mt-2 text-xs text-stone-500">
            {registerFieldMessages.password.min} Include uppercase, lowercase, a number, and a
            special character like - _ # @.
          </p>
        </div>
        <div>
          <FieldLabel htmlFor="register-confirm-password">Confirm password</FieldLabel>
          <Input
            id="register-confirm-password"
            aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            autoComplete="new-password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            required
            value={formValues.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            onBlur={() => validateSingleField("confirmPassword")}
          />
          <FieldError id="confirmPassword-error" message={fieldErrors.confirmPassword} />
        </div>
      </div>
      <FormMessage type="error" message={state.error} />
      {errorCount > 0 ? (
        <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
          {errorCount === 1
            ? "1 field needs attention. It's highlighted in red above."
            : `${errorCount} fields need attention. They're highlighted in red above.`}
        </p>
      ) : null}
      <SubmitButton label="Create workspace" loadingLabel="Creating..." className="w-full" />
      <p className="text-sm text-stone-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-stone-900">
          Log in
        </Link>
      </p>
    </form>
  );
}
