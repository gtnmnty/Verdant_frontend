// Corner label on a product image: black background, gold text. Shared by the collection cards and the
// product detail gallery so both look the same. Place it inside a `relative` image container.
export function ProductBadge({label}: { label: string }) {
    return (
        <span
            className="absolute left-4 top-4 z-10 rounded-full bg-black px-4 py-2
                text-xs font-semibold uppercase tracking-[0.18em]
                text-champagne-gold shadow-md"
        >
            {label}
        </span>
    );
}
