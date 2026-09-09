import type {Metadata} from "next";
import {ProductDetailContent} from "@/app/(site)/collections/[id]/_components/ProductDetailContent";

export const metadata: Metadata = {
    title: "Product Details — Verdant Luxe",
    description: "Discover the craftsmanship behind every Verdant Luxe piece.",
};

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const {id} = await params;
    return <ProductDetailContent id={id}/>;
}