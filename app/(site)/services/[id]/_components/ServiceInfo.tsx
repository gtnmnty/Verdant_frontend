"use client";

import React, {useState} from "react";
import {toast} from "sonner";
import {CheckCircle2, Clock, Heart, Minus, Plus, Share2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {gqlRequest} from "@/utils/graphqlClient";
import {Stars} from "@/app/(site)/services/[id]/_components/shared";

export interface ServiceInfoData {
    id: string;
    name: string;
    subName: string;
    categoryLabel: string;
    price: number;
    durationInMinutes: number;
    averageRating: number;
    reviewCount: number;
    tags: string[];
    isFavorited: boolean;
}

const TOGGLE_FAVORITE_MUTATION = `
    mutation ToggleFavoriteService($targetId: ID!) {
        toggleFavoriteService(targetId: $targetId) {
            id
        }
    }
`;

export function ServiceInfo({
    service,
    qty,
    onQtyChange,
}: {
    service: ServiceInfoData;
    qty: number;
    onQtyChange: (updater: (q: number) => number) => void;
}) {
    const [wished, setWished] = useState(service.isFavorited);

    const totalPrice = service.price * qty;

    function toggleWishlist() {
        const wasWished = wished;
        setWished(!wasWished);

        gqlRequest(TOGGLE_FAVORITE_MUTATION, {targetId: service.id})
            .then(() => toast(
                wasWished ? "Removed from wishlist" : "Saved to wishlist")
            )
            .catch((err) => {
                setWished(wasWished);
                toast.error(
                    err instanceof Error ? err.message : "Failed to update wishlist."
                );
            });
    }

    return (
        <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase
                 tracking-[0.22em] text-champagne-gold">
                {service.categoryLabel}
            </p>
            <h1 className="mt-2 font-display
                 text-[clamp(1.75rem,4vw,3rem)] leading-[1.05]
                 tracking-tight text-primary">
                {service.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed
                 text-on-surface-variant">
                {service.subName}
            </p>

            <div className="mt-4 flex items-center gap-3">
                <Stars value={service.averageRating}/>
                <span className="text-xs text-on-surface-variant">
                  {service.averageRating.toFixed(1)} · {service.reviewCount.toLocaleString()} reviews
                </span>
            </div>

            <div className="my-5 h-px w-full bg-border"/>

            <p className="font-display text-[clamp(1.5rem,3vw,2rem)]
                 text-soft-rose">
                ${service.price.toLocaleString()}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <Pill icon={<Clock className="h-3.5 w-3.5"/>} label={`${service.durationInMinutes} min`}/>
                <Pill icon={<CheckCircle2 className="h-3.5 w-3.5"/>} label="Available today"/>
            </div>

            {service.tags.length > 0 && (
                <div className="mt-6">
                    <p className="text-[11px] font-semibold uppercase
                       tracking-[0.18em] text-on-surface-variant">
                        Service Highlights
                    </p>
                    <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {service.tags.map((h) => (
                            <li key={h} className="flex items-center gap-2 text-sm text-on-surface">
                                <span className="text-champagne-gold">✦</span> {h}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold uppercase
                         tracking-[0.18em] text-on-surface-variant">
                        Guests
                    </span>
                    <div className="flex items-center rounded-full border
                         border-border">
                        <button
                            type="button"
                            onClick={() => onQtyChange((q) => Math.max(1, q - 1))}
                            aria-label="Decrease"
                            className="grid h-9 w-9 place-items-center text-primary
                              hover:bg-secondary"
                        >
                            <Minus className="h-3.5 w-3.5"/>
                        </button>
                        <span className="w-10 text-center text-sm">{qty}</span>
                        <button
                            type="button"
                            onClick={() => onQtyChange((q) => Math.min(8, q + 1))}
                            aria-label="Increase"
                            className="grid h-9 w-9 place-items-center text-primary
                              hover:bg-secondary"
                        >
                            <Plus className="h-3.5 w-3.5"/>
                        </button>
                    </div>
                </div>

                <button
                    type="button"
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
                    type="button"
                    onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.share) {
                            navigator
                                .share({title: service.name, url: window.location.href})
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
                variant="outline"
                onClick={() =>
                    document.getElementById("booking")?.scrollIntoView({behavior: "smooth"})
                }
                size="lg"
                className="mt-6 w-full border-primary text-[11px]
                        uppercase tracking-[0.18em] text-primary
                        hover:bg-primary
                        hover:text-primary-foreground"
            >
                Book Appointment · ${totalPrice.toLocaleString()}
            </Button>
        </div>
    );
}

function Pill({icon, label}: { icon: React.ReactNode; label: string }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full
              border border-border px-3 py-2
              text-on-surface-variant">
      {icon} {label}
    </span>
    );
}