"use client";

import Image from "next/image";
import {Heart} from "lucide-react";
import type {JournalStory} from "@/app/(site)/journal/_components/data";

// columns-[16rem] lets the browser pick the column count from the available
// width (1 on phones, up to 5 at the 1400px max), instead of fixed breakpoints.
export const MASONRY_LAYOUT =
    "mt-[clamp(1.5rem,4vw,2.5rem)] columns-[16rem] gap-[clamp(0.75rem,1.4vw,1.25rem)] " +
    "*:mb-[clamp(0.75rem,1.4vw,1.25rem)]";

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
                    <Image
                        src={story.resultImage}
                        alt={`${story.clientName} — ${story.service} result`}
                        width={story.resultImageWidth}
                        height={story.resultImageHeight}
                        sizes="(max-width: 600px) 90vw, (max-width: 1100px) 45vw, 22vw"
                        className="h-auto w-full object-cover
                        transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Hover overlay, Pinterest-pin style */}
                    <div
                        className="pointer-events-none absolute
                        inset-0 flex flex-col justify-between
                        bg-linear-to-t from-primary/85 via-primary/10
                        to-transparent p-[clamp(0.75rem,1.4vw,1.25rem)] opacity-0
                        transition-opacity duration-300 group-hover:opacity-100">
                        <div className="flex justify-end">
                        <span
                            className="pointer-events-auto
                            inline-flex items-center gap-[0.4em] rounded-full
                            bg-surface/90 px-[1em] py-[0.5em] text-fluid-2xs
                            font-semibold uppercase tracking-[0.12em]
                            text-primary shadow-sm">
                            <Heart className="h-[1.1em] w-[1.1em]"/>
                            Save
                        </span>
                        </div>
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
