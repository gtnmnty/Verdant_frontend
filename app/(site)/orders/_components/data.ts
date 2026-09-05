export type OrderStatus = "PROCESSING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
    id: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
}

export interface Order {
    id: string;
    orderCode: string;
    orderStatus: OrderStatus;
    total: number;
    createdAt: string;
    items: OrderItem[];
    courier?: string;
    tracking?: string;
    eta?: string;
    customer?: string;
    email?: string;
    phone?: string;
    deliveryMethod?: "delivery" | "pickup";
    shippingAddress?: string;
    branch?: string;
    paymentMethod?: string;
    deliveryFee?: number;
    notes?: string;
}

export const STATUS_LABELS: Record<OrderStatus, { label: string; chip: string }> = {
    PROCESSING: {   label: "Processing",   chip: "text-amber-700" },
    IN_TRANSIT: {   label: "In Transit",   chip: "text-soft-rose" },
    DELIVERED: {    label: "Delivered",    chip: "text-emerald-700" },
    CANCELLED: {    label: "Cancelled",    chip: "text-rose-600" },
};

export function orderSubtotal(o: Order) {
    return o.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
}

export function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}