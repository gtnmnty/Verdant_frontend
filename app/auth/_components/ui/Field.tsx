"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { EyeIcon, EyeOffIcon } from "./Icons";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
  rightSlot?: ReactNode;
}

const inputBase =
  "w-full min-w-0 rounded-md border bg-[#FBF8F2] px-3.5 py-2.5 text-[0.95rem] text-[#15241D] placeholder:text-[#A39C8C] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0";

export const TextField = forwardRef<HTMLInputElement, FieldProps>(function TextField(
  { label, error, hint, rightSlot, className = "", ...rest },
  ref
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6E6859]"
      >
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`${inputBase} ${
            error
              ? "border-[#9B3B3B] focus:border-[#9B3B3B] focus:ring-[#9B3B3B]/25"
              : "border-[#E3DAC9] focus:border-[#B68D40] focus:ring-[#B68D40]/30"
          } ${rightSlot ? "pr-11" : ""} ${className}`}
          {...rest}
        />
        {rightSlot ? (
          <div className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</div>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-[0.78rem] text-[#9B3B3B]">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[0.78rem] text-[#A39C8C]">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

interface PasswordFieldProps extends Omit<FieldProps, "type" | "rightSlot"> {
  showToggleLabel?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ showToggleLabel = "password", ...rest }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <TextField
        ref={ref}
        type={visible ? "text" : "password"}
        rightSlot={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="rounded p-1 text-[#A39C8C] transition-colors hover:text-[#15241D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68D40]/40"
            aria-label={visible ? `Hide ${showToggleLabel}` : `Show ${showToggleLabel}`}
            aria-pressed={visible}
            tabIndex={0}
          >
            {visible ? <EyeOffIcon className="h-[18px] w-[18px]" /> : <EyeIcon className="h-[18px] w-[18px]" />}
          </button>
        }
        {...rest}
      />
    );
  }
);
