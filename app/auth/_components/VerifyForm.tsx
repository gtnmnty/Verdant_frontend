"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "./AuthShell";
import { OtpInput } from "./OtpInput";
import { Button } from "./ui/Button";
import { MountFade } from "./Transition";
import { CheckCircleIcon, ShieldIcon } from "./ui/Icons";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;
/** Demo-only: this is the code that is treated as "correct" in this mock flow. */
const MOCK_VALID_CODE = "123456";

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "your email";

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  const code = digits.join("");
  const isComplete = code.length === CODE_LENGTH;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const errorId = "verify-otp-error";

  async function handleVerify() {
    if (!isComplete) return;
    setStatus("checking");
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (code === MOCK_VALID_CODE) {
      setStatus("success");
      await new Promise((resolve) => setTimeout(resolve, 700));
      router.push(`/auth/new-password?email=${encodeURIComponent(email)}`);
      return;
    }

    setStatus("error");
  }

  async function handleResend() {
    setResending(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setDigits(Array(CODE_LENGTH).fill(""));
    setStatus("idle");
    setSecondsLeft(RESEND_SECONDS);
    setResending(false);
  }

  function handleChangeEmail() {
    router.push(`/auth?mode=signup&email=${encodeURIComponent(email)}`);
  }

  return (
    <MountFade>
      <AuthShell
        eyebrow="Verification"
        heading="Verify your email"
        blurb={`We sent a 6-digit code to ${email}.`}
        headerExtra={
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2F5233]/10 text-[#2F5233]">
            <ShieldIcon className="h-5 w-5" />
          </span>
        }
      >
        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2F5233]/10 text-[#2F5233]">
              <CheckCircleIcon className="h-6 w-6" />
            </span>
            <h2 className="font-serif text-[1.15rem] text-[#15241D]">Verified</h2>
            <p className="text-[0.85rem] text-[#6E6859]">Taking you to set a new password…</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <OtpInput
              value={digits}
              onChange={(next) => {
                setDigits(next);
                if (status === "error") setStatus("idle");
              }}
              disabled={status === "checking"}
              error={status === "error"}
              describedById={status === "error" ? errorId : undefined}
            />

            {status === "error" ? (
              <p id={errorId} role="alert" className="text-[0.82rem] text-[#9B3B3B]">
                That code didn&apos;t match. Check the digits and try again.
              </p>
            ) : (
              <p className="text-[0.78rem] text-[#A39C8C]">
                Demo tip: enter <span className="font-medium text-[#6E6859]">123456</span> to
                continue.
              </p>
            )}

            <Button type="button" onClick={handleVerify} isLoading={status === "checking"} loadingLabel="Verifying" disabled={!isComplete}>
              Verify
            </Button>

            <div className="flex flex-col items-center gap-3 text-center">
              {secondsLeft > 0 ? (
                <p className="text-[0.82rem] text-[#6E6859]">
                  Resend code in{" "}
                  <span className="font-medium text-[#15241D]">{formatCountdown(secondsLeft)}</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[0.85rem] font-medium text-[#B68D40] underline-offset-2 transition-colors hover:text-[#15241D] hover:underline disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68D40]/40 focus-visible:rounded-sm"
                >
                  {resending ? "Sending a new code…" : "Resend code"}
                </button>
              )}

              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-[0.8rem] text-[#A39C8C] underline-offset-2 transition-colors hover:text-[#15241D] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68D40]/40 focus-visible:rounded-sm"
              >
                Change email
              </button>
            </div>
          </div>
        )}
      </AuthShell>
    </MountFade>
  );
}
