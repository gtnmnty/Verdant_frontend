"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {Search, Star} from "lucide-react";
import {toast} from "sonner";
import {DataTable, type Column} from "@/app/admin/_components/DataTable";
import {PageHeader} from "@/app/admin/_components/PageHeader";
import {StatusBadge} from "@/app/admin/_components/StatusBadge";
import {Input} from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Stars} from "@/app/admin/reviews/_components/Stars";
import {gqlRequest} from "@/utils/graphqlClient";
import type {AdminReview} from "@/app/admin/reviews/_components/types";

const STAR_FILTER_TO_BACKEND: Record<number, string | undefined> = {
    0: undefined,
    5: "FIVE_STARS",
    4: "FOUR_STARS",
    3: "THREE_STARS",
    2: "TWO_STARS",
    1: "ONE_STARS",
};

interface BackendAdminReviewDto {
    id: string;
    user: { fullName: string };
    itemType: "PRODUCT" | "SALON_SERVICE";
    itemName: string;
    stars: number;
    text: string | null;
    createdAt: string;
}

interface AdminReviewPage {
    items: BackendAdminReviewDto[];
    totalItems: number;
}

const ADMIN_REVIEWS_QUERY = `
    query AdminReviews(
        $itemType: ItemType, 
        $filter: ReviewsClientFilter, 
        $search: String, 
        $sort: AdminReviewSort, 
        $page: Int, 
        $pageSize: Int
    ) {
        adminReviews(
        itemType: $itemType, 
        filter: $filter, 
        search: $search, 
        sort: $sort, 
        page: $page, 
        pageSize: $pageSize
        ) {
            items {
                id
                user { fullName }
                itemType
                itemName
                stars
                text
                createdAt
            }
            totalItems
        }
    }
`;

function toAdminReview(r: BackendAdminReviewDto): AdminReview {
    return {
        id: r.id,
        customer: r.user.fullName,
        rating: r.stars,
        content: r.text ?? "",
        itemType: r.itemType === "PRODUCT" ? "product" : "service",
        itemName: r.itemName,
        reviewDate: new Date(r.createdAt).toLocaleDateString(),
    };
}

const FALLBACK_AVATAR = "https://picsum.photos/seed/review-admin/100/100";

export function ReviewsContent() {
    const router = useRouter();
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [typeFilter, setTypeFilter] = useState<"all" | "product" | "service">("all");
    const [starFilter, setStarFilter] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);

    useEffect(() => {
        setLoading(true);
        gqlRequest<{ adminReviews: AdminReviewPage }>(ADMIN_REVIEWS_QUERY, {
            itemType: typeFilter === "all" ? undefined : typeFilter === "product" ? "PRODUCT" : "SALON_SERVICE",
            filter: STAR_FILTER_TO_BACKEND[starFilter],
            search: q.trim() || undefined,
            sort: "NEWEST",
            page: 1,
            pageSize: 100,
        })
            .then((res) => setReviews(res.adminReviews.items.map(toAdminReview)))
            .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load reviews."))
            .finally(() => setLoading(false));
    }, [q, typeFilter, starFilter]);

    const filtered = useMemo(() => reviews, [reviews]);

    const columns: Column<AdminReview>[] = [
        {
            key: "customer",
            header: "Customer",
            sortable: true,
            sortValue: (r) => r.customer,
            render: (r) => (
                <div className="flex min-w-0 items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- no real avatar field on AdminReviewDto */}
                    <img src={FALLBACK_AVATAR} alt="" className="size-9 shrink-0 rounded-full"/>
                    <div className="min-w-0">
                        <p className="truncate font-medium">{r.customer}</p>
                        <p className="truncate text-xs text-admin-muted">{r.itemName}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "rating",
            header: "Rating",
            sortable: true,
            sortValue: (r) => r.rating,
            render: (r) => <Stars value={r.rating}/>,
        },
        {
            key: "content",
            header: "Review",
            render: (r) =>
                <p className="line-clamp-2 max-w-xs text-sm">{r.content}</p>,
        },
        {
            key: "date",
            header: "Date",
            sortable: true,
            sortValue: (r) => r.reviewDate,
            render: (r) =>
                <span className="text-xs text-admin-muted">{r.reviewDate}</span>,
        },
        {
            key: "type",
            header: "Item Type",
            render: (r) => <StatusBadge status={r.itemType}/>,
        },
    ];

    return (
        <>
            <PageHeader
                title="Reviews"
                description="Read-only — there's no backend
                endpoint yet to edit, delete, or moderate a
                customer's review."
                actions={
                    <>
                        <div className="relative">
                            <Search
                                className="pointer-events-none absolute
                                left-3 top-1/2 size-4 -translate-y-1/2
                                text-admin-muted"/>
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search"
                                className="h-9 w-48 rounded-full
                                border-admin-line bg-admin-surface
                                pl-9 sm:w-64"
                            />
                        </div>
                        <Select
                            value={typeFilter}
                            onValueChange={(v: string) => setTypeFilter(v as typeof typeFilter)}
                        >
                            <SelectTrigger className="h-9 w-32 rounded-full
                            border-admin-line bg-admin-surface">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="service">Service</SelectItem>
                            </SelectContent>
                        </Select>
                    </>
                }
            />

            <div className="mb-4 flex flex-wrap gap-2">
                {[0, 5, 4, 3, 2, 1].map((n) => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => setStarFilter(n as typeof starFilter)}
                        className={`inline-flex items-center gap-1 
                        rounded-full border px-3 py-1.5 text-xs 
                        font-medium ${
                            starFilter === n
                                ? "border-admin-sidebar bg-admin-sidebar text-white"
                                : "border-admin-line bg-admin-surface text-admin-muted " +
                                  "hover:text-admin-ink"
                        }`}
                    >
                        {n === 0 ? (
                            "All ratings"
                        ) : (
                            <>
                                <span>{n}</span>
                                <Star className="size-3 fill-current"/>
                            </>
                        )}
                    </button>
                ))}
            </div>

            <DataTable
                rows={filtered}
                columns={columns}
                emptyTitle={loading ? "Loading…" : "No reviews found"}
                emptyDescription={loading ?
                    "Fetching reviews from the server." : "Try a different search, rating, or item type filter."}
                rowActions={(r) => [
                    {label: "View details", onSelect: () => router.push(`/admin/reviews/${r.id}`)},
                ]}
            />
        </>
    );
}
