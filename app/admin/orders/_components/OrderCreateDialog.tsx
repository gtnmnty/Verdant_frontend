"use client";

import {useEffect, useState} from "react";
import {Plus, Trash2} from "lucide-react";
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
import {PaymentStep} from "@/app/(site)/checkout/_components/PaymentStep";
import {gqlRequest} from "@/utils/graphqlClient";

// Bank uses the same Stripe card form as Card (the backend only enables Stripe "card"); it is stored as "bank" for
// the records. Cash needs no payment step: Place Order creates the paid order straight away.
const PAYMENT_METHODS = [
    {value: "card", label: "Card"},
    {value: "bank", label: "Bank"},
    {value: "cash", label: "Cash"},
] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

const DELIVERY_OPTIONS = ["STANDARD", "EXPRESS", "SAME_DAY"] as const;

interface ProductOption {
    id: string;
    name: string;
    price: number;
    salePrice: number | null;
    stockQuantity: number;
}

interface Line {
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    deliveryOption: string;
}

const PRODUCTS_QUERY = `
    query OrderProducts($search: String) {
        adminProducts(search: $search, status: ACTIVE, page: 1, pageSize: 20) {
            items { id name price salePrice stockQuantity }
        }
    }
`;

const CREATE_CASH_ORDER_MUTATION = `
    mutation AdminCreateOrder($input: AdminCreateOrderInput!) {
        adminCreateOrder(input: $input) { id orderCode }
    }
`;

const START_PAYMENT_MUTATION = `
    mutation AdminStartOrderPayment($input: AdminCreateOrderInput!) {
        adminStartOrderPayment(input: $input) { paymentIntentId clientSecret amount }
    }
`;

const FINALIZE_MUTATION = `
    mutation AdminFinalizeCheckout($paymentIntentId: String!) {
        finalizeCheckout(paymentIntentId: $paymentIntentId) { id orderCode }
    }
`;

const EMPTY_FORM = {
    email: "", fullName: "", phone: "",
    line1: "", line2: "", city: "", state: "", postal: "", country: "US",
    promoCode: "",
};

