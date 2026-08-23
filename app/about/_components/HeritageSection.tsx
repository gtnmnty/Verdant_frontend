import {Reveal} from "@/components/home/reveal";

const HERITAGE = [
    {
        year: "2012",
        title: "The First Chair",
        copy: "Verdant Luxe began in a small, white-walled studio in Paris." +
            "Our founder, Elara Vance, sought to merge her experience in haute" +
            "couture styling with a personalized salon experience.",
    },
    {
        year: "2017",
        title: "The Expansion",
        copy: "Gaining international recognition, we opened our flagship atelier. " +
            "This period marked the birth of our \u201CEditorial Signature\u201D, " +
            "a methodology now taught to stylists worldwide.",
    },
    {
        year: "2024",
        title: "A Global Legacy",
        copy: "Today, Verdant Luxe stands as a beacon of luxury hairdressing, " +
            "committed to sustainable practices and the continuous evolution " +
            "of professional artistry.",
    },
];

export function HeritageSection() {
    return (
        <section className="-mx-[5vw] bg-surface-low px-[5vw]
        py-[clamp(3rem,7vw,6rem)] sm:-mx-[6vw] sm:px-[6vw]
        lg:-mx-[10vw] lg:px-[10vw]">
            <Reveal className="text-center">
                <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)]
                leading-tight text-primary">
                    Our Heritage
                </h2>
                <p className="mt-3 text-[clamp(12px,1vw,14px)]
                italic text-on-surface-variant">
                    A decade of refinement, one client at a time.
                </p>
            </Reveal>

            <div className="mt-[clamp(2.5rem,5vw,4rem)] grid
            gap-[clamp(1.75rem,3vw,3rem)] sm:grid-cols-2 md:grid-cols-3">
                {HERITAGE.map((item, i) => (
                    <Reveal
                        key={item.year}
                        delay={i * 120}
                        className={`min-w-0 ${i === 1 ? "md:mt-16" : ""} ${
                            i === 2 ? "sm:col-span-2 sm:mx-auto " +
                                "sm:max-w-sm md:col-span-1 " +
                                "md:mx-0 md:max-w-none" : ""
                        }`}
                    >
                        <p className="text-[10px] font-semibold uppercase
                        tracking-[0.32em] text-champagne-gold">
                            {item.year}
                        </p>
                        <h3 className="mt-3 font-display
                        text-[clamp(1.05rem,1.8vw,1.4rem)]
                        text-primary">
                            {item.title}
                        </h3>
                        <p className="mt-3 text-[clamp(12px,1vw,14px)]
                        leading-relaxed text-on-surface-variant">
                            {item.copy}
                        </p>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
