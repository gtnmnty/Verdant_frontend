import type { Metadata } from "next";
import { OrdersContent } from "@/app/admin/orders/_components/OrdersContent";

export const metadata: Metadata = {
  title: "Orders — Admin — Verdant Luxe",
};

export default function AdminOrdersPage() {
  return <OrdersContent />;
}
