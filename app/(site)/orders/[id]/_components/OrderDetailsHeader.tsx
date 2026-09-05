import {STATUS_LABELS, formatDate, type Order} from "@/app/(site)/orders/_components/data";

export function OrderDetailsHeader({order}: { order: Order }) {
    return (
        <header className="mt-6 border-b border-blush/40 pb-6">
            <p className="text-[10px] font-semibold uppercase
                 tracking-[0.22em] text-soft-rose">
                Order Details
            </p>
            <h1 className="mt-2 wrap-break-word font-display
                 text-[clamp(1.75rem,4.5vw,3rem)]
                 leading-tight tracking-tight text-primary">
                Order #{order.id}
            </h1>
            <p className="mt-2 text-xs text-on-surface-variant">
        <span
            className={`font-semibold uppercase tracking-[0.14em] ${STATUS_LABELS[order.orderStatus].chip}`}
        >
          {STATUS_LABELS[order.orderStatus].label}
        </span>
                <span className="mx-2">·</span>
                Placed on {formatDate(order.createdAt)}
            </p>
        </header>
    );
}
