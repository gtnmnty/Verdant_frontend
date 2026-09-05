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
        <div className="mt-10 flex flex-col gap-5
        sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
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

            <div className="relative w-full sm:max-w-xs">
                <Search
                    className="pointer-events-none
                    absolute left-3 top-1/2 h-4 w-4
                    -translate-y-1/2 text-on-surface-variant"/>
                <Input
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search stylist, service, or product…"
                    aria-label="Search journal stories"
                    className="bg-surface-lowest pl-9"
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
            className={`rounded-full border px-4 py-1.5 
            text-xs font-semibold uppercase tracking-widest 
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
