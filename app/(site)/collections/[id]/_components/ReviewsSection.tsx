"use client";

import {useMemo, useState, type SubmitEvent} from "react";
import {toast} from "sonner";
import {Star} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
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
import {INITIAL_REVIEWS} from "@/app/(site)/collections/[id]/_components/data";
import {SectionTitle, Stars} from "@/app/(site)/collections/[id]/_components/shared";

const PER_PAGE = 3;
type SortKey = "recent" | "high" | "low";

export function ReviewsSection() {
    const [reviews, setReviews] = useState(INITIAL_REVIEWS);
    const [reviewSort, setReviewSort] = useState<SortKey>("recent");
    const [reviewFilter, setReviewFilter] = useState("all");
    const [reviewPage, setReviewPage] = useState(1);

    const [rvName, setRvName] = useState("");
    const [rvRating, setRvRating] = useState(5);
    const [rvText, setRvText] = useState("");

    const breakdown = useMemo(() => {
        const counts = [0, 0, 0, 0, 0];
        reviews.forEach((r) => counts[r.rating - 1]++);
        const t = reviews.length || 1;
        return [5, 4, 3, 2, 1].map((s) => ({
            star: s,
            pct: Math.round((counts[s - 1] / t) * 100),
            count: counts[s - 1],
        }));
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        let list = [...reviews];
        if (reviewFilter !== "all") {
            list = list.filter((r) => r.rating === Number(reviewFilter));
        }
        list.sort((a, b) => {
            if (reviewSort === "high") return b.rating - a.rating;
            if (reviewSort === "low") return a.rating - b.rating;
            return 0;
        });
        return list;
    }, [reviews, reviewSort, reviewFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PER_PAGE));
    const currentPage = Math.min(reviewPage, totalPages);
    const paged = filteredReviews.slice(
        (currentPage - 1) * PER_PAGE,
        currentPage * PER_PAGE,
    );

    const averageRating =
        reviews.reduce((a: number, r: { rating: number }) => a + r.rating, 0) / (reviews.length || 1);

    const submitReview = (e: SubmitEvent) => {
        e.preventDefault();
        if (!rvName.trim() || !rvText.trim()) {
            toast.error("Please complete the form.");
            return;
        }
        setReviews((prev) => [
            {
                id: `rv-${Date.now()}`,
                name: rvName.trim(),
                date: new Date().toLocaleDateString(),
                rating: rvRating,
                text: rvText.trim(),
            },
            ...prev,
        ]);
        setRvName("");
        setRvRating(5);
        setRvText("");
        toast.success("Review submitted");
    };

    return (
        <section className="mt-[clamp(40px,6vw,80px)]">
            <SectionTitle eyebrow="Client Voices" title="Customer Reviews"/>
            <div className="mt-6 grid grid-cols-1 gap-8
                 lg:grid-cols-[280px_1fr]">
                <aside className="rounded-2xl border border-border
                 bg-surface-lowest p-5">
                    <p className="font-display text-4xl text-primary">{averageRating.toFixed(1)}</p>
                    <Stars value={averageRating}/>
                    <p className="mt-1 text-xs text-on-surface-variant">
                        Based on {reviews.length} reviews
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
                            <Select value={reviewSort} onValueChange={(v) => setReviewSort(v as SortKey)}>
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
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase
                                  tracking-[0.18em] text-on-surface-variant">
                                Filter
                            </span>
                            <Select
                                value={reviewFilter}
                                onValueChange={(v) => {
                                    setReviewFilter(v);
                                    setReviewPage(1);
                                }}
                            >
                                <SelectTrigger className="w-35">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Ratings</SelectItem>
                                    {[5, 4, 3, 2, 1].map((n) => (
                                        <SelectItem key={n} value={String(n)}>
                                            {n} Stars
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {paged.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="font-display text-lg text-primary">No reviews match</p>
                        </div>
                    ) : (
                        <ul className="mt-5 space-y-4">
                            {paged.map((r) => (
                                <li key={r.id} className="rounded-2xl border border-border
                                    bg-surface-lowest p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-primary">{r.name}</p>
                                            <p className="text-[11px] text-on-surface-variant">{r.date}</p>
                                        </div>
                                        <Stars value={r.rating} small/>
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
                                                setReviewPage((p) => Math.max(1, p - 1));
                                            }}
                                            className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
                                        />
                                    </PaginationItem>
                                    {Array.from({length: totalPages}).map((_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                href="#"
                                                isActive={i + 1 === currentPage}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setReviewPage(i + 1);
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
                                                setReviewPage((p) => Math.min(totalPages, p + 1));
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
                </div>
            </div>

            <form
                onSubmit={submitReview}
                className="mt-8 rounded-2xl border border-border
                        bg-primary p-[clamp(20px,3vw,40px)]
                        text-primary-foreground"
            >
                <p className="font-display text-2xl">Share Your Experience</p>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                        value={rvName}
                        onChange={(e) => setRvName(e.target.value)}
                        placeholder="Your name"
                        className="border-primary-foreground/30
                            bg-primary-foreground/10
                            text-primary-foreground
                            placeholder:text-primary-foreground/60"
                    />
                    <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setRvRating(n)}
                                aria-label={`${n} stars`}
                            >
                                <Star
                                    className={`h-6 w-6 ${
                                        n <= rvRating
                                            ? "fill-champagne-gold text-champagne-gold"
                                            : "text-primary-foreground/40"
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>
                <Textarea
                    value={rvText}
                    onChange={(e) => setRvText(e.target.value)}
                    placeholder="What did you love about this product?"
                    className="mt-4 min-h-27.5
                          border-primary-foreground/30
                          bg-primary-foreground/10
                          text-primary-foreground
                          placeholder:text-primary-foreground/60"
                />
                <Button
                    type="submit"
                    className="mt-5 bg-champagne-gold text-primary
                          hover:bg-champagne-gold/90"
                >
                    Submit Review
                </Button>
            </form>
        </section>
    );
}
