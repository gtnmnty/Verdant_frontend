// Corner label on a product image: black background, gold text. Shared by the collection cards and the
// product detail gallery so both look the same. Place it inside a `relative` image container.
export function ProductBadge({label}: { label: string }) {
    return (
        <span
            className="absolute left-3 top-3 z-10 rounded-full bg-black px-3 py-1
                text-[10px] font-semibold uppercase tracking-[0.16em]
                text-champagne-gold"
        >
            {label}
        </span>
    );
}
