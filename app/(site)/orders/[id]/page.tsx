import type {Metadata} from "next";
import Link from "next/link";
import Image from "next/image";
import {ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {findOrder, orderSubtotal} from "@/app/(site)/orders/_components/data";
import {OrderDetailsHeader} from "@/app/(site)/orders/[id]/_components/OrderDetailsHeader";
import {OrderDetailsFooter} from "@/app/(site)/orders/[id]/_components/OrderDetailsFooter";
import {OrderTimeline} from "@/app/(site)/orders/[id]/_components/OrderTimeline";
import {DetailCard, DetailRow} from "@/app/(site)/orders/[id]/_components/shared";

export const metadata: Metadata = {
    title: "Order Details — Verdant Luxe",
    description:
        "Full breakdown of your Verdant Luxe order: items, payment, delivery and activity timeline.",
    openGraph: {
        title: "Order Details — Verdant Luxe",
        description:
            "Review the items, totals and delivery progress of your Verdant Luxe order.",
        type: "website",
    },
    twitter: {card: "summary"},
};

export default async function OrderDetailsPage({
                                                   params,
                                               }: {
    params: Promise<{ id: string }>;
}) {
    const {id} = await params;
    const order = findOrder(id);

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

            {!order ? (
                <div className="mt-10 rounded-2xl border border-dashed
                 border-blush/60 p-10 text-center">
                    <p className="font-display text-2xl text-primary">Order not found</p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                        We couldn&rsquo;t locate order #{id}.
                    </p>
                    <Button asChild className="mt-5">
                        <Link href="/orders">Return to Orders</Link>
                    </Button>
                </div>
            ) : (
                <>
                    <OrderDetailsHeader order={order}/>

                    <div className="mt-8 grid gap-5
                         lg:grid-cols-[minmax(0,1fr)_20rem]">
                        <div className="min-w-0 space-y-5">
                            <DetailCard title="Order Summary">
                                <dl>
                                    <DetailRow label="Reference" value={<span className="font-mono">{order.id}</span>}/>
                                    <DetailRow label="Customer" value={order.customer}/>
                                    <DetailRow label="Email" value={order.email}/>
                                    <DetailRow label="Phone" value={order.phone}/>
                                    <DetailRow label="Items" value={order.items.reduce((s, i) => s + i.qty, 0)}/>
                                    <DetailRow label="Subtotal" value={`$${orderSubtotal(order).toFixed(2)}`}/>
                                    <DetailRow label="Delivery" value={`$${(order.deliveryFee ?? 0).toFixed(2)}`}/>
                                    <DetailRow
                                        label="Total"
                                        value={<span className="font-semibold">${order.total.toFixed(2)}</span>}
                                    />
                                    <DetailRow label="Payment" value={order.paymentMethod}/>
                                    <DetailRow
                                        label="Delivery Method"
                                        value={<span className="capitalize">{order.deliveryMethod}</span>}
                                    />
                                    <DetailRow
                                        label={order.deliveryMethod === "pickup" ? "Pickup Branch" : "Shipping Address"}
                                        value={order.deliveryMethod === "pickup" ? order.branch : order.shippingAddress}
                                    />
                                    {order.courier ? <DetailRow label="Courier" value={order.courier}/> : null}
                                    {order.tracking ? (
                                        <DetailRow label="Tracking"
                                                   value={<span className="font-mono">{order.tracking}</span>}/>
                                    ) : null}
                                    {order.notes ? <DetailRow label="Notes" value={order.notes}/> : null}
                                </dl>
                            </DetailCard>

                            <DetailCard title="Ordered Items">
                                <ul className="divide-y divide-blush/30">
                                    {order.items.map((it) => (
                                        <li key={it.id} className="flex items-center gap-3 py-3">
                                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                                                <Image src={it.image} alt={it.name} fill sizes="56px"
                                                       className="object-cover"/>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-on-surface">{it.name}</p>
                                                <p className="text-xs text-on-surface-variant">
                                                    {it.category} · Qty {it.qty} × ${it.price.toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-sm font-semibold text-primary">
                                                ${(it.qty * it.price).toFixed(2)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </DetailCard>
                        </div>

                        <div className="min-w-0">
                            <DetailCard title="Activity">
                                <OrderTimeline order={order}/>
                            </DetailCard>
                        </div>
                    </div>

                    <OrderDetailsFooter order={order}/>
                </>
            )}
        </div>
    );
}
