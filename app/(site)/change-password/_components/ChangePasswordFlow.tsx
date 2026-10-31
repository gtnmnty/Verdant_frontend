"use client";

import {useEffect, useState, type SubmitEvent} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Button} from "@/app/(site)/auth/_components/ui/Button";
import {Field} from "@/app/(site)/auth/_components/ui/Field";
import {OtpInput} from "@/app/(site)/auth/_components/OtpInput";
import {PasswordStrengthMeter} from "@/app/(site)/auth/_components/PasswordStrengthMeter";
import {useAuth} from "@/context/AuthContext";
import {apiRequest} from "@/utils/apiClient";
import {gqlRequest} from "@/utils/graphqlClient";

type Step = "request" | "verify" | "update";
type Errors = Partial<Record<"current" | "next" | "confirm", string>>;

// Flow (was simulated with timeouts, so no email was ever sent and the password never changed):
//   1. /auth/forgot-password  -> emails a 6-digit code to the signed-in account's address
//   2. /auth/verify-reset-code -> checks the code without using it up
//   3. PUT /v1/users/change-password -> checks the current password, sets the new one, signs out every
//      other device and re-issues this device's refresh cookie, so the user stays signed in here.
export function ChangePasswordFlow() {
    const router = useRouter();
    const {token, loading: authLoading} = useAuth();
    const [email, setEmail] = useState<string | null>(null);
    const [step, setStep] = useState<Step>("request");
    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState<string>();
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (token === null) {
            router.replace("/auth");
            return;
        }
        let cancelled = false;
        gqlRequest<{ me: { email: string } }>(`query ChangePasswordEmail { me { email } }`)
            .then((res) => { if (!cancelled) setEmail(res.me.email); })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Couldn't load your account.");
            });
        return () => { cancelled = true; };
    }, [authLoading, token, router]);

    const sendCode = async (resend = false) => {
        if (!email) return;
        setLoading(true);
        try {
            await apiRequest("/auth/forgot-password", {method: "POST", body: JSON.stringify({email})});
            toast.success(resend ? "A new code was sent to " + email + "." : "Verification code sent to " + email + ".");
            setStep("verify");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Couldn't send the code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const verifyCode = async (ev: SubmitEvent) => {
        ev.preventDefault();
        if (code.length < 6) {
            setCodeError("Enter the 6-digit code we sent you");
            return;
        }
        setCodeError(undefined);
        setLoading(true);
        try {
            await apiRequest("/auth/verify-reset-code", {method: "POST", body: JSON.stringify({email, code})});
            toast.success("Code verified.");
            setStep("update");
        } catch (err) {
            setCodeError(err instanceof Error ? err.message : "Invalid or expired code.");
        } finally {
            setLoading(false);
        }
    };

    const submit = async (ev: SubmitEvent) => {
        ev.preventDefault();
        const e: Errors = {};
        if (!current) e.current = "Enter your current password";
        if (next.length < 8) e.next = "Password must be at least 8 characters";
        if (confirm !== next) e.confirm = "Passwords do not match";
        setErrors(e);
        if (Object.keys(e).length) return;

        setLoading(true);
        try {
            await apiRequest("/v1/users/change-password", {
                method: "PUT",
                body: JSON.stringify({oldPassword: current, newPassword: next}),
            });
            toast.success("Password changed. Other devices have been signed out.");
            router.push("/account");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Couldn't change your password.";
            // A wrong current password is the common case: show it on that field.
            if (/current password/i.test(message)) setErrors({current: message});
            else toast.error(message);
        } finally {
            setLoading(false);
        }
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
                            We&rsquo;ll send a verification code to{" "}
                            {email ? <span className="font-semibold text-on-surface">{email}</span>
                                : "your registered email"}{" "}
                            to confirm this change.
                        </p>
                        <Button
                            onClick={() => sendCode()}
                            disabled={loading || !email}
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
                            onClick={() => sendCode(true)}
                            disabled={loading}
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
