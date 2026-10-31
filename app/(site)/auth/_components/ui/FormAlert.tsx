import type {ReactNode} from "react";
import {AlertCircle, CheckCircle2} from "lucide-react";

// Inline message for the auth forms. Used instead of toasts so the feedback sits next to the form the user
// is filling in (and survives the redirects that follow a login or verification).
export function FormAlert({tone = "error", children}: { tone?: "error" | "success"; children: ReactNode }) {
    const Icon = tone === "error" ? AlertCircle : CheckCircle2;
    return (
        <div
            role={tone === "error" ? "alert" : "status"}
            className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-snug ${
                tone === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-champagne-gold/40 bg-champagne-gold/10 text-primary"
            }`}
        >
            <Icon className="mt-0.5 h-4 w-4 shrink-0"/>
            <p>{children}</p>
        </div>
    );
}
