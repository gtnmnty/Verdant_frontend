"use client";

import {Gift, ShieldCheck} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Separator} from "@/components/ui/separator";

interface CartSummaryProps {
    subtotal: number;
    shipping: number;
    tax: number;
    giftPackaging: boolean;
    giftPackagingFee: number;
    total: number;
    selectedCount: number;
    onGiftPackagingChange: (checked: boolean) => void;
    onCheckout: () => void;
}

export function CartSummary({
    subtotal,
    shipping,
    tax,
    giftPackaging,
    giftPackagingFee,
    total,
    selectedCount,
    onGiftPackagingChange,
    onCheckout,
}: CartSummaryProps) {
    const disabled = selectedCount === 0;

    return (
        <aside className="rounded-xl bg-surface-low p-6 sm:sticky
                 sm:top-[calc(clamp(56px,8vw,76px)+1.5rem)]
                 sm:p-7">
            <h2 className="font-display text-xl text-on-surface">Summary</h2>

            <dl className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <dt className="text-on-surface-variant">Subtotal</dt>
                    <dd className="font-medium text-on-surface">${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between">
                    <dt className="text-on-surface-variant">Shipping</dt>
                    <dd className="font-medium text-on-surface">
                        {shipping === 0 ? (
                            <span className="text-champagne-gold">Complimentary</span>
                        ) : (
                            `$${shipping.toFixed(2)}`
                        )}
                    </dd>
                </div>
                <div className="flex items-center justify-between">
                    <dt className="text-on-surface-variant">Tax (Estimated)</dt>
                    <dd className="font-medium text-on-surface">${tax.toFixed(2)}</dd>
                </div>
                {giftPackaging ? (
                    <div className="flex items-center justify-between">
                        <dt className="text-on-surface-variant">Gift Packaging</dt>
                        <dd className="font-medium text-on-surface">
                            ${giftPackagingFee.toFixed(2)}
                        </dd>
                    </div>
                ) : null}
            </dl>

            <Separator className="my-5 bg-blush/40"/>

            <div className="flex items-center justify-between">
                <span className="font-display text-lg text-on-surface">Total</span>
                <span className="font-display text-xl text-primary">
          ${total.toFixed(2)}
        </span>
            </div>

            <Button
                type="button"
                onClick={onCheckout}
                disabled={disabled}
                size="lg"
                className="mt-6 w-full uppercase tracking-[0.14em]"
            >
                Proceed to Checkout
            </Button>

            {disabled ? (
                <p className="mt-2 text-center text-xs text-on-surface-variant">
                    Select at least one item to proceed.
                </p>
            ) : (
                <p className="mt-2 flex items-center justify-center gap-1.5
                 text-center text-[11px] uppercase
                 tracking-widest text-on-surface-variant">
                    <ShieldCheck className="h-3.5 w-3.5 text-champagne-gold"/>
                    Secure SSL Encryption · Global Shipping
                </p>
            )}

            <Separator className="my-5 bg-blush/40"/>

            <label className="flex cursor-pointer items-start gap-3">
                <Checkbox
                    checked={giftPackaging}
                    onCheckedChange={(checked: boolean | "indeterminate") => onGiftPackagingChange(checked === true)}
                    className="mt-0.5"
                />
                <span className="text-sm text-on-surface">
                    <span className="flex items-center gap-1.5 font-medium">
                        <Gift className="h-3.5 w-3.5 text-champagne-gold"/>
                        Add Gift Packaging
                    </span>
                    <span className="text-xs text-on-surface-variant">
                        Cotton wrap &amp; luxury box (+${giftPackagingFee.toFixed(2)})
                    </span>
                </span>
            </label>
        </aside>
    );
}
