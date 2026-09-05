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
            <DialogContent className="max-w-3xl overflow-hidden p-0">
                {story ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="relative min-w-0">
                            <div className="relative aspect-4/5
                            w-full overflow-hidden bg-surface-low">
                                <Image
                                    src={story.resultImage}
                                    alt={`${story.clientName} — ${story.service} result`}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </div>
                            <div
                                className="absolute bottom-4
                                right-4 h-24 w-24 overflow-hidden
                                rounded-lg border-4 border-surface
                                shadow-lg sm:h-28 sm:w-28">
                                <Image
                                    src={story.productImage}
                                    alt={`Products used for ${story.clientName}'s ${story.service}`}
                                    fill
                                    sizes="112px"
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        {/* Story content */}
                        <div className="min-w-0 p-6 sm:p-8">
                            <p className="text-[10px] font-semibold
                            uppercase tracking-[0.24em] text-soft-rose">
                                {story.category}
                            </p>
                            <DialogTitle
                                className="mt-4 font-display text-xl
                                italic leading-snug text-on-surface sm:text-2xl">
                                &ldquo;{story.quote}&rdquo;
                            </DialogTitle>
                            <p className="mt-3 text-sm text-on-surface-variant">
                                — {story.clientName}
                            </p>

                            <dl className="mt-6 space-y-2 text-sm">
                                <div className="flex gap-2">
                                    <dt className="w-20 shrink-0
                                    font-semibold text-on-surface">
                                        Service
                                    </dt>
                                    <dd className="text-on-surface-variant">{story.service}</dd>
                                </div>
                                <div className="flex gap-2">
                                    <dt className="w-20 shrink-0 font-semibold text-on-surface">
                                        Stylist
                                    </dt>
                                    <dd className="text-on-surface-variant">{story.stylist}</dd>
                                </div>
                            </dl>

                            <div className="mt-5">
                                <p className="text-[10px] font-semibold
                                uppercase tracking-[0.18em]
                                text-on-surface-variant">
                                    Products Used
                                </p>
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {story.products.map((product) => (
                                        <li
                                            key={product.id}
                                            className="flex items-center
                                            gap-2 rounded-full border
                                            border-blush/60 bg-surface
                                             py-1.5 pl-3 pr-1.5
                                             text-xs
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
                                                className="grid h-5 w-5 shrink-0
                                                place-items-center
                                                rounded-full text-primary
                                                transition-colors hover:bg-primary
                                                hover:text-primary-foreground"
                                            >
                                                <Plus className="h-3 w-3"/>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Button asChild className="uppercase tracking-[0.12em]">
                                    <Link href={`/book?service=${encodeURIComponent(story.service)}`}>
                                        Book This Service
                                    </Link>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onAddRoutine(story)}
                                    className="border-primary uppercase
                                    tracking-[0.12em] text-primary
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
