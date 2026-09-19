"use client";

import {useEffect, useState} from "react";
import {Search} from "lucide-react";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {gqlRequest} from "@/utils/graphqlClient";
import {ProductCard} from "@/app/(site)/collections/_components/ProductCard";
import {
    PRODUCTS_QUERY,
    TOGGLE_FAVORITE_PRODUCT_MUTATION,
    CATEGORY_LABELS,
    type BackendProductSummary,
} from "@/app/(site)/collections/_components/query";

const PAGE_SIZE = 6;

// Backend only supports filtering by a single category at a time
// (ProductSpec.hasCategory does an equality check, not an IN clause),
// so this is a single-select toggle rather than the multi-select the
// old mock UI had.
const CATEGORIES = ["SKIN_CARE", "HAIR_CARE", "MAKE_UP"] as const;
type Category = (typeof CATEGORIES)[number];

type SortKey = "newest" | "oldest" | "price-low" | "price-high";

const SORT_TO_BACKEND: Record<SortKey, string> = {
    "newest": "NEWEST",
    "oldest": "OLDEST",
    "price-low": "PRICE_LOW_TO_HIGH",
    "price-high": "PRICE_HIGH_TO_LOW",
};

export function CollectionsExplorer() {
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("newest");
    const [page, setPage] = useState(1);

    const [products, setProducts] = useState<BackendProductSummary[]>([]);
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const toggleCategory = (cat: Category) => {
        setActiveCategory((prev) => (prev === cat ? null : cat));
        setPage(1);
    };

    // Debounce search input so we're not firing a request on every keystroke.
    const [debouncedQuery, setDebouncedQuery] = useState("");
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(t);
    }, [query]);

    useEffect(() => {
        setPage(1);
    }, [debouncedQuery, activeCategory, sort]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        gqlRequest<{ products: {
            items: BackendProductSummary[];
            totalPages: number;
        } }>(PRODUCTS_QUERY, {
            category: activeCategory ?? undefined,
            search: debouncedQuery.trim() || undefined,
            sort: SORT_TO_BACKEND[sort],
            page,
            pageSize: PAGE_SIZE,
        })
            .then((res) => {
                if (cancelled) return;
                setProducts(res.products.items);
                setTotalPages(Math.max(1, res.products.totalPages));
                setWishlist(new Set(res.products.items.filter((p) => p.isFavorited).map((p) => p.id)));
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load products.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [activeCategory, debouncedQuery, sort, page]);

    const toggleWishlist = (id: string, name: string) => {
        const wasWished = wishlist.has(id);

        setWishlist((prev) => {
            const next = new Set(prev);
            if (wasWished) next.delete(id); else next.add(id);
            return next;
        });

        gqlRequest(TOGGLE_FAVORITE_PRODUCT_MUTATION, {targetId: id})
            .then(() => {
                if (wasWished) {
                    toast(`Removed "${name}" from wishlist`);
                } else {
                    toast.success(`Added "${name}" to wishlist`);
                }
            })
            .catch((err) => {
                // Roll back on failure.
                setWishlist((prev) => {
                    const next = new Set(prev);
                    if (wasWished) next.add(id); else next.delete(id);
                    return next;
                });
                toast.error(err instanceof Error ? err.message : "Failed to update wishlist.");
            });
    };

    return (
        <>
            {/* Toolbar */}
            <div className="grid grid-cols-1 items-center gap-4 border-b
                 border-border pb-6
                 md:grid-cols-[1fr_auto_1fr]">
                {/* Filters */}
                <div className="flex min-w-0 flex-wrap items-center
                 justify-center gap-2 md:justify-start">
                    {CATEGORIES.map((cat) => {
                        const active = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => toggleCategory(cat)}
                                aria-pressed={active}
                                className={`rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-colors duration-200 ${
                                    active
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-transparent text-on-surface hover:border-primary hover:text-primary"
                                }`}
                            >
                                {CATEGORY_LABELS[cat]}
                            </button>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-[min(380px,40vw)]
                 md:justify-self-center">
                    <Search className="pointer-events-none absolute left-4 top-1/2
                            h-4 w-4 -translate-y-1/2
                            text-on-surface-variant"/>
                    <Input
                        type="search"
                        placeholder="Search the edit…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Sort */}
                <div className="flex items-center justify-center gap-2
                     md:justify-end">
                    <span className="text-xs uppercase tracking-[0.15em]
                         text-on-surface-variant">
                        Sort By:
                    </span>
                    <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                        <SelectTrigger className="w-40">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <p className="mt-20 text-center text-sm text-on-surface-variant">Loading products…</p>
            ) : products.length === 0 ? (
                <div className="mt-20 flex flex-col items-center
                 justify-center text-center">
                    <p className="font-display text-2xl text-primary">No products found</p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                        Try adjusting your filters or search query.
                    </p>
                </div>
            ) : (
                <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12
                 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((p) => (
                        <li key={p.id}>
                            <ProductCard
                                product={p}
                                wished={wishlist.has(p.id)}
                                onWish={() => toggleWishlist(p.id, p.name)}
                            />
                        </li>
                    ))}
                </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-16 border-t border-border pt-8">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPage((p) => Math.max(1, p - 1));
                                    }}
                                    className={page === 1 ? "pointer-events-none opacity-40" : ""}
                                />
                            </PaginationItem>
                            {Array.from({length: totalPages}).map((_, i) => {
                                const n = i + 1;
                                return (
                                    <PaginationItem key={n}>
                                        <PaginationLink
                                            href="#"
                                            isActive={n === page}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setPage(n);
                                            }}
                                        >
                                            {String(n).padStart(2, "0")}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPage((p) => Math.min(totalPages, p + 1));
                                    }}
                                    className={
                                        page === totalPages ? "pointer-events-none opacity-40" : ""
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </>
    );
}
