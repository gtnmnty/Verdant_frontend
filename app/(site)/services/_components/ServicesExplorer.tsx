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
import {CATEGORIES, type Category, type Service} from "@/app/(site)/services/_components/data";
import {ServiceCard} from "@/app/(site)/services/_components/ServiceCard";

const PAGE_SIZE = 6;
type SortKey = "featured" | "popular" | "price-asc" | "price-desc";

// Backend ItemCatalog enum (common.graphql) <-> frontend Category label
const CATEGORY_TO_BACKEND: Record<Category, string> = {
    Skincare: "SKIN_CARE",
    Haircare: "HAIR_CARE",
    Makeup: "MAKE_UP",
};

const CATEGORY_FROM_BACKEND: Record<string, Category> = {
    SKIN_CARE: "Skincare",
    HAIR_CARE: "Haircare",
    MAKE_UP: "Makeup",
};

// Backend ServiceSort enum has no "most popular" concept — falls back to NEWEST.
const SORT_TO_BACKEND: Record<SortKey, string> = {
    featured: "NEWEST",
    popular: "NEWEST",
    "price-asc": "PRICE_LOW_TO_HIGH",
    "price-desc": "PRICE_HIGH_TO_LOW",
};

interface BackendMediaImage {
    url: string;
    isPrimary: boolean;
}

interface BackendSalonService {
    id: string;
    name: string;
    subName: string;
    catalog: string;
    price: number;
    durationInMinutes: number;
    description: string | null;
    images: BackendMediaImage[];
    primaryImage: {url: string} | null;
    isFavorited: boolean;
}

interface ServicePage {
    items: BackendSalonService[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

const SERVICES_QUERY = `
    query Services(
        $category: String, 
        $search: String, 
        $sort: ServiceSort, 
        $page: Int, 
        $pageSize: Int
    ) {
        services(
            category: $category, 
            search: $search, 
            sort: $sort, 
            page: $page, 
            pageSize: $pageSize
        ) {
            items {
                id
                name
                subName
                catalog
                price
                durationInMinutes
                description
                primaryImage { url }
                images { url isPrimary }
                isFavorited
            }
            page
            pageSize
            totalItems
            totalPages
        }
    }
`;

const TOGGLE_FAVORITE_MUTATION = `
    mutation ToggleFavoriteService($targetId: ID!) {
        toggleFavoriteService(targetId: $targetId) {
            id
        }
    }
`;

function toService(s: BackendSalonService): Service {
    return {
        id: s.id,
        name: s.name,
        subtitle: s.subName,
        description: s.description ?? "",
        category: CATEGORY_FROM_BACKEND[s.catalog] ?? "Skincare",
        durationMin: s.durationInMinutes,
        price: s.price,
        popular: 0,
        image: s.primaryImage?.url ?? s.images[0]?.url ?? "https://picsum.photos/seed/service/900/600",
    };
}

export function ServicesExplorer() {
    const [activeFilters, setActiveFilters] = useState<Set<Category>>(new Set());
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("featured");
    const [page, setPage] = useState(1);
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());

    const [services, setServices] = useState<Service[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // The backend only supports filtering by a single category at a time,
    // so when more than one filter chip is active we fetch everything and
    // let the multi-select behave client-side won't fully apply server-side.
    const singleCategory = activeFilters.size === 1 ? [...activeFilters][0] : undefined;

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        gqlRequest<{ services: ServicePage }>(SERVICES_QUERY, {
            category: singleCategory ? CATEGORY_TO_BACKEND[singleCategory] : undefined,
            search: query.trim() || undefined,
            sort: SORT_TO_BACKEND[sort],
            page,
            pageSize: PAGE_SIZE,
        })
            .then((res) => {
                if (cancelled) return;
                const mapped = res.services.items.map(toService);
                setServices(mapped);
                setTotalPages(Math.max(1, res.services.totalPages));
                setWishlist(
                    new Set(
                        res.services.items.filter((s) =>
                            s.isFavorited).map((s) => s.id),
                    ),
                );
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load services.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [singleCategory, query, sort, page]);

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
        const wasWished = wishlist.has(id);

        setWishlist((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

        gqlRequest(TOGGLE_FAVORITE_MUTATION, {targetId: id})
            .then(() => {
                toast[wasWished ? "message" : "success"](
                    wasWished ? `Removed "${name}" from wishlist` : `Saved "${name}" to wishlist`,
                );
            })
            .catch((err) => {
                // roll back on failure
                setWishlist((prev) => {
                    const next = new Set(prev);
                    if (wasWished) next.add(id);
                    else next.delete(id);
                    return next;
                });
                toast.error(err instanceof Error ? err.message : "Failed to update wishlist.");
            });
    };

    const currentPage = Math.min(page, totalPages);

    return (
        <>
            {/* Toolbar */}
            <div className="grid grid-cols-1 items-center gap-4 border-y
                 border-border py-5
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
                                className={`rounded-full border px-4 py-1.5 text-xs 
                                font-medium tracking-wide transition-colors 
                                duration-200 ${
                                    active
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-transparent text-on-surface " +
                                          "hover:border-primary hover:text-primary"
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
                        placeholder="Search services…"
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
                    <Select value={sort} onValueChange={(v) => { setSort(v as SortKey); setPage(1); }}>
                        <SelectTrigger className="w-40">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="featured">Featured</SelectItem>
                            <SelectItem value="popular">Most Popular</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <p className="mt-20 text-center text-sm text-on-surface-variant">Loading services…</p>
            ) : services.length === 0 ? (
                <div className="mt-20 flex flex-col items-center
                 justify-center text-center">
                    <p className="font-display text-2xl text-primary">No services found</p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                        Try a different search or filter.
                    </p>
                </div>
            ) : (
                <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10
                 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((s) => (
                        <li key={s.id}>
                            <ServiceCard
                                service={s}
                                wished={wishlist.has(s.id)}
                                onWish={() => toggleWishlist(s.id, s.name)}
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