"use client";

import {useState, type SubmitEvent} from "react";
import {Button} from "@/app/(site)/auth/_components/ui/Button";
import {Checkbox} from "@/app/(site)/auth/_components/ui/Checkbox";
import {SocialButtons} from "@/app/(site)/auth/_components/SocialButtons";
import {useAuth} from "@/context/AuthContext";
import {apiRequest} from "@/utils/apiClient";
import {useCooldown} from "@/hooks/useCooldown";
import {Field} from "@/app/(site)/auth/_components/ui/Field";
import {FormAlert} from "@/app/(site)/auth/_components/ui/FormAlert";

type Errors = { email?: string; password?: string };


export function LoginForm({
    onSwitchToSignup,
    onForgotPassword,
    onSuccess,
    notice,
}: {
    onSwitchToSignup: () => void;
    onForgotPassword: () => void;
    onSuccess: () => void;
    // Shown above the form, e.g. "Email verified" after the signup verification step.
    notice?: string;
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string>();
    // 429: keep the button off until the backend accepts another attempt (retrying early extends nothing).
    const cooldown = useCooldown();

    const { setToken } = useAuth();

    const validate = () => {
        const e: Errors = {};
        if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email address";
        if (password.length < 8) e.password = "Password must be at least 8 characters";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = async (ev: SubmitEvent) => {
        ev.preventDefault();
        setFormError(undefined);
        // Invalid fields are already highlighted under each input.
        if (!validate()) return;
        setLoading(true);

        try{
            const data =
                await apiRequest<{ token: string; expiresAt: number }>("/auth/login", {
                    method: "POST",
                    body: JSON.stringify( { email, password } )
            })
            setToken(data.token)
            onSuccess();
        } catch (e) {
            cooldown.startFrom(e);
            setFormError(e instanceof Error ? e.message : "Login failed. Please try again.");
        } finally {
            setLoading(false)
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            {notice && !formError && <FormAlert tone="success">{notice}</FormAlert>}
            <Field
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((er) => ({...er, email: undefined}));
                    setFormError(undefined);
                }}
                error={errors.email}
            />
            <Field
                label="Password"
                type="password"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((er) => ({...er, password: undefined}));
                    setFormError(undefined);
                }}
                error={errors.password}
            />

            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <Checkbox
                        checked={remember}
                        onCheckedChange={(v) => setRemember(v === true)}
                    />
                    Remember me
                </label>
                <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-xs font-semibold text-primary underline underline-offset-4"
                >
                    Forgot password?
                </button>
            </div>

            {formError && <FormAlert>{formError}</FormAlert>}

            <Button type="submit" disabled={loading || cooldown.active} size="lg" className="w-full">
                {loading ? "Logging In…" : cooldown.active ? cooldown.label : "Log In"}
            </Button>

            <SocialButtons/>

            <p className="pt-2 text-center text-sm text-on-surface-variant">
                No account yet?{" "}
                <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="font-semibold text-primary underline underline-offset-4"
                >
                    Create one now
                </button>
            </p>
        </form>
    );
}