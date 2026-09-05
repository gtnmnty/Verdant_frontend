"use client";

import {useState, type SubmitEvent} from "react";
import {Button} from "@/app/(site)/auth/_components/ui/Button";
import {Field} from "@/app/(site)/auth/_components/ui/Field";
import {PasswordStrengthMeter} from "@/app/(site)/auth/_components/PasswordStrengthMeter";
import {CheckCircle2} from "@/app/(site)/auth/_components/ui/Icons";
import {apiRequest} from "@/utils/apiClient";
import {toast} from "sonner";

type Errors = { password?: string; confirm?: string };

export function NewPasswordForm({ email, code, onDone }: { email: string; code: string; onDone: () => void; }) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const onSubmit = async (ev: SubmitEvent) => {
        ev.preventDefault();
        const e: Errors = {};
        if (password.length < 8) e.password = "Password must be at least 8 characters";
        if (confirm !== password) e.confirm = "Passwords do not match";
        setErrors(e);
        if (Object.keys(e).length) return;
        setLoading(true);
        try {
            await apiRequest("/auth/reset-password", {
                method: "POST",
                body: JSON.stringify({ email, verificationCode: code, newPassword: password })
            });
            setSuccess(true);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
                <CheckCircle2 className="h-14 w-14 text-primary"/>
                <h2 className="font-display text-2xl text-primary">
                    Password Reset Complete
                </h2>
                <p className="max-w-xs text-sm text-on-surface-variant">
                    Your password has been updated. You may now log in with your new
                    credentials.
                </p>
                <Button onClick={onDone} size="lg" className="mt-2 w-full">
                    Go to Log In
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div>
                <Field
                    label="New Password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((er) => ({...er, password: undefined}));
                    }}
                    error={errors.password}
                />
                <PasswordStrengthMeter password={password}/>
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
                {loading ? "Updating…" : "Set New Password"}
            </Button>
        </form>
    );
}
