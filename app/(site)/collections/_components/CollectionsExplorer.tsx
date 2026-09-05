"use client";

import {useMemo, useState} from "react";
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
import {CATEGORIES, PRODUCTS, type Category} from "@/app/(site)/collections/_components/data";
import {ProductCard} from "@/app/(site)/collections/_components/ProductCard";

const PAGE_SIZE = 6;
type SortKey = "newest" | "oldest" | "price-low" | "price-high";

export function CollectionsExplorer() {
    const [activeFilters, setActiveFilters] = useState<Set<Category>>(new Set());
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("newest");
    const [page, setPage] = useState(1);
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());

    const toggleFilter = (cat: Category) => {
        setActiveFilters((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
        setPage(1);
    };

    const toggleWishlist = (id: string, name: string) => {
        setWishlist((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                toast(`Removed "${name}" from wishlist`);
            } else {
                next.add(id);
                toast.success(`Added "${name}" to wishlist`);
            }
            return next;
        });
    };

    const filtered = useMemo(() => {
        let list = PRODUCTS.filter((p) =>
            activeFilters.size === 0 ? true : activeFilters.has(p.category),
        );
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.subLabel.toLowerCase().includes(q),
            );
        }
        list = [...list].sort((a, b) => {
            switch (sort) {
                case "oldest":
                    return a.createdAt - b.createdAt;
                case "price-low":
                    return a.price - b.price;
                case "price-high":
                    return b.price - a.price;
                default:
                    return b.createdAt - a.createdAt;
            }
        });
        return list;
    }, [activeFilters, query, sort]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paged = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

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
                        const active = activeFilters.has(cat);
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => toggleFilter(cat)}
                                aria-pressed={active}
                                className={`rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-colors duration-200 ${
                                    active
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-transparent text-on-surface hover:border-primary hover:text-primary"
                                }`}
                            >
                                {cat}
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
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(1);
                        }}
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
            {paged.length === 0 ? (
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
                    {paged.map((p) => (
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
                                    className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
                                />
                            </PaginationItem>
                            {Array.from({length: totalPages}).map((_, i) => {
                                const n = i + 1;
                                return (
                                    <PaginationItem key={n}>
                                        <PaginationLink
                                            href="#"
                                            isActive={n === currentPage}
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
                                        currentPage === totalPages ? "pointer-events-none opacity-40" : ""
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
