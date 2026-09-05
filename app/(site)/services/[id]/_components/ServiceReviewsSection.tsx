"use client";

import {useEffect, useMemo, useState, type SubmitEvent} from "react";
import {toast} from "sonner";
import {Star} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {Progress} from "@/components/ui/progress";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {gqlRequest} from "@/utils/graphqlClient";
import {SectionTitle, Stars} from "@/app/(site)/services/[id]/_components/shared";

const PER_PAGE = 3;
type SortKey = "recent" | "high" | "low";

interface BackendReview {
    id: string;
    user: {fullName: string};
    stars: number;
    text: string | null;
    createdAt: string;
}

interface ReviewConnection {
    items: BackendReview[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

const REVIEWS_QUERY = `
    query Reviews(
        $targetId: ID!, 
        $sort: ReviewClientSort, 
        $page: Int!, 
        $pageSize: Int!
    ) {
        reviews(
            targetType: SALON_SERVICE, 
            targetId: $targetId, 
            sort: $sort, page: 
            $page, 
            pageSize: $pageSize
        ) {
            items {
                id
                user { fullName }
                stars
                text
                createdAt
            }
            totalCount
            totalPages
            currentPage
        }
    }
`;

const UPSERT_REVIEW_MUTATION = `
    mutation UpsertReview(
        $targetId: ID!, 
        $stars: Int!, 
        $text: String
    ) {
        upsertReview(
            targetType: SALON_SERVICE,
            targetId: $targetId, 
            stars: $stars, 
            text: $text
        ) {
            id
        }
    }
`;

const SORT_TO_BACKEND: Record<SortKey, string> = {
    recent: "MOST_RECENT",
    high: "HIGHEST_RATED",
    low: "LOWEST_RATED",
};

export function ServiceReviewsSection({serviceId}: { serviceId: string }) {
    const [reviews, setReviews] = useState<BackendReview[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const [reviewSort, setReviewSort] = useState<SortKey>("recent");
    const [reviewPage, setReviewPage] = useState(0); // backend reviews query is 0-indexed

    const [rvRating, setRvRating] = useState(5);
    const [rvText, setRvText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        gqlRequest<{ reviews: ReviewConnection }>(REVIEWS_QUERY, {
            targetId: serviceId,
            sort: SORT_TO_BACKEND[reviewSort],
            page: reviewPage,
            pageSize: PER_PAGE,
        })
            .then((res) => {
                if (cancelled) return;
                setReviews(res.reviews.items);
                setTotalCount(res.reviews.totalCount);
                setTotalPages(Math.max(1, res.reviews.totalPages));
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load reviews.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [serviceId, reviewSort, reviewPage]);

    const breakdown = useMemo(() => {
        const counts = [0, 0, 0, 0, 0];
        reviews.forEach((r) => {
            if (r.stars >= 1 && r.stars <= 5) counts[r.stars - 1]++;
        });
        const t = reviews.length || 1;
        return [5, 4, 3, 2, 1].map((s) => ({
            star: s,
            pct: Math.round((counts[s - 1] / t) * 100),
            count: counts[s - 1],
        }));
    }, [reviews]);

    const averageRating =
        reviews.reduce((a, r) => a + r.stars, 0) / (reviews.length || 1);

    const submitReview = (e: SubmitEvent) => {
        e.preventDefault();
        if (!rvText.trim()) {
            toast.error("Please write a review before submitting.");
            return;
        }
        setSubmitting(true);
        gqlRequest(UPSERT_REVIEW_MUTATION, {
            targetId: serviceId,
            stars: rvRating,
            text: rvText.trim(),
        })
            .then(() => {
                toast.success("Review submitted", {description: "Thank you for sharing."});
                setRvRating(5);
                setRvText("");
                setReviewPage(0);
                setReviewSort("recent");
            })
            .catch((err) => {
                toast.error(err instanceof Error ? err.message : "Failed to submit review.");
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <section className="mt-[clamp(40px,6vw,80px)]">
            <SectionTitle eyebrow="Client Voices" title="Customer Reviews"/>

            <div className="mt-6 grid grid-cols-1 gap-8
                 lg:grid-cols-[280px_1fr]">
                <aside className="rounded-2xl border border-border
                 bg-surface-lowest p-5">
                    <p className="font-display text-4xl text-primary">
                        {reviews.length > 0 ? averageRating.toFixed(1) : "—"}
                    </p>
                    <Stars value={averageRating}/>
                    <p className="mt-1 text-xs text-on-surface-variant">
                        Based on {totalCount} reviews
                    </p>
                    <ul className="mt-5 space-y-2">
                        {breakdown.map((b) => (
                            <li key={b.star} className="flex items-center gap-3 text-xs">
                                <span className="w-6 text-on-surface-variant">{b.star}★</span>
                                <Progress value={b.pct} className="h-1.5 flex-1"/>
                                <span className="w-8 text-right text-on-surface-variant">{b.count}</span>
                            </li>
                        ))}
                    </ul>
                </aside>

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 border-y
                        border-border py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase
                                 tracking-[0.18em] text-on-surface-variant">
                                Sort
                            </span>
                            <Select value={reviewSort} onValueChange={(v) => { setReviewSort(v as SortKey); setReviewPage(0); }}>
                                <SelectTrigger className="w-37.5">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recent">Most Recent</SelectItem>
                                    <SelectItem value="high">Highest Rated</SelectItem>
                                    <SelectItem value="low">Lowest Rated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {loading ? (
                        <p className="py-16 text-center text-sm text-on-surface-variant">Loading reviews…</p>
                    ) : reviews.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="font-display text-lg text-primary">No reviews yet</p>
                            <p className="mt-1 text-xs text-on-surface-variant">
                                Be the first to share your experience.
                            </p>
                        </div>
                    ) : (
                        <ul className="mt-5 space-y-4">
                            {reviews.map((r) => (
                                <li key={r.id} className="rounded-2xl border border-border
                                bg-surface-lowest p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-primary">{r.user.fullName}</p>
                                            <p className="text-[11px] text-on-surface-variant">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Stars value={r.stars} small/>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed
                                    text-on-surface-variant">{r.text}</p>
                                </li>
                            ))}
                        </ul>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-6">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setReviewPage((p) => Math.max(0, p - 1));
                                            }}
                                            className={reviewPage === 0 ? "pointer-events-none opacity-40" : ""}
                                        />
                                    </PaginationItem>
                                    {Array.from({length: totalPages}).map((_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                href="#"
                                                isActive={i === reviewPage}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setReviewPage(i);
                                                }}
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setReviewPage((p) => Math.min(totalPages - 1, p + 1));
                                            }}
                                            className={
                                                reviewPage === totalPages - 1 ? "pointer-events-none opacity-40" : ""
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </div>

            <form
                onSubmit={submitReview}
                className="mt-8 rounded-2xl border border-border
                        bg-primary p-[clamp(20px,3vw,40px)]
                        text-primary-foreground"
            >
                <p className="font-display text-2xl">Share Your Experience</p>
                <div className="mt-4 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setRvRating(n)}
                            aria-label={`${n} stars`}
                        >
                            <Star
                                className={`h-6 w-6 transition-colors ${
                                    n <= rvRating ? "fill-champagne-gold " +
                                        "text-champagne-gold" : 
                                        "text-primary-foreground/40"
                                }`}
                            />
                        </button>
                    ))}
                </div>
                <Textarea
                    value={rvText}
                    onChange={(e) => setRvText(e.target.value)}
                    placeholder="What did you love about this service?"
                    className="mt-4 min-h-27.5
                          border-primary-foreground/30
                          bg-primary-foreground/10
                          text-primary-foreground
                          placeholder:text-primary-foreground/60"
                />
                <Button
                    type="submit"
                    disabled={submitting}
                    className="mt-5 bg-champagne-gold text-primary
                          hover:bg-champagne-gold/90"
                >
                    {submitting ? "Submitting…" : "Submit Review"}
                </Button>
            </form>
        </section>
    );
}