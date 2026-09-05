"use client";

import Image from "next/image";
import { Reveal } from "@/utils/Reveal";

const GALLERY = [
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=800&q=80",
];

export function AtmosphereSection() {
    return (
        <section id="atmosphere" className="py-[clamp(3rem,8vw,6rem)]">
            <div className="grid grid-cols-1 items-center gap-6
                 sm:grid-cols-2 md:grid-cols-3">
                <Reveal>
                    <div className="space-y-4 text-center sm:col-span-2
                 sm:text-left md:col-span-1">
                        <h2 className="font-display
                 text-[clamp(1.75rem,3.5vw,2.5rem)]
                 text-stone-800">
                            The Atmosphere
                        </h2>
                        <p className="text-sm leading-relaxed text-stone-500">
                            Step inside our sanctuary of style. Every detail of the Verdant
                            Luxe boutique is curated to provide a calm, luxurious escape
                            from the world outside.
                        </p>
                        <p className="inline-flex items-center gap-2 text-[0.7rem]
                 uppercase tracking-[0.3em] text-stone-600">
                            <span className="h-px w-6 bg-stone-400"/> @verdantluxe.boutique
                        </p>
                    </div>
                </Reveal>
                {GALLERY.map((src, i) => (
                    <Reveal key={src} delay={(i + 1) * 150}>
                        <div className="relative aspect-3/4 overflow-hidden rounded-2xl">
                            <Image
                                src={src}
                                alt="Boutique atmosphere"
                                fill
                                sizes="(max-width: 768px) 90vw, 30vw"
                                className="object-cover transition-transform
                                                duration-1200 hover:scale-110"
                            />
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
