"use client";

import {useEffect, useState} from "react";
import Image from "next/image";
import {toast} from "sonner";
import {gqlRequest} from "@/utils/graphqlClient";
import {ScrollRow, SectionTitle} from "@/app/(site)/services/[id]/_components/shared";

interface BackendSummaryItem {
    id: string;
    name: string;
    price: number;
    primaryImage: {url: string} | null;
}

const RELATED_SERVICES_QUERY = `
    query RelatedServices($category: String, $pageSize: Int!) {
        services(category: $category, pageSize: $pageSize) {
            items {
                id
                name
                price
                primaryImage { url }
            }
        }
    }
`;

const RECOMMENDED_PRODUCTS_QUERY = `
    query RecommendedProducts($pageSize: Int!) {
        products(sort: NEWEST, pageSize: $pageSize) {
            items {
                id
                name
                price
                primaryImage { url }
            }
        }
    }
`;

const FALLBACK_IMAGE = "https://picsum.photos/seed/related/600/450";

export function RelatedServicesSection({
                                           excludeServiceId,
                                           category,
                                       }: {
    excludeServiceId: string;
    category: string;
}) {
    const [related, setRelated] = useState<BackendSummaryItem[]>([]);

    useEffect(() => {
        let cancelled = false;
        gqlRequest<{ services: {items: BackendSummaryItem[]} }>(RELATED_SERVICES_QUERY, {
            category,
            pageSize: 5,
        })
            .then((res) => {
                if (cancelled) return;
                setRelated(res.services.items.filter((s) => s.id !== excludeServiceId).slice(0, 4));
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load related services.");
            });
        return () => { cancelled = true; };
    }, [category, excludeServiceId]);

    if (related.length === 0) return null;

    return (
        <section className="mt-[clamp(40px,6vw,80px)]">
            <SectionTitle eyebrow="You May Also Love" title="Related Services"/>
            <ScrollRow>
                {related.map((r) => (
                    <article
                        key={r.id}
                        className="w-55 shrink-0 overflow-hidden
                            rounded-2xl border border-border
                            bg-surface-lowest sm:w-65"
                    >
                        <div className="relative aspect-4/3">
                            <Image
                                src={r.primaryImage?.url ?? FALLBACK_IMAGE}
                                alt={r.name}
                                fill
                                sizes="260px"
                                className="object-cover"
                            />
                        </div>
                        <div className="p-4">
                            <p className="font-display text-base text-primary">{r.name}</p>
                            <p className="mt-1 text-sm text-soft-rose">${r.price}</p>
                        </div>
                    </article>
                ))}
            </ScrollRow>
        </section>
    );
}

export function RecommendedProductsSection() {
    const [products, setProducts] = useState<BackendSummaryItem[]>([]);

    useEffect(() => {
        let cancelled = false;
        gqlRequest<{ products: {items: BackendSummaryItem[]} }>(RECOMMENDED_PRODUCTS_QUERY, {pageSize: 3})
            .then((res) => {
                if (cancelled) return;
                setProducts(res.products.items);
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load recommended products.");
            });
        return () => { cancelled = true; };
    }, []);

    if (products.length === 0) return null;

    return (
        <section className="mt-[clamp(40px,6vw,80px)]">
            <SectionTitle eyebrow="Take Home The Ritual" title="Recommended Products"/>
            <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2
                 lg:grid-cols-3">
                {products.map((p) => (
                    <li key={p.id} className="overflow-hidden rounded-2xl border
                        border-border bg-surface-lowest">
                        <div className="relative aspect-4/3">
                            <Image
                                src={p.primaryImage?.url ?? FALLBACK_IMAGE}
                                alt={p.name}
                                fill
                                sizes="(max-width: 640px) 90vw, 30vw"
                                className="object-cover"
                            />
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <p className="font-display text-base text-primary">{p.name}</p>
                            <p className="text-sm text-soft-rose">${p.price}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}