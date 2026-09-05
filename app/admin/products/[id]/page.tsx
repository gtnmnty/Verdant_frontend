import type { Metadata } from "next";
import { ProductDetailContent } from "@/app/admin/products/[id]/_components/ProductDetailContent";

export const metadata: Metadata = {
  title: "Product Details — Admin — Verdant Luxe",
};

export default function AdminProductDetailPage() {
  return <ProductDetailContent />;
}
