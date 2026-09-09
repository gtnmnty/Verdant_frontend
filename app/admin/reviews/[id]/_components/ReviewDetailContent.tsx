"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Star} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {
    DetailCard,
    DetailGrid,
    DetailHeader,
    FieldRow,
} from "@/app/admin/_components/Detail";
import {EmptyState} from "@/app/admin/_components/EmptyState";
import {StatusBadge} from "@/app/admin/_components/StatusBadge";
import {gqlRequest} from "@/utils/graphqlClient";

interface BackendAdminReviewDetail {
    id: string;
    user: { fullName: string };
    itemType: "PRODUCT" | "SALON_SERVICE";
    itemName: string;
    stars: number;
    text: string | null;
    createdAt: string;
}

const ADMIN_REVIEW_DETAIL_QUERY = `
    query AdminReviewDetail($id: ID!) {
        adminReview(id: $id) {
            id
            user { fullName }
            itemType
            itemName
            stars
            text
            createdAt
        }
    }
`;

const FALLBACK_AVATAR = "https://picsum.photos/seed/review-admin/100/100";

export function ReviewDetailContent() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [review, setReview] = useState<BackendAdminReviewDetail | null | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        gqlRequest<{ adminReview: BackendAdminReviewDetail | null }>(ADMIN_REVIEW_DETAIL_QUERY, {id: params.id})
            .then((res) => {
                if (!cancelled) setReview(res.adminReview);
            })
            .catch((err) => {
                if (cancelled) return;
                toast.error(err instanceof Error ? err.message : "Failed to load review.");
                setReview(null);
            });
        return () => {
            cancelled = true;
        };
    }, [params.id]);

    if (review === undefined) {
        return <p className="py-16 text-center text-sm text-admin-muted">Loading…</p>;
    }

    if (!review) {
        return (
            <EmptyState
                title="Review not found"
                description="It may have been removed. Return to the reviews list."
                action={
                    <Button onClick={() => router.push("/admin/reviews")}>
                        Back to Reviews
                    </Button>
                }
            />
        );
    }

    const itemType = review.itemType === "PRODUCT" ? "product" : "service";

    return (
        <>
            <DetailHeader backHref="/admin/reviews" backLabel="Back to Reviews" title={review.user.fullName}/>
            <DetailGrid>
                <DetailCard>
                    <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- no real avatar field on AdminReviewDto */}
                        <img src={FALLBACK_AVATAR} alt="" className="size-12 rounded-full"/>
                        <div>
                            <p className="font-semibold">{review.user.fullName}</p>
                            <p className="text-xs text-admin-muted">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex">
                        {Array.from({length: 5}, (_, i) => (
                            <Star
                                key={i}
                                className={`size-5 ${
                                    i < review.stars ? 
                                        "fill-admin-amber text-admin-amber" : "text-admin-line"
                                }`}
                            />
                        ))}
                    </div>
                    <p className="mt-4 text-sm leading-relaxed">{review.text}</p>
                </DetailCard>

                {/* AdminReviewDto has no itemId, only itemName — so there's nothing
            to fetch the reviewed product/service's image/price from. Only
            what the backend actually returns is shown below. */}
                <DetailCard title="Item">
                    <dl>
                        <FieldRow label="Item Type" value={<StatusBadge status={itemType}/>}/>
                        <FieldRow label="Item Name" value={review.itemName}/>
                        <FieldRow label="Rating" value={`${review.stars} / 5`}/>
                        <FieldRow label="Review Date" value={new Date(review.createdAt).toLocaleDateString()}/>
                    </dl>
                </DetailCard>
            </DetailGrid>
        </>
    );
}
