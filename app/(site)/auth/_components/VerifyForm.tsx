"use client";

import {useState, type SubmitEvent} from "react";
import {toast} from "sonner";
import {Button} from "@/app/(site)/auth/_components/ui/Button";
import {OtpInput} from "@/app/(site)/auth/_components/OtpInput";
import {apiRequest} from "@/utils/apiClient";
import {useCooldown} from "@/hooks/useCooldown";

// "signup" checks the account-activation code; "reset" checks the forgot-password code
// (a separate code on the backend — /auth/verify rejects already-verified accounts).
type Purpose = "signup" | "reset";

export function VerifyForm({ email, purpose, onVerified }: {
    email: string;
    purpose: Purpose;
    onVerified: (code: string) => void;
}) {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState(false);
    // 429: keep the button off until the backend accepts another attempt (retrying early extends nothing).
    const cooldown = useCooldown();

    const authPost =
        async (path: string, body: object, successMsg: string, onSuccess?: () => void) => {
            setLoading(true);
            try {
                await apiRequest(path, { method: "POST", body: JSON.stringify(body) });
                toast.success(successMsg);
                onSuccess?.();
            } catch (e) {
                cooldown.startFrom(e);
                toast.error(e instanceof Error ? e.message : "Something went wrong.");
            } finally {
                setLoading(false);
            }
    };


    const onSubmit = async (ev: SubmitEvent) => {
        ev.preventDefault();
        if (code.length < 6) {
            setError("Enter the 6-digit code we sent you");
            return;
        }

        const [path, body] = purpose === "reset"
            ? ["/auth/verify-reset-code", {email, code}]
            : ["/auth/verify", {email, verificationCode: code}];

        await authPost(path, body, "Code verified.", () => {
            onVerified(code);
        });
    };

    const onResend = () => purpose === "reset"
        ? authPost("/auth/forgot-password", {email}, "A new reset code was sent.")
        : authPost("/auth/resend", {email}, "Verification code resent.");

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <p className="text-center text-sm text-on-surface-variant">
                We sent a verification code to{" "}
                <span className="font-semibold text-primary">{email || "your email"}</span>
            </p>

            <OtpInput
                value={code}
                onChange={(v) => {
                    setCode(v);
                    setError(undefined);
                }}
            />
            {error && <p className="text-center text-xs text-rose-500">{error}</p>}

            <Button type="submit" disabled={loading || cooldown.active} size="lg" className="w-full">
                {loading ? "Verifying…" : cooldown.active ? cooldown.label : "Verify Code"}
            </Button>

            <button
                type="button"
                onClick={onResend}
                disabled={loading || cooldown.active}
                className="block w-full text-center text-xs font-semibold uppercase tracking-[0.16em]
                text-primary underline underline-offset-4 disabled:no-underline disabled:opacity-50"
            >
                {cooldown.active ? cooldown.label : "Resend Code"}
            </button>
        </form>
    );
}
