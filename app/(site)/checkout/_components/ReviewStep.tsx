"use client";

import Image from "next/image";
import {ArrowLeft, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {DELIVERY_OPTION_LABELS} from "@/app/(site)/cart/_components/data";
import type {
    CheckoutOrderItem,
    CheckoutStep,
    PaymentSummary,
    ShippingDetails,
} from "@/app/(site)/checkout/_components/data";
import React from "react";

interface ReviewStepProps {
    shipping: ShippingDetails;
    payment: PaymentSummary;
    items: CheckoutOrderItem[];
    subtotal: number;
    shippingFee: number;
    tax: number;
    discount: number;
    total: number;
    isPlacingOrder: boolean;
    onEditStep: (step: CheckoutStep) => void;
    onBack: () => void;
    onPlaceOrder: () => void;
}

export function ReviewStep({
    shipping,
    payment,
    items,
    subtotal,
    shippingFee,
    tax,
    discount,
    total,
    isPlacingOrder,
    onEditStep,
    onBack,
    onPlaceOrder,
}: ReviewStepProps) {
    return (
        <div>
            <h2 className="font-display text-2xl text-on-surface sm:text-3xl">
                Review Your Order
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
                Confirm everything looks right before we send this off to our
                studio.
            </p>

            <div className="mt-8 space-y-6">
                <ReviewSection title="Customer Information" onEdit={() => onEditStep("shipping")}>
                    <p className="text-sm text-on-surface">
                        {shipping.firstName} {shipping.lastName}
                    </p>
                    <p className="text-sm text-on-surface-variant">{shipping.email}</p>
                    <p className="text-sm text-on-surface-variant">{shipping.phone}</p>
                </ReviewSection>

                <ReviewSection title="Delivery Information" onEdit={() => onEditStep("shipping")}>
                    <p className="text-sm text-on-surface">
                        {shipping.streetAddress}, {shipping.city} {shipping.postalCode}
                    </p>
                    <p className="text-sm text-on-surface-variant">{shipping.country}</p>
                    <p className="mt-1 text-sm text-champagne-gold">
                        {DELIVERY_OPTION_LABELS[shipping.deliveryOption]}
                    </p>
                </ReviewSection>

                <ReviewSection title="Payment" onEdit={() => onEditStep("payment")}>
                    <p className="text-sm text-on-surface">
                        {payment.brand} •••• •••• •••• {payment.last4}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                        {payment.cardholderName}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                        Billing:{" "}
                        {payment.billingSameAsShipping
                            ? "Same as shipping"
                            : `${payment.billingAddress?.streetAddress}, ${payment.billingAddress?.city}`}
                    </p>
                </ReviewSection>

                <div>
                    <h3 className="text-[10px] font-semibold uppercase
                    tracking-[0.18em] text-on-surface-variant">
                        Order
                    </h3>
                    <ul className="mt-3 divide-y divide-blush/40 rounded-lg
                    border border-blush/40">
                        {items.map((item) => (
                            <li key={item.id} className="flex items-center gap-3 p-4">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden
                                rounded-lg bg-surface-low">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        sizes="56px"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-on-surface">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-on-surface-variant">
                                        Qty {item.quantity} · ${item.price.toFixed(2)} each
                                    </p>
                                </div>
                                <p className="shrink-0 text-sm font-medium text-on-surface">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </p>
                            </li>
                        ))}
                    </ul>

                    <dl className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <dt className="text-on-surface-variant">Subtotal</dt>
                            <dd className="text-on-surface">${subtotal.toFixed(2)}</dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-on-surface-variant">Shipping</dt>
                            <dd className="text-on-surface">
                                {shippingFee === 0 ? "Complimentary" : `$${shippingFee.toFixed(2)}`}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-on-surface-variant">Tax</dt>
                            <dd className="text-on-surface">${tax.toFixed(2)}</dd>
                        </div>
                        {discount > 0 ? (
                            <div className="flex items-center justify-between">
                                <dt className="text-champagne-gold">Promo Discount</dt>
                                <dd className="text-champagne-gold">−${discount.toFixed(2)}</dd>
                            </div>
                        ) : null}
                    </dl>

                    <Separator className="my-4 bg-blush/40"/>

                    <div className="flex items-center justify-between">
                        <span className="font-display text-lg text-on-surface">
                          Final Total
                        </span>
                        <span className="font-display text-xl text-primary">
                          ${total.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center
                 justify-between gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isPlacingOrder}
                    className="flex items-center gap-2 text-xs font-semibold
                          uppercase tracking-[0.14em]
                          text-on-surface-variant transition-colors
                          hover:text-primary disabled:opacity-50"
                >
                    <ArrowLeft className="h-3.5 w-3.5"/>
                    Return to Payment
                </button>

                <Button
                    type="button"
                    size="lg"
                    onClick={onPlaceOrder}
                    disabled={isPlacingOrder}
                    className="gap-2 uppercase tracking-[0.14em]"
                >
                    {isPlacingOrder ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin"/>
                            Placing Order…
                        </>
                    ) : (
                        "Place Order"
                    )}
                </Button>
            </div>
        </div>
    );
}

function ReviewSection({
   title,
   onEdit,
   children,
}: {
    title: string;
    onEdit: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-blush/40 p-5">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-[10px] font-semibold uppercase
                 tracking-[0.18em] text-on-surface-variant">
                    {title}
                </h3>
                <button
                    type="button"
                    onClick={onEdit}
                    className="text-[11px] font-semibold uppercase
                          tracking-widest text-primary underline
                          underline-offset-4 hover:opacity-75"
                >
                    Edit
                </button>
            </div>
            <div className="mt-3 space-y-0.5">{children}</div>
        </div>
    );
}
