"use client";

import { CheckIcon } from "./ui/Icons";
import { getMetRequirementIds, getPasswordStrength, passwordRequirements } from "../lib/validation";

const SEGMENT_COLORS = ["#9B3B3B", "#C08A3E", "#B68D40", "#6F9468", "#2F5233"];

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label } = getPasswordStrength(password);
  const metIds = getMetRequirementIds(password);
  const activeColor = SEGMENT_COLORS[Math.max(score, password.length > 0 ? 1 : 0)];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6E6859]">
            Password strength
          </span>
          {password.length > 0 ? (
            <span className="text-[0.78rem] font-medium" style={{ color: activeColor }}>
              {label}
            </span>
          ) : null}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5" role="presentation">
          {Array.from({ length: 4 }).map((_, index) => {
            const filled = password.length > 0 && index <= score;
            return (
              <span
                key={index}
                className="h-1.5 rounded-full transition-colors duration-300"
                style={{ backgroundColor: filled ? activeColor : "#E3DAC9" }}
              />
            );
          })}
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {passwordRequirements.map((req) => {
          const met = metIds.has(req.id);
          return (
            <li
              key={req.id}
              className={`flex items-center gap-1.5 text-[0.78rem] transition-colors duration-200 ${
                met ? "text-[#2F5233]" : "text-[#A39C8C]"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
                  met ? "border-[#2F5233] bg-[#2F5233]" : "border-[#D8D0BD]"
                }`}
              >
                {met ? <CheckIcon className="h-2.5 w-2.5 text-white" /> : null}
              </span>
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
