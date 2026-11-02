import {Package, Scissors, UserRound} from "lucide-react";

export type PlaceholderKind = "service" | "product" | "stylist";

const KIND_META = {
    service: {Icon: Scissors, label: "Service"},
    product: {Icon: Package, label: "Product"},
    stylist: {Icon: UserRound, label: "Stylist"},
} as const;

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");
}

// Stand-in for an item that has no uploaded photo yet (a new service/product, or a stylist without an avatar).
// A plain card with the item's type and name, so no stock or random imagery is ever shown for real catalog data.
// Fills its (relatively positioned) parent. `compact` is for thumbnails too small to hold text: icon only.
export function ImagePlaceholder({
    name,
    kind,
    compact = false,
    className = "",
}: {
    name: string;
    kind: PlaceholderKind;
    compact?: boolean;
    className?: string;
}) {
    const {Icon, label} = KIND_META[kind];

    if (kind === "stylist") {
        return (
            <div
                role="img"
                aria-label={name}
                className={`grid size-full place-items-center bg-secondary font-display text-primary/70 ${className}`}
            >
                <span className={compact ? "text-xs" : "text-lg"}>{initials(name) || "?"}</span>
            </div>
        );
    }

    return (
        <div
            role="img"
            aria-label={`${name} (no photo yet)`}
            className={`flex size-full flex-col items-center justify-center gap-1.5 overflow-hidden
                bg-linear-to-br from-secondary to-surface-low p-3 text-center text-primary/60 ${className}`}
        >
            <Icon className={compact ? "size-4" : "size-6"} strokeWidth={1.5}/>
            {compact ? null : (
                <>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">{label}</span>
                    <span className="line-clamp-2 max-w-[85%] font-display text-sm leading-snug text-primary/80">
                        {name}
                    </span>
                </>
            )}
        </div>
    );
}
