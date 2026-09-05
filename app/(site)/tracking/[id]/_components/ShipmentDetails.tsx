"use client";

import {Copy} from "lucide-react";
import {toast} from "sonner";

function Row({label, value}: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4
                 border-b border-blush/40 pb-2 last:border-0">
            <dt className="text-[10px] font-semibold uppercase
                 tracking-[0.16em] text-on-surface-variant">
                {label}
            </dt>
            <dd className="text-right text-on-surface">{value}</dd>
        </div>
    );
}

export function ShipmentDetails({
    courier,
    trackingNumber,
    eta,
    shippingAddress,
    paymentMethod,
}: {
    courier: string;
    trackingNumber: string;
    eta: string;
    shippingAddress: string;
    paymentMethod: string;
}) {
    const copyTracking = () => {
        navigator.clipboard?.writeText(trackingNumber).catch(() => {
        });
        toast.success("Tracking number copied.");
    };

    return (
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-blush/50
                 bg-surface-lowest p-6">
                <h3 className="font-display text-xl text-primary">Shipment Details</h3>
                <dl className="mt-4 space-y-3 text-sm">
                    <Row label="Courier" value={courier}/>
                    <Row
                        label="Tracking Number"
                        value={
                            <span className="inline-flex items-center gap-2">
                {trackingNumber}
                                <button
                                    onClick={copyTracking}
                                    aria-label="Copy tracking"
                                    className="text-primary hover:opacity-70"
                                >
                  <Copy className="h-4 w-4"/>
                </button>
              </span>
                        }
                    />
                    <Row label="Estimated Delivery" value={eta}/>
                </dl>
            </div>
            <div className="rounded-2xl border border-blush/50
                 bg-surface-lowest p-6">
                <h3 className="font-display text-xl text-primary">Shipping &amp; Payment</h3>
                <dl className="mt-4 space-y-3 text-sm">
                    <Row label="Shipping Address" value={shippingAddress}/>
                    <Row label="Payment Method" value={paymentMethod}/>
                    <Row label="Billing" value="Same as shipping"/>
                </dl>
            </div>
        </section>
    );
}
