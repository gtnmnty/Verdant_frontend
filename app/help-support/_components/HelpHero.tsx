import Image from "next/image";

const HERO_IMAGE =
    "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1400&q=80";

export function HelpHero() {
    return (
        <section className="grid items-center gap-[clamp(1.75rem,4vw,3.5rem)] md:grid-cols-2">
            <div className="min-w-0 text-center md:order-1 md:text-left">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-soft-rose">
                    Concierge Services
                </p>
                <h1 className="mt-4 font-display
                text-[clamp(1.9rem,5vw,3.5rem)]
                leading-[1.06] tracking-tight text-primary">
                    How may we
                    <br/>
                    assist your journey?
                </h1>
                <p className="mx-auto mt-6
                max-w-md text-[clamp(13px,1.05vw,15px)]
                leading-relaxed text-on-surface-variant md:mx-0">
                    At Verdant Luxe, every interaction is an extension of our craft.
                    Whether you seek guidance on our services or require immediate
                    support, our concierge is here to provide an effortless experience.
                </p>
            </div>
            <div className="relative aspect-4/3 min-w-0 overflow-hidden rounded-2xl md:order-2">
                <Image
                    src={HERO_IMAGE}
                    alt="Interior detail of the Verdant Luxe atelier"
                    fill
                    priority
                    sizes="(max-width: 768px) 90vw, 45vw"
                    className="object-cover"
                />
            </div>
        </section>
    );
}
