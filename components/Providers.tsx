"use client";

import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import type { CSSProperties, ReactNode } from "react";

// Toaster is mounted once here so every toast.success/error call in the app has somewhere to render.
// Unstyled + site tokens: ivory card, blush border, serif title and a coloured edge per type, instead of
// sonner's stock rich colours.
const TOAST_CLASSES = {
  toast:
    "relative flex w-full items-start gap-3.5 rounded-2xl border border-blush/60 border-l-4 " +
    "bg-surface-lowest py-4 pl-5 pr-11 font-sans text-on-surface " +
    "shadow-[0_22px_45px_-20px_rgba(15,23,42,0.35)]",
  title: "font-display text-[15px] leading-snug tracking-tight text-primary",
  description: "mt-1 text-[13px] leading-relaxed text-on-surface-variant",
  content: "min-w-0 flex-1",
  icon: "mt-0.5 shrink-0 [&>svg]:size-5",
  success: "border-l-champagne-gold [&_[data-icon]]:text-champagne-gold",
  info: "border-l-primary [&_[data-icon]]:text-primary",
  warning: "border-l-soft-rose [&_[data-icon]]:text-soft-rose",
  error: "border-l-destructive [&_[data-icon]]:text-destructive",
  default: "border-l-blush",
  closeButton:
    "absolute right-3 top-3 grid size-6 place-items-center rounded-full text-on-surface-variant " +
    "transition-colors hover:bg-blush/40 hover:text-primary [&>svg]:size-3.5",
  actionButton:
    "ml-auto shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-semibold uppercase " +
    "tracking-[0.14em] text-primary-foreground",
  cancelButton:
    "shrink-0 rounded-full border border-blush/60 px-3.5 py-1.5 text-[11px] font-semibold uppercase " +
    "tracking-[0.14em] text-on-surface-variant",
};

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-center"
        closeButton
        gap={12}
        offset={{ top: 88 }}
        mobileOffset={{ top: 72 }}
        style={{ "--width": "min(92vw, 420px)" } as CSSProperties}
        toastOptions={{ unstyled: true, classNames: TOAST_CLASSES }}
      />
    </AuthProvider>
  );
}