// Staff-placed order. An order is only ever written once it is paid: Cash is paid on the spot; Card and Bank
// open the Stripe card form (staff type the customer's card) and the order is created when it succeeds.
export function OrderCreateDialog({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: () => void;
}) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [method, setMethod] = useState<PaymentMethod>("cash");
    const [lines, setLines] = useState<Line[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [productResults, setProductResults] = useState<ProductOption[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [payment, setPayment] = useState<{clientSecret: string; amount: number} | null>(null);

    const reset = () => {
        setForm(EMPTY_FORM);
        setMethod("cash");
        setLines([]);
        setProductSearch("");
        setPayment(null);
    };

    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(() => {
            gqlRequest<{ adminProducts: { items: ProductOption[] } }>(
                PRODUCTS_QUERY, {search: productSearch.trim() || undefined})
                .then((res) => setProductResults(res.adminProducts.items))
                .catch(() => setProductResults([]));
        }, 250);
        return () => clearTimeout(timer);
    }, [open, productSearch]);

    const set = (key: keyof typeof EMPTY_FORM, value: string) => setForm((f) => ({...f, [key]: value}));

    const addProduct = (p: ProductOption) => {
        setLines((prev) => prev.some((l) => l.productId === p.id)
            ? prev // one line per product (the backend rejects duplicates)
            : [...prev, {
                productId: p.id, name: p.name, unitPrice: p.salePrice ?? p.price,
                quantity: 1, deliveryOption: "STANDARD",
            }]);
    };

    const patchLine = (index: number, patch: Partial<Line>) =>
        setLines((prev) => prev.map((l, i) => (i === index ? {...l, ...patch} : l)));

    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

    const buildInput = () => ({
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        shippingAddress: {
            line1: form.line1.trim(),
            line2: form.line2.trim() || undefined,
            city: form.city.trim(),
            state: form.state.trim(),
            postal: form.postal.trim(),
            country: form.country.trim(),
        },
        paymentMethod: method,
        promoCode: form.promoCode.trim() || undefined,
        items: lines.map((l) => ({
            productId: l.productId, quantity: l.quantity, deliveryOption: l.deliveryOption,
        })),
    });

    const validate = (): string | null => {
        if (!form.email.trim()) return "Enter the customer's account email.";
        if (!form.fullName.trim()) return "Enter the customer's full name.";
        if (!form.phone.trim()) return "Enter the customer's phone number.";
        if (!form.line1.trim() || !form.city.trim() || !form.state.trim() || !form.postal.trim() || !form.country.trim()) {
            return "Complete the shipping address.";
        }
        if (lines.length === 0) return "Add at least one item.";
        if (lines.some((l) => !Number.isInteger(l.quantity) || l.quantity < 1)) return "Quantities must be at least 1.";
        return null;
    };

    const handleSubmit = () => {
        const problem = validate();
        if (problem) {
            toast.error(problem);
            return;
        }
        setSubmitting(true);

        if (method === "cash") {
            gqlRequest<{ adminCreateOrder: { orderCode: string } }>(
                CREATE_CASH_ORDER_MUTATION, {input: buildInput()})
                .then((res) => {
                    toast.success(`Order ${res.adminCreateOrder.orderCode} placed and marked paid.`);
                    reset();
                    onOpenChange(false);
                    onCreated();
                })
                .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to place order."))
                .finally(() => setSubmitting(false));
            return;
        }

        gqlRequest<{ adminStartOrderPayment: { clientSecret: string; amount: number } }>(
            START_PAYMENT_MUTATION, {input: buildInput()})
            .then((res) => setPayment(res.adminStartOrderPayment))
            .catch((err) => toast.error(err instanceof Error ? err.message : "Couldn't start the payment."))
            .finally(() => setSubmitting(false));
    };

    // Stripe took the card: create the order. A thrown Error's message shows in the card form.
    const handlePaid = async (paymentIntentId: string) => {
        const res = await gqlRequest<{ finalizeCheckout: { orderCode: string } }>(
            FINALIZE_MUTATION, {paymentIntentId});
        toast.success(`Order ${res.finalizeCheckout.orderCode} placed and paid.`);
        reset();
        onOpenChange(false);
        onCreated();
    };

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
            <DialogContent className="max-h-[90vh] gap-6 overflow-y-auto p-6 sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="inline-flex items-center gap-2">
                        <Plus className="size-5"/> New Order
                    </DialogTitle>
                </DialogHeader>

                {payment ? (
                    <PaymentStep
                        clientSecret={payment.clientSecret}
                        amountDue={Number(payment.amount)}
                        onPaid={handlePaid}
                        returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/admin/orders`}
                        description={`Enter the customer's card${method === "bank" ? " (recorded as a bank payment)" : ""}. The order is created as soon as the payment goes through.`}
                    />
                ) : (
                    <div className="grid gap-5">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <Label>Customer account email</Label>
                                <Input value={form.email} onChange={(e) => set("email", e.target.value)}
                                       className="mt-1.5" placeholder="customer@example.com"/>
                            </div>
                            <div>
                                <Label>Full name</Label>
                                <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
                                       className="mt-1.5"/>
                            </div>
                            <div>
                                <Label>Phone</Label>
                                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                                       className="mt-1.5"/>
                            </div>
                        </div>

                        <div>
                            <Label>Shipping address</Label>
                            <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
                                <Input placeholder="Street address" value={form.line1}
                                       onChange={(e) => set("line1", e.target.value)}/>
                                <Input placeholder="Apt / Suite (optional)" value={form.line2}
                                       onChange={(e) => set("line2", e.target.value)}/>
                                <Input placeholder="City" value={form.city}
                                       onChange={(e) => set("city", e.target.value)}/>
                                <Input placeholder="State / Region" value={form.state}
                                       onChange={(e) => set("state", e.target.value)}/>
                                <Input placeholder="Postal code" value={form.postal}
                                       onChange={(e) => set("postal", e.target.value)}/>
                                <Input placeholder="Country" value={form.country}
                                       onChange={(e) => set("country", e.target.value)}/>
                            </div>
                        </div>

                        <div>
                            <Label>Items</Label>
                            <Input className="mt-1.5" placeholder="Search products to add…" value={productSearch}
                                   onChange={(e) => setProductSearch(e.target.value)}/>
                            {productResults.length > 0 && (
                                <ul className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-admin-line">
                                    {productResults.map((p) => (
                                        <li key={p.id}>
                                            <button
                                                type="button"
                                                onClick={() => addProduct(p)}
                                                disabled={p.stockQuantity < 1}
                                                className="flex w-full items-center justify-between px-3 py-1.5
                                                    text-left text-sm hover:bg-admin-cream disabled:opacity-50"
                                            >
                                                <span className="truncate">{p.name}</span>
                                                <span className="shrink-0 text-xs text-admin-muted">
                                                    ${p.salePrice ?? p.price} · {p.stockQuantity} in stock
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="mt-3 space-y-2">
                                {lines.map((l, i) => (
                                    <div key={l.productId}
                                         className="grid grid-cols-[minmax(0,1fr)_80px_140px_36px] items-center gap-3
                                            rounded-lg border border-admin-line p-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{l.name}</p>
                                            <p className="text-xs text-admin-muted">${l.unitPrice} each</p>
                                        </div>
                                        <Input type="number" min={1} value={l.quantity}
                                               onChange={(e) => patchLine(i, {quantity: Number(e.target.value)})}/>
                                        <Select value={l.deliveryOption}
                                                onValueChange={(v) => patchLine(i, {deliveryOption: v})}>
                                            <SelectTrigger className="w-full"><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                {DELIVERY_OPTIONS.map((d) => (
                                                    <SelectItem key={d} value={d}>{d.replace("_", " ")}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="ghost" size="icon-sm"
                                                aria-label={`Remove ${l.name}`}
                                                onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))}>
                                            <Trash2 className="size-4"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            {lines.length > 0 && (
                                <p className="mt-2 text-right text-xs text-admin-muted">
                                    Items subtotal ${subtotal.toFixed(2)} (delivery fee and promo are added at checkout)
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label>Payment method</Label>
                                <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                                    <SelectTrigger className="mt-1.5 w-full"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_METHODS.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Promo code (optional)</Label>
                                <Input value={form.promoCode} onChange={(e) => set("promoCode", e.target.value)}
                                       className="mt-1.5"/>
                            </div>
                        </div>
                    </div>
                )}

                {!payment && (
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting
                                ? "Working…"
                                : method === "cash" ? "Place Order" : "Continue to payment"}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
