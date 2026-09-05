"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DetailHeader,
  DetailGrid,
  DetailCard,
  FieldRow,
} from "@/app/admin/_components/Detail";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { EmptyState } from "@/app/admin/_components/EmptyState";
import { OrderFormDialog } from "@/app/admin/orders/_components/OrderFormDialog";
import { useAdmin } from "@/lib/admin/store";

export function OrderDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { orders, setOrders } = useAdmin();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const order = orders.find((o) => o.id === params.id);

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

  const cancelOrder = () => {
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled" } : o)),
    );
    toast.success("Order cancelled.");
  };

  const handleDelete = () => {
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
    toast.success("Order deleted.");
    router.push("/admin/orders");
  };

  return (
    <div>
      <DetailHeader
        backHref="/admin/orders"
        backLabel="Back to Orders"
        title={order.reference}
        subtitle={order.customer}
        status={<StatusBadge status={order.status} />}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="border-admin-line"
            >
              Print
            </Button>
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
              disabled={order.status === "cancelled"}
              className="border-admin-line"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              className="border-admin-line text-admin-rose hover:text-admin-rose"
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
                value={<span className="font-mono">{order.reference}</span>}
              />
              <FieldRow label="Customer" value={order.customer} />
              <FieldRow label="Items" value={order.itemsCount} />
              <FieldRow label="Subtotal" value={`$${order.subtotal}`} />
              <FieldRow label="Delivery" value={`$${order.deliveryFee}`} />
              <FieldRow
                label="Total"
                value={<span className="font-semibold">${order.total}</span>}
              />
              <FieldRow label="Status" value={<StatusBadge status={order.status} />} />
              <FieldRow
                label="Delivery method"
                value={<span className="capitalize">{order.deliveryMethod}</span>}
              />
              <FieldRow label="Shipping address" value={order.shippingAddress} />
              <FieldRow label="Placed" value={order.createdAt} />
            </dl>
          </DetailCard>

          <DetailCard title="Ordered items">
            {order.items.length === 0 ? (
              <p className="text-sm text-admin-muted">No items.</p>
            ) : (
              <ul className="divide-y divide-admin-line">
                {order.items.map((it, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 py-3"
                  >
                    {it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs
                      <img
                        src={it.image}
                        alt=""
                        className="size-14 rounded-md object-cover"
                      />
                    ) : (
                      <div className="size-14 rounded-md bg-admin-cream" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium">{it.name}</p>
                      <p className="text-xs text-admin-muted">
                        Qty {it.quantity} × ${it.price}
                      </p>
                    </div>
                    <p className="font-semibold">${it.quantity * it.price}</p>
                  </li>
                ))}
              </ul>
            )}
          </DetailCard>
        </div>

        <DetailCard title="Activity">
          <ul className="space-y-3 text-sm">
            <li className="border-l-2 border-admin-sage pl-3">
              <p className="font-semibold">Order placed</p>
              <p className="text-xs text-admin-muted">{order.createdAt}</p>
            </li>
            <li className="border-l-2 border-admin-sage pl-3">
              <p className="font-semibold">Payment received</p>
              <p className="text-xs text-admin-muted">{order.createdAt}</p>
            </li>
            {order.status === "in_transit" || order.status === "delivered" ? (
              <li className="border-l-2 border-admin-amber pl-3">
                <p className="font-semibold">In transit</p>
              </li>
            ) : null}
            {order.status === "delivered" ? (
              <li className="border-l-2 border-admin-sage-deep pl-3">
                <p className="font-semibold">Delivered</p>
              </li>
            ) : null}
            {order.status === "cancelled" ? (
              <li className="border-l-2 border-admin-rose pl-3">
                <p className="font-semibold text-admin-rose">Cancelled</p>
              </li>
            ) : null}
          </ul>
        </DetailCard>
      </DetailGrid>

      <OrderFormDialog open={editOpen} onOpenChange={setEditOpen} order={order} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this order?"
        description={`"${order.reference}" will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
