"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "./AuthShell";
import { Button } from "./ui/Button";
import { PasswordField } from "./ui/Field";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { MountFade } from "./Transition";
import { CheckCircleIcon, LockIcon } from "./ui/Icons";
import { isPasswordValid } from "../lib/validation";

export function NewPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const confirmError =
    touchedConfirm && confirmPassword.length > 0 && !passwordsMatch
      ? "Passwords don't match."
      : undefined;

  const isFormValid = useMemo(
    () => isPasswordValid(password) && passwordsMatch,
    [password, passwordsMatch]
  );

  async function handleSubmit() {
    if (!isFormValid) return;
    setStatus("saving");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStatus("success");
  }

  return (
    <MountFade>
      <AuthShell
        eyebrow="Account security"
        heading="Set a new password"
        blurb={email ? `Choose a new password for ${email}.` : "Choose a strong new password."}
        headerExtra={
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2F5233]/10 text-[#2F5233]">
            <LockIcon className="h-5 w-5" />
          </span>
        }
      >
        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2F5233]/10 text-[#2F5233]">
              <CheckCircleIcon className="h-6 w-6" />
            </span>
            <h2 className="font-serif text-[1.15rem] text-[#15241D]">Password updated</h2>
            <p className="max-w-[280px] text-[0.85rem] text-[#6E6859]">
              Your password has been changed. Use it next time you log in.
            </p>
            <Button
              variant="secondary"
              type="button"
              className="mt-2 w-auto px-6"
              onClick={() => router.push("/auth")}
            >
              Continue to log in
            </Button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            noValidate
          >
            <PasswordField
              label="New password"
              name="newPassword"
              autoComplete="new-password"
              placeholder="Enter a new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showToggleLabel="new password"
            />

            <PasswordStrengthMeter password={password} />

            <PasswordField
              label="Confirm password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouchedConfirm(true)}
              error={confirmError}
              showToggleLabel="confirm password"
            />

            <Button type="submit" isLoading={status === "saving"} loadingLabel="Saving" disabled={!isFormValid}>
              Save password
            </Button>
          </form>
        )}
      </AuthShell>
    </MountFade>
  );
}
