"use client";

import Image from "next/image";
import type {JournalStory} from "@/app/(site)/journal/_components/data";

// columns-[16rem] lets the browser pick the column count from the available
// width (1 on phones, up to 5 at the 1400px max), instead of fixed breakpoints.
export const MASONRY_LAYOUT =
    "mt-[clamp(1.5rem,4vw,2.5rem)] columns-[16rem] gap-[clamp(0.75rem,1.4vw,1.25rem)] " +
    "*:mb-[clamp(0.75rem,1.4vw,1.25rem)]";

// Pinterest-style variety: each story gets its own tile shape (width / height), picked deterministically from
// its id so it stays stable between renders but looks random across the board - regardless of the uploaded
// photo's own dimensions (it is cropped to fit with object-cover).
const TILE_RATIOS = ["3 / 4", "4 / 5", "1 / 1", "2 / 3", "4 / 3", "3 / 5", "5 / 6", "5 / 7"];

function tileRatio(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
    return TILE_RATIOS[hash % TILE_RATIOS.length];
}

export function JournalMasonryGrid({
   stories, onOpen,}: { stories: JournalStory[]; onOpen: (story: JournalStory) => void;
}) {
    return (
        <div className={MASONRY_LAYOUT}>
            {stories.map((story) => (
                <button
                    key={story.id}
                    type="button"
                    onClick={() => onOpen(story)}
                    className="group relative block w-full
                    break-inside-avoid overflow-hidden
                    rounded-[clamp(0.75rem,1.4vw,1.25rem)] bg-surface-low text-left"
                >
                    <div className="relative w-full" style={{aspectRatio: tileRatio(story.id)}}>
                        <Image
                            src={story.resultImage}
                            alt={`${story.clientName} — ${story.service} result`}
                            fill
                            sizes="(max-width: 600px) 90vw, (max-width: 1100px) 45vw, 22vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>

                    {/* Hover overlay, Pinterest-pin style */}
                    <div
                        className="pointer-events-none absolute
                        inset-0 flex flex-col justify-end
                        bg-linear-to-t from-primary/85 via-primary/10
                        to-transparent p-[clamp(0.75rem,1.4vw,1.25rem)] opacity-0
                        transition-opacity duration-300 group-hover:opacity-100">
                        <div>
                            <p className="text-fluid-2xs font-semibold
                            uppercase tracking-[0.2em] text-champagne-gold">
                                {story.category}
                            </p>
                            <p className="mt-[0.25em] font-display
                            text-fluid-lg leading-snug text-surface">
                                {story.service}
                            </p>
                            <p className="mt-[0.25em] text-fluid-xs
                            text-surface/80">— {story.clientName}</p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
