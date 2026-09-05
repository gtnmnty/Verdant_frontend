"use client";

import {useState, type SubmitEvent} from "react";
import {toast} from "sonner";
import {Button} from "@/app/(site)/auth/_components/ui/Button";
import {Checkbox} from "@/app/(site)/auth/_components/ui/Checkbox";
import {Field} from "@/app/(site)/auth/_components/ui/Field";
import {PasswordStrengthMeter} from "@/app/(site)/auth/_components/PasswordStrengthMeter";
import {SocialButtons} from "@/app/(site)/auth/_components/SocialButtons";
import {TermsDialog} from "@/app/(site)/auth/_components/TermsDialog";
import {apiRequest} from "@/utils/apiClient";

interface FormState {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    agree: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

const INITIAL: FormState = {
    fullName: "",
    phone: "",
    email: "",
    password: "",
    agree: false,
};

export function SignUpForm({
   onSwitchToLogin,
   onSuccess,
}: {
    onSwitchToLogin: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState<FormState>(INITIAL);
    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((f) => ({...f, [key]: value}));
        setErrors((e) => ({...e, [key]: undefined}));
    };

    const validate = () => {
        const e: Errors = {};
        if (!form.fullName.trim()) e.fullName = "Full name is required";
        if (!/^\+?[\d\s()-]{7,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
        if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
        if (form.password.length < 8) e.password = "Password must be at least 8 characters";
        if (!form.agree) e.agree = "You must agree to the Terms and Conditions";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit =  async (ev: SubmitEvent) => {
        ev.preventDefault();
        if (!validate()) {
            toast.error("Please input correct info in respective fields.");
            return;
        }
        setLoading(true);
        try{
            await apiRequest("/auth/signup", {
                method: "POST",
                body: JSON.stringify({
                    fullName: form.fullName,
                    email: form.email,
                    phone: form.phone,
                    password: form.password,
                })
            })
            toast.success("Account created! Check your email to verify.");
            onSuccess(); // takes user to login
        }
        catch (e) {
            toast.error(e instanceof Error ? e.message : "Account creation failed.");
        } finally {
            setLoading(false)
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
                <Field
                    label="Full Name"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    error={errors.fullName}
                />
                <Field
                    label="Phone Number"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    error={errors.phone}
                />
            </div>

            <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                error={errors.email}
            />

            <div>
                <Field
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    error={errors.password}
                />
                <PasswordStrengthMeter password={form.password}/>
            </div>

            <div>
                <label className="flex items-start gap-3 text-sm text-on-surface-variant">
                    <Checkbox
                        checked={form.agree}
                        onCheckedChange={(v) => set("agree", v === true)}
                        className="mt-0.5"
                    />
                    <span>
            I agree to the{" "}
                        <TermsDialog>
              <button
                  type="button"
                  className="text-primary underline underline-offset-4"
              >
                Terms and Conditions
              </button>
            </TermsDialog>
          </span>
                </label>
                {errors.agree && <p className="mt-1 text-xs text-rose-500">{errors.agree}</p>}
            </div>

            <Button type="submit" disabled={loading} size="lg" className="w-full">
                {loading ? "Creating Account…" : "Sign Up"}
            </Button>

            <SocialButtons/>

            <p className="pt-2 text-center text-sm text-on-surface-variant">
                Already have an account?{" "}
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
