export function TrackingSummary({
    id,
    placedOn,
    itemCount,
    total,
}: {
    id: string;
    placedOn: string;
    itemCount: number;
    total: number;
}) {
    const stats: [string, string][] = [
        ["Order ID", id],
        ["Placed On", placedOn],
        ["Items", `${itemCount} Items`],
        ["Order Total", `USD $${total.toFixed(2)}`],
    ];

    return (
        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([label, value]) => (
                <div
                    key={label}
                    className="rounded-2xl border border-blush/60
                          bg-surface-lowest p-5 text-center"
                >
                    <p className="text-[10px] font-semibold uppercase
                 tracking-[0.18em] text-on-surface-variant">
                        {label}
                    </p>
                    <p className="mt-2 font-display text-lg text-primary">{value}</p>
                </div>
            ))}
        </section>
    );
}
