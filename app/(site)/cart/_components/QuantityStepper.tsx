"use client";

import {Minus, Plus} from "lucide-react";

interface QuantityStepperProps {
    quantity: number;
    onChange: (quantity: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
}

export function QuantityStepper({
    quantity,
    onChange,
    min = 1,
    max = 99,
    disabled,
}: QuantityStepperProps) {
    return (
        <div
            role="group"
            aria-label="Quantity"
            className={`inline-flex items-center gap-3 rounded-full border border-blush/60 px-1 py-1 ${
                disabled ? "opacity-50" : ""
            }`}
        >
            <button
                type="button"
                onClick={() => onChange(Math.max(min, quantity - 1))}
                disabled={disabled || quantity <= min}
                aria-label="Decrease quantity"
                className="grid h-6 w-6 shrink-0 place-items-center
                        rounded-full text-on-surface-variant
                        transition-colors hover:bg-blush/30
                        disabled:pointer-events-none
                        disabled:opacity-40"
            >
                <Minus className="h-3 w-3"/>
            </button>
            <span className="min-w-5 text-center text-sm
                 font-medium tabular-nums text-on-surface">
        {quantity}
      </span>
            <button
                type="button"
                onClick={() => onChange(Math.min(max, quantity + 1))}
                disabled={disabled || quantity >= max}
                aria-label="Increase quantity"
                className="grid h-6 w-6 shrink-0 place-items-center
                        rounded-full text-on-surface-variant
                        transition-colors hover:bg-blush/30
                        disabled:pointer-events-none
                        disabled:opacity-40"
            >
                <Plus className="h-3 w-3"/>
            </button>
        </div>
    );
}
