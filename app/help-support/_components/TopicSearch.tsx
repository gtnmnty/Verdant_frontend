"use client";

import Link from "next/link";
import {useMemo, useState} from "react";
import {
    ArrowRight,
    BadgeCheck,
    CalendarDays,
    Gift,
    MapPin,
    Package,
    Search,
} from "lucide-react";

type Topic = {
    id: string;
    title: string;
    copy: string;
    keywords: string;
    pills?: string[];
    link?: string;
};

const FEATURED: Topic = {
    id: "bookings",
    title: "Bookings & Scheduling",
    copy: "Learn about our priority booking system, " +
          "membership tiers, and stylist consultation " +
          "protocols.",
    keywords: "booking appointment reschedule schedule " +
              "consultation membership",
    pills: ["Rescheduling", "Consultations", "Membership"],
};

const SECONDARY: Topic = {
    id: "products",
    title: "Luxe Products",
    copy: "Care instructions and return policies for our " +
          "exclusive atelier collections.",
    keywords: "product care return refund shipping collection",
    link: "View articles",
};

const TILES: (Topic & { tone: "dark" | "plain" | "accent"; icon: typeof Gift })[] = [
    {
        id: "gift-cards",
        title: "Gift Cards",
        copy: "The gift of transformation.",
        keywords: "gift card voucher present balance",
        tone: "dark",
        icon: Gift,
    },
    {
        id: "atelier",
        title: "Our Atelier",
        copy: "Locations and amenities.",
        keywords: "location branch address parking amenities atelier",
        tone: "plain",
        icon: MapPin,
    },
    {
        id: "membership",
        title: "Membership",
        copy: "Tiered luxury benefits.",
        keywords: "membership tier benefits loyalty points",
        tone: "accent",
        icon: BadgeCheck,
    },
];

const PILL_COPY: Record<string, string> = {
    Rescheduling:
        "Appointments may be rescheduled up to 24 hours before " +
        "your slot from your Appointments page — no fee, no phone call.",
    Consultations:
        "Every new guest begins with a 20-minute consultation to " +
        "map texture, tone and lifestyle before a single cut.",
    Membership:
        "Members receive priority slots, seasonal rituals and early " +
        "access to atelier collections across all tiers.",
};

export function TopicSearch() {
    const [query, setQuery] = useState("");
    const [activePill, setActivePill] = useState<string | null>(null);

    const q = query.trim().toLowerCase();
    const match = (t: Topic) =>
        !q ||
        `${t.title} ${t.copy} ${t.keywords}`.toLowerCase().includes(q) ||
        (t.pills ?? []).some((p) => p.toLowerCase().includes(q));

    const showFeatured = match(FEATURED);
    const showSecondary = match(SECONDARY);
    const visibleTiles = useMemo(
        () => TILES.filter(match),
        [q],
    );
    const nothing = !showFeatured && !showSecondary && visibleTiles.length === 0;

    return (
        <>
            {/* Search */}
            <div className="relative mt-[clamp(2.5rem,6vw,5rem)] border-b border-blush/50 pb-4">
                <Search className="pointer-events-none absolute left-0
                top-1.5 h-4 w-4 text-on-surface-variant"/>
                <label htmlFor="help-search" className="sr-only">
                    Search help topics
                </label>
                <input
                    id="help-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by topic or keyword…"
                    className="w-full bg-transparent pl-8
                    text-[clamp(13px,1.1vw,15px)] text-on-surface
                    outline-none placeholder:text-on-surface-variant/70"
                />
            </div>

            {/* Topic grid */}
            <section className="mt-[clamp(2rem,4vw,3.5rem)]">
                {nothing ? (
                    <p className="py-12 text-center text-sm text-on-surface-variant">
                        No topics match &ldquo;{query}&rdquo;. Try a different keyword or
                        contact the concierge below.
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {showFeatured ? (
                            <article
                                className="min-w-0 rounded-2xl bg-surface-low
                                p-[clamp(1.25rem,2.5vw,2rem)] sm:col-span-2">
                                <CalendarDays className="h-6 w-6 text-primary"/>
                                <h2 className="mt-6 font-display
                                text-[clamp(1.15rem,2.2vw,1.6rem)] text-primary">
                                    {FEATURED.title}
                                </h2>
                                <p className="mt-3 max-w-md text-[clamp(12px,1vw,14px)]
                                leading-relaxed text-on-surface-variant">
                                    {FEATURED.copy}
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {FEATURED.pills?.map((pill) => {
                                        const active = activePill === pill;
                                        return (
                                            <button
                                                key={pill}
                                                type="button"
                                                aria-pressed={active}
                                                onClick={() => setActivePill(active ? null : pill)}
                                                className={`rounded-full border px-4 py-2 text-[10px] 
                                                font-semibold uppercase tracking-[0.18em] transition-colors ${
                                                    active
                                                        ? "border-primary bg-primary text-primary-foreground"
                                                        : "border-blush/60 bg-surface text-on-surface " +
                                                        "hover:border-primary hover:text-primary"
                                                }`}
                                            >
                                                {pill}
                                            </button>
                                        );
                                    })}
                                </div>
                                {activePill ? (
                                    <p className="mt-5 max-w-md text-[clamp(12px,1vw,14px)]
                                    leading-relaxed text-on-surface-variant">
                                        {PILL_COPY[activePill]}
                                    </p>
                                ) : null}
                            </article>
                        ) : null}

                        {showSecondary ? (
                            <article
                                className="min-w-0 rounded-2xl border
                                border-blush/50 p-[clamp(1.25rem,2.5vw,2rem)]">
                                <Package className="h-6 w-6 text-primary"/>
                                <h2 className="mt-6 font-display
                                text-[clamp(1.05rem,1.8vw,1.4rem)] text-primary">
                                    {SECONDARY.title}
                                </h2>
                                <p className="mt-3 text-[clamp(12px,1vw,14px)]
                                leading-relaxed text-on-surface-variant">
                                    {SECONDARY.copy}
                                </p>
                                <Link
                                    href="/"
                                    className="mt-6 inline-flex items-center
                                    gap-2 text-[10px] font-semibold uppercase
                                    tracking-[0.22em] text-primary hover:opacity-70"
                                >
                                    {SECONDARY.link}
                                    <ArrowRight className="h-3.5 w-3.5"/>
                                </Link>
                            </article>
                        ) : null}

                        {visibleTiles.map((tile) => {
                            const Icon = tile.icon;
                            const tone =
                                tile.tone === "dark"
                                    ? "bg-primary text-primary-foreground"
                                    : tile.tone === "accent"
                                        ? "bg-soft-rose text-primary"
                                        : "border border-blush/50 bg-surface text-on-surface";
                            return (
                                <article
                                    key={tile.id}
                                    className={`flex min-w-0 items-start 
                                    justify-between gap-4 rounded-2xl 
                                    p-[clamp(1rem,2vw,1.5rem)] ${tone}`}
                                >
                                    <div className="min-w-0">
                                        <h3 className="text-[10px] font-semibold
                                        uppercase tracking-[0.24em]">
                                            {tile.title}
                                        </h3>
                                        <p className="mt-2 text-[clamp(12px,1vw,14px)]
                                        leading-relaxed opacity-80">
                                            {tile.copy}
                                        </p>
                                    </div>
                                    <Icon
                                        className={`h-5 w-5 shrink-0 ${
                                            tile.tone === "dark" ? "text-champagne-gold" : ""
                                        }`}
                                    />
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </>
    );
}
