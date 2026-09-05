import type {Metadata} from "next";
import Link from "next/link";
import {ChevronLeft} from "lucide-react";
import {ProductGallery} from "@/app/(site)/collections/[id]/_components/ProductGallery";
import {ProductInfo} from "@/app/(site)/collections/[id]/_components/ProductInfo";
import {ProductTabs} from "@/app/(site)/collections/[id]/_components/ProductTabs";
import {ReviewsSection} from "@/app/(site)/collections/[id]/_components/ReviewsSection";
import {RelatedProducts} from "@/app/(site)/collections/[id]/_components/RelatedProducts";
import {FaqSection} from "@/app/(site)/collections/[id]/_components/FaqSection";

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
        <div className="pb-20">
            <div className="mb-6 flex items-center justify-between gap-4">
                <Link
                    href="/collections"
                    className="inline-flex items-center gap-2 rounded-full
                          border border-border px-3 py-2 text-[10px]
                          font-semibold uppercase tracking-[0.18em]
                          text-primary transition-colors
                          hover:bg-blush/40"
                >
                    <ChevronLeft className="h-3.5 w-3.5"/> Back to Collections
                </Link>
                <span className="hidden text-[10px] font-semibold uppercase
                 tracking-[0.22em] text-on-surface-variant
                 sm:block">
          Product Detail · #{id}
        </span>
            </div>

            <section className="grid grid-cols-1 gap-[clamp(20px,3vw,40px)]
                 lg:grid-cols-[1.1fr_1fr]">
                <ProductGallery/>
                <ProductInfo/>
            </section>

            <section className="mt-[clamp(40px,6vw,80px)]">
                <ProductTabs/>
            </section>

            <ReviewsSection/>
            <RelatedProducts/>
            <FaqSection/>
        </div>
    );
}
