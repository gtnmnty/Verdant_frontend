import type {Metadata} from "next";
import {OrdersFeed} from "@/app/(site)/orders/_components/OrdersFeed";

export const metadata: Metadata = {
    title: "Order Details — Verdant Luxe",
    description:
        "Full breakdown of your Verdant Luxe order: " +
        "items, payment, delivery and activity timeline.",
    openGraph: {
        title: "Order Details — Verdant Luxe",
        description:
            "Review the items, totals and delivery " +
            "progress of your Verdant Luxe order.",
        type: "website",
    },
    twitter: {card: "summary"},
};

export default function OrdersPage() {
    return <OrdersFeed/>;
}
