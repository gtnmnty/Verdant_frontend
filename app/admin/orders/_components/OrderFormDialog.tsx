"use client";

import {useEffect, useState} from "react";
import {Pencil} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {gqlRequest} from "@/utils/graphqlClient";

const ORDER_STATUSES = ["PLACED", "PROCESSING", "IN_TRANSIT", "DELIVERED", "CANCELLED"] as const;
const PAYMENT_STATUSES = ["PROCESSED", "PAID", "FAILED", "REFUNDED", "CANCELLED"] as const;
const DELIVERY_OPTIONS = ["STANDARD", "EXPRESS", "SAME_DAY"] as const;

interface Draft {
    fullName: string;
    phone: string;
    email: string;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal: string;
    country: string;
    items: {
        id: string;
        productId: string | null;
        productName: string;
        productImage: string | null;
        unitPrice: number;
        quantity: number;
        deliveryOption: string;
    }[];
}

interface BackendAdminOrderFull {
    id: string;
    user: { fullName: string; phone: string | null; email: string };
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    address: {
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        postal: string;
        country: string | null
    };
    items: {
        id: string;
        product: { id: string } | null;
        productName: string;
        productImage: string | null;
        unitPrice: number;
        quantity: number;
        deliveryOption: string;
    }[];
}

const ADMIN_ORDER_QUERY = `
    query AdminOrderForEdit($id: ID!) {
        adminOrder(id: $id) {
            id
            user { fullName phone email }
            orderStatus
            paymentStatus
            paymentMethod
            address { line1 line2 city state postal country }
            items {
                id
                product { id }
                productName
                productImage
                unitPrice
                quantity
                deliveryOption
            }
        }
    }
`;

const UPDATE_ORDER_MUTATION = `
    mutation AdminUpdateOrder($id: ID!, $input: AdminUpdateOrderInput!) {
        adminUpdateOrder(id: $id, input: $input) { id }
    }
`;

function toDraft(o: BackendAdminOrderFull): Draft {
    return {
        fullName: o.user.fullName,
        phone: o.user.phone ?? "",
        email: o.user.email,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        line1: o.address.line1,
        line2: o.address.line2 ?? "",
        city: o.address.city,
        state: o.address.state,
        postal: o.address.postal,
        country: o.address.country ?? "",
        items: o.items.map((it) => ({
            id: it.id,
            productId: it.product?.id ?? null,
            productName: it.productName,
            productImage: it.productImage,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
            deliveryOption: it.deliveryOption,
        })),
    };
}

