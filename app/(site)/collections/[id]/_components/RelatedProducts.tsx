import Image from "next/image";
import {RELATED} from "@/app/(site)/collections/[id]/_components/data";
import {SectionTitle} from "@/app/(site)/collections/[id]/_components/shared";

export function RelatedProducts() {
    return (
        <section className="mt-[clamp(40px,6vw,80px)]">
            <SectionTitle eyebrow="You May Also Love" title="Related Products"/>
            <div className="mt-6 -mx-2 flex gap-5 overflow-x-auto px-2
                 pb-3 scrollbar-thin">
                {RELATED.map((r) => (
                    <article
                        key={r.id}
                        className="w-55 shrink-0 overflow-hidden
                            rounded-2xl border border-border
                            bg-surface-lowest sm:w-65"
                    >
                        <div className="relative aspect-square">
                            <Image
                                src={r.image}
                                alt={r.name}
                                fill
                                sizes="260px"
                                className="object-cover"
                            />
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <p className="font-display text-base text-primary">{r.name}</p>
                            <p className="text-sm text-soft-rose">${r.price}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
