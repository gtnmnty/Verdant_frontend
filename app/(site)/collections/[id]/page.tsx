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
    return (
        <div className="w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]">
            <ProductDetailContent id={id}/>
        </div>
    );
}