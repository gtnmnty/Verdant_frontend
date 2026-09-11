"use client";

import {useState, type SubmitEvent} from "react";
import {toast} from "sonner";
import {Button} from "@/app/(site)/auth/_components/ui/Button";
import {Field} from "@/app/(site)/auth/_components/ui/Field";
import {apiRequest} from "@/utils/apiClient";

export function ForgotPasswordForm({
   onSwitchToLogin,
   onCodeSent,
}: {
    onSwitchToLogin: () => void;
    onCodeSent: (email: string) => void;
}) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (ev: SubmitEvent) => {
        ev.preventDefault();

        // Validate basic email format before dispatching request
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setError("Enter a valid email address");
            return;
        }

        setError(undefined);
        setLoading(true);

        try {
            // Flow: Dispatch password reset code request to backend REST controller
            await apiRequest("/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email }),
            });

            // Notify user and trigger parent callback to advance auth stepper
            toast.success("If that email exists, a reset code was sent.");
            onCodeSent(email);
        } catch (e) {
            // Display failure toast if backend rejects request or network fails
            toast.error(e instanceof Error ? e.message : "Failed to send code.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <Field
                label="Registered Email"
                type="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    setError(undefined);
                }}
                error={error}
            />
            <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? "Sending…" : "Send Verification Code"}
            </Button>
            <p className="pt-2 text-center text-sm text-on-surface-variant">
                Remembered your password?{" "}
                <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="font-semibold text-primary underline underline-offset-4"
                >
                    Log in here
                </button>
            </p>
        </form>
    );
}
