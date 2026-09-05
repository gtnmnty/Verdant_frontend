"use client";

import {toast} from "sonner";
import {Button} from "@/app/(site)/auth/_components/ui/Button";
import {GoogleIcon, AppleIcon} from "@/app/(site)/auth/_components/ui/Icons";

export function SocialButtons() {
    return (
        <div className="space-y-3">
            <div className="relative py-1 text-center">
        <span
            className="relative bg-surface-lowest px-3 text-[10px]
            font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
          Or continue with
        </span>
                <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-blush/60"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => toast.success("Redirecting to Google sign-in…")}
                    className="w-full border-border text-on-surface"
                >
                    <GoogleIcon/>
                    Google
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => toast.success("Redirecting to Apple sign-in…")}
                    className="w-full border-border text-on-surface"
                >
                    <AppleIcon/>
                    Apple
                </Button>
            </div>
        </div>
    );
}
