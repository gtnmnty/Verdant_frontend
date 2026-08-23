"use client";

import {useState, type SubmitEvent} from "react";
import {Button} from "@/app/auth/_components/ui/Button";
import {Checkbox} from "@/app/auth/_components/ui/Checkbox";
import {SocialButtons} from "@/app/auth/_components/SocialButtons";
import {useAuth} from "@/context/AuthContext";
import {apiRequest} from "@/utils/apiClient";

import {toast} from "sonner";
import {Field} from "@/app/auth/_components/ui/Field";

type Errors = { email?: string; password?: string };


export function LoginForm({
  onSwitchToSignup,
  onForgotPassword,
  onSuccess,
}: {
    onSwitchToSignup: () => void;
    onForgotPassword: () => void;
    onSuccess: () => void;
}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);

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
        if (!validate()) {
            toast.error("Please correct the highlighted fields.");
            return;
        }
        setLoading(true);

        try{
            const data = await apiRequest<{ accessToken: string }>("/auth/login", {
                method: "POST",
                body: JSON.stringify( { email, password } )
            })
            setToken(data.accessToken)
            toast.success("Welcome back to Verdant Luxe.");
            onSuccess();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Login failed.");
        } finally {
            setLoading(false)
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <Field
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((er) => ({...er, email: undefined}));
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

            <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? "Logging In…" : "Log In"}
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
