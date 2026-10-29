"use client";

import {ChevronDown} from "lucide-react";
import {useState} from "react";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import type {CheckoutOrderItem} from "@/app/(site)/checkout/_components/data";

interface OrderSummaryProps {
    items: CheckoutOrderItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    promoCode: string;
    promoApplied: boolean;
    promoChecking: boolean;
    promoError: string | null;
    onPromoCodeChange: (value: string) => void;
    onApplyPromoCode: () => void;
    // Spendable gift-card balance (myWalletBalance); the option is hidden when it's 0.
    walletBalance: number;
    useWallet: boolean;
    onUseWalletChange: (use: boolean) => void;
    walletApplied: number;
    amountDue: number;
    // Once the order is placed its promo and wallet are fixed, so the controls are disabled.
    locked: boolean;
}

export function OrderSummary({
     items,
     subtotal,
     shipping,
     tax,
     discount,
     total,
     promoCode,
     promoApplied,
     promoChecking,
     promoError,
     onPromoCodeChange,
     onApplyPromoCode,
     walletBalance,
     useWallet,
     onUseWalletChange,
     walletApplied,
     amountDue,
     locked,
}: OrderSummaryProps) {
    const [promoOpen, setPromoOpen] = useState(false);

    return (
        <aside className="rounded-xl bg-surface-low p-6 sm:sticky
                 sm:top-[calc(clamp(56px,8vw,76px)+1.5rem)]
                 sm:p-7">
            <h2 className="font-display text-xl text-on-surface">Order Summary</h2>

            <ul className="mt-5 space-y-4">
                {items.map((item) => (
                    <li key={item.id} className="flex items-start gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden
                             rounded-lg bg-surface-lowest">
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-semibold uppercase
                               tracking-widest text-on-surface">
                                {item.name}
                            </p>
                            <p className="text-xs text-on-surface-variant">
                                {item.category} · Qty {item.quantity}
                            </p>
                            <p className="mt-1 text-sm font-medium text-on-surface">
                                ${(item.price * item.quantity).toFixed(2)}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>

            <Separator className="my-5 bg-blush/40"/>

            <dl className="space-y-3 text-sm">
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
                {tax > 0 ? (
                    <div className="flex items-center justify-between">
                        <dt className="text-on-surface-variant">Taxes</dt>
                        <dd className="font-medium text-on-surface">${tax.toFixed(2)}</dd>
                    </div>
                ) : null}
                {discount > 0 ? (
                    <div className="flex items-center justify-between">
                        <dt className="text-champagne-gold">Promo Discount</dt>
                        <dd className="font-medium text-champagne-gold">
                            −${discount.toFixed(2)}
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

            {walletApplied > 0 ? (
                <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <dt className="text-champagne-gold">Gift card balance</dt>
                        <dd className="font-medium text-champagne-gold">−${walletApplied.toFixed(2)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                        <dt className="font-medium text-on-surface">Due now</dt>
                        <dd className="font-medium text-on-surface">${amountDue.toFixed(2)}</dd>
                    </div>
                </dl>
            ) : null}

            {walletBalance > 0 ? (
                <label className="mt-5 flex cursor-pointer items-start gap-3">
                    <Checkbox
                        checked={useWallet}
                        disabled={locked}
                        onCheckedChange={(checked: boolean | "indeterminate") => onUseWalletChange(checked === true)}
                        className="mt-0.5"
                    />
                    <span className="text-sm text-on-surface">
                        Use my gift card balance
                        <span className="block text-xs text-on-surface-variant">
                            ${walletBalance.toFixed(2)} available
                        </span>
                    </span>
                </label>
            ) : null}

            <Separator className="my-5 bg-blush/40"/>

            <div>
                <button
                    type="button"
                    onClick={() => setPromoOpen((open) => !open)}
                    aria-expanded={promoOpen}
                    className="flex items-center gap-1.5 text-[11px]
                                    font-semibold uppercase tracking-[0.12em]
                                    text-champagne-gold"
                >
                    Have a promotional code?
                    <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${promoOpen ? "rotate-180" : ""}`}
                    />
                </button>

                {promoOpen ? (
                    <div className="mt-3 flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                            <Input
                                value={promoCode}
                                onChange={(e) => onPromoCodeChange(e.target.value)}
                                placeholder="Enter code"
                                disabled={promoApplied || locked}
                                className="bg-surface-lowest"
                            />
                            {promoError ? (
                                <p className="mt-1 text-xs text-destructive">{promoError}</p>
                            ) : promoApplied ? (
                                <p className="mt-1 text-xs text-champagne-gold">
                                    Code applied.
                                </p>
                            ) : null}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onApplyPromoCode}
                            disabled={promoApplied || locked || promoChecking || promoCode.trim().length === 0}
                        >
                            {promoChecking ? "Checking…" : "Apply"}
                        </Button>
                    </div>
                ) : null}
            </div>

            <p className="mt-5 text-[11px] leading-relaxed
                 text-on-surface-variant">
                By completing your purchase, you agree to Verdant Luxe&apos;s Terms of
                Service and Privacy Policy. All shipments are insured and require
                signature upon delivery.
            </p>
        </aside>
    );
}
