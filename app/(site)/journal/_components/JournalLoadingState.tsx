import {MASONRY_LAYOUT} from "@/app/(site)/journal/_components/JournalMasonryGrid";

// Aspect ratios rather than fixed heights, so placeholders scale with the column width.
const SKELETON_RATIOS = [
    "aspect-4/5",
    "aspect-3/4",
    "aspect-square",
    "aspect-2/3",
    "aspect-4/5",
    "aspect-5/6",
    "aspect-3/5",
    "aspect-3/4",
];

export function JournalLoadingState() {
    return (
        <div
            className={MASONRY_LAYOUT}
            aria-busy="true"
            aria-live="polite"
        >
            {SKELETON_RATIOS.map((ratio, i) => (
                <div
                    key={i}
                    className={`w-full animate-pulse break-inside-avoid
                    rounded-[clamp(0.75rem,1.4vw,1.25rem)] bg-surface-low ${ratio}`}
                />
            ))}
        </div>
    );
}
