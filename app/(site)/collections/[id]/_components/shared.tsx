import {Star} from "lucide-react";

export function Stars({value, small = false}: { value: number; small?: boolean }) {
    const size = small ? "h-3.5 w-3.5" : "h-4 w-4";
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    className={`${size} ${
                        n <= Math.round(value)
                            ? "fill-champagne-gold text-champagne-gold"
                            : "text-border"
                    }`}
                />
            ))}
        </div>
    );
}

export function SectionTitle({eyebrow, title}: { eyebrow: string; title: string }) {
    return (
        <div>
            <p className="text-[10px] font-semibold uppercase
                 tracking-[0.22em] text-champagne-gold">
                {eyebrow}
            </p>
            <h2 className="mt-2 font-display
                 text-[clamp(1.5rem,3vw,2.25rem)]
                 leading-tight text-primary">
                {title}
            </h2>
        </div>
    );
}
