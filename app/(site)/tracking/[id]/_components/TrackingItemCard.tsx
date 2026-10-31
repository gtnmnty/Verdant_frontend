import Image from "next/image";
import {STAGES, type TrackItem} from "@/app/(site)/tracking/[id]/_components/data";

// Each item gets its own stage: the order status sets the floor, and an
// in-transit item moves to "Out for Delivery" once its delivery option's
// window starts (see itemStage in TrackingContent.tsx).
//
// Below 600px the five steps don't fit side by side, so the timeline turns
// vertical; from 600px up it is the horizontal bar.
export function TrackingItemCard({item}: { item: TrackItem }) {
    const stageIdx = item.cancelled ? -1 : STAGES.indexOf(item.stage);

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
                            {item.eta && !item.cancelled && item.stage !== "Delivered" && (
                                <p className="mt-1 text-xs text-on-surface-variant">
                                    Est. arrival {item.eta}
                                </p>
                            )}
                            <span className={`mt-2 inline-block rounded-full border px-3 py-1
                                 text-xs font-semibold uppercase tracking-[0.14em] ${
                                item.cancelled
                                    ? "border-rose-500/40 text-rose-600"
                                    : item.stage === "Delivered"
                                        ? "border-emerald-600/40 text-emerald-700"
                                        : "border-champagne-gold/60 text-[#8a6d1f]"
                            }`}>
                                {item.statusLabel}
                            </span>
                        </div>
                    </div>

                    {/* Timeline: vertical below 600px */}
                    <ol className="mt-6 min-[600px]:hidden" aria-label="Delivery progress">
                        {STAGES.map((stage, i) => {
                            const active = i <= stageIdx;
                            const isLast = i === STAGES.length - 1;
                            return (
                                <li key={stage} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <span className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full ${
                                            active ? "bg-primary" : "bg-blush/60"
                                        }`}/>
                                        {!isLast && (
                                            <span className={`w-px flex-1 min-h-6 ${
                                                i < stageIdx ? "bg-primary" : "bg-blush/60"
                                            }`}/>
                                        )}
                                    </div>
                                    <p className={`text-[10px] font-semibold uppercase leading-5
                                        tracking-[0.14em] ${isLast ? "" : "pb-4"} ${
                                        active ? "text-primary" : "text-on-surface-variant"
                                    }`}>
                                        {stage}
                                        {i === stageIdx && <span className="sr-only"> (current)</span>}
                                    </p>
                                </li>
                            );
                        })}
                    </ol>

                    {/* Timeline: horizontal from 600px */}
                    <ol className="mt-6 hidden items-start justify-between min-[600px]:flex"
                        aria-label="Delivery progress">
                        {STAGES.map((stage, i) => {
                            const active = i <= stageIdx;
                            return (
                                <li key={stage} className="flex min-w-0 flex-1 flex-col
                                items-center text-center">
                                    <div className="flex w-full items-center">
                                        <span className={`h-px flex-1 ${
                                            i === 0 ? "invisible" : i <= stageIdx ? "bg-primary" : "bg-blush/60"
                                        }`}/>
                                        <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${
                                            active ? "bg-primary" : "bg-blush/60"
                                        }`}/>
                                        <span className={`h-px flex-1 ${
                                            i === STAGES.length - 1
                                                ? "invisible"
                                                : i < stageIdx ? "bg-primary" : "bg-blush/60"
                                        }`}/>
                                    </div>
                                    <p className={`mt-2 px-1 text-[9px] font-semibold uppercase
                                        tracking-[0.14em] ${
                                        active ? "text-primary" : "text-on-surface-variant"
                                    }`}>
                                        {stage}
                                        {i === stageIdx && <span className="sr-only"> (current)</span>}
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
