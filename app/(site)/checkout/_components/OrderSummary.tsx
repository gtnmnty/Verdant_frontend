"use client";

import {ChevronDown} from "lucide-react";
import {useState} from "react";
import Image from "next/image";
import {Button} from "@/components/ui/button";
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
    promoError: string | null;
    onPromoCodeChange: (value: string) => void;
    onApplyPromoCode: () => void;
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
     promoError,
     onPromoCodeChange,
     onApplyPromoCode,
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
                <div className="flex items-center justify-between">
                    <dt className="text-on-surface-variant">Taxes</dt>
                    <dd className="font-medium text-on-surface">${tax.toFixed(2)}</dd>
                </div>
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
                                disabled={promoApplied}
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
                            disabled={promoApplied || promoCode.trim().length === 0}
                        >
                            Apply
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
