"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { gqlRequest } from "@/utils/graphqlClient";
import {
    OrdersToolbar,
    type OrderFilter,
    type OrderSort,
} from "@/app/(site)/orders/_components/OrdersToolbar";
import { OrderCard } from "@/app/(site)/orders/_components/OrderCard";
import type { Order, OrderItem } from "@/app/(site)/orders/_components/data";
import { useRouter } from "next/navigation";
import { MY_ORDERS_QUERY } from "@/app/(site)/orders/_components/query";

const PER_PAGE = 6;

export function OrdersFeed() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<OrderFilter>("all");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<OrderSort>("date-desc");
    const [page, setPage] = useState(1);

    const router = useRouter();


    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        gqlRequest<{ myOrders: { content: Order[]; totalPage: number } }>(MY_ORDERS_QUERY, {
            status: filter === "all" ? "ALL" : filter.toUpperCase().replace("-", "_"),
            sort: sort === "date-desc" ? "NEWEST" : sort === "date-asc" ? "OLDEST" : "HIGHEST_TOTAL",
            page,
            pageSize: PER_PAGE,
        })
            .then((res) => {
                if (cancelled) return;
                setOrders(res.myOrders.content);
                setTotalPages(res.myOrders.totalPage);
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load orders.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [filter, sort, page]);

    // `query` (search box) filters orders over the current page only
    const visible = query.trim()
        ? orders.filter((o) => o.orderCode.toLowerCase().includes(query.toLowerCase()))
        : orders;

    const buyAgain = (it: OrderItem) =>
        toast.success(`${it.productName} added to cart.`);

    const downloadInvoice = (o: Order) =>
        toast.success(`Invoice ${o.orderCode}.pdf downloaded.`);

    return (
        <div className="mx-auto w-[min(90vw,1400px)] pb-16">
            <section className="pb-8">
                <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)]
                    leading-tight tracking-tight text-primary">
                    Order History
                </h1>
                <p className="mt-3 max-w-xl text-sm text-on-surface-variant">
                    Refined elegance, curated for you. Review your past selections and
                    revisit your favorite beauty experiences.
                </p>
            </section>

            <OrdersToolbar
                filter={filter}
                onFilterChange={(f) => { setFilter(f); setPage(1); }}
                query={query}
                onQueryChange={setQuery}
                sort={sort}
                onSortChange={(s) => { setSort(s); setPage(1); }}
            />

            <section className="space-y-6">
                {loading ? (
                    <p className="text-center text-sm text-on-surface-variant py-12">Loading orders…</p>
                ) : visible.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-blush/60 p-12 text-center">
                        <p className="font-display text-2xl text-primary">No orders found</p>
                        <p className="mt-2 text-sm text-on-surface-variant">
                            Adjust your filters or shop the collection.
                        </p>
                        <Button asChild className="mt-5">
                            <Link href="/collections">Shop Now</Link>
                        </Button>
                    </div>
                ) : (
                    visible.map((o) => (
                        <OrderCard
                            key={o.id}
                            order={o}
                            onBuyAgain={buyAgain}
                            onReview={(it: OrderItem) =>
                                router.push(`/collections/${it.id}#reviews`)} // Marks down for potential update
                            onDownloadInvoice={downloadInvoice}
                        />
                    ))
                )}

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`h-9 w-9 rounded-full text-sm ${page === i + 1
                                        ? "bg-primary text-primary-foreground"
                                        : "border border-blush/60 text-primary " +
                                          "hover:bg-blush/40"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}