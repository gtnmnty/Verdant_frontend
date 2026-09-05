"use client";

import {useState, type SubmitEvent} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Button} from "@/app/(site)/auth/_components/ui/Button";
import {Field} from "@/app/(site)/auth/_components/ui/Field";
import {OtpInput} from "@/app/(site)/auth/_components/OtpInput";
import {PasswordStrengthMeter} from "@/app/(site)/auth/_components/PasswordStrengthMeter";

type Step = "request" | "verify" | "update";
type Errors = Partial<Record<"current" | "next" | "confirm", string>>;

export function ChangePasswordFlow() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("request");
    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState<string>();
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);

    const requestCode = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("Verification code sent " +
                          "to your registered email.");
            setStep("verify");
        }, 800);
    };

    const verifyCode = (ev: SubmitEvent) => {
        ev.preventDefault();
        if (code.length < 6) {
            setCodeError("Enter the 6-digit code we sent you");
            return;
        }
        setCodeError(undefined);
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("Code verified.");
            setStep("update");
        }, 700);
    };

    const submit = (ev: SubmitEvent) => {
        ev.preventDefault();
        const e: Errors = {};
        if (!current) e.current = "Enter your current password";
        if (next.length < 8) e.next = "Password must be at least 8 characters";
        if (confirm !== next) e.confirm = "Passwords do not match";
        setErrors(e);
        if (Object.keys(e).length) return;

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("Password changed successfully.");
            router.push("/account");
        }, 800);
    };

    return (
        <div className="mx-auto w-[min(90vw,26rem)]
                 py-[clamp(2.5rem,6vw,4.5rem)]">
            <header className="text-center">
                <p className="text-xs font-semibold uppercase
                 tracking-[0.24em] text-soft-rose">
                    Account Security
                </p>
                <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)]
                 leading-tight tracking-tight text-primary">
                    Change Password
                </h1>
                <p className="mx-auto mt-4 max-w-sm text-sm
                 text-on-surface-variant">
                    For your protection, we&rsquo;ll 
                    verify your identity before
                    updating your password.
                </p>
            </header>

            <div className="mx-auto mt-10">
                {step === "request" && (
                    <div className="space-y-5 text-center">
                        <p className="text-sm text-on-surface-variant">
                            We&rsquo;ll send a verification code 
                            to your registered email
                            to confirm this change.
                        </p>
                        <Button
                            onClick={requestCode}
                            disabled={loading}
                            size="lg"
                            className="w-full"
                        >
                            {loading ? "Sending…" : "Send Verification Code"}
                        </Button>
                    </div>
                )}

                {step === "verify" && (
                    <form onSubmit={verifyCode} className="space-y-6">
                        <OtpInput
                            value={code}
                            onChange={(v) => {
                                setCode(v);
                                setCodeError(undefined);
                            }}
                        />
                        {codeError && (
                            <p className="text-center text-xs 
                            text-rose-500">{codeError}</p>
                        )}
                        <Button type="submit" disabled={loading} 
                                size="lg" className="w-full">
                            {loading ? "Verifying…" : "Verify Code"}
                        </Button>
                        <button
                            type="button"
                            onClick={() => toast.success(
                                "Verification code resent."
                            )}
                            className="block w-full text-center text-xs
                                            font-semibold uppercase tracking-[0.16em]
                                            text-primary underline underline-offset-4"
                        >
                            Resend Code
                        </button>
                    </form>
                )}

                {step === "update" && (
                    <form onSubmit={submit} className="space-y-5">
                        <Field
                            label="Current Password"
                            type="password"
                            value={current}
                            onChange={(e) => {
                                setCurrent(e.target.value);
                                setErrors((er) => ({...er, current: undefined}));
                            }}
                            error={errors.current}
                        />
                        <div>
                            <Field
                                label="New Password"
                                type="password"
                                value={next}
                                onChange={(e) => {
                                    setNext(e.target.value);
                                    setErrors((er) => ({...er, next: undefined}));
                                }}
                                error={errors.next}
                            />
                            <PasswordStrengthMeter password={next}/>
                        </div>
                        <Field
                            label="Confirm New Password"
                            type="password"
                            value={confirm}
                            onChange={(e) => {
                                setConfirm(e.target.value);
                                setErrors((er) => ({...er, confirm: undefined}));
                            }}
                            error={errors.confirm}
                        />
                        <Button type="submit" disabled={loading} size="lg" className="w-full">
                            {loading ? "Updating…" : "Update Password"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
