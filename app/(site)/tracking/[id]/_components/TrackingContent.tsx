"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {ArrowLeft, Sparkles} from "lucide-react";
import {toast} from "sonner";
import {gqlRequest} from "@/utils/graphqlClient";
import {TrackingSummary} from "@/app/(site)/tracking/[id]/_components/TrackingSummary";
import {TrackingItemCard} from "@/app/(site)/tracking/[id]/_components/TrackingItemCard";
import {ShipmentDetails} from "@/app/(site)/tracking/[id]/_components/ShipmentDetails";
import {TrackingActions} from "@/app/(site)/tracking/[id]/_components/TrackingActions";
import {STAGES, type Stage, type TrackItem} from "@/app/(site)/tracking/[id]/_components/data";

interface BackendOrderItem {
    id: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    unitPrice: number;
}

interface BackendAddress {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postal: string;
    country: string | null;
}

interface BackendOrder {
    id: string;
    orderCode: string;
    orderStatus: "PLACED" | "PROCESSING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
    paymentMethod: string;
    address: BackendAddress;
    total: number;
    items: BackendOrderItem[];
    createdAt: string;
}

const ORDER_QUERY = `
    query TrackOrder($id: ID!) {
        order(id: $id) {
            id
            orderCode
            orderStatus
            paymentMethod
            address { line1 line2 city state postal country }
            total
            items {
                id
                productName
                productImage
                quantity
                unitPrice
            }
            createdAt
        }
    }
`;

// The backend only tracks a single orderStatus per order (order.graphql) —
// there's no per-item status, no courier, no tracking number, and no ETA
// field anywhere in the schema. So every item on this page shares the same
// stage derived from the order's orderStatus, and courier/tracking
// number/ETA below stay as frontend-only placeholders until the backend
// exposes real shipment data.
const STATUS_TO_STAGE_INDEX: Record<BackendOrder["orderStatus"], number> = {
    PLACED: 0,
    PROCESSING: 1,
    IN_TRANSIT: 2,
    DELIVERED: 4,
    CANCELLED: 0,
};

const FALLBACK_IMAGE = "https://picsum.photos/seed/tracking-item/400/400";
const STATIC_COURIER = "DHL Express Delivery";
const STATIC_TRACKING_NUMBER = "Not available yet";
const STATIC_ETA = "Not available yet";

function formatAddress(a: BackendAddress) {
    return [a.line1, a.line2, a.city, a.state, a.postal, a.country].filter(Boolean).join(", ");
}

export function TrackingContent({id}: { id: string }) {
    const [order, setOrder] = useState<BackendOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        gqlRequest<{ order: BackendOrder | null }>(ORDER_QUERY, {id})
            .then((res) => { if (!cancelled) setOrder(res.order); })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load order.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id]);

    if (loading) {
        return <p className="py-24 text-center text-sm text-on-surface-variant">Loading order…</p>;
    }

    if (!order) {
        return (
            <div className="py-24 text-center">
                <p className="font-display text-2xl text-primary">Order not found</p>
                <Link href="/orders" className="mt-3 inline-block text-sm text-primary underline">
                    Back to Orders
                </Link>
            </div>
        );
    }

    const stage: Stage = STAGES[STATUS_TO_STAGE_INDEX[order.orderStatus]];

    const items: TrackItem[] = order.items.map((i) => ({
        id: i.id,
        name: i.productName,
        price: i.unitPrice,
        qty: i.quantity,
        image: i.productImage ?? FALLBACK_IMAGE,
        courier: STATIC_COURIER,
        stage,
        note: "Your order is being handled by our team — check back for updates.",
    }));

    return (
        <div className="pb-20">
            <Link
                href="/orders"
                className="inline-flex items-center gap-2 text-xs
                        font-semibold uppercase tracking-[0.18em]
                        text-primary hover:underline"
            >
                <ArrowLeft className="h-4 w-4"/> Return to Order History
            </Link>

            <header className="mt-8 text-center">
                <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)]
                 leading-tight tracking-tight text-primary">
                    Track Order
                </h1>
                <Sparkles className="mx-auto mt-2 h-5 w-5 text-champagne-gold"/>
            </header>

            <TrackingSummary
                id={order.orderCode}
                placedOn={new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                })}
                itemCount={items.length}
                total={order.total}
            />

            <section className="mt-10 space-y-6">
                {items.map((item) => (
                    <TrackingItemCard key={item.id} item={item}/>
                ))}
            </section>

            <ShipmentDetails
                courier={STATIC_COURIER}
                trackingNumber={STATIC_TRACKING_NUMBER}
                eta={STATIC_ETA}
                shippingAddress={formatAddress(order.address)}
                paymentMethod={order.paymentMethod}
            />

            <TrackingActions/>
        </div>
    );
}
