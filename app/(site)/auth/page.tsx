"use client";

import {useState} from "react";
import {AuthShell} from "@/app/(site)/auth/_components/AuthShell";
import {AuthCard} from "@/app/(site)/auth/_components/AuthCard";
import {Transition} from "@/app/(site)/auth/_components/Transition";
import {LoginForm} from "@/app/(site)/auth/_components/LoginForm";
import {SignUpForm} from "@/app/(site)/auth/_components/SignUpForm";
import {ForgotPasswordForm} from "@/app/(site)/auth/_components/ForgotPasswordForm";
import {VerifyForm} from "@/app/(site)/auth/_components/VerifyForm";
import {NewPasswordForm} from "@/app/(site)/auth/_components/NewPasswordForm";

type Mode = "login" | "signup" | "forgot" | "verify" | "new-password";

const COPY: Record<Mode, { eyebrow: string; title: string; subtitle?: string }> = {
    login: {
        eyebrow: "Welcome Back",
        title: "Log In",
        subtitle: "Access your personal space, appointments, and exclusive rewards.",
    },
    signup: {
        eyebrow: "Join Verdant Luxe",
        title: "Create an Account",
        subtitle:
            "Become a member and unlock personalized rituals, priority booking, and rewards.",
    },
    forgot: {
        eyebrow: "Account Recovery",
        title: "Reset Your Password",
        subtitle: "Enter your email and we'll send you a verification code.",
    },
    verify: {
        eyebrow: "Account Recovery",
        title: "Enter Verification Code",
    },
    "new-password": {
        eyebrow: "Account Recovery",
        title: "Choose a New Password",
    },
};

export default function AuthPage() {
    const [mode, setMode] = useState<Mode>("login");
    const [resetEmail, setResetEmail] = useState("");
    const [resetCode, setResetCode] = useState("");

    return (
        <div className="w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]"><AuthShell>
            <Transition activeKey={mode}>
                <AuthCard {...COPY[mode]}>
                    {mode === "login" && (
                        <LoginForm
                            onSwitchToSignup={() => setMode("signup")}
                            onForgotPassword={() => setMode("forgot")}
                            onSuccess={() => {
                                window.location.href = "/";
                            }}
                        />
                    )}

                    {mode === "signup" && (
                        <SignUpForm
                            onSwitchToLogin={() => setMode("login")}
                            onSuccess={() => setMode("login")}
                        />
                    )}

                    {mode === "forgot" && (
                        <ForgotPasswordForm
                            onSwitchToLogin={() => setMode("login")}
                            onCodeSent={(email) => {
                                setResetEmail(email);
                                setMode("verify");
                            }}
                        />
                    )}

                    {mode === "verify" && (
                        <VerifyForm
                            email={resetEmail}
                            onVerified={(code: string) => {
                                setResetCode(code);
                                setMode("new-password");
                            }}
                        />
                    )}

                    {mode === "new-password" && (
                        <NewPasswordForm
                            email={resetEmail}
                            code={resetCode}
                            onDone={() => setMode("login")}
                        />
                    )}
                </AuthCard>
            </Transition>
        </AuthShell></div>
    );
}
