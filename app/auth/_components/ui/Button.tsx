"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { SpinnerIcon } from "./Icons";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

const base =
  "inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-[0.8rem] font-medium uppercase tracking-[0.12em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#15241D] text-[#F7F2E8] shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_8px_20px_-8px_rgba(21,36,29,0.55)] hover:bg-[#1C2F24] active:bg-[#0F1B15] focus-visible:ring-[#B68D40] focus-visible:ring-offset-[#FBF8F2]",
  secondary:
    "border border-[#15241D]/20 bg-transparent text-[#15241D] hover:border-[#15241D]/40 hover:bg-[#15241D]/[0.04] focus-visible:ring-[#B68D40] focus-visible:ring-offset-[#FBF8F2]",
  ghost:
    "bg-transparent text-[#6E6859] hover:text-[#15241D] focus-visible:ring-[#B68D40] focus-visible:ring-offset-[#FBF8F2]",
};

export function Button({
  variant = "primary",
  isLoading = false,
  loadingLabel,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <>
          <SpinnerIcon className="h-4 w-4" />
          <span>{loadingLabel ?? "Please wait"}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
