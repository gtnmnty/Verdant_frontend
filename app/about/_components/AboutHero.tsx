import Image from "next/image";

const HERO_IMAGE =
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80";

export function AboutHero() {
    return (
        <section className="relative isolate mx-[-5vw] overflow-hidden sm:mx-[-6vw] lg:mx-[-10vw]">
            <div className="relative min-h-[clamp(360px,62vh,720px)] w-full">
                <Image
                    src={HERO_IMAGE}
                    alt="Arched interior of the Verdant Luxe atelier"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t
                from-primary/75 via-primary/25 to-transparent"/>
                <div
                    className="relative flex min-h-[clamp(360px,62vh,720px)]
                    w-[min(90vw,1400px)] flex-col justify-end px-[5vw]
                    pb-[clamp(2rem,5vw,4.5rem)] pt-[clamp(120px,16vw,220px)]
                    sm:px-[6vw] lg:mx-auto lg:px-0">
                    <p className="text-[10px] font-semibold uppercase
                    tracking-[0.32em] text-champagne-gold">
                        Established 2012
                    </p>
                    <h1 className="mt-4 max-w-3xl font-display
                    text-[clamp(2rem,6vw,4.5rem)] leading-[1.04]
                    tracking-tight text-surface">
                        Redefining the
                        <br/>
                        <em className="font-light italic">Art of Elegance.</em>
                    </h1>
                    <p className="mt-5 max-w-md text-[clamp(13px,1.1vw,15px)] leading-relaxed text-surface/85">
                        A journey born from a singular vision — to create a sanctuary
                        where high-fashion editorial craft meets the intimacy of personal
                        care.
                    </p>
                </div>
            </div>
        </section>
    );
}
