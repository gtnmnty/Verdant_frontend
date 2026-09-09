"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {
    DetailHeader,
    DetailGrid,
    DetailCard,
    FieldRow,
} from "@/app/admin/_components/Detail";
import {StatusBadge} from "@/app/admin/_components/StatusBadge";
import {ConfirmDialog} from "@/app/admin/_components/ConfirmDialog";
import {EmptyState} from "@/app/admin/_components/EmptyState";
import {OrderFormDialog} from "@/app/admin/orders/_components/OrderFormDialog";
import {gqlRequest} from "@/utils/graphqlClient";

const STATUS_FROM_BACKEND: Record<string, string> = {
    PLACED: "pending",
    PROCESSING: "processing",
    IN_TRANSIT: "in_transit",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
};

interface BackendAdminOrder {
    id: string;
    orderCode: string;
    user: { fullName: string };
    orderStatus: string;
    paymentMethod: string;
    address: {
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        postal: string;
        country: string | null
    };
    subtotal: number;
    deliveryFee: number;
    total: number;
    itemCount: number;
    items: {
        id: string;
        productName: string;
        productImage: string | null;
        quantity: number; unitPrice: number
    }[];
    activity: { label: string; timestamp: string }[];
    createdAt: string;
}

const ADMIN_ORDER_DETAIL_QUERY = `
    query AdminOrderDetail($id: ID!) {
        adminOrder(id: $id) {
            id
            orderCode
            user { fullName }
            orderStatus
            paymentMethod
            address { line1 line2 city state postal country }
            subtotal
            deliveryFee
            total
            itemCount
            items { id productName productImage quantity unitPrice }
            activity { label timestamp }
            createdAt
        }
    }
`;

const UPDATE_ORDER_STATUS_MUTATION = `
    mutation CancelAdminOrder($id: ID!, $input: AdminUpdateOrderInput!) {
        adminUpdateOrder(id: $id, input: $input) { id orderStatus }
    }
`;

const DELETE_ORDERS_MUTATION = `
    mutation AdminDeleteOrders($ids: [ID!]!) {
        adminDeleteOrders(ids: $ids) { id }
    }
`;

function formatAddress(a: BackendAdminOrder["address"]): string {
    return [a.line1, a.line2, a.city, a.state, a.postal, a.country].filter(Boolean).join(", ");
}

export function OrderDetailContent() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<BackendAdminOrder | null | undefined>(undefined);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const fetchOrder = () => {
        gqlRequest<{ adminOrder: BackendAdminOrder }>(ADMIN_ORDER_DETAIL_QUERY, {id: params.id})
            .then((res) => setOrder(res.adminOrder))
            .catch((err) => {
                toast.error(err instanceof Error ? err.message : "Failed to load order.");
                setOrder(null);
            });
    };

    useEffect(fetchOrder, [params.id]);

    if (order === undefined) {
        return <p className="py-16 text-center text-sm text-admin-muted">Loading…</p>;
    }

    if (!order) {
        return (
            <EmptyState
                title="Order not found"
                description="It may have been removed. Return to the orders list."
                action={
                    <Button onClick={() => router.push("/admin/orders")}>
                        Back to Orders
                    </Button>
                }
            />
        );
    }

    const status = STATUS_FROM_BACKEND[order.orderStatus] ?? "pending";

    const cancelOrder = () => {
        gqlRequest(UPDATE_ORDER_STATUS_MUTATION, {
            id: order.id,
            input: {orderStatus: "CANCELLED"},
        })
            .then(() => {
                toast.success("Order cancelled.");
                fetchOrder();
            })
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to cancel order."));
    };

    const handleDelete = () => {
        gqlRequest(DELETE_ORDERS_MUTATION, {ids: [order.id]})
            .then(() => {
                toast.success("Order deleted.");
                router.push("/admin/orders");
            })
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to delete order."));
    };

    return (
        <div>
            <DetailHeader
                backHref="/admin/orders"
                backLabel="Back to Orders"
                title={order.orderCode}
                subtitle={order.user.fullName}
                status={<StatusBadge status={status}/>}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                            className="border-admin-line"
                        >
                            Print
                        </Button>
                        {/* No export endpoint on the backend — stays a demo toast. */}
                        <Button
                            variant="outline"
                            onClick={() => toast.success("Exported")}
                            className="border-admin-line"
                        >
                            Export
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setEditOpen(true)}
                            className="border-admin-line"
                        >
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            onClick={cancelOrder}
                            disabled={status === "cancelled"}
                            className="border-admin-line"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(true)}
                            className="border-admin-line text-admin-rose
                            hover:text-admin-rose"
                        >
                            Delete
                        </Button>
                    </>
                }
            />

            <DetailGrid>
                <div className="space-y-4">
                    <DetailCard title="Order summary">
                        <dl>
                            <FieldRow
                                label="Reference"
                                value={<span className="font-mono">{order.orderCode}</span>}
                            />
                            <FieldRow label="Customer" value={order.user.fullName}/>
                            <FieldRow label="Items" value={order.itemCount}/>
                            <FieldRow label="Subtotal" value={`$${order.subtotal}`}/>
                            <FieldRow label="Delivery" value={`$${order.deliveryFee}`}/>
                            <FieldRow
                                label="Total"
                                value={<span className="font-semibold">${order.total}</span>}
                            />
                            <FieldRow label="Status" value={<StatusBadge status={status}/>}/>
                            <FieldRow label="Payment method" value={order.paymentMethod}/>
                            <FieldRow label="Shipping address" value={formatAddress(order.address)}/>
                            <FieldRow label="Placed" value={new Date(order.createdAt).toLocaleString()}/>
                        </dl>
                    </DetailCard>

                    <DetailCard title="Ordered items">
                        {order.items.length === 0 ? (
                            <p className="text-sm text-admin-muted">No items.</p>
                        ) : (
                            <ul className="divide-y divide-admin-line">
                                {order.items.map((it) => (
                                    <li
                                        key={it.id}
                                        className="grid grid-cols-[64px_minmax(0,1fr)_auto]
                                        items-center gap-3 py-3"
                                    >
                                        {it.productImage ? (
                                            // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs
                                            <img
                                                src={it.productImage}
                                                alt=""
                                                className="size-14 rounded-md object-cover"
                                            />
                                        ) : (
                                            <div className="size-14 rounded-md bg-admin-cream"/>
                                        )}
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{it.productName}</p>
                                            <p className="text-xs text-admin-muted">
                                                Qty {it.quantity} × ${it.unitPrice}
                                            </p>
                                        </div>
                                        <p className="font-semibold">${(it.quantity * it.unitPrice).toFixed(2)}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </DetailCard>
                </div>

                <DetailCard title="Activity">
                    {order.activity.length === 0 ? (
                        <p className="text-sm text-admin-muted">No activity recorded.</p>
                    ) : (
                        <ul className="space-y-3 text-sm">
                            {order.activity.map((a, i) => (
                                <li key={i} className="border-l-2 border-admin-sage pl-3">
                                    <p className="font-semibold">{a.label}</p>
                                    <p className="text-xs text-admin-muted">
                                        {new Date(a.timestamp).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </DetailCard>
            </DetailGrid>

            <OrderFormDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                orderId={order.id}
                onSaved={fetchOrder}
            />
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete this order?"
                description={`"${order.orderCode}" will be permanently removed.`}
                confirmLabel="Delete"
                destructive
                onConfirm={handleDelete}
            />
        </div>
    );
}
