"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "./AuthShell";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { FadeSwitch, MountFade } from "./Transition";
import type { AuthMode, SignUpPayload } from "@/lib/types";

const HEADER_COPY: Record<AuthMode, { eyebrow: string; heading: string; blurb: string }> = {
  login: {
    eyebrow: "Welcome back",
    heading: "Log in",
    blurb: "Access your curated experience.",
  },
  signup: {
    eyebrow: "Join the club",
    heading: "Sign up",
    blurb: "Join the Verdant Luxe community.",
  },
  forgot: {
    eyebrow: "Account recovery",
    heading: "Reset password",
    blurb: "We'll help you get back in.",
  },
};

function parseMode(value: string | null): AuthMode {
  return value === "signup" || value === "forgot" ? value : "login";
}

export function AuthCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") ?? "";

  const [mode, setMode] = useState<AuthMode>(() => parseMode(searchParams.get("mode")));
  const copy = HEADER_COPY[mode];

  function handleSignUpSuccess(payload: SignUpPayload) {
    const params = new URLSearchParams({
      email: payload.email,
    });
    router.push(`/auth/verify?${params.toString()}`);
  }

  return (
    <MountFade>
      <AuthShell eyebrow={copy.eyebrow} heading={copy.heading} blurb={copy.blurb}>
        <FadeSwitch activeKey={mode}>
          {mode === "login" ? (
            <LoginForm
              initialIdentifier={prefillEmail}
              onSwitchToSignUp={() => setMode("signup")}
              onSwitchToForgot={() => setMode("forgot")}
            />
          ) : mode === "signup" ? (
            <SignUpForm
              initialEmail={prefillEmail}
              onSwitchToLogin={() => setMode("login")}
              onSubmitSuccess={handleSignUpSuccess}
            />
          ) : (
            <ForgotPasswordForm onBackToLogin={() => setMode("login")} />
          )}
        </FadeSwitch>
      </AuthShell>
    </MountFade>
  );
}
