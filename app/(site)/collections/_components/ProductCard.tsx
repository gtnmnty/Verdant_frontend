import Image from "next/image";
import Link from "next/link";
import {Heart} from "lucide-react";
import type {Product} from "@/app/(site)/collections/_components/data";

export function ProductCard({
    product,
    wished,
    onWish,
}: {
    product: Product;
    wished: boolean;
    onWish: () => void;
}) {
    return (
        <article className="group flex flex-col">
            <Link
                href={`/collections/${product.id}`}
                className="relative block overflow-hidden rounded-xl
                        bg-secondary"
            >
                <div className="relative aspect-4/5 w-full">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                        className="object-cover transition-transform
                            duration-500 group-hover:scale-105"
                    />
                </div>
                <button
                    type="button"
                    aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={wished}
                    onClick={(e) => {
                        e.preventDefault();
                        onWish();
                    }}
                    className="absolute right-3 top-3 grid h-9 w-9
                          place-items-center rounded-full bg-surface/90
                          text-primary shadow-sm backdrop-blur
                          transition-colors hover:bg-surface"
                >
                    <Heart
                        className={`h-4 w-4 transition-colors ${wished ? "fill-primary text-primary" : ""}`}
                    />
                </button>
            </Link>
            <Link
                href={`/collections/${product.id}`}
                className="mt-5 flex items-start justify-between gap-4"
            >
                <div className="min-w-0">
                    <h3 className="truncate font-display
                        text-[clamp(1.05rem,1.6vw,1.35rem)]
                        leading-tight text-primary">
                        {product.name}
                    </h3>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em]
                       text-soft-rose">
                        {product.category} / {product.subLabel}
                    </p>
                </div>
                <span className="shrink-0 font-display text-base text-primary">
          ${product.price}
        </span>
            </Link>
        </article>
    );
}
