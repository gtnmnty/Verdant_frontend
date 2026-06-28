"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "./ui/Button";
import { TextField, PasswordField } from "./ui/Field";
import { Checkbox } from "./ui/Checkbox";
import { SocialButtons } from "./SocialButtons";
import { TermsDialog } from "./TermsDialog";
import {
  isValidEmail,
  isValidFullName,
  isValidPhone,
  isUsablePassword,
} from "@/lib/validation";
import type { SignUpPayload } from "@/lib/types";

interface SignUpFormProps {
  onSwitchToLogin: () => void;
  onSubmitSuccess: (payload: SignUpPayload) => void;
  initialEmail?: string;
}

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  agreed: boolean;
}

const initialState: FormState = {
  fullName: "",
  phone: "",
  email: "",
  password: "",
  agreed: false,
};

export function SignUpForm({ onSwitchToLogin, onSubmitSuccess, initialEmail = "" }: SignUpFormProps) {
  const [form, setForm] = useState<FormState>({ ...initialState, email: initialEmail });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function markTouched(key: keyof FormState) {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }

  const errors = {
    fullName:
      touched.fullName && !isValidFullName(form.fullName) ? "Enter your full name." : undefined,
    phone:
      touched.phone && !isValidPhone(form.phone) ? "Enter a valid phone number." : undefined,
    email:
      touched.email && !isValidEmail(form.email) ? "Enter a valid email address." : undefined,
    password:
      touched.password && !isUsablePassword(form.password)
        ? "Use at least 8 characters."
        : undefined,
  };

  const isFormValid = useMemo(
    () =>
      isValidFullName(form.fullName) &&
      isValidPhone(form.phone) &&
      isValidEmail(form.email) &&
      isUsablePassword(form.password) &&
      form.agreed,
    [form]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ fullName: true, phone: true, email: true, password: true, agreed: true });
    if (!isFormValid) return;

    setIsSubmitting(true);
    setNotice(null);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    setIsSubmitting(false);
    onSubmitSuccess({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      password: form.password,
    });
  }

  return (
    <>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Full name"
          name="fullName"
          autoComplete="name"
          placeholder="Full name"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          onBlur={() => markTouched("fullName")}
          error={errors.fullName}
        />

        <TextField
          label="Phone number"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="09XX XXX XXXX"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          onBlur={() => markTouched("phone")}
          error={errors.phone}
        />

        <TextField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="your@email.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          onBlur={() => markTouched("email")}
          error={errors.email}
        />

        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          onBlur={() => markTouched("password")}
          error={errors.password}
          hint={!errors.password ? "At least 8 characters." : undefined}
          showToggleLabel="password"
        />

        <Checkbox
          label={
            <span>
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                className="font-medium text-[#B68D40] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68D40]/40 focus-visible:rounded-sm"
              >
                Terms &amp; Privacy
              </button>
            </span>
          }
          checked={form.agreed}
          onChange={(e) => update("agreed", e.target.checked)}
          onBlur={() => markTouched("agreed")}
          error={touched.agreed && !form.agreed ? "Please accept the terms to continue." : undefined}
        />

        {notice ? <p className="text-[0.8rem] text-[#6E6859]">{notice}</p> : null}

        <Button type="submit" isLoading={isSubmitting} loadingLabel="Creating account" disabled={!isFormValid}>
          Create account
        </Button>

        <SocialButtons
          onSelect={(provider) =>
            setNotice(`${provider === "google" ? "Google" : "Apple"} sign-in is a demo placeholder.`)
          }
        />

        <p className="text-center text-[0.85rem] text-[#6E6859]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-[#15241D] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68D40]/40 focus-visible:rounded-sm"
          >
            Log in here
          </button>
        </p>
      </form>

      <TermsDialog
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        onAccept={() => update("agreed", true)}
      />
    </>
  );
}
