import type {Metadata} from "next";
import Link from "next/link";
import Image from "next/image";
import {ArrowLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {OrderDetailsHeader} from "@/app/(site)/orders/[id]/_components/OrderDetailsHeader";
import {OrderDetailsFooter} from "@/app/(site)/orders/[id]/_components/OrderDetailsFooter";
import {OrderTimeline} from "@/app/(site)/orders/[id]/_components/OrderTimeline";
import {DetailCard, DetailRow} from "@/app/(site)/orders/[id]/_components/shared";
import {gqlRequest} from "@/utils/graphqlClient";
import {Order, orderSubtotal} from "@/app/(site)/orders/_components/data";
import {ORDER_BY_ID_QUERY} from "@/app/(site)/orders/_components/query";

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
    const res = await gqlRequest<{ order: Order | null }>(ORDER_BY_ID_QUERY, { id });
    const order = res?.order ?? null;

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
                                    <DetailRow label="Reference" value={<span className="font-mono">{order.orderCode || order.id}</span>}/>
                                    {/* Flow: Customer contact info mapped from backend user relation */}
                                    <DetailRow label="Customer" value={order.user?.fullName || order.customer || "—"}/>
                                    <DetailRow label="Email" value={order.user?.email || order.email || "—"}/>
                                    <DetailRow label="Phone" value={order.user?.phone || order.phone || "—"}/>
                                    <DetailRow label="Items" value={
                                        order.items.reduce((s, i) =>
                                        s + i.quantity, 0)}/>
                                    <DetailRow label="Subtotal"
                                               value={`$${(order.subtotal ?? orderSubtotal(order)).toFixed(2)}`}/>
                                    <DetailRow label="Delivery"
                                               value={`$${(order.deliveryFee ?? 0).toFixed(2)}`}/>
                                    <DetailRow
                                        label="Total"
                                        value={<span className="font-semibold">
                                                    ${order.total.toFixed(2)}
                                               </span>}
                                    />
                                    <DetailRow label="Payment" value={order.paymentMethod || "—"}/>
                                    <DetailRow
                                        label="Delivery Method"
                                        value={<span className="capitalize">{order.deliveryMethod || "Delivery"}</span>}
                                    />
                                    {/* Flow: Shipping destination formatted from Address relation */}
                                    <DetailRow
                                        label={order.deliveryMethod === "pickup" ?
                                            "Pickup Branch" : "Shipping Address"}
                                        value={order.deliveryMethod === "pickup" ?
                                            (order.branch || "—") :
                                            (order.address ?
                                                [
                                                    order.address.line1, order.address.line2,
                                                    order.address.city, order.address.state,
                                                    order.address.postal, order.address.country
                                                ].filter(Boolean).join(", ") :
                                                (order.shippingAddress || "—"))
                                        }
                                    />
                                    {order.courier ? <DetailRow label="Courier"
                                                                value={order.courier}/> : null}
                                    {order.tracking ? (
                                        <DetailRow label="Tracking"
                                                   value={
                                            <span className="font-mono">{order.tracking}</span>
                                        }/>
                                    ) : null}
                                    {order.notes ? <DetailRow label="Notes" value={order.notes}/> : null}
                                </dl>
                            </DetailCard>

                            <DetailCard title="Ordered Items">
                                <ul className="divide-y divide-blush/30">
                                    {/* Flow: Render canonical OrderItem fields: productName, productImage, quantity, unitPrice */}
                                    {order.items.map((it) => (
                                        <li key={it.id} className="flex items-center gap-3 py-3">
                                            <div className="relative h-14 w-14
                                                 shrink-0 overflow-hidden
                                                 rounded-md">
                                                <Image
                                                    src={it.productImage || "https://picsum.photos/seed/product/56/56"}
                                                    alt={it.productName}
                                                    fill
                                                    sizes="56px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm
                                                   font-medium text-on-surface">{it.productName}</p>
                                                <p className="text-xs text-on-surface-variant">
                                                    Qty {it.quantity} × ${it.unitPrice.toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-sm font-semibold text-primary">
                                                ${(it.quantity * it.unitPrice).toFixed(2)}
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
