"use client";

import React, {useState} from "react";
import {toast} from "sonner";
import {
    CheckCircle2,
    Heart,
    Minus,
    Plus,
    Share2,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Truck,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {gqlRequest} from "@/utils/graphqlClient";
import {Stars} from "@/app/(site)/collections/[id]/_components/shared";

export interface ProductInfoData {
    id: string;
    name: string;
    categoryLabel: string;
    description: string;
    price: number;
    salePrice: number | null;
    averageRating: number;
    reviewCount: number;
    tags: string[];
    inStock: boolean;
    isFavorited: boolean;
}

const ADD_TO_CART_MUTATION = `
    mutation AddToCart($input: AddToCartInput!) {
        addToCart(input: $input) { items { id } }
    }
`;

const TOGGLE_FAVORITE_MUTATION = `
    mutation ToggleFavoriteProduct($targetId: ID!) {
        toggleFavoriteProduct(targetId: $targetId) { id }
    }
`;

export function ProductInfo({product}: { product: ProductInfoData }) {
    const [wished, setWished] = useState(product.isFavorited);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);

    const activePrice = product.salePrice ?? product.price;
    const total = activePrice * qty;

    const addToCart = () => {
        setAdding(true);
        gqlRequest(ADD_TO_CART_MUTATION, {
            input: {productId: product.id, quantity: qty, deliveryOption: "STANDARD"},
        })
            .then(() => {
                toast.success("Added to cart", {description: `${product.name} × ${qty}`});
            })
            .catch((err) => {
                toast.error(err instanceof Error ? err.message : "Failed to add to cart.");
            })
            .finally(() => setAdding(false));
    };

    const toggleWishlist = () => {
        const wasWished = wished;
        setWished(!wasWished);

        gqlRequest(TOGGLE_FAVORITE_MUTATION, {targetId: product.id})
            .then(() => toast(wasWished ? "Removed from wishlist" : "Saved to wishlist"))
            .catch((err) => {
                setWished(wasWished);
                toast.error(err instanceof Error ? err.message : "Failed to update wishlist.");
            });
    };

    return (
        <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase
                 tracking-[0.22em] text-champagne-gold">
                {product.categoryLabel}
            </p>
            <h1 className="mt-2 font-display
                 text-[clamp(1.75rem,4vw,3rem)] leading-[1.05]
                 tracking-tight text-primary">
                {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-3">
                <Stars value={product.averageRating}/>
                <span className="text-xs text-on-surface-variant">
          {product.averageRating.toFixed(1)} · {product.reviewCount.toLocaleString()} reviews
        </span>
            </div>

            <div className="my-5 h-px w-full bg-border"/>

            <div className="flex items-end gap-3">
                <p className="font-display text-[clamp(1.5rem,3vw,2rem)]
                 text-soft-rose">
                    ${activePrice.toLocaleString()}
                </p>
                {product.salePrice && (
                    <p className="pb-1 text-sm
                       text-on-surface-variant
                       line-through">
                        ${product.price.toLocaleString()}
                    </p>
                )}
                <span
                    className={`ml-auto inline-flex items-center 
                    gap-1.5 rounded-full px-2.5 py-1 text-[10px] 
                    font-semibold uppercase tracking-[0.15em] ${
                        product.inStock
                            ? "bg-blush/60 text-primary"
                            : "bg-muted text-on-surface-variant"
                    }`}
                >
                    <CheckCircle2 className="h-3 w-3"/>
                    {product.inStock ? "In Stock" : "Sold Out"}
                </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed
                 text-on-surface-variant">
                {product.description || "No description available yet."}
            </p>

            {product.tags.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2">
                    {product.tags.map((t) => (
                        <li
                            key={t}
                            className="rounded-full border border-border
                             px-3 py-1 text-xs text-on-surface-variant"
                        >
                            {t}
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold uppercase
                          tracking-[0.18em] text-on-surface-variant">
                        Qty
                    </span>
                    <div className="flex items-center rounded-full border
                         border-border">
                        <button
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            aria-label="Decrease"
                            className="grid h-9 w-9 place-items-center text-primary
                              hover:bg-secondary"
                        >
                            <Minus className="h-3.5 w-3.5"/>
                        </button>
                        <span className="w-10 text-center text-sm">{qty}</span>
                        <button
                            onClick={() => setQty((q) => Math.min(99, q + 1))}
                            aria-label="Increase"
                            className="grid h-9 w-9 place-items-center text-primary
                              hover:bg-secondary"
                        >
                            <Plus className="h-3.5 w-3.5"/>
                        </button>
                    </div>
                </div>

                <button
                    onClick={toggleWishlist}
                    aria-pressed={wished}
                    className="inline-flex h-9 items-center gap-2
                          rounded-full border border-border px-3
                          text-[10px] font-semibold uppercase
                          tracking-[0.15em] text-primary
                          hover:bg-secondary"
                >
                    <Heart className={`h-3.5 w-3.5 ${wished ? "fill-primary" : ""}`}/>
                    {wished ? "Saved" : "Wishlist"}
                </button>
                <button
                    onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.share) {
                            navigator
                                .share({title: product.name, url: window.location.href})
                                .catch(() => {
                                });
                        } else if (typeof navigator !== "undefined") {
                            navigator.clipboard?.writeText(window.location.href);
                            toast.success("Link copied");
                        }
                    }}
                    className="inline-flex h-9 items-center gap-2
                          rounded-full border border-border px-3
                          text-[10px] font-semibold uppercase
                          tracking-[0.15em] text-primary
                          hover:bg-secondary"
                >
                    <Share2 className="h-3.5 w-3.5"/> Share
                </button>
            </div>

            <Button
                onClick={addToCart}
                disabled={adding || !product.inStock}
                size="lg"
                className="mt-6 w-full text-[11px] uppercase
                        tracking-[0.18em]"
            >
                <ShoppingBag className="mr-1.5 h-4 w-4"/>
                {adding ? "Adding…" : `Add to Cart · $${total.toLocaleString()}`}
            </Button>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Feature icon={<Truck className="h-4 w-4"/>} label="Free over $100"/>
                <Feature icon={<ShieldCheck className="h-4 w-4"/>} label="Authentic guarantee"/>
                <Feature icon={<Sparkles className="h-4 w-4"/>} label="Complimentary samples"/>
            </div>
        </div>
    );
}

function Feature({icon, label}: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center gap-2 rounded-xl border
                 border-border bg-surface-lowest px-3 py-2.5
                 text-xs text-on-surface-variant">
            <span className="text-champagne-gold">{icon}</span>
            {label}
        </div>
    );
}