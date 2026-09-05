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
import {Label} from "@/components/ui/label";
import {PRODUCT} from "@/app/(site)/collections/[id]/_components/data";
import {Stars} from "@/app/(site)/collections/[id]/_components/shared";

export function ProductInfo() {
    const [wished, setWished] = useState(false);
    const [qty, setQty] = useState(1);
    const [shade, setShade] = useState(PRODUCT.shades[0]);
    const [size, setSize] = useState(PRODUCT.sizes[1]);
    const [adding, setAdding] = useState(false);

    const total = PRODUCT.price * qty;

    const addToCart = () => {
        setAdding(true);
        setTimeout(() => {
            setAdding(false);
            toast.success("Added to cart", {
                description: `${PRODUCT.name} · ${shade} · ${size}`,
            });
        }, 600);
    };

    return (
        <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase
                 tracking-[0.22em] text-champagne-gold">
                {PRODUCT.category}
            </p>
            <h1 className="mt-2 font-display
                 text-[clamp(1.75rem,4vw,3rem)] leading-[1.05]
                 tracking-tight text-primary">
                {PRODUCT.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed
                 text-on-surface-variant">
                {PRODUCT.subtitle}
            </p>

            <div className="mt-4 flex items-center gap-3">
                <Stars value={PRODUCT.rating}/>
                <span className="text-xs text-on-surface-variant">
          {PRODUCT.rating.toFixed(1)} · {PRODUCT.reviewsCount} reviews
        </span>
            </div>

            <div className="my-5 h-px w-full bg-border"/>

            <div className="flex items-end gap-3">
                <p className="font-display text-[clamp(1.5rem,3vw,2rem)]
                 text-soft-rose">
                    ${PRODUCT.price}
                </p>
                {PRODUCT.oldPrice && (
                    <p className="pb-1 text-sm 
                       text-on-surface-variant 
                       line-through">
                        ${PRODUCT.oldPrice}
                    </p>
                )}
                <span
                    className={`ml-auto inline-flex items-center 
                    gap-1.5 rounded-full px-2.5 py-1 text-[10px] 
                    font-semibold uppercase tracking-[0.15em] ${
                        PRODUCT.inStock
                            ? "bg-blush/60 text-primary"
                            : "bg-muted text-on-surface-variant"
                    }`}
                >
                    <CheckCircle2 className="h-3 w-3"/>
                    {PRODUCT.inStock ? "In Stock" : "Sold Out"}
                </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed
                 text-on-surface-variant">
                {PRODUCT.description}
            </p>

            {/* Variants */}
            <div className="mt-6 space-y-4">
                <VariantRow label="Shade">
                    {PRODUCT.shades.map((s) => (
                        <Chip key={s} active={s === shade} onClick={() => setShade(s)}>
                            {s}
                        </Chip>
                    ))}
                </VariantRow>
                <VariantRow label="Size">
                    {PRODUCT.sizes.map((s) => (
                        <Chip key={s} active={s === size} onClick={() => setSize(s)}>
                            {s}
                        </Chip>
                    ))}
                </VariantRow>
            </div>

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
                    onClick={() => {
                        setWished((w) => !w);
                        toast(wished ? "Removed from wishlist" : "Saved to wishlist");
                    }}
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
                                .share({title: PRODUCT.name, url: window.location.href})
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
                disabled={adding || !PRODUCT.inStock}
                size="lg"
                className="mt-6 w-full text-[11px] uppercase
                        tracking-[0.18em]"
            >
                <ShoppingBag className="mr-1.5 h-4 w-4"/>
                {adding ? "Adding…" : `Add to Cart · $${total}`}
            </Button>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Feature icon={<Truck className="h-4 w-4"/>} label="Free over $100"/>
                <Feature icon={<ShieldCheck className="h-4 w-4"/>} label="Authentic guarantee"/>
                <Feature icon={<Sparkles className="h-4 w-4"/>} label="Complimentary samples"/>
            </div>
        </div>
    );
}

function VariantRow({label, children}: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <Label className="mb-2 block text-[10px] font-semibold
                 uppercase tracking-[0.18em]
                 text-on-surface-variant">
                {label}
            </Label>
            <div className="flex flex-wrap gap-2">{children}</div>
        </div>
    );
}

function Chip({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-on-surface hover:border-primary"
            }`}
        >
            {children}
        </button>
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
