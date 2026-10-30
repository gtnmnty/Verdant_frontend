"use client";

import React, {useRef} from "react";

export function OtpInput({
     value,
     onChange,
     length = 6,
}: {
    value: string;
    onChange: (value: string) => void;
    length?: number;
}) {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const digits = Array.from({length}, (_, i) => value[i] ?? "");

    const setDigit = (index: number, digit: string) => {
        const next = digits.slice();
        next[index] = digit;
        onChange(next.join(""));
    };

    const handleChange = (index: number, raw: string) => {
        const digit = raw.replace(/\D/g, "").slice(-1);
        setDigit(index, digit);
        if (digit && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
        if (!pasted) return;
        e.preventDefault();
        onChange(pasted.slice(0, length));
        const focusIndex = Math.min(pasted.length, length - 1);
        inputsRef.current[focusIndex]?.focus();
    };

    return (
        <div className="flex w-full justify-center gap-[clamp(0.25rem,1.5vw,0.75rem)]">
            {digits.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        inputsRef.current[i] = el;
                    }}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`Digit ${i + 1}`}
                    // Boxes share the row (flex-1, min-w-0) so six always fit the card, capped at 3.25rem.
                    className="aspect-5/6 min-w-0 max-w-[3.25rem] flex-1 rounded-xl border border-border bg-white text-center text-[clamp(1rem,calc(0.85rem+0.8vw),1.25rem)] font-semibold text-on-surface outline-none transition-colors focus:border-primary"
                />
            ))}
        </div>
    );
}
