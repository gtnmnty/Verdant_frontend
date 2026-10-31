"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {ArrowLeft, Sparkles} from "lucide-react";
import {toast} from "sonner";
import {gqlRequest} from "@/utils/graphqlClient";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";
import {TrackingSummary} from "@/app/(site)/tracking/[id]/_components/TrackingSummary";
import {TrackingItemCard} from "@/app/(site)/tracking/[id]/_components/TrackingItemCard";
import {ShipmentDetails} from "@/app/(site)/tracking/[id]/_components/ShipmentDetails";
import {TrackingActions} from "@/app/(site)/tracking/[id]/_components/TrackingActions";
import {STAGES, type Stage, type TrackItem} from "@/app/(site)/tracking/[id]/_components/data";
import {PaymentStatusBadge} from "@/app/(site)/orders/_components/PaymentStatus";

interface BackendOrderItem {
    id: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    unitPrice: number;
    deliveryOption: "STANDARD" | "EXPRESS" | "SAME_DAY";
    estimatedDeliveryMin: string | null;
    estimatedDeliveryMax: string | null;
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
    paymentStatus: string;
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
            paymentStatus
            paymentMethod
            address { line1 line2 city state postal country }
            total
            items {
                id
                productName
                productImage
                quantity
                unitPrice
                deliveryOption
                estimatedDeliveryMin
                estimatedDeliveryMax
            }
            createdAt
        }
    }
`;

// The backend only tracks a single orderStatus per order (order.graphql) —
// there's no per-item status, no courier and no tracking number in the
// schema. So every item on this page shares the same stage derived from
// the order's orderStatus, and the tracking number below stays a
// frontend-only placeholder until the backend exposes real shipment data.
// The delivery option and its estimated arrival window (shipping.days.* on
// the backend) are real, so the shipment name and ETA come from those.
const STATUS_TO_STAGE_INDEX: Record<BackendOrder["orderStatus"], number> = {
    PLACED: 0,
    PROCESSING: 1,
    IN_TRANSIT: 2,
    DELIVERED: 4,
    CANCELLED: 0,
};

const FALLBACK_IMAGE = "https://picsum.photos/seed/tracking-item/400/400";
const STATIC_TRACKING_NUMBER = "Not available yet";

const DELIVERY_LABELS: Record<BackendOrderItem["deliveryOption"], string> = {
    STANDARD: "Standard Delivery",
    EXPRESS: "Express Delivery",
    SAME_DAY: "Same-Day Delivery",
};

function formatDay(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {month: "short", day: "numeric"});
}

// "Nov 5 – Nov 7", or a single date when the window is one day (same-day delivery).
function formatWindow(min: string | null, max: string | null) {
    if (!min || !max) return null;
    const from = formatDay(min);
    const to = formatDay(max);
    return from === to ? from : `${from} – ${to}`;
}

// The order is only fully delivered once its slowest shipment arrives, so the
// order-level ETA runs from the earliest start to the latest end of its items.
function orderEstimate(order: BackendOrder) {
    if (order.orderStatus === "DELIVERED") return "Delivered";
    if (order.orderStatus === "CANCELLED") return "Order cancelled";

    const windows = order.items.filter((i) => i.estimatedDeliveryMin && i.estimatedDeliveryMax);
    if (windows.length === 0) return "Not available yet";

    const min = windows.map((i) => i.estimatedDeliveryMin as string).sort()[0];
    const max = windows.map((i) => i.estimatedDeliveryMax as string).sort().reverse()[0];
    return formatWindow(min, max) ?? "Not available yet";
}

function itemNote(status: BackendOrder["orderStatus"], item: BackendOrderItem) {
    if (status === "DELIVERED") return "Your order has been delivered. We hope you love it.";
    if (status === "CANCELLED") return "This order was cancelled.";
    const window = formatWindow(item.estimatedDeliveryMin, item.estimatedDeliveryMax);
    const base = status === "IN_TRANSIT"
        ? "Your order is on its way."
        : "Your order is being handled by our team.";
    return window ? `${base} Expected to arrive ${window}.` : `${base} Check back for updates.`;
}

function formatAddress(a: BackendAddress) {
    return [a.line1, a.line2, a.city, a.state, a.postal, a.country].filter(Boolean).join(", ");
}

export function TrackingContent({id}: { id: string }) {
    const [order, setOrder] = useState<BackendOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const {token, loading: authLoading} = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Wait for the session restore: opened in a new tab (or from the Track Order button with a fresh load),
        // the first request would otherwise go out without a token and fail with "no permission".
        if (authLoading) return;
        if (token === null) {
            router.replace("/auth");
            return;
        }
        let cancelled = false;
        gqlRequest<{ order: BackendOrder | null }>(ORDER_QUERY, {id})
            .then((res) => { if (!cancelled) setOrder(res.order); })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load order.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id, authLoading, token, router]);

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
        courier: DELIVERY_LABELS[i.deliveryOption] ?? "Delivery",
        stage,
        note: itemNote(order.orderStatus, i),
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
                <div className="mt-3">
                    <PaymentStatusBadge orderStatus={order.orderStatus} paymentStatus={order.paymentStatus}/>
                </div>
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
                courier={[...new Set(order.items.map((i) => DELIVERY_LABELS[i.deliveryOption]))].join(", ") || "—"}
                trackingNumber={STATIC_TRACKING_NUMBER}
                eta={orderEstimate(order)}
                shippingAddress={formatAddress(order.address)}
                paymentMethod={order.paymentMethod}
            />

            <TrackingActions/>
        </div>
    );
}
