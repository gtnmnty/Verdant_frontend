import {Reveal} from "@/utils/Reveal";
import {SectionLabel} from "@/utils/SectionLabel";
import Image from "next/image";

type Service = {
    id: string;
    title: string;
    description: string;
    image: string;
};

const SERVICES: Service[] = [
    {
        id: "salon",
        title: "Salon Services",
        description:
            "Expert cuts, styling, and texture treatments tailored to your unique identity.",
        image:
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "spa",
        title: "Spa Treatments",
        description:
            "Indulgent rituals for the scalp and soul, restoring balance and vitality.",
        image:
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "color",
        title: "Professional Coloring",
        description:
            "Dimensional shades and bespoke tones that illuminate your complexion.",
        image:
            "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=900&q=80",
    },
];

export default function ServicesSection() {
    return (
        <section id="services" className="py-[clamp(3rem,8vw,6rem)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(1.25rem,3vw,2.5rem)]
                 items-start mb-[clamp(2rem,5vw,4rem)]">
                <div className="md:col-span-2 space-y-[clamp(0.5rem,1vw,0.875rem)]">
                    <SectionLabel>Our Expertise</SectionLabel>
                    <h2 className="font-serif text-[clamp(2rem,4.5vw,3.5rem)]
                 leading-tight text-stone-800">
                        Refined <br/> Transformations
                    </h2>
                </div>
                <p className="text-stone-500 text-fluid-base max-w-[clamp(18rem,26vw,26rem)]
                 leading-relaxed">
                    A curated selection of treatments designed to enhance your natural beauty
                    with precision and grace.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2
                 lg:grid-cols-3 gap-[clamp(1.25rem,2.5vw,2.5rem)]">
                {SERVICES.map((s, i) => (
                    <Reveal key={s.id} delay={i * 120}
                            className={i === 1 ? "lg:mt-[clamp(2.5rem,5vw,5rem)]" : ""}>
                        <article className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-[clamp(1rem,1.6vw,1.5rem)]
                 aspect-[4/5] mb-[clamp(1rem,1.6vw,1.5rem)]">
                                <Image
                                    src={s.image}
                                    alt={s.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="h-full w-full object-cover
                                                    transition-transform duration-[1200ms]
                                                    ease-out group-hover:scale-110"
                                />
                            </div>
                            <h3 className="font-serif text-fluid-xl text-stone-800 mb-[0.4em]">{s.title}</h3>
                            <p className="text-fluid-sm text-stone-500 leading-relaxed mb-[1em]">
                                {s.description}
                            </p>
                            <button
                                className="text-fluid-2xs tracking-[0.3em] uppercase
                                                text-stone-700 border-b border-stone-300 pb-1
                                                transition-colors hover:border-stone-700">
                                Discover
                            </button>
                        </article>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
