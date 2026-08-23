"use client";

import * as React from "react";
import {useId, useState} from "react";
import {Eye, EyeOff} from "lucide-react";

import {cn} from "@/lib/utils";

type FieldProps = Omit<React.ComponentProps<"input">, "id"> & {
    label: string;
    error?: string;
    id?: string;
};

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
    ({label, error, type = "text", className, id, ...props}, ref) => {
        const generatedId = useId();
        const fieldId = id ?? generatedId;
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === "password";
        const resolvedType = isPassword && showPassword ? "text" : type;

        return (
            <div className="w-full">
                <div className="relative">
                    <input
                        ref={ref}
                        id={fieldId}
                        type={resolvedType}
                        placeholder=" "
                        aria-invalid={!!error}
                        className={cn(
                            "peer w-full rounded-xl border " +
                            "bg-white px-4 pb-2.5 pt-5 text-sm " +
                            "text-on-surface outline-none transition-colors " +
                            "placeholder-shown:pb-4 placeholder-shown:pt-4 " +
                            "focus:pb-2.5 focus:pt-5",
                            isPassword && "pr-11",
                            error
                                ? "border-rose-400 focus:border-rose-500"
                                : "border-border focus:border-primary",
                            className,
                        )}
                        {...props}
                    />
                    <label
                        htmlFor={fieldId}
                        className={cn(
                            "pointer-events-none absolute left-4 top-2.5 text-xs " +
                            "text-on-surface-variant transition-all duration-150",
                            "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 " +
                            "peer-placeholder-shown:text-sm peer-placeholder-shown:text-on-surface-variant/70",
                            "peer-focus:top-2.5 peer-focus:-translate-y-0 peer-focus:text-xs peer-focus:text-primary",
                        )}
                    >
                        {label}
                    </label>
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            tabIndex={-1}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-3 top-1/2 -translate-y-1/2
                            text-on-surface-variant/70 transition-colors
                            hover:text-primary"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4"/>
                            ) : (
                                <Eye className="h-4 w-4"/>
                            )}
                        </button>
                    )}
                </div>
                {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
            </div>
        );
    },
);

Field.displayName = "Field";
