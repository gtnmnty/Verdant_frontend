"use client";

import {useEffect, useState} from "react";
import Image from "next/image";
import {toast} from "sonner";
import {gqlRequest} from "@/utils/graphqlClient";
import {SectionTitle} from "@/app/(site)/collections/[id]/_components/shared";

interface BackendProductSummary {
    id: string;
    name: string;
    price: number;
    salePrice: number | null;
    primaryImage: {url: string} | null;
}

const RELATED_PRODUCTS_QUERY = `
    query RelatedProducts($category: String, $pageSize: Int!) {
        products(category: $category, pageSize: $pageSize) {
            items {
                id
                name
                price
                salePrice
                primaryImage { url }
            }
        }
    }
`;

const FALLBACK_IMAGE = "https://picsum.photos/seed/related-product/600/600";

export function RelatedProducts(
    {excludeProductId, category}: { excludeProductId: string; category: string }
) {
    const [related, setRelated] = useState<BackendProductSummary[]>([]);

    useEffect(() => {
        let cancelled = false;
        gqlRequest<{ products: {items: BackendProductSummary[]} }>(RELATED_PRODUCTS_QUERY, {
            category,
            pageSize: 5,
        })
            .then((res) => {
                if (cancelled) return;
                setRelated(res.products.items.filter((p) =>
                    p.id !== excludeProductId).slice(0, 4));
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ?
                    err.message : "Failed to load related products.");
            });
        return () => { cancelled = true; };
    }, [category, excludeProductId]);

    if (related.length === 0) return null;

    return (
        <section className="mt-[clamp(40px,6vw,80px)]">
            <SectionTitle eyebrow="You May Also Love" title="Related Products"/>
            <div className="mt-6 -mx-2 flex gap-5 overflow-x-auto px-2
                 pb-3 scrollbar-thin">
                {related.map((r) => (
                    <article
                        key={r.id}
                        className="w-55 shrink-0 overflow-hidden
                            rounded-2xl border border-border
                            bg-surface-lowest sm:w-65"
                    >
                        <div className="relative aspect-square">
                            <Image
                                src={r.primaryImage?.url ?? FALLBACK_IMAGE}
                                alt={r.name}
                                fill
                                sizes="260px"
                                className="object-cover"
                            />
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <p className="font-display text-base text-primary">{r.name}</p>
                            <p className="text-sm text-soft-rose">${r.salePrice ?? r.price}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}