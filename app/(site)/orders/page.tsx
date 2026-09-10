import type {Metadata} from "next";
import {OrderDetailContent} from "@/app/(site)/orders/[id]/_components/OrderDetailContent";

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

export default async function OrderDetailsPage({params,}: { params: Promise<{ id: string }>; }) {
    const {id} = await params;
    return <OrderDetailContent id={id}/>;
}
