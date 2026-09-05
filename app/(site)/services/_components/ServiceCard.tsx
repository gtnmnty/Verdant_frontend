import Image from "next/image";
import Link from "next/link";
import {ArrowRight, Calendar, Heart} from "lucide-react";
import {Button} from "@/components/ui/button";
import type {Service} from "@/app/(site)/services/_components/data";

export function ServiceCard({
    service,
    wished,
    onWish,
}: {
    service: Service;
    wished: boolean;
    onWish: () => void;
}) {
    return (
        <article className="group flex h-full flex-col overflow-hidden
                 rounded-2xl border border-border
                 bg-surface-lowest transition-shadow
                 duration-300
                 hover:shadow-[0_18px_40px_-24px_rgba(39,19,28,0.35)]">
            <div className="relative aspect-4/3 w-full overflow-hidden">
                <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    className="object-cover transition-transform
                          duration-500 group-hover:scale-105"
                />
                <button
                    type="button"
                    aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
                    aria-pressed={wished}
                    onClick={onWish}
                    className="absolute right-3 top-3 grid h-9 w-9
                          place-items-center rounded-full bg-surface/90
                          text-primary shadow-sm backdrop-blur
                          transition-colors hover:bg-surface"
                >
                    <Heart
                        className={`h-4 w-4 transition-colors ${wished ? "fill-primary text-primary" : ""}`}
                    />
                </button>
                <span className="absolute bottom-3 left-3 inline-flex
                 items-center rounded-full bg-blush px-2.5
                 py-1 text-[9px] font-semibold uppercase
                 tracking-[0.15em] text-primary">
          {service.category} · {service.durationMin} min
        </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-1 flex items-start justify-between gap-3">
                    <h2 className="min-w-0 font-display
                 text-[clamp(1.05rem,1.6vw,1.3rem)]
                 leading-tight text-primary">
                        {service.name}
                    </h2>
                    <span className="shrink-0 font-display text-base text-primary">
            ${service.price}
          </span>
                </div>
                <p className="text-[11px] font-semibold uppercase
                 tracking-[0.15em] text-soft-rose">
                    {service.subtitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed
                 text-on-surface-variant">
                    {service.description}
                </p>

                <div className="mt-5 flex flex-col gap-2 pt-2
                 min-[420px]:flex-row">
                    <Button asChild className="flex-1 text-[10px] uppercase tracking-[0.12em]">
                        <Link href={`/services/${service.id}`}>
                            <Calendar className="h-3.5 w-3.5"/>
                            Book Now
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="flex-1 text-[10px] uppercase tracking-[0.12em]"
                    >
                        <Link href={`/services/${service.id}`}>
                            Discover
                            <ArrowRight className="h-3.5 w-3.5"/>
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}
