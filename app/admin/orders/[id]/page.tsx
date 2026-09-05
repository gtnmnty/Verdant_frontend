import type { Metadata } from "next";
import { OrderDetailContent } from "@/app/admin/orders/[id]/_components/OrderDetailContent";

export const metadata: Metadata = {
  title: "Order Details — Admin — Verdant Luxe",
};

export default function AdminOrderDetailPage() {
  return <OrderDetailContent />;
}
