"use client";

import { useState, type FormEvent } from "react";
import { Button } from "./ui/Button";
import { TextField } from "./ui/Field";
import { MailIcon, ChevronLeftIcon } from "./ui/Icons";
import { isValidEmail } from "@/lib/validation";
import type { AsyncStatus } from "@/lib/types";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<AsyncStatus>("idle");

  const error = touched && email.length > 0 && !isValidEmail(email) ? "Enter a valid email address." : undefined;
  const isValid = isValidEmail(email);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!isValid) return;
    setStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 900));
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2F5233]/10 text-[#2F5233]">
          <MailIcon className="h-6 w-6" />
        </span>
        <h2 className="font-serif text-[1.15rem] text-[#15241D]">Check your inbox</h2>
        <p className="max-w-[280px] text-[0.85rem] text-[#6E6859]">
          If an account exists for <span className="font-medium text-[#15241D]">{email}</span>,
          we&apos;ve sent a link to reset your password.
        </p>
        <Button variant="secondary" type="button" className="mt-2 w-auto px-6" onClick={onBackToLogin}>
          Back to log in
        </Button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <button
        type="button"
        onClick={onBackToLogin}
        className="-mt-1 mb-1 inline-flex items-center gap-1 self-start text-[0.8rem] font-medium text-[#6E6859] transition-colors hover:text-[#15241D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68D40]/40 focus-visible:rounded-sm"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Back to log in
      </button>

      <p className="text-[0.85rem] leading-relaxed text-[#6E6859]">
        Enter the email linked to your account and we&apos;ll send a link to reset your password.
      </p>

      <TextField
        label="Email address"
        name="forgot-email"
        type="email"
        autoComplete="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched(true)}
        error={error}
      />

      <Button type="submit" isLoading={status === "loading"} loadingLabel="Sending link" disabled={!isValid}>
        Send reset link
      </Button>
    </form>
  );
}
