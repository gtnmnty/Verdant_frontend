"use client";

import Image from "next/image";
import {Separator} from "@/components/ui/separator";
import type {CheckoutOrderItem} from "@/app/(site)/checkout/_components/data";
import {ImagePlaceholder} from "@/components/ui/image-placeholder";

interface OrderSummaryProps {
    items: CheckoutOrderItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    walletApplied: number;
    amountDue: number;
}

export function OrderSummary({
     items,
     subtotal,
     shipping,
     tax,
     discount,
     total,
     walletApplied,
     amountDue,
}: OrderSummaryProps) {
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
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                />
                            ) : (
                                <ImagePlaceholder name={item.name} kind="product" compact/>
                            )}
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

            <p className="mt-5 text-[11px] leading-relaxed
                 text-on-surface-variant">
                By completing your purchase, you agree to Verdant Luxe&apos;s Terms of
                Service and Privacy Policy. All shipments are insured and require
                signature upon delivery.
            </p>
        </aside>
    );
}
