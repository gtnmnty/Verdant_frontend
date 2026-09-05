export interface JournalProduct {
    id: string;
    name: string;
    price: number;
    image: string;
}

export type JournalCategory =
    | "Color"
    | "Cut & Style"
    | "Spa & Skin"
    | "Bridal"
    | "Texture";

export interface JournalStory {
    id: string;
    clientName: string;
    quote: string;
    resultImage: string;
    resultImageWidth: number;
    resultImageHeight: number;
    productImage: string;
    service: string;
    category: JournalCategory;
    stylist: string;
    products: JournalProduct[];
}

// TODO: replace with a fetch to a real backend once journal/client-story
// endpoints exist. Image URLs are placeholders — swap for real asset URLs
// when available. Product ids that match items in cart/_components/data.ts
// (e.g. "silk-elixir-restorative-oil") resolve to the same catalog entry
// once a shared product source exists.
//
// Result image heights are deliberately varied (rather than one fixed
// aspect ratio) so the masonry grid on the Journal page reads like a
// genuine Pinterest board instead of a uniform tile grid.

export const JOURNAL_STORIES: JournalStory[] = [
    {
        id: "sophia-botanical-gloss",
        clientName: "Sophia M.",
        quote:
            "The botanical color treatment saved my hair after months of damage.",
        resultImage: "https://picsum.photos/seed/journal-sophia-result/900/1300",
        resultImageWidth: 900,
        resultImageHeight: 1300,
        productImage: "https://picsum.photos/seed/journal-sophia-products/700/700",
        service: "Signature Botanical Gloss & Cut",
        category: "Color",
        stylist: "Elena Rose",
        products: [
            {
                id: "nourishing-oil",
                name: "Nourishing Oil",
                price: 68,
                image: "https://picsum.photos/seed/nourishing-oil/200/200",
            },
            {
                id: "hydrating-mask",
                name: "Hydrating Mask",
                price: 54,
                image: "https://picsum.photos/seed/hydrating-mask/200/200",
            },
        ],
    },
    {
        id: "amara-texture-reset",
        clientName: "Amara K.",
        quote:
            "My curls finally have definition without the frizz — it's a whole new routine.",
        resultImage: "https://picsum.photos/seed/journal-amara-result/900/950",
        resultImageWidth: 900,
        resultImageHeight: 950,
        productImage: "https://picsum.photos/seed/journal-amara-products/700/700",
        service: "Curl Definition Ritual",
        category: "Texture",
        stylist: "Marcus Chen",
        products: [
            {
                id: "curl-cream",
                name: "Curl Defining Cream",
                price: 42,
                image: "https://picsum.photos/seed/curl-cream/200/200",
            },
            {
                id: "silk-elixir-restorative-oil",
                name: "Silk Elixir Restorative Oil",
                price: 82,
                image: "https://picsum.photos/seed/silk-elixir/200/200",
            },
        ],
    },
    {
        id: "priya-bridal-glow",
        clientName: "Priya N.",
        quote:
            "Everything from the trial to the final look felt effortless and calm.",
        resultImage: "https://picsum.photos/seed/journal-priya-result/900/1150",
        resultImageWidth: 900,
        resultImageHeight: 1150,
        productImage: "https://picsum.photos/seed/journal-priya-products/700/700",
        service: "Bridal Vision Styling",
        category: "Bridal",
        stylist: "Elena Rose",
        products: [
            {
                id: "pearl-hairpins",
                name: "Pearl Hairpin Set",
                price: 36,
                image: "https://picsum.photos/seed/pearl-hairpins/200/200",
            },
            {
                id: "setting-mist",
                name: "All-Night Setting Mist",
                price: 29,
                image: "https://picsum.photos/seed/setting-mist/200/200",
            },
        ],
    },
    {
        id: "noor-facial-renewal",
        clientName: "Noor A.",
        quote:
            "My skin has never felt this calm — the facial was worth every minute.",
        resultImage: "https://picsum.photos/seed/journal-noor-result/900/1400",
        resultImageWidth: 900,
        resultImageHeight: 1400,
        productImage: "https://picsum.photos/seed/journal-noor-products/700/700",
        service: "Botanical Renewal Facial",
        category: "Spa & Skin",
        stylist: "Wren Ashby",
        products: [
            {
                id: "hydrating-clay-mask",
                name: "Hydrating Clay Mask",
                price: 58,
                image: "https://picsum.photos/seed/clay-mask/200/200",
            },
            {
                id: "rosewater-toner",
                name: "Rosewater Toner",
                price: 32,
                image: "https://picsum.photos/seed/rosewater-toner/200/200",
            },
        ],
    },
    {
        id: "leah-precision-cut",
        clientName: "Leah T.",
        quote:
            "The cut is so precise it barely needs any styling in the morning.",
        resultImage: "https://picsum.photos/seed/journal-leah-result/900/1000",
        resultImageWidth: 900,
        resultImageHeight: 1000,
        productImage: "https://picsum.photos/seed/journal-leah-products/700/700",
        service: "Architectural Bob & Gloss",
        category: "Cut & Style",
        stylist: "Marcus Chen",
        products: [
            {
                id: "ceramic-sculpt-styler",
                name: "Ceramic Sculpt Styler",
                price: 245,
                image: "https://picsum.photos/seed/ceramic-sculpt/200/200",
            },
            {
                id: "shine-serum",
                name: "Weightless Shine Serum",
                price: 46,
                image: "https://picsum.photos/seed/shine-serum/200/200",
            },
        ],
    },
];

export const JOURNAL_CATEGORIES = [
    "Color",
    "Cut & Style",
    "Spa & Skin",
    "Bridal",
    "Texture",
] as const;
