"use client";

import { useRouter, useParams } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DetailCard,
  DetailGrid,
  DetailHeader,
  FieldRow,
} from "@/app/admin/_components/Detail";
import { EmptyState } from "@/app/admin/_components/EmptyState";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { useAdmin } from "@/lib/admin/store";

export function ReviewDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { reviews, products, services } = useAdmin();
  const r = reviews.find((x) => x.id === params.id);

  if (!r) {
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

  const item =
    r.itemType === "product"
      ? products.find((p) => p.id === r.itemId)
      : services.find((s) => s.id === r.itemId);

  return (
    <>
      <DetailHeader backHref="/admin/reviews" backLabel="Back to Reviews" title={r.customer} />
      <DetailGrid>
        <DetailCard>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- dicebear/account avatar URLs */}
            <img src={r.customerAvatar} alt="" className="size-12 rounded-full" />
            <div>
              <p className="font-semibold">{r.customer}</p>
              <p className="text-xs text-admin-muted">{r.reviewDate}</p>
            </div>
          </div>
          <div className="mt-4 flex">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`size-5 ${
                  i < r.rating ? "fill-admin-amber text-admin-amber" : "text-admin-line"
                }`}
              />
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed">{r.content}</p>
        </DetailCard>
        <div className="space-y-5">
          <DetailCard title="Item">
            <dl>
              <FieldRow label="Item Type" value={<StatusBadge status={r.itemType} />} />
              <FieldRow label="Item Name" value={r.itemName || r.serviceName} />
              <FieldRow label="Rating" value={`${r.rating} / 5`} />
              <FieldRow label="Review Date" value={r.reviewDate} />
            </dl>
          </DetailCard>
          {item ? (
            <DetailCard title={r.itemType === "product" ? "Product info" : "Service info"}>
              <div className="flex gap-3">
                {"images" in item && item.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs
                  <img
                    src={item.images[0]}
                    alt=""
                    className="size-20 rounded-lg object-cover"
                  />
                ) : "image" in item && item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded URLs
                  <img src={item.image} alt="" className="size-20 rounded-lg object-cover" />
                ) : null}
                <div className="min-w-0">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-admin-muted">
                    ${"salePrice" in item && item.salePrice ? item.salePrice : item.price}
                  </p>
                </div>
              </div>
            </DetailCard>
          ) : null}
        </div>
      </DetailGrid>
    </>
  );
}
