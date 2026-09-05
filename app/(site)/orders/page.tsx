import type { Metadata } from "next";
import { OrdersFeed } from "@/app/(site)/orders/_components/OrdersFeed";

export const metadata: Metadata = {
  title: "Order History — Verdant Luxe",
  description:
    "Review your past Verdant Luxe orders, " +
    "track shipments, download invoices, " +
    "and reorder your favorites.",
  openGraph: {
    title: "Order History — Verdant Luxe",
    description: "Refined elegance, curated for you.",
  },
};

export default function OrdersPage() {
  return <div className="w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]"><OrdersFeed/></div>;
}
