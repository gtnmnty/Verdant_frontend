export const GALLERY = [
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1599751449128-eb7249c3d6b1?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1400&q=80",
];

export const PRODUCT = {
    category: "Skincare",
    name: "Velvet Renewal Serum",
    subtitle: "Resurfacing concentrate · 30ml",
    description:
        "An overnight resurfacing concentrate infused with rare botanicals " +
        "and a 6% bio-acid complex. Dissolves dullness, refines pores, " +
        "and restores a porcelain-soft finish by morning.",
    price: 185,
    oldPrice: 220,
    inStock: true,
    rating: 4.8,
    reviewsCount: 482,
    highlights: [
        "Vegan & Cruelty-free",
        "Dermatologist Tested",
        "Suitable for Sensitive Skin",
    ],
    ingredients: [
        "6% Bio-Acid Complex (Lactic, Mandelic, PHA)",
        "Cold-pressed Camellia Oil",
        "Centella Asiatica Extract",
        "Hyaluronic Acid Trio",
    ],
    usage: [
        "Apply 3–4 drops to clean, dry skin in the evening.",
        "Avoid the immediate eye area.",
        "Always follow with SPF in the morning.",
    ],
    care: [
        "Store away from direct sunlight.",
        "Replace cap tightly after each use.",
        "Use within 6 months of opening.",
    ],
    shades: ["Original", "Brightening", "Calming"],
    sizes: ["15ml", "30ml", "50ml"],
};

export const RELATED = [
    {
        id: "rp1",
        name: "Silk Lustre Oil",
        price: 95,
        image:
            "https://images.unsplash.com/photo-1599751449128-eb7249c3d6b1?auto=format&fit=crop&w=600&q=80",
    },
    {
        id: "rp2",
        name: "Alpine Clay Mask",
        price: 78,
        image:
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
    },
    {
        id: "rp3",
        name: "Nocturnal Rouge",
        price: 64,
        image:
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80",
    },
    {
        id: "rp4",
        name: "Gilded Glow Balm",
        price: 110,
        image:
            "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80",
    },
];

export const FAQ = [
    {
        q: "Is this suitable for sensitive skin?",
        a: "Yes — formulated with a gentle PHA blend, it's been tested on sensitive skin types.",
    },
    {
        q: "How long until I see results?",
        a: "Most clients notice a brighter, smoother complexion within 2–3 weeks of nightly use.",
    },
    {
        q: "Can I pair this with retinol?",
        a: "Alternate evenings rather than layering on the same night to avoid sensitivity.",
    },
];

export type Review = {
    id: string;
    name: string;
    date: string;
    rating: number;
    text: string;
};

export const INITIAL_REVIEWS: Review[] = [
    {
        id: "rv1",
        name: "Sofia R.",
        date: "Mar 2025",
        rating: 5,
        text: "Skin transformation in two weeks. Worth every penny.",
    },
    {
        id: "rv2",
        name: "Andrea M.",
        date: "Feb 2025",
        rating: 5,
        text: "Glow that lasts. My new holy grail.",
    },
    {
        id: "rv3",
        name: "Camille D.",
        date: "Jan 2025",
        rating: 4,
        text: "Lovely texture, faint scent — a small luxury nightly.",
    },
    {
        id: "rv4",
        name: "Marie L.",
        date: "Dec 2024",
        rating: 5,
        text: "Visibly smoother pores after a month.",
    },
    {
        id: "rv5",
        name: "Elena V.",
        date: "Nov 2024",
        rating: 3,
        text: "Pretty packaging but a bit pricey for the size.",
    },
];
