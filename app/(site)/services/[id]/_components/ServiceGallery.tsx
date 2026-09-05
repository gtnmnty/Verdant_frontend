"use client";

import {useState} from "react";
import Image from "next/image";
import {ChevronLeft, ChevronRight, X, ZoomIn} from "lucide-react";
import {Dialog, DialogContent} from "@/components/ui/dialog";

interface ServiceGalleryProps {
    images: string[];
    name: string;
}

const FALLBACK_IMAGE = "https://picsum.photos/seed/service-detail/1400/1050";

export function ServiceGallery({images, name}: ServiceGalleryProps) {
    const gallery = images.length > 0 ? images : [FALLBACK_IMAGE];
    const [activeImage, setActiveImage] = useState(0);
    const [lightbox, setLightbox] = useState(false);

    return (
        <div className="min-w-0">
            <div className="group relative overflow-hidden rounded-2xl
                 border border-border bg-secondary">
                <div className="relative aspect-4/3 w-full">
                    <Image
                        src={gallery[activeImage]}
                        alt={name}
                        fill
                        sizes="(max-width: 1024px) 90vw, 45vw"
                        className="object-cover"
                        priority
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setLightbox(true)}
                    aria-label="Zoom image"
                    className="absolute right-3 top-3 grid h-10 w-10
                          place-items-center rounded-full bg-surface/90
                          text-primary shadow-sm backdrop-blur
                          transition-colors hover:bg-surface"
                >
                    <ZoomIn className="h-4 w-4"/>
                </button>
                {gallery.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() =>
                                setActiveImage((i) => (i - 1 + gallery.length) % gallery.length)
                            }
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
                            type="button"
                            onClick={() => setActiveImage((i) => (i + 1) % gallery.length)}
                            aria-label="Next"
                            className="absolute right-3 top-1/2 grid h-10 w-10
                                  -translate-y-1/2 place-items-center
                                  rounded-full bg-surface/90 text-primary
                                  opacity-0 shadow-sm backdrop-blur transition
                                  group-hover:opacity-100"
                        >
                            <ChevronRight className="h-4 w-4"/>
                        </button>
                    </>
                )}
                <span className="absolute bottom-3 right-3 rounded-full
                 bg-primary/85 px-2.5 py-1 text-[10px]
                 font-semibold uppercase tracking-[0.15em]
                 text-primary-foreground">
          {activeImage + 1} / {gallery.length}
        </span>
            </div>

            {gallery.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                    {gallery.map((src, i) => (
                        <button
                            key={src + i}
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
            )}

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
                            src={gallery[activeImage]}
                            alt={name}
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