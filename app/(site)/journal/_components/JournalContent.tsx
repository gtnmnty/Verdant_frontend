"use client";

import {useEffect, useMemo, useState} from "react";
import {toast} from "sonner";
import {JournalFilters} from "@/app/(site)/journal/_components/JournalFilters";
import {JournalMasonryGrid} from "@/app/(site)/journal/_components/JournalMasonryGrid";
import {JournalStoryDialog} from "@/app/(site)/journal/_components/JournalStoryDialog";
import {JournalEmptyState} from "@/app/(site)/journal/_components/JournalEmptyState";
import {JournalLoadingState} from "@/app/(site)/journal/_components/JournalLoadingState";
import {
    JOURNAL_CATEGORIES,
    JOURNAL_STORIES,
    type JournalStory,
} from "@/app/(site)/journal/_components/data";
import {addManyToCart, addToCart} from "@/lib/cart-store";

export function JournalContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeStory, setActiveStory] = useState<JournalStory | null>(null);

    // Simulates the initial fetch from a backend so the loading state is
    // exercised; replace with real fetch/query state once an API exists.
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const filteredStories = useMemo(() => {
        const query = search.trim().toLowerCase();
        return JOURNAL_STORIES.filter((story) => {
            const matchesCategory = activeCategory === "All" || story.category === activeCategory;
            if (!matchesCategory) return false;
            if (!query) return true;
            const haystack = [
                story.clientName,
                story.service,
                story.stylist,
                ...story.products.map((product) => product.name),
            ]
                .join(" ")
                .toLowerCase();
            return haystack.includes(query);
        });
    }, [search, activeCategory]);

    function handleAddProduct(productId: string, productName: string) {
        addToCart(productId, 1);
        toast.success(`${productName} added to your bag.`);
    }

    function handleAddRoutine(story: JournalStory) {
        addManyToCart(story.products.map((product) => product.id));
        toast.success(`${story.clientName}'s routine added to your bag.`);
    }

    return (
        <div className="mx-auto w-[min(92vw,1400px)] pb-24">
            <div className="max-w-2xl">
                <p className="text-[10px] font-semibold
                uppercase tracking-[0.28em] text-soft-rose">
                    The Verdant Luxe Journal
                </p>
                <h1 className="mt-2 font-display
                text-[clamp(2rem,5vw,3.25rem)]
                leading-tight text-primary">
                    Client Stories
                </h1>
                <p className="mt-3 text-sm
                text-on-surface-variant sm:text-base">
                    Real rituals, real results — a look inside the transformations
                    our stylists craft every day.
                </p>
            </div>

            <JournalFilters
                search={search}
                onSearchChange={setSearch}
                categories={JOURNAL_CATEGORIES}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />

            {isLoading ? (
                <JournalLoadingState/>
            ) : filteredStories.length === 0 ? (
                <div className="mt-10">
                    <JournalEmptyState/>
                </div>
            ) : (
                <JournalMasonryGrid stories={filteredStories} onOpen={setActiveStory}/>
            )}

            <JournalStoryDialog
                story={activeStory}
                onOpenChange={(open) => !open && setActiveStory(null)}
                onAddProduct={handleAddProduct}
                onAddRoutine={handleAddRoutine}
            />
        </div>
    );
}
