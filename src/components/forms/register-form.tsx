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
    <p id={id} className="mb-2 text-sm font-medium text-rose-700">
      {message}
    </p>
  );
}

type RegisterFieldName = keyof RegisterFormValues;

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
      setClientErrors(mapRegisterValidationErrors(parsed.error.issues));
      return;
    }

    setEditedFields({});
    setClientErrors({});
  }

  return (
    <form action={formAction} className="space-y-4" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldError id="partnerOneName-error" message={fieldErrors.partnerOneName} />
          <Input
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
        </div>
        <div>
          <FieldError id="partnerTwoName-error" message={fieldErrors.partnerTwoName} />
          <Input
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
        </div>
      </div>
      <div>
        <FieldError id="brandName-error" message={fieldErrors.brandName} />
        <Input
          aria-describedby={fieldErrors.brandName ? "brandName-error" : undefined}
          aria-invalid={Boolean(fieldErrors.brandName)}
          name="brandName"
          placeholder="Wedding brand, e.g. KamMonBeginnings"
          required
          value={formValues.brandName}
          onChange={(event) => updateField("brandName", event.target.value)}
          onBlur={() => validateSingleField("brandName")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
        <div>
          <FieldError id="email-error" message={fieldErrors.email} />
          <Input
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            autoCapitalize="none"
            autoComplete="email"
            name="email"
            type="email"
            placeholder="Email address"
            required
            value={formValues.email}
            onChange={(event) => updateField("email", event.target.value)}
            onBlur={() => validateSingleField("email")}
          />
        </div>
        <div>
          <FieldError id="slug-error" message={fieldErrors.slug} />
          <Input
            aria-describedby={fieldErrors.slug ? "slug-error" : undefined}
            aria-invalid={Boolean(fieldErrors.slug)}
            autoCapitalize="none"
            name="slug"
            placeholder="Custom URL slug"
            required
            value={formValues.slug}
            onChange={(event) => updateField("slug", event.target.value)}
            onBlur={() => validateSingleField("slug")}
          />
        </div>
      </div>
      <div>
        <FieldError id="weddingDate-error" message={fieldErrors.weddingDate} />
        <Input
          aria-describedby={fieldErrors.weddingDate ? "weddingDate-error" : undefined}
          aria-invalid={Boolean(fieldErrors.weddingDate)}
          name="weddingDate"
          type="date"
          required
          value={formValues.weddingDate}
          onChange={(event) => updateField("weddingDate", event.target.value)}
          onBlur={() => validateSingleField("weddingDate")}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldError id="password-error" message={fieldErrors.password} />
          <Input
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
          <p className="mt-2 text-xs text-stone-500">
            {registerFieldMessages.password.min} Include uppercase, lowercase, a number, and a
            special character like - _ # @.
          </p>
        </div>
        <div>
          <FieldError id="confirmPassword-error" message={fieldErrors.confirmPassword} />
          <Input
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
        </div>
      </div>
      <FormMessage type="error" message={state.error} />
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
