"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { CheckIcon } from "./Icons";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> {
  label: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, className = "", ...rest },
  ref
) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="group flex cursor-pointer items-start gap-2.5 select-none">
        <span className="relative mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={`peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-[4px] border border-[#C9BFA8] bg-[#FBF8F2] transition-colors checked:border-[#15241D] checked:bg-[#15241D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68D40]/40 focus-visible:ring-offset-1 ${className}`}
            {...rest}
          />
          <CheckIcon className="pointer-events-none relative h-3 w-3 text-[#F7F2E8] opacity-0 transition-opacity peer-checked:opacity-100" />
        </span>
        <span className="text-[0.85rem] leading-snug text-[#4A4538] group-hover:text-[#15241D]">
          {label}
        </span>
      </label>
      {error ? <p className="pl-[26px] text-[0.78rem] text-[#9B3B3B]">{error}</p> : null}
    </div>
  );
});
