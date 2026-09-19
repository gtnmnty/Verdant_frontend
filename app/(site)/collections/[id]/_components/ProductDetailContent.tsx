"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {ChevronLeft} from "lucide-react";
import {toast} from "sonner";
import {gqlRequest} from "@/utils/graphqlClient";
import {ProductGallery} from "@/app/(site)/collections/[id]/_components/ProductGallery";
import {ProductInfo, type ProductInfoData} from "@/app/(site)/collections/[id]/_components/ProductInfo";
import {ProductTabs} from "@/app/(site)/collections/[id]/_components/ProductTabs";
import {ReviewsSection} from "@/app/(site)/collections/[id]/_components/ReviewsSection";
import {RelatedProducts} from "@/app/(site)/collections/[id]/_components/RelatedProducts";
import {FaqSection} from "@/app/(site)/collections/[id]/_components/FaqSection";
import {
    PRODUCT_BY_ID_QUERY,
    CATEGORY_LABELS,
    type BackendProduct,
} from "@/app/(site)/collections/_components/query";

export function ProductDetailContent({id}: { id: string }) {
    const [product, setProduct] = useState<BackendProduct | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        gqlRequest<{ product: BackendProduct | null }>(PRODUCT_BY_ID_QUERY, {id})
            .then((res) => { if (!cancelled) setProduct(res.product); })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load product.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [id]);

    if (loading) {
        return <p className="py-24 text-center text-sm text-on-surface-variant">Loading product…</p>;
    }

    if (!product) {
        return (
            <div className="py-24 text-center">
                <p className="font-display text-2xl text-primary">Product not found</p>
                <Link href="/collections" className="mt-3 inline-block text-sm text-primary underline">
                    Back to Collections
                </Link>
            </div>
        );
    }

    const productInfoData: ProductInfoData = {
        id: product.id,
        name: product.name,
        categoryLabel: CATEGORY_LABELS[product.catalog] ?? product.catalog,
        description: product.description ?? "",
        price: product.price,
        salePrice: product.salePrice,
        averageRating: product.averageRating,
        reviewCount: product.reviewCount,
        tags: product.tags,
        inStock: product.inStock,
        isFavorited: product.isFavorited,
    };

    const galleryImages = product.images.length > 0
        ? product.images.map((i) => i.url)
        : product.primaryImage
            ? [product.primaryImage.url]
            : [];

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
                <ProductGallery images={galleryImages} name={product.name}/>
                <ProductInfo product={productInfoData}/>
            </section>

            <section className="mt-[clamp(40px,6vw,80px)]">
                <ProductTabs description={product.description ?? ""} info={product.info}/>
            </section>

            <ReviewsSection productId={product.id}/>
            <RelatedProducts excludeProductId={product.id} category={product.catalog}/>
            <FaqSection/>
        </div>
    );
}
