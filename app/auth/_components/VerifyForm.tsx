"use client";

import {useState, type SubmitEvent} from "react";
import {toast} from "sonner";
import {Button} from "@/app/auth/_components/ui/Button";
import {OtpInput} from "@/app/auth/_components/OtpInput";
import {apiRequest} from "@/utils/apiClient";

export function VerifyForm({ email, onVerified }: { email: string; onVerified: (code: string) => void; }) {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState(false);

    const authPost =
        async (path: string, body: object, successMsg: string, onSuccess?: () => void) => {
            setLoading(true);
            try {
                await apiRequest(path, { method: "POST", body: JSON.stringify(body) });
                toast.success(successMsg);
                onSuccess?.();
            } catch (e) {
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

        await authPost("/auth/verify", {email, verificationCode: code}, "Code verified.", () => {
            onVerified(code);
        });
    };

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

            <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? "Verifying…" : "Verify Code"}
            </Button>

            <button
                type="button"
                onClick={() => authPost("/auth/resend", {email}, "Verification code resent.")}
                className="block w-full text-center text-xs font-semibold uppercase tracking-[0.16em]
                text-primary underline underline-offset-4"
            >
                Resend Code
            </button>
        </form>
    );
}
