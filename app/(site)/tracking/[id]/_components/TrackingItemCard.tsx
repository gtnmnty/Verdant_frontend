import Image from "next/image";
import {STAGES, type TrackItem} from "@/app/(site)/tracking/[id]/_components/data";

export function TrackingItemCard({item}: { item: TrackItem }) {
    const stageIdx = STAGES.indexOf(item.stage);

    return (
        <article className="rounded-2xl border border-blush/50
                 bg-surface-lowest p-5 sm:p-7">
            <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                <div className="relative aspect-square w-full overflow-hidden
                 rounded-xl">
                    <Image src={item.image} alt={item.name} fill sizes="200px" className="object-cover"/>
                </div>
                <div className="min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row
                        sm:items-start sm:justify-between">
                        <div>
                            <h3 className="font-display text-[clamp(1.25rem,2vw,1.6rem)]
                            text-primary">
                                {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-on-surface-variant">
                                USD ${item.price.toFixed(2)} · Qty {item.qty}
                            </p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-[10px] font-semibold uppercase
                            tracking-[0.18em] text-on-surface-variant">
                                {item.courier}
                            </p>
                            <span className="mt-2 inline-block rounded-full border
                                 border-champagne-gold/60 px-3 py-1 text-xs
                                 font-semibold uppercase tracking-[0.14em]
                                 text-[#8a6d1f]">
                                In Progress
                              </span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <ol className="mt-6 flex items-center justify-between">
                        {STAGES.map((stage, i) => {
                            const active = i <= stageIdx;
                            return (
                                <li key={stage} className="flex flex-1 flex-col items-center text-center">
                                    <div className="flex w-full items-center">
                                        {i > 0 && (
                                            <span
                                                className={`h-px flex-1 ${i <= stageIdx ? "bg-primary" : "bg-blush/60"}`}/>
                                        )}
                                        <span
                                            className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full ${
                                                active ? "bg-primary" : "bg-blush/60"
                                            }`}
                                        />
                                        {i < STAGES.length - 1 && (
                                            <span
                                                className={`h-px flex-1 ${i < stageIdx ? "bg-primary" : "bg-blush/60"}`}/>
                                        )}
                                    </div>
                                    <p
                                        className={`mt-2 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                                            active ? "text-primary" : "text-on-surface-variant"
                                        }`}
                                    >
                                        {stage}
                                    </p>
                                </li>
                            );
                        })}
                    </ol>

                    <p className="mt-5 border-t border-blush/40 pt-4 text-sm
                 italic text-on-surface-variant">
                        &ldquo;{item.note}&rdquo;
                    </p>
                </div>
            </div>
        </article>
    );
}
