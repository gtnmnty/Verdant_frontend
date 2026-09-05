"use client";

import {useState, type ReactNode} from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function FieldShell({ error, children }: { error?: string; children: ReactNode; }) {
    return (
        <div className="w-full">
            {children}
            {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
        </div>
    );
}

function FloatingLabel({label, active}: { label: string; active: boolean }) {
    return (
        <span
            className={`pointer-events-none absolute left-4 transition-all duration-150 ${
                active
                    ? "top-2.5 text-[10px] font-semibold uppercase tracking-widest text-primary"
                    : "top-1/2 -translate-y-1/2 text-sm text-on-surface-variant/70"
            }`}
        >
      {label}
    </span>
    );
}

type BaseProps = {
    label: string;
    value: string;
    error?: string;
};

/** Single-line text / email input with a label that floats to the top-left on focus or value. */
export function FloatingInput({
    label, value, error, onChange, type = "text",}: BaseProps & {
    onChange: (value: string) => void; type?: "text" | "email" | "tel";
}) {
    const [focused, setFocused] = useState(false);
    const active = focused || value.length > 0;

    return (
        <FieldShell error={error}>
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={`w-full rounded-xl border bg-white px-4 
                    pb-2.5 pt-5 text-sm text-on-surface outline-none 
                    transition-colors ${
                        error ? "border-rose-400 " +
                            "focus:border-rose-500" : 
                            "border-border focus:border-primary"
                    }`}
                />
                <FloatingLabel label={label} active={active}/>
            </div>
        </FieldShell>
    );
}

/** Multi-line textarea with the same floating-label behavior. */
export function FloatingTextarea({
     label, value, error, onChange, rows = 5,
}: BaseProps & { onChange: (value: string) => void; rows?: number
}) {
    const [focused, setFocused] = useState(false);
    const active = focused || value.length > 0;

    return (
        <FieldShell error={error}>
            <div className="relative">
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={rows}
            className={`w-full resize-none rounded-xl border 
            bg-white px-4 pb-3 pt-6 text-sm text-on-surface 
            outline-none transition-colors ${
                error ? "border-rose-400 " +
                    "focus:border-rose-500" : 
                    "border-border focus:border-primary"
            }`}
        />
                <FloatingLabel label={label} active={active}/>
            </div>
        </FieldShell>
    );
}

/** Date input — the label floats up on focus or once a date is picked, since native date inputs render their own placeholder. */
export function FloatingDateInput({
    label, value, error, onChange,
}: BaseProps & { onChange: (value: string) => void }) {
    const [focused, setFocused] = useState(false);
    const active = focused || value.length > 0;

    return (
        <FieldShell error={error}>
            <div className="relative">
                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={`w-full rounded-xl border 
                    bg-white px-4 pb-2.5 pt-5 
                    text-sm text-on-surface 
                    outline-none transition-colors ${
                        error ? "border-rose-400 " +
                            "focus:border-rose-500" : 
                            "border-border focus:border-primary"
                    }`}
                />
                <FloatingLabel label={label} active={active}/>
            </div>
        </FieldShell>
    );
}

/** shadcn Select — the label floats up once the dropdown opens or a value is chosen. */
export function FloatingSelect({
   label, value, error, onChange, options,
}: BaseProps & { onChange: (value: string) => void; options: readonly string[]
}) {
    const [open, setOpen] = useState(false);
    const active = open || value.length > 0;

    return (
        <FieldShell error={error}>
            <div className="relative">
                <Select value={value} onValueChange={onChange} onOpenChange={setOpen}>
                    <SelectTrigger
                        className={`w-full pb-2.5 pt-5 ${
                            error ? "border-rose-400" : ""
                        }`}
                    >
                        <SelectValue placeholder=""/>
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                                {opt}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FloatingLabel label={label} active={active}/>
            </div>
        </FieldShell>
    );
}
