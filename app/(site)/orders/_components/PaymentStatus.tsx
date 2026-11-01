// Customer-facing label per backend PaymentStatus. PAID gets no badge (it's the normal case), and a cancelled
// order's payment needs none: the order status already says "Cancelled". Orders are only created once paid, so
// the "awaiting payment" entries only ever show on old orders from before that change.
const PAYMENT_BADGES: Record<string, { label: string; className: string }> = {
    PENDING: {label: "Awaiting payment", className: "border-amber-500/30 bg-amber-500/10 text-amber-800"},
    REQUIRES_ACTION: {label: "Awaiting payment", className: "border-amber-500/30 bg-amber-500/10 text-amber-800"},
    FAILED: {label: "Payment failed", className: "border-rose-500/30 bg-rose-500/10 text-rose-700"},
    PROCESSED: {label: "Payment processing", className: "border-sky-500/30 bg-sky-500/10 text-sky-800"},
    PARTIALLY_REFUNDED: {label: "Partially refunded", className: "border-violet-500/30 bg-violet-500/10 text-violet-800"},
    REFUNDED: {label: "Refunded", className: "border-violet-500/30 bg-violet-500/10 text-violet-800"},
};

export function PaymentStatusBadge({
    orderStatus,
    paymentStatus,
}: {
    orderStatus: string;
    paymentStatus?: string | null;
}) {
    if (!paymentStatus || orderStatus === "CANCELLED") return null;
    const badge = PAYMENT_BADGES[paymentStatus];
    if (!badge) return null;
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px]
                font-semibold uppercase tracking-[0.12em] ${badge.className}`}
        >
            {badge.label}
        </span>
    );
}
