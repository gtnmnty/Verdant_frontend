"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdmin } from "@/lib/admin/store";
import type { Order, OrderStatus } from "@/lib/admin/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "in_transit",
  "delivered",
  "cancelled",
];

export function OrderFormDialog({
  open,
  onOpenChange,
  order,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}) {
  const { setOrders } = useAdmin();
  const [draft, setDraft] = useState<Order | null>(null);

  useEffect(() => {
    if (open) setDraft(order ? { ...order } : null);
  }, [open, order]);

  const set = <K extends keyof Order>(key: K, value: Order[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const setItem = (index: number, patch: Partial<Order["items"][number]>) => {
    if (!draft) return;
    set(
      "items",
      draft.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    );
  };

  const handleSave = () => {
    if (!draft) return;
    const total = draft.subtotal + draft.deliveryFee;
    const itemsCount = draft.items.reduce((sum, it) => sum + it.quantity, 0);
    setOrders((prev) =>
      prev.map((o) => (o.id === draft.id ? { ...draft, total, itemsCount } : o)),
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] max-w-2xl overflow-y-auto"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
            e.preventDefault();
            handleSave();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="inline-flex items-center gap-2">
            <Pencil className="size-5" /> Edit Order
          </DialogTitle>
        </DialogHeader>

        {draft ? (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="o-customer">Customer</Label>
                <Input
                  id="o-customer"
                  value={draft.customer}
                  onChange={(e) => set("customer", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="o-reference">Reference</Label>
                <Input
                  id="o-reference"
                  value={draft.reference}
                  onChange={(e) => set("reference", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Status</Label>
                <Select
                  value={draft.status}
                  onValueChange={(v) => set("status", v as OrderStatus)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Delivery method</Label>
                <Select
                  value={draft.deliveryMethod}
                  onValueChange={(v) => set("deliveryMethod", v as Order["deliveryMethod"])}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="o-address">Shipping address</Label>
              <Input
                id="o-address"
                value={draft.shippingAddress}
                onChange={(e) => set("shippingAddress", e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="o-subtotal">Subtotal ($)</Label>
                <Input
                  id="o-subtotal"
                  type="number"
                  value={draft.subtotal}
                  onChange={(e) => set("subtotal", Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="o-delivery-fee">Delivery fee ($)</Label>
                <Input
                  id="o-delivery-fee"
                  type="number"
                  value={draft.deliveryFee}
                  onChange={(e) => set("deliveryFee", Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="o-total">Total ($)</Label>
                <Input
                  id="o-total"
                  type="number"
                  value={draft.subtotal + draft.deliveryFee}
                  readOnly
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label>Ordered items</Label>
              <div className="mt-2 space-y-2">
                {draft.items.map((it, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[64px_minmax(0,1fr)_80px_80px] items-center gap-3 rounded-lg border border-admin-line p-2"
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
                    <Input
                      value={it.name}
                      onChange={(e) => setItem(i, { name: e.target.value })}
                    />
                    <Input
                      type="number"
                      value={it.quantity}
                      onChange={(e) => setItem(i, { quantity: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      value={it.price}
                      onChange={(e) => setItem(i, { price: Number(e.target.value) })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!draft}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