export function OrderFormDialog({
    open,
    onOpenChange,
    orderId,
    onSaved,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string | null;
    onSaved: () => void;
}) {
    const [draft, setDraft] = useState<Draft | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open || !orderId) {
            setDraft(null);
            return;
        }
        setLoading(true);
        gqlRequest<{ adminOrder: BackendAdminOrderFull }>(ADMIN_ORDER_QUERY, {id: orderId})
            .then((res) => setDraft(toDraft(res.adminOrder)))
            .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load order."))
            .finally(() => setLoading(false));
    }, [open, orderId]);

    const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
        setDraft((d) => (d ? {...d, [key]: value} : d));

    const setItem =
        (index: number, patch: Partial<Draft["items"][number]>) => {
        if (!draft) return;
        set(
            "items",
            draft.items.map(
                (it, i) =>
                    (i === index ? {...it, ...patch} : it)),
        );
    };

    const handleSave = () => {
        if (!draft || !orderId) return;

        // Every line needs a real productId — an item with none (data
        // inconsistency on an old order) can't be resent to adminUpdateOrder.
        if (draft.items.some((it) => !it.productId)) {
            toast.error("One or more items on this order have no linked product and can't be saved.");
            return;
        }

        setSaving(true);
        gqlRequest(UPDATE_ORDER_MUTATION, {
            id: orderId,
            input: {
                fullName: draft.fullName,
                phone: draft.phone || undefined,
                email: draft.email,
                orderStatus: draft.orderStatus,
                paymentStatus: draft.paymentStatus,
                paymentMethod: draft.paymentMethod,
                shippingAddress: {
                    line1: draft.line1,
                    line2: draft.line2 || undefined,
                    city: draft.city,
                    state: draft.state,
                    postal: draft.postal,
                    country: draft.country || undefined,
                },
                items: draft.items.map((it) => ({
                    productId: it.productId,
                    quantity: it.quantity,
                    deliveryOption: it.deliveryOption,
                })),
            },
        })
            .then(() => {
                toast.success("Order saved.");
                onOpenChange(false);
                onSaved();
            })
            .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to save order."))
            .finally(() => setSaving(false));
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
                        <Pencil className="size-5"/> Edit Order
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <p className="py-8 text-center text-sm text-admin-muted">Loading order…</p>
                ) : draft ? (
                    <div className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <Label>Full Name</Label>
                                <Input value={draft.fullName}
                                       onChange={(e) =>
                                           set("fullName", e.target.value)}
                                       className="mt-1.5"/>
                            </div>
                            <div>
                                <Label>Phone</Label>
                                <Input value={draft.phone}
                                       onChange={(e) =>
                                           set("phone", e.target.value)}
                                       className="mt-1.5"/>
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input value={draft.email}
                                       onChange={(e) =>
                                           set("email", e.target.value)}
                                       className="mt-1.5"/>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <Label>Order Status</Label>
                                <Select value={draft.orderStatus} onValueChange={(v) => set("orderStatus", v)}>
                                    <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {ORDER_STATUSES.map((s) => (
                                            <SelectItem key={s} value={s}
                                                        className="capitalize">{s.replace("_", " ")}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Payment Status</Label>
                                <Select value={draft.paymentStatus}
                                        onValueChange={(v) =>
                                            set("paymentStatus", v)}>
                                    <SelectTrigger className="mt-1.5"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_STATUSES.map((s) => (
                                            <SelectItem key={s} value={s}
                                                        className="capitalize">{s.replace("_", " ")}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Payment Method</Label>
                                <Input value={draft.paymentMethod}
                                       onChange={(e) =>
                                           set("paymentMethod", e.target.value)} className="mt-1.5"/>
                            </div>
                        </div>

                        <div>
                            <Label>Shipping address</Label>
                            <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
                                <Input placeholder="Street address" value={draft.line1}
                                       onChange={(e) =>
                                           set("line1", e.target.value)}/>
                                <Input placeholder="Apt / Suite (optional)" value={draft.line2}
                                       onChange={(e) =>
                                           set("line2", e.target.value)}/>
                                <Input placeholder="City" value={draft.city}
                                       onChange={(e) =>
                                           set("city", e.target.value)}/>
                                <Input placeholder="State / Region" value={draft.state}
                                       onChange={(e) =>
                                           set("state", e.target.value)}/>
                                <Input placeholder="Postal code" value={draft.postal}
                                       onChange={(e) =>
                                           set("postal", e.target.value)}/>
                                <Input placeholder="Country" value={draft.country}
                                       onChange={(e) =>
                                           set("country", e.target.value)}/>
                            </div>
                        </div>

                        <div>
                            {/* Product/price/name come from the real Product record and
                  aren't editable here — only quantity and delivery option
                  are actual per-line fields on the backend. There's also no
                  UI yet to add or remove a line item. */}
                            <Label>Ordered items</Label>
                            <div className="mt-2 space-y-2">
                                {draft.items.map((it, i) => (
                                    <div
                                        key={it.id}
                                        className="grid grid-cols-[64px_minmax(0,1fr)_80px_140px]
                                        items-center gap-3 rounded-lg border border-admin-line p-2"
                                    >
                                        {it.productImage ? (
                                            // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs
                                            <img src={it.productImage} alt=""
                                                 className="size-14 rounded-md object-cover"/>
                                        ) : (
                                            <div className="size-14 rounded-md bg-admin-cream"/>
                                        )}
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{it.productName}</p>
                                            <p className="text-xs text-admin-muted">${it.unitPrice} each</p>
                                        </div>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={it.quantity}
                                            onChange={(e) =>
                                                setItem(i, {quantity: Number(e.target.value)})}
                                        />
                                        <Select value={it.deliveryOption}
                                                onValueChange={(v) => setItem(i, {deliveryOption: v})}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                {DELIVERY_OPTIONS.map((d) => (
                                                    <SelectItem key={d} value={d}
                                                                className="capitalize">{
                                                                d.replace("_", " ")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                    <Button onClick={handleSave} disabled={!draft || saving}>
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
