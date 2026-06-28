import type { ReactNode } from "react";

function Seal({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#B68D40]/70 font-serif text-[0.95rem] tracking-[0.04em] text-[#B68D40] ${className}`}
      aria-hidden="true"
    >
      VL
    </span>
  );
}

function BrandPanel() {
  return (
    <div
      className="relative hidden w-full max-w-[420px] flex-col justify-between overflow-hidden rounded-2xl bg-[#15241D] p-10 text-[#F7F2E8] lg:flex"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(247,242,232,0.16) 1px, transparent 0)",
        backgroundSize: "18px 18px",
      }}
    >
      <div>
        <div className="flex items-center gap-3">
          <Seal />
          <div className="font-serif text-[1.05rem] leading-tight tracking-[0.02em]">
            Verdant Luxe
          </div>
        </div>
        <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#B68D40]">
          Private Members&apos; Club
        </p>
      </div>

      <blockquote className="border-l border-[#B68D40]/50 pl-5">
        <p className="font-serif text-[1.35rem] leading-snug text-[#F7F2E8]/95">
          Quiet luxury is never loud about it.
        </p>
        <p className="mt-3 max-w-[280px] text-[0.85rem] leading-relaxed text-[#F7F2E8]/60">
          Every detail of your stay, your table, and your time is considered before you ask.
        </p>
      </blockquote>

      <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[#F7F2E8]/40">
        Est. for those who notice the difference
      </p>
    </div>
  );
}

interface AuthShellProps {
  eyebrow: string;
  heading: string;
  blurb?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
}

export function AuthShell({ eyebrow, heading, blurb, headerExtra, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#F7F2E8] px-4 py-10 sm:px-6">
      <div className="flex w-full max-w-[920px] items-stretch justify-center gap-6">
        <BrandPanel />

        <div className="flex min-w-0 w-full max-w-[440px] flex-col">
          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <div className="flex items-center gap-2.5">
              <Seal className="h-9 w-9 text-[0.8rem]" />
              <span className="font-serif text-[1rem] tracking-[0.02em] text-[#15241D]">
                Verdant Luxe
              </span>
            </div>
          </div>

          <div className="w-full rounded-2xl border border-[#E3DAC9]/70 bg-white p-6 shadow-[0_24px_48px_-24px_rgba(21,36,29,0.22)] sm:p-9">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#B68D40]">
                  {eyebrow}
                </p>
                <h1 className="mt-1.5 font-serif text-[1.6rem] leading-tight text-[#15241D] sm:text-[1.75rem]">
                  {heading}
                </h1>
                {blurb ? (
                  <p className="mt-1.5 text-[0.875rem] leading-relaxed text-[#6E6859]">{blurb}</p>
                ) : null}
              </div>
              {headerExtra}
            </div>

            {children}
          </div>

          <p className="mt-6 text-center text-[0.75rem] text-[#A39C8C]">
            © {new Date().getFullYear()} Verdant Luxe. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
