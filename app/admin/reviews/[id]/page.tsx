import type { Metadata } from "next";
import { ReviewDetailContent } from "@/app/admin/reviews/[id]/_components/ReviewDetailContent";

export const metadata: Metadata = {
  title: "Review Details — Admin — Verdant Luxe",
};

export default function AdminReviewDetailPage() {
  return <ReviewDetailContent />;
}
