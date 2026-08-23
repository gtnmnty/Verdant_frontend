import Image from "next/image";
import {Reveal} from "@/components/home/reveal";

const TEAM = [
    {
        name: "Elara Vance",
        role: "Founder & Creative Director",
        bio: "With over two decades in the industry, " +
            "Elara's vision defines the aesthetic heartbeat " +
            "of every Verdant Luxe experience.",
        image:
            "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1000&q=80",
    },
    {
        name: "Julian Rossi",
        role: "Master Colorist",
        bio: "Julian is renowned for his \u201Csun-kissed\u201D techniques, " +
            "specialising in dimensional tones that enhance natural beauty.",
        image:
            "https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=1000&q=80",
    },
];

export function TeamSection() {
    return (
        <section className="py-[clamp(3rem,8vw,7rem)]">
            <Reveal>
                <div className="grid gap-6 text-center
                md:grid-cols-[1fr_auto] md:items-end
                md:text-left">
                    <div className="min-w-0">
                        <p className="text-[10px]
                        font-semibold uppercase
                        tracking-[0.32em] text-soft-rose">
                            The Team
                        </p>
                        <h2 className="mt-4 font-display
                        text-[clamp(1.75rem,4vw,3rem)]
                        leading-tight text-primary">
                            Meet the
                            <br/>
                            Visionaries
                        </h2>
                    </div>
                    <p className="mx-auto max-w-xs
                    text-[clamp(12px,1vw,14px)]
                    leading-relaxed
                    text-on-surface-variant md:mx-0">
                        Curating a collective of world-class stylists, each bringing a
                        unique perspective to the Verdant Luxe ethos.
                    </p>
                </div>
            </Reveal>

            <div className="mt-[clamp(2rem,5vw,3.5rem)]
            grid gap-[clamp(1.5rem,4vw,3rem)] sm:grid-cols-2">
                {TEAM.map((member, i) => (
                    <Reveal
                        key={member.name}
                        delay={i * 140}
                        className={`min-w-0 ${i === 1 ? "md:mt-24" : ""}`}
                    >
                        <div className="relative aspect-4/5
                        overflow-hidden rounded-2xl">
                            <Image
                                src={member.image}
                                alt={member.name}
                                fill
                                sizes="(max-width: 640px) 90vw, 45vw"
                                className="object-cover
                                transition-transform duration-1200
                                ease-out hover:scale-[1.03]"
                            />
                        </div>
                        <h3 className="mt-5 font-display
                        text-[clamp(1.05rem,1.8vw,1.4rem)] text-primary">
                            {member.name}
                        </h3>
                        <p className="mt-1.5 text-[10px]
                        font-semibold uppercase
                        tracking-[0.28em] text-soft-rose">
                            {member.role}
                        </p>
                        <p className="mt-3 max-w-sm
                        text-[clamp(12px,1vw,14px)]
                        leading-relaxed text-on-surface-variant">
                            {member.bio}
                        </p>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
