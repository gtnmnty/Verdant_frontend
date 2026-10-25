"use client";

import {useEffect, useRef, useState, type FormEvent} from "react";
import Link from "next/link";
import {AuthShell} from "@/app/(site)/auth/_components/AuthShell";
import {AuthCard} from "@/app/(site)/auth/_components/AuthCard";
import {Button} from "@/app/(site)/auth/_components/ui/Button";
import {Field} from "@/app/(site)/auth/_components/ui/Field";
import {PasswordStrengthMeter} from "@/app/(site)/auth/_components/PasswordStrengthMeter";
import {CheckCircle2} from "@/app/(site)/auth/_components/ui/Icons";
import {gqlRequest} from "@/utils/graphqlClient";

// Page for the link staff trigger from the admin panel (new account invite or "Reset password"):
//   /reset-password?token=<one-time token>
// Flow: read the token from the URL -> remove it from the address bar -> user picks a password ->
// redeemPasswordReset(token, newPassword). The backend also marks the email verified, so the user can
// log in straight after.
const REDEEM_MUTATION = `
    mutation RedeemPasswordReset($token: String!, $newPassword: String!) {
        redeemPasswordReset(token: $token, newPassword: $newPassword)
    }
`;

// Same rule as the backend's PasswordPolicy. The backend stays the authority; this only saves a round trip.
const PASSWORD_RULE = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const PASSWORD_MESSAGE =
    "Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, and a number";

type Errors = { password?: string; confirm?: string };

export function ResetPasswordFlow() {
    // Held in a ref, not state: it must survive re-renders and React strict-mode's double effect run,
    // but it should never be rendered or stored anywhere.
    const tokenRef = useRef<string | null>(null);
    const [checked, setChecked] = useState(false);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [linkInvalid, setLinkInvalid] = useState(false);

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get("token");
        if (token) {
            tokenRef.current = token;
            // Remove the token from the address bar so it doesn't stay in history, get copied from the
            // URL, or leak through a screenshot. Tradeoff: reloading the page afterwards shows the
            // "invalid link" panel, and the user has to reopen the email link.
            window.history.replaceState(null, "", window.location.pathname);
        }
        setChecked(true);
    }, []);

    const onSubmit = async (ev: FormEvent) => {
        ev.preventDefault();
        const e: Errors = {};
        if (!PASSWORD_RULE.test(password)) e.password = PASSWORD_MESSAGE;
        if (confirm !== password) e.confirm = "Passwords do not match";
        setErrors(e);
        if (Object.keys(e).length || !tokenRef.current) return;

        setLoading(true);
        try {
            await gqlRequest(REDEEM_MUTATION, {token: tokenRef.current, newPassword: password});
            tokenRef.current = null; // single use: nothing left to retry with
            setSuccess(true);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to set password.";
            if (/invalid or expired/i.test(message)) {
                // Expired, already used, or never valid: the backend deliberately doesn't say which.
                tokenRef.current = null;
                setLinkInvalid(true);
            } else {
                // Password rule, rate limit, locked account...: the link may still be good, so stay on the form.
                setErrors({password: message});
            }
        } finally {
            setLoading(false);
        }
    };

    if (!checked) return null;

    if (success) {
        return (
            <AuthShell>
                <AuthCard eyebrow="All Set" title="Password Set">
                    <div className="flex flex-col items-center gap-4 py-4 text-center">
                        <CheckCircle2 className="h-14 w-14 text-primary"/>
                        <p className="max-w-xs text-sm text-on-surface-variant">
                            Your password has been saved. You can now log in.
                        </p>
                        <Link href="/auth" className="mt-2 w-full">
                            <Button size="lg" className="w-full">Go to Log In</Button>
                        </Link>
                    </div>
                </AuthCard>
            </AuthShell>
        );
    }

    if (linkInvalid || !tokenRef.current) {
        return (
            <AuthShell>
                <AuthCard eyebrow="Link Problem" title="This Link Can't Be Used">
                    <div className="mx-auto max-w-sm space-y-4 text-center text-sm text-on-surface-variant">
                        <p>The link is invalid, has expired, or has already been used.</p>
                        <p>Ask an admin to send you a new link.</p>
                        <Link href="/auth" className="block pt-2">
                            <Button size="lg" variant="outline" className="w-full">Back to Log In</Button>
                        </Link>
                    </div>
                </AuthCard>
            </AuthShell>
        );
    }

    return (
        <AuthShell>
            <AuthCard
                eyebrow="Account Setup"
                title="Choose a Password"
                subtitle="Pick a password for your Verdant Luxe account."
            >
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
                        {loading ? "Saving…" : "Set Password"}
                    </Button>
                </form>
            </AuthCard>
        </AuthShell>
    );
}
