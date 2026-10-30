"use client";

import {smoothScrollTo} from "@/utils/smoothScrollTo";
import {SectionLabel} from "@/utils/SectionLabel";
import {PAGE_GUTTER} from "@/utils/pageGutter";
import Image from "next/image";

export default function HeroSection() {
    return (
        <section id="home"
                 className="relative w-full overflow-hidden border-b
                                border-stone-200/70 bg-[#f7f4f0]">
            <div
                className={`grid grid-cols-1 md:grid-cols-2 items-center
                                gap-[clamp(2rem,5vw,5rem)] ${PAGE_GUTTER}
                                py-[clamp(2.5rem,7vw,7rem)]`}>
                <div className="space-y-[clamp(1rem,2vw,1.75rem)] animate-[fadeIn_1s_ease-out]">
                    <SectionLabel>The Parfois Boutique</SectionLabel>
                    <h1 className="font-serif text-[clamp(2.25rem,calc(1.5rem+3.5vw),5rem)]
                 leading-[1.05] text-stone-800 tracking-tight">
                        Hair Is <em className="italic font-light">Our Craft</em>
                    </h1>
                    <p className="text-stone-600 text-fluid-base
                 max-w-[clamp(18rem,36vw,34rem)] leading-relaxed">
                        Experience the ultimate in boutique hair styling and luxe care. Our expert
                        stylists create professional works of art designed to exceed your every
                        expectation.
                    </p>
                    <div className="flex flex-wrap gap-[clamp(0.625rem,1vw,1rem)]
                 pt-[clamp(0.25rem,0.6vw,0.75rem)]">
                        <button
                            onClick={() => smoothScrollTo("services")}
                            className="group inline-flex items-center gap-[0.5em]
                                            rounded-full bg-stone-900 text-rose-50
                                            px-[clamp(1.25rem,2vw,2rem)]
                                            py-[clamp(0.7rem,1vw,1rem)]
                                            text-fluid-sm font-medium tracking-wide
                                            transition-all hover:bg-stone-800
                                            hover:scale-[1.03] hover:shadow-lg"
                        >
                            Book Your Experience
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                        </button>
                        <button
                            onClick={() => smoothScrollTo("services")}
                            className="inline-flex items-center gap-[0.5em] rounded-full
                                            border border-stone-300 bg-white/60 backdrop-blur
                                            px-[clamp(1.25rem,2vw,2rem)]
                                            py-[clamp(0.7rem,1vw,1rem)]
                                            text-fluid-sm font-medium
                                            text-stone-700 transition-all hover:bg-white
                                            hover:border-stone-400"
                        >
                            Explore Services
                            <span>→</span>
                        </button>
                    </div>
                </div>

                <div className="relative mx-auto aspect-square
                 w-[min(100%,clamp(16rem,36vw,34rem))]">
                    <div aria-hidden
                         className="absolute inset-0 rounded-full bg-stone-300/40
                                         blur-3xl translate-y-[clamp(0.75rem,1.5vw,1.5rem)]"
                    />
                    <Image
                        src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1000&h=1000&q=80"
                        alt="Model with voluminous natural curls, soft studio portrait"
                        width={1000}
                        height={1000}
                        sizes="(max-width: 768px) 80vw, 36vw"
                        priority
                        className="relative z-10 h-full w-full rounded-full
                                        object-cover ring-[clamp(4px,0.6vw,10px)] ring-white
                                        shadow-2xl animate-[float_6s_ease-in-out_infinite]
                                        transition-transform duration-700
                                        hover:scale-[1.02]"
                    />
                </div>
            </div>
        </section>
    );
}
