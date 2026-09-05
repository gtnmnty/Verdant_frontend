import {Check} from "lucide-react";
import type {CheckoutStep} from "@/app/(site)/checkout/_components/data";

const STEPS: { id: CheckoutStep; label: string }[] = [
    {id: "shipping", label: "Shipping"},
    {id: "payment", label: "Payment"},
    {id: "review", label: "Review"},
];

export function CheckoutStepper({current}: { current: CheckoutStep }) {
    const currentIndex = STEPS.findIndex((step) => step.id === current);

    return (
        <ol aria-label="Checkout progress" className="flex items-center">
            {STEPS.map((step, index) => {
                const isComplete = index < currentIndex;
                const isActive = index === currentIndex;

                return (
                    <li key={step.id} className="flex flex-1 items-center last:flex-none">
                        <div className="flex items-center gap-2 sm:gap-2.5">
              <span
                  aria-current={isActive ? "step" : undefined}
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors ${
                      isActive
                          ? "bg-primary text-primary-foreground"
                          : isComplete
                              ? "bg-champagne-gold text-primary"
                              : "border border-blush/60 text-on-surface-variant"
                  }`}
              >
                {isComplete ? <Check className="h-3.5 w-3.5"/> : index + 1}
              </span>
                            <span
                                className={`whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] sm:text-xs ${
                                    isActive || isComplete ? "text-on-surface" : "text-on-surface-variant"
                                }`}
                            >
                {step.label}
              </span>
                        </div>

                        {index < STEPS.length - 1 ? (
                            <span
                                aria-hidden
                                className={`mx-3 h-px flex-1 sm:mx-5 ${
                                    isComplete ? "bg-champagne-gold" : "bg-blush/40"
                                }`}
                            />
                        ) : null}
                    </li>
                );
            })}
        </ol>
    );
}
