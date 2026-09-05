"use client";

import {useState} from "react";
import Image from "next/image";
import {ChevronLeft, ChevronRight, X, ZoomIn} from "lucide-react";
import {Dialog, DialogContent} from "@/components/ui/dialog";
import {GALLERY, PRODUCT} from "@/app/(site)/collections/[id]/_components/data";

export function ProductGallery() {
    const [activeImage, setActiveImage] = useState(0);
    const [lightbox, setLightbox] = useState(false);

    return (
        <div className="min-w-0">
            <div className="group relative overflow-hidden rounded-2xl
                 border border-border bg-secondary">
                <div className="relative aspect-square w-full">
                    <Image
                        src={GALLERY[activeImage]}
                        alt={PRODUCT.name}
                        fill
                        sizes="(max-width: 1024px) 90vw, 45vw"
                        className="object-cover"
                        priority
                    />
                </div>
                <button
                    onClick={() => setLightbox(true)}
                    className="absolute right-3 top-3 grid h-10 w-10
                          place-items-center rounded-full bg-surface/90
                          text-primary shadow-sm backdrop-blur
                          hover:bg-surface"
                    aria-label="Zoom"
                >
                    <ZoomIn className="h-4 w-4"/>
                </button>
                <button
                    onClick={() => setActiveImage((i) => (i - 1 + GALLERY.length) % GALLERY.length)}
                    aria-label="Previous"
                    className="absolute left-3 top-1/2 grid h-10 w-10
                          -translate-y-1/2 place-items-center
                          rounded-full bg-surface/90 text-primary
                          opacity-0 shadow-sm backdrop-blur transition
                          group-hover:opacity-100"
                >
                    <ChevronLeft className="h-4 w-4"/>
                </button>
                <button
                    onClick={() => setActiveImage((i) => (i + 1) % GALLERY.length)}
                    aria-label="Next"
                    className="absolute right-3 top-1/2 grid h-10 w-10
                          -translate-y-1/2 place-items-center
                          rounded-full bg-surface/90 text-primary
                          opacity-0 shadow-sm backdrop-blur transition
                          group-hover:opacity-100"
                >
                    <ChevronRight className="h-4 w-4"/>
                </button>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
                {GALLERY.map((src, i) => (
                    <button
                        key={src}
                        onClick={() => setActiveImage(i)}
                        className={`relative aspect-square overflow-hidden rounded-xl border transition-all ${
                            activeImage === i
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-border hover:border-primary/60"
                        }`}
                        aria-label={`View image ${i + 1}`}
                    >
                        <Image src={src} alt="" fill sizes="10vw" className="object-cover"/>
                    </button>
                ))}
            </div>

            <Dialog open={lightbox} onOpenChange={setLightbox}>
                <DialogContent className="max-w-5xl border-0 bg-primary/95 p-0">
                    <button
                        onClick={() => setLightbox(false)}
                        className="absolute right-3 top-3 z-10 grid h-9 w-9
                            place-items-center rounded-full bg-surface/90
                            text-primary"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4"/>
                    </button>
                    <div className="relative aspect-square w-full sm:aspect-4/3">
                        <Image
                            src={GALLERY[activeImage]}
                            alt={PRODUCT.name}
                            fill
                            sizes="90vw"
                            className="object-contain"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
