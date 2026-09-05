import Image from "next/image";
import {Reveal} from "@/components/home/reveal";

const PHILOSOPHY_IMAGE =
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80";

export function PhilosophySection() {
    return (
        <section className="py-[clamp(3rem,8vw,7rem)]">
            <div className="grid items-center gap-[clamp(2rem,5vw,4.5rem)] md:grid-cols-2">
                <Reveal className="min-w-0 text-center md:text-left">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-soft-rose">
                        Brand Philosophy
                    </p>
                    <h2 className="mt-4 font-display
                    text-[clamp(1.6rem,3.4vw,2.75rem)]
                    leading-tight text-primary">
                        The Art of
                        <br/>
                        Artistry
                    </h2>
                    <p className="mx-auto mt-6 max-w-md
                    text-[clamp(13px,1.05vw,15px)]
                    leading-relaxed text-on-surface-variant md:mx-0">
                        We believe that hair is the ultimate form of self-expression — a
                        living sculpture that demands precision, intuition, and an
                        unwavering commitment to quality.
                    </p>
                    <p className="mx-auto mt-4 max-w-md
                    text-[clamp(13px,1.05vw,15px)]
                    leading-relaxed text-on-surface-variant md:mx-0">
                        Our approach is deeply rooted in the principles of &ldquo;silent
                        luxury.&rdquo; We eschew the noisy trends of the moment in favour
                        of timeless techniques and curated aesthetics that reveal the
                        natural radiance of our clients.
                    </p>
                    <span className="mx-auto mt-8 block h-px w-24 bg-champagne-gold/70 md:mx-0"/>
                </Reveal>

                <Reveal delay={120} className="min-w-0">
                    <div className="relative aspect-[4/5]
                    overflow-hidden rounded-2xl">
                        <Image
                            src={PHILOSOPHY_IMAGE}
                            alt="Stylist shaping a length of hair in the atelier"
                            fill
                            sizes="(max-width: 768px) 90vw, 45vw"
                            className="object-cover grayscale
                            transition-transform duration-[1200ms]
                            ease-out hover:scale-[1.03]"
                        />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
