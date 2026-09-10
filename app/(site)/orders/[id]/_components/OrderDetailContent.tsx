"use client";

import type { Order } from "@/app/(site)/orders/_components/data";
import {useEffect, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {ArrowLeft, Loader2} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {gqlRequest} from "@/utils/graphqlClient";
import {DetailCard, DetailRow} from "@/app/(site)/orders/[id]/_components/shared";
import {OrderDetailsHeader} from "@/app/(site)/orders/[id]/_components/OrderDetailsHeader";
import {OrderDetailsFooter} from "@/app/(site)/orders/[id]/_components/OrderDetailsFooter";
import {OrderTimeline} from "@/app/(site)/orders/[id]/_components/OrderTimeline";
import {
    ORDER_BY_ID_QUERY,
    type BackendOrder,
} from "@/app/(site)/orders/_components/query";

function formatAddress(addr?: BackendOrder["address"]) {
    if (!addr) return "N/A";
    return [addr.line1, addr.line2, addr.city, addr.state, addr.postal, addr.country]
        .filter(Boolean)
        .join(", ");
}

export function OrderDetailContent({id}: { id: string }) {
    const [order, setOrder] = useState<BackendOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        gqlRequest<{ order: BackendOrder | null }>(ORDER_BY_ID_QUERY, {id})
            .then((res) => {
                if (!cancelled) {
                    //unwrap res.order
                    setOrder(res.order);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    toast.error(err instanceof Error ? err.message : "Failed to load order.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary"/>
                <p className="text-sm text-on-surface-variant">Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="mt-10 rounded-2xl border border-dashed border-blush/60 p-10 text-center">
                <p className="font-display text-2xl text-primary">Order not found</p>
                <p className="mt-2 text-sm text-on-surface-variant">
                    {"We couldn&rsquo;t locate order #"}{id}.
                </p>
                <Button asChild className="mt-5">
                    <Link href="/orders">Return to Orders</Link>
                </Button>
            </div>
        );
    }

    // Cast or adapt to the interface expected by child components (Header, Timeline, Footer)
    const clientOrder: Order = {
        id: order.id,
        orderCode: order.orderCode,
        orderStatus: order.orderStatus === "PLACED" ? "PROCESSING" : order.orderStatus,
        total: Number(order.total),
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod,
        deliveryFee: Number(order.deliveryFee ?? 0),
        items: order.items.map((i) => ({
            id: i.id,
            productName: i.productName,
            productImage: i.productImage ?? "", // Converts null to empty string ""
            quantity: i.quantity,
            unitPrice: Number(i.unitPrice),
        })),
    };


    const totalItemCount = order.items.reduce((s, i) => s + i.quantity, 0);

    return (
        <div className="mx-auto w-[min(90vw,1200px)] pb-20">
            <Link
                href="/orders"
                className="inline-flex items-center gap-2 text-[10px]
                font-semibold uppercase tracking-[0.18em]
                text-primary hover:underline"
            >
                <ArrowLeft className="h-4 w-4"/> Back to Order History
            </Link>

            <OrderDetailsHeader order={clientOrder}/>

            <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="min-w-0 space-y-5">
                    <DetailCard title="Order Summary">
                        <dl>
                            <DetailRow label="Reference"
                                       value={<span className="font-mono">{order.orderCode || order.id}</span>}/>
                            <DetailRow label="Customer" value={order.user?.fullName || "Guest"}/>
                            <DetailRow label="Email" value={order.user?.email || "N/A"}/>
                            <DetailRow label="Phone" value={order.user?.phone || "N/A"}/>
                            <DetailRow label="Items" value={totalItemCount}/>

                            {/* Fix Issue D: Use backend order.subtotal */}
                            <DetailRow label="Subtotal" value={`$${Number(order.subtotal).toFixed(2)}`}/>
                            <DetailRow label="Delivery" value={`$${Number(order.deliveryFee ?? 0).toFixed(2)}`}/>
                            <DetailRow
                                label="Total"
                                value={<span className="font-semibold">${Number(order.total).toFixed(2)}</span>}
                            />
                            <DetailRow label="Payment" value={order.paymentMethod}/>
                            <DetailRow label="Shipping Address" value={formatAddress(order.address)}/>
                        </dl>
                    </DetailCard>

                    <DetailCard title="Ordered Items">
                        <ul className="divide-y divide-blush/30">
                            {/* Fix Issue E: use productName, productImage, quantity, unitPrice */}
                            {order.items.map((it) => (
                                <li key={it.id} className="flex items-center gap-3 py-3">
                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-blush/20">
                                        {it.productImage ? (
                                            <Image
                                                src={it.productImage}
                                                alt={it.productName}
                                                fill
                                                sizes="56px"
                                                className="object-cover"
                                            />
                                        ) : null}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-on-surface">{it.productName}</p>
                                        <p className="text-xs text-on-surface-variant">
                                            Qty {it.quantity} × ${Number(it.unitPrice).toFixed(2)}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-semibold text-primary">
                                        ${(it.quantity * Number(it.unitPrice)).toFixed(2)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </DetailCard>
                </div>

                <div className="min-w-0">
                    <DetailCard title="Activity">
                        <OrderTimeline order={clientOrder}/>
                    </DetailCard>
                </div>
            </div>

            <OrderDetailsFooter order={clientOrder}/>
        </div>
    );
}
