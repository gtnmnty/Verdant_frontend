"use client";

import {useRef} from "react";

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
        <div className="flex justify-center gap-2 sm:gap-3">
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
                    className="h-12 w-10 rounded-xl border border-border bg-white text-center text-lg font-semibold text-on-surface outline-none transition-colors focus:border-primary sm:h-14 sm:w-12"
                />
            ))}
        </div>
    );
}
