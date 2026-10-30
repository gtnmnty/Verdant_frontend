"use client";

import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";

interface JournalFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    categories: readonly string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export function JournalFilters({
   search, onSearchChange, categories, activeCategory, onCategoryChange,
}: JournalFiltersProps) {
    return (
        <div className="mt-[clamp(1.5rem,4vw,2.5rem)] flex flex-col
        gap-[clamp(1rem,2vw,1.5rem)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-[clamp(0.375rem,0.8vw,0.625rem)]">
                <FilterPill
                    label="All Stories"
                    active={activeCategory === "All"}
                    onClick={() => onCategoryChange("All")}
                />
                {categories.map((category) => (
                    <FilterPill
                        key={category}
                        label={category}
                        active={activeCategory === category}
                        onClick={() => onCategoryChange(category)}
                    />
                ))}
            </div>

            <div className="relative w-full shrink-0 text-fluid-sm sm:max-w-[clamp(16rem,28vw,24rem)]">
                <Search
                    className="pointer-events-none
                    absolute left-[0.75em] top-1/2 h-[1.1em] w-[1.1em]
                    -translate-y-1/2 text-on-surface-variant"/>
                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search stylist, service, or product…"
                    aria-label="Search journal stories"
                    className="h-[clamp(2.25rem,calc(2rem+0.8vw),2.75rem)] bg-surface-lowest
                    pl-[2.4em] text-fluid-sm"
                />
            </div>
        </div>
    );
}

function FilterPill({
    label, active, onClick,}: { label: string; active: boolean; onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`rounded-full border px-[1.25em] py-[0.5em]
            text-fluid-xs font-semibold uppercase tracking-widest
            transition-colors ${
                active
                    ? "border-primary bg-primary " +
                    "text-primary-foreground"
                    : "border-blush/60 text-on-surface-variant " +
                    "hover:border-primary hover:text-primary"
            }`}
        >
            {label}
        </button>
    );
}
