"use client";

import { AppleIcon, GoogleIcon } from "./ui/Icons";

interface SocialButtonsProps {
  onSelect: (provider: "google" | "apple") => void;
}

export function SocialButtons({ onSelect }: SocialButtonsProps) {
  return (
    <div>
      <div className="flex items-center gap-3" role="presentation">
        <span className="h-px flex-1 bg-[#E3DAC9]" />
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#A39C8C]">
          Or continue with
        </span>
        <span className="h-px flex-1 bg-[#E3DAC9]" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSelect("google")}
          className="inline-flex min-w-0 items-center justify-center gap-2 rounded-md border border-[#E3DAC9] bg-[#FBF8F2] px-3 py-2.5 text-[0.85rem] font-medium text-[#15241D] transition-colors duration-150 hover:border-[#15241D]/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68D40]/40 focus-visible:ring-offset-1"
        >
          <GoogleIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">Google</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect("apple")}
          className="inline-flex min-w-0 items-center justify-center gap-2 rounded-md border border-[#E3DAC9] bg-[#FBF8F2] px-3 py-2.5 text-[0.85rem] font-medium text-[#15241D] transition-colors duration-150 hover:border-[#15241D]/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68D40]/40 focus-visible:ring-offset-1"
        >
          <AppleIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">Apple</span>
        </button>
      </div>
    </div>
  );
}
