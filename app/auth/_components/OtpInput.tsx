"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  error?: boolean;
  describedById?: string;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
  describedById,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  function setDigit(index: number, digit: string) {
    const next = [...value];
    next[index] = digit;
    onChange(next);
  }

  function handleChange(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");

    if(digits.length === 0){
      setDigit(index, "")
      return;
    }

    if(digits.length > 1){
      const next = [...value];
      let cursor = index;
      for (const digit of digits) {
        if (cursor >= length) break;
        next[cursor] = digit;
        cursor +=1
      }
      onChange(next)
      inputsRef.current[Math.min(cursor, length - 1)]?.focus()
      return;
    }

    setDigit(index, digits);
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      if (value[index]) {
        setDigit(index, "");
        return;
      }
      if (index > 0) {
        event.preventDefault();
        inputsRef.current[index - 1]?.focus();
        setDigit(index - 1, "");
      }
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").split("");
    if (digits.length === 0) return;
    event.preventDefault();

    const next = [...value];
    let cursor = index;
    for (const digit of digits) {
      if (cursor >= length) break;
      next[cursor] = digit;
      cursor += 1;
    }
    onChange(next);
    const focusIndex = Math.min(cursor, length - 1);
    inputsRef.current[focusIndex]?.focus();
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3" role="group" aria-label="One-time passcode">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] ?? ""}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-describedby={describedById}
          aria-invalid={error || undefined}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          className={`h-12 flex-1 min-w-0 max-w-[52px] rounded-md border bg-[#FBF8F2] text-center text-[1.15rem] font-medium text-[#15241D] transition-colors duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 sm:h-14 sm:text-[1.3rem] ${
            error
              ? "border-[#9B3B3B] focus:border-[#9B3B3B] focus:ring-[#9B3B3B]/25"
              : "border-[#E3DAC9] focus:border-[#B68D40] focus:ring-[#B68D40]/30"
          }`}
        />
      ))}
    </div>
  );
}
