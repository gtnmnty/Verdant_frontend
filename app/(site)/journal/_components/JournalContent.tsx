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
import { gqlRequest } from "@/utils/graphqlClient";

// GraphQL mutation to add an item to the authenticated user's cart in the database
const ADD_TO_CART_MUTATION = `
    mutation JournalAddToCart($input: AddToCartInput!) {
        addToCart(input: $input) {
            totalItems
        }
    }
`;

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

    // Flow: Call the backend GraphQL mutation to persist the selected product into the user's cart
    async function handleAddProduct(productId: string, productName: string) {
        try {
            await gqlRequest(ADD_TO_CART_MUTATION, {
                input: {
                    productId,
                    quantity: 1,
                    deliveryOption: "STANDARD",
                },
            });
            toast.success(`${productName} added to your bag.`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to add product to cart.");
        }
    }

    // Flow: Concurrently add each product in the curated routine to the backend cart
    async function handleAddRoutine(story: JournalStory) {
        try {
            await Promise.all(
                story.products.map((product) =>
                    gqlRequest(ADD_TO_CART_MUTATION, {
                        input: {
                            productId: product.id,
                            quantity: 1,
                            deliveryOption: "STANDARD",
                        },
                    })
                )
            );
            toast.success(`${story.clientName}'s routine added to your bag.`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to add routine to cart.");
        }
    }

    return (
        // w-full, not a vw width: the page wrapper already pads, so 92vw would overflow it.
        <div className="mx-auto w-full max-w-[1400px] pt-[clamp(1.5rem,4vw,3rem)]
        pb-[clamp(3rem,8vw,6rem)]">
            <div className="max-w-[clamp(20rem,50vw,42rem)]">
                <p className="text-fluid-2xs font-semibold
                uppercase tracking-[0.28em] text-soft-rose">
                    The Verdant Luxe Journal
                </p>
                <h1 className="mt-[0.25em] font-display
                text-[clamp(2rem,calc(1.25rem+3vw),3.75rem)]
                leading-tight text-primary">
                    Client Stories
                </h1>
                <p className="mt-[0.75em] text-fluid-base
                text-on-surface-variant">
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
                <div className="mt-[clamp(1.5rem,4vw,2.5rem)]">
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
