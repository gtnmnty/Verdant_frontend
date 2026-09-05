import type { Metadata } from "next";
import { ReviewsContent } from "@/app/admin/reviews/_components/ReviewsContent";

export const metadata: Metadata = {
  title: "Reviews — Admin — Verdant Luxe",
};

export default function AdminReviewsPage() {
  return <ReviewsContent />;
}
