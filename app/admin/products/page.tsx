import type { Metadata } from "next";
import { ProductsContent } from "@/app/admin/products/_components/ProductsContent";

export const metadata: Metadata = {
  title: "Products — Admin — Verdant Luxe",
};

export default function AdminProductsPage() {
  return <ProductsContent />;
}
