"use client";

import Link from "next/link";
import Image from "next/image";
import {Plus} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import type {JournalStory} from "@/app/(site)/journal/_components/data";

interface JournalStoryDialogProps {
    story: JournalStory | null;
    onOpenChange: (open: boolean) => void;
    onAddProduct: (productId: string, productName: string) => void;
    onAddRoutine: (story: JournalStory) => void;
}

export function JournalStoryDialog(
    {story, onOpenChange, onAddProduct, onAddRoutine,}: JournalStoryDialogProps
) {
    return (
        <Dialog open={!!story} onOpenChange={onOpenChange}>
            {/* sm:max-w-* is needed to override the base DialogContent's sm:max-w-sm. */}
            <DialogContent className="max-h-[90vh] overflow-y-auto p-0
            sm:max-w-[min(calc(100vw-4rem),52rem)]">
                {story ? (
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="relative min-w-0">
                            <div className="relative aspect-4/5 w-full
                            overflow-hidden bg-surface-low md:aspect-auto
                            md:h-full md:min-h-[clamp(22rem,40vw,32rem)]">
                                <Image
                                    src={story.resultImage}
                                    alt={`${story.clientName} — ${story.service} result`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 416px"
                                    className="object-cover"
                                />
                            </div>
                            <div
                                className="absolute bottom-[clamp(0.75rem,1.5vw,1.25rem)]
                                right-[clamp(0.75rem,1.5vw,1.25rem)]
                                size-[clamp(5rem,calc(4rem+4vw),7.5rem)] overflow-hidden
                                rounded-[clamp(0.5rem,0.8vw,0.75rem)]
                                border-[clamp(3px,0.4vw,5px)] border-surface shadow-lg">
                                <Image
                                    src={story.productImage}
                                    alt={`Products used for ${story.clientName}'s ${story.service}`}
                                    fill
                                    sizes="120px"
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Story content */}
                        <div className="min-w-0 p-[clamp(1.25rem,3vw,2.25rem)]">
                            <p className="text-fluid-2xs font-semibold
                            uppercase tracking-[0.24em] text-soft-rose">
                                {story.category}
                            </p>
                            <DialogTitle
                                className="mt-[0.75em] font-display text-fluid-xl
                                italic leading-snug text-on-surface">
                                &ldquo;{story.quote}&rdquo;
                            </DialogTitle>
                            <p className="mt-[0.75em] text-fluid-sm text-on-surface-variant">
                                — {story.clientName}
                            </p>

                            {/* em-based widths/gaps scale with the fluid text size. */}
                            <dl className="mt-[1.5em] space-y-[0.5em] text-fluid-sm">
                                <div className="flex gap-[0.5em]">
                                    <dt className="w-[5.5em] shrink-0
                                    font-semibold text-on-surface">
                                        Service
                                    </dt>
                                    <dd className="text-on-surface-variant">{story.service}</dd>
                                </div>
                                <div className="flex gap-[0.5em]">
                                    <dt className="w-[5.5em] shrink-0 font-semibold text-on-surface">
                                        Stylist
                                    </dt>
                                    <dd className="text-on-surface-variant">{story.stylist}</dd>
                                </div>
                            </dl>

                            <div className="mt-[clamp(1rem,2vw,1.5rem)]">
                                <p className="text-fluid-2xs font-semibold
                                uppercase tracking-[0.18em]
                                text-on-surface-variant">
                                    Products Used
                                </p>
                                <ul className="mt-[clamp(0.5rem,1vw,0.875rem)] flex flex-wrap
                                gap-[clamp(0.375rem,0.8vw,0.625rem)]">
                                    {story.products.map((product) => (
                                        <li
                                            key={product.id}
                                            className="flex items-center
                                            gap-[0.5em] rounded-full border
                                            border-blush/60 bg-surface
                                             py-[0.4em] pl-[0.9em] pr-[0.4em]
                                             text-fluid-xs
                                             font-medium
                                             text-on-surface
                                             transition-colors
                                             hover:border-primary"
                                        >
                                            <Link
                                                href={`/collections/${product.id}`}
                                                className="hover:text-primary"
                                            >
                                                {product.name}
                                            </Link>
                                            <span className="text-on-surface-variant">
                                                ${product.price.toFixed(2)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onAddProduct(product.id, product.name)}
                                                aria-label={`Add ${product.name} to cart`}
                                                className="grid size-[1.6em] shrink-0
                                                place-items-center
                                                rounded-full text-primary
                                                transition-colors hover:bg-primary
                                                hover:text-primary-foreground"
                                            >
                                                <Plus className="size-[60%]"/>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-[clamp(1.5rem,3vw,2.25rem)] flex flex-wrap
                            gap-[clamp(0.5rem,1vw,0.75rem)]">
                                <Button asChild
                                        className="h-auto px-[1.5em] py-[0.85em] text-fluid-xs
                                        uppercase tracking-[0.12em]">
                                    <Link href={`/book?service=${encodeURIComponent(story.service)}`}>
                                        Book This Service
                                    </Link>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onAddRoutine(story)}
                                    className="h-auto border-primary px-[1.5em] py-[0.85em]
                                    text-fluid-xs uppercase tracking-[0.12em] text-primary
                                    hover:bg-primary
                                    hover:text-primary-foreground"
                                >
                                    Shop {story.clientName.split(" ")[0]}&apos;s Routine
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
