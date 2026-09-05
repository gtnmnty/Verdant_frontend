"use client";

import Link from "next/link";
import Image from "next/image";
import {Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import type {RecommendedProduct} from "@/app/(site)/cart/_components/data";

interface RecommendedProductsProps {
    products: RecommendedProduct[];
    onAddToCart: (product: RecommendedProduct) => void;
}

export function RecommendedProducts({
    products,
    onAddToCart,
}: RecommendedProductsProps) {
    return (
        <section className="mt-16 sm:mt-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[10px] font-semibold uppercase
                 tracking-[0.28em] text-soft-rose">
                        The Ritual Continues
                    </p>
                    <h2 className="mt-2 font-display text-2xl text-on-surface
                 sm:text-3xl">
                        You May Also Like
                    </h2>
                </div>
                <Link
                    href="/collections"
                    className="text-xs font-semibold uppercase
                          tracking-[0.14em] text-on-surface underline
                          underline-offset-4 transition-colors
                          hover:text-primary"
                >
                    Shop All Collections
                </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8
                 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                {products.map((product) => (
                    <div key={product.id} className="group min-w-0">
                        <Link
                            href={`/collections/${product.id}`}
                            className="relative block aspect-square overflow-hidden
                              rounded-lg bg-surface-low"
                        >
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                                className="object-cover transition-transform
                                duration-500 group-hover:scale-105"
                            />
                        </Link>
                        <div className="mt-3 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <Link
                                    href={`/collections/${product.id}`}
                                    className="block truncate text-sm font-medium
                                  text-on-surface hover:text-primary"
                                >
                                    {product.name}
                                </Link>
                                <p className="text-xs text-on-surface-variant">
                                    ${product.price.toFixed(2)}
                                </p>
                            </div>
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                aria-label={`Add ${product.name} to cart`}
                                onClick={() => onAddToCart(product)}
                                className="h-8 w-8 shrink-0 rounded-full border-blush/60
                                text-primary hover:bg-primary
                                hover:text-primary-foreground"
                            >
                                <Plus className="h-3.5 w-3.5"/>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
