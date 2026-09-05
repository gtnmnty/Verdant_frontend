import Image from "next/image";
import Link from "next/link";
import {ArrowRight, Download, FileText, Truck} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    STATUS_LABELS,
    formatDate,
    type Order,
    type OrderItem,
} from "@/app/(site)/orders/_components/data";

export function OrderCard({
    order: o,
    onBuyAgain,
    onReview,
    onDownloadInvoice,
}: {
    order: Order;
    onBuyAgain: (item: OrderItem) => void;
    onReview: (item: OrderItem) => void;
    onDownloadInvoice: (order: Order) => void;
}) {
    const trackable = o.status === "in-transit" || o.status === "processing";

    return (
        <article className="rounded-2xl border border-blush/50
                 bg-surface-lowest p-5 sm:p-7">
            <header className="flex flex-col gap-3 border-b border-blush/40
                 pb-4 sm:flex-row sm:items-start
                 sm:justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                        <span className={STATUS_LABELS[o.status].chip}>
                          {STATUS_LABELS[o.status].label}
                        </span>
                        <span className="mx-2 text-on-surface-variant">·</span>
                        <span className="text-primary">Order #{o.id}</span>
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                        Placed on {formatDate(o.date)}
                    </p>
                </div>
                <span className="font-display text-2xl text-primary">
                  ${o.total.toFixed(2)}
                </span>
            </header>

            {trackable && o.courier && (
                <div className="mt-4 flex flex-wrap items-center gap-2
                 rounded-xl bg-blush/20 px-4 py-3 text-xs
                 text-on-surface-variant">
                    <Truck className="h-4 w-4 shrink-0 text-soft-rose"/>
                    <span>
                        <span className="font-semibold text-primary">{o.courier}</span>
                                {o.tracking ? <> · Tracking #{o.tracking}</> : null}
                        </span>
                            {o.eta && (
                        <span className="whitespace-nowrap">
                          Est. arrival {formatDate(o.eta)}
                        </span>
                    )}
                    <Link
                        href={`/tracking/${o.id}`}
                        className="ml-auto inline-flex items-center gap-1
                            whitespace-nowrap font-semibold uppercase
                            tracking-[0.12em] text-primary
                            hover:underline"
                    >
                        Track Package <ArrowRight className="h-3.5 w-3.5"/>
                    </Link>
                </div>
            )}

            <ul className="mt-5 space-y-5">
                {o.items.map((it) => (
                    <li key={it.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden
                             rounded-xl">
                            <Image src={it.image} alt={it.name} fill sizes="80px" className="object-cover"/>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold uppercase
                               tracking-[0.16em] text-on-surface-variant">
                                {it.category}
                            </p>
                            <p className="mt-1 font-display text-lg text-primary">{it.name}</p>
                            <p className="text-xs text-on-surface-variant">
                                Quantity: {it.qty} · ${it.price.toFixed(2)}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => onBuyAgain(it)} size="sm" className="text-xs">
                                Buy Again
                            </Button>
                            {o.status === "delivered" && (
                                <Button
                                    onClick={() => onReview(it)}
                                    size="sm"
                                    variant="outline"
                                    className="border-primary text-xs text-primary"
                                >
                                    Review
                                </Button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            <footer className="mt-5 flex flex-wrap items-center justify-end
                 gap-3 border-t border-blush/40 pt-4">
                <Button asChild size="sm" variant="ghost" className="text-primary">
                    <Link href={`/orders/${o.id}`}>
                        <FileText className="mr-1.5 h-4 w-4"/> Order Details
                    </Link>
                </Button>
                <Button
                    onClick={() => onDownloadInvoice(o)}
                    size="sm"
                    variant="ghost"
                    className="text-primary"
                >
                    <Download className="mr-1.5 h-4 w-4"/> Invoice
                </Button>
            </footer>
        </article>
    );
}
