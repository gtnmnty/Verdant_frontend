import {formatDate, type Order} from "@/app/(site)/orders/_components/data";

export function OrderTimeline({order: o}: { order: Order }) {
    const steps: { label: string; done: boolean; tone: string }[] = [
        {label: "Order placed", done: true, tone: "border-primary"},
        {label: "Payment received", done: o.orderStatus !== "CANCELLED", tone: "border-primary"},
        {label: "Preparing", done: o.orderStatus !== "CANCELLED", tone: "border-champagne-gold"},
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
