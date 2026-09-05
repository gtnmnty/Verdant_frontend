import Image from "next/image";
import {SectionTitle} from "@/app/(site)/services/[id]/_components/shared";

export interface StylistData {
    id: string;
    name: string;
    bio: string | null;
    avatarUrl: string | null;
    branchName: string | null;
}

const FALLBACK_AVATAR = "https://picsum.photos/seed/stylist/300/300";

export function StylistsSection({stylists}: { stylists: StylistData[] }) {
    if (stylists.length === 0) return null;

    return (
        <section className="mt-[clamp(40px,6vw,80px)]">
            <SectionTitle eyebrow="Our Artisans" title="Assigned Stylists"/>
            <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2
                 lg:grid-cols-3">
                {stylists.map((s) => (
                    <li
                        key={s.id}
                        className="flex items-center gap-4 rounded-2xl border
                            border-border bg-surface-lowest p-4"
                    >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden
                             rounded-full">
                            <Image
                                src={s.avatarUrl ?? FALLBACK_AVATAR}
                                alt={s.name}
                                fill
                                sizes="64px"
                                className="object-cover"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-base text-primary">{s.name}</p>
                            <p className="truncate text-xs text-on-surface-variant">
                                {s.bio ?? s.branchName ?? "Salon stylist"}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}