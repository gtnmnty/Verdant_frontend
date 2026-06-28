"use client";

import { useEffect, useRef } from "react";
import { XIcon } from "./ui/Icons";
import { Button } from "./ui/Button";

interface TermsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "Terms of Service",
    body:
      "Membership grants you access to Verdant Luxe's curated booking platform, concierge support, and partner venues. By creating an account you agree to use these services honestly and to keep your login details confidential.",
  },
  {
    title: "Privacy Policy",
    body:
      "We collect only what's needed to personalize your experience — contact details, stay and dining preferences, and basic device information. We never sell member data, and you can request a copy or deletion of your records at any time.",
  },
  {
    title: "Refund Policy",
    body:
      "Reservations cancelled at least 48 hours before arrival are fully refundable. Later cancellations may be credited toward a future visit at the discretion of the venue, depending on its individual booking terms.",
  },
  {
    title: "Booking Policy",
    body:
      "Bookings are confirmed once you receive a written confirmation from our concierge team. Peak-season reservations may require a deposit, which is applied to your final bill upon arrival.",
  },
  {
    title: "Data Collection Summary",
    body:
      "In short: name, contact details, and preferences for service personalization; device and usage data for security; payment details handled by our PCI-compliant processor and never stored on our servers.",
  },
];

export function TermsDialog({ isOpen, onClose, onAccept }: TermsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    lastFocused.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const node = dialogRef.current;
    const focusable = node?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1813]/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-dialog-title"
        className="flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-[#FBF8F2] shadow-[0_32px_64px_-24px_rgba(14,24,19,0.45)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E3DAC9] px-6 py-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#B68D40]">
              Membership Agreement
            </p>
            <h2 id="terms-dialog-title" className="mt-1 font-serif text-[1.3rem] text-[#15241D]">
              Terms &amp; Privacy
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-1.5 text-[#A39C8C] transition-colors hover:bg-[#15241D]/5 hover:text-[#15241D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B68D40]/40"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <ul className="space-y-5">
            {SECTIONS.map((section) => (
              <li key={section.title}>
                <h3 className="text-[0.95rem] font-semibold text-[#15241D]">{section.title}</h3>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-[#6E6859]">
                  {section.body}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[0.72rem] text-[#A39C8C]">
            This is a summary for demonstration purposes and does not constitute a binding legal
            agreement.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-[#E3DAC9] px-6 py-5 sm:flex-row">
          <Button variant="secondary" type="button" onClick={onClose} className="sm:order-1">
            Close
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="sm:order-2"
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
