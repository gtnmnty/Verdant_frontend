"use client";

import Image from "next/image";
import {Heart} from "lucide-react";
import type {JournalStory} from "@/app/(site)/journal/_components/data";

export function JournalMasonryGrid({
   stories, onOpen,}: { stories: JournalStory[]; onOpen: (story: JournalStory) => void;
}) {
    return (
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 *:mb-4">
            {stories.map((story) => (
                <button
                    key={story.id}
                    type="button"
                    onClick={() => onOpen(story)}
                    className="group relative block w-full
                    break-inside-avoid overflow-hidden
                    rounded-2xl bg-surface-low text-left"
                >
                    <Image
                        src={story.resultImage}
                        alt={`${story.clientName} — ${story.service} result`}
                        width={story.resultImageWidth}
                        height={story.resultImageHeight}
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                        className="h-auto w-full object-cover
                        transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Hover overlay, Pinterest-pin style */}
                    <div
                        className="pointer-events-none absolute
                        inset-0 flex flex-col justify-between
                        bg-linear-to-t from-primary/85 via-primary/10
                        to-transparent p-4 opacity-0 transition-opacity
                        duration-300 group-hover:opacity-100">
                        <div className="flex justify-end">
                        <span
                            className="pointer-events-auto
                            inline-flex items-center gap-1 rounded-full
                            bg-surface/90 px-3 py-1.5 text-[10px]
                            ont-semibold uppercase tracking-[0.12em]
                            text-primary shadow-sm">
                            <Heart className="h-3 w-3"/>
                            Save
                        </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold
                            uppercase tracking-[0.2em] text-champagne-gold">
                                {story.category}
                            </p>
                            <p className="mt-1 font-display
                            text-base leading-snug
                            text-surface sm:text-lg">
                                {story.service}
                            </p>
                            <p className="mt-1 text-xs
                            text-surface/80">— {story.clientName}</p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
