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

// Shared box height/shape for every field in the form, text inputs included.
const FIELD_BASE =
    "w-full h-[56px] rounded-xl border bg-white px-4 pb-2.5 pt-5 text-sm text-on-surface outline-none transition-colors";
const FIELD_BORDER = (error?: string) =>
    error ? "border-rose-400 focus:border-rose-500" : "border-border focus:border-primary";

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
                    className={`${FIELD_BASE} ${FIELD_BORDER(error)}`}
                />
                <FloatingLabel label={label} active={active}/>
            </div>
        </FieldShell>
    );
}

/**
 * Multi-line textarea. Like the date field, the label stays floated at
 * top-left always — a vertically-centered label looks wrong once the box
 * is tall (rows=5+), so there's no "resting center" state here.
 */
export function FloatingTextarea({
                                     label, value, error, onChange, rows = 5,
                                 }: BaseProps & { onChange: (value: string) => void; rows?: number
}) {
    return (
        <FieldShell error={error}>
            <div className="relative">
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className={`w-full resize-none rounded-xl border 
            bg-white px-4 pb-3 pt-6 text-sm text-on-surface 
            outline-none transition-colors ${FIELD_BORDER(error)}`}
        />
                <FloatingLabel label={label} active={true}/>
            </div>
        </FieldShell>
    );
}

/**
 * Date input. Native date inputs always render a locale placeholder
 * (dd/mm/yyyy) that JS can't detect, so there's no real "empty" state to
 * protect — the label stays floated permanently, same final position as
 * an active FloatingInput, so it lines up with the rest of the form.
 */
export function FloatingDateInput({
                                      label, value, error, onChange,
                                  }: BaseProps & { onChange: (value: string) => void }) {
    return (
        <FieldShell error={error}>
            <div className="relative">
                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${FIELD_BASE} ${FIELD_BORDER(error)}`}
                />
                <FloatingLabel label={label} active={true}/>
            </div>
        </FieldShell>
    );
}

// shadcn Select — the label floats up once the dropdown opens or a value is chosen. */
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
                        className={`
                            flex! h-14! w-full! items-end! justify-between! gap-2!
                            rounded-xl! border! bg-white! px-4! pb-2.5! pt-5!
                            text-sm! text-on-surface! shadow-none!
                            ${error ? "border-rose-400!" : "border-border!"}
                        `}
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