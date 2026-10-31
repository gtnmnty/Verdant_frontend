import {formatDate, type Order} from "@/app/(site)/orders/_components/data";

// Payment statuses where the money was actually received (a later refund doesn't undo that).
const RECEIVED_PAYMENT = new Set(["PAID", "PARTIALLY_REFUNDED", "REFUNDED"]);

export function OrderTimeline({order: o}: { order: Order }) {
    const paid = o.paymentStatus ? RECEIVED_PAYMENT.has(o.paymentStatus) : o.orderStatus !== "CANCELLED";
    const steps: { label: string; done: boolean; tone: string }[] = [
        {label: "Order placed", done: true, tone: "border-primary"},
        {label: "Payment received", done: paid, tone: "border-primary"},
        // Matches the tracking page: a just-placed order isn't being prepared yet.
        {
            label: "Preparing",
            done: o.orderStatus === "PROCESSING" || o.orderStatus === "IN_TRANSIT" || o.orderStatus === "DELIVERED",
            tone: "border-champagne-gold",
        },
        {
            label: "In transit",
            done: o.orderStatus === "IN_TRANSIT" || o.orderStatus === "DELIVERED",
            tone: "border-champagne-gold",
        },
        {label: "Delivered", done: o.orderStatus === "DELIVERED", tone: "border-emerald-600"},
    ];

    return (
        <ul className="space-y-3 text-sm">
            {steps.map((s) => (
                <li
                    key={s.label}
                    className={`border-l-2 pl-3 ${s.done ? s.tone : "border-blush/50 opacity-60"}`}
                >
                    <p className="font-semibold text-on-surface">{s.label}</p>
                    <p className="text-xs text-on-surface-variant">
                        {s.done ? formatDate(o.createdAt) : "Pending"}
                    </p>
                </li>
            ))}
            {o.orderStatus === "CANCELLED" ? (
                <li className="border-l-2 border-rose-500 pl-3">
                    <p className="font-semibold text-rose-600">Cancelled</p>
                    <p className="text-xs text-on-surface-variant">
                        This order was cancelled and refunded.
                    </p>
                </li>
            ) : null}
        </ul>
    );
}
