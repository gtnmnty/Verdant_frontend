export type Category = "Skincare" | "Haircare" | "Makeup";

export type Service = {
    id: string;
    name: string;
    subtitle: string;
    description: string;
    category: Category;
    durationMin: number;
    price: number;
    popular: number; // 1 = most popular
    image: string;
};

export const CATEGORIES: Category[] = ["Skincare", "Haircare", "Makeup"];

// Kept only as a fallback/reference for the Service shape.
// ServicesExplorer now fetches real data from the backend.
export const SERVICES: Service[] = [
    {
        id: "s1",
        name: "Velvet Renewal Facial",
        subtitle: "Deep Hydration & Resurfacing",
        description:
            "A luxurious resurfacing ritual that melts away dullness, " +
            "floods skin with concentrated moisture, " +
            "and restores a luminous, porcelain-soft finish.",
        category: "Skincare",
        durationMin: 60,
        price: 185,
        popular: 4,
        image:
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "s2",
        name: "Silk Lustre Treatment",
        subtitle: "Bond Repair & Gloss",
        description:
            "An intensive bond-rebuilding ceremony featuring " +
            "rare botanical oils, leaving each strand " +
            "mirror-smooth and radiant with healthy brilliance.",
        category: "Haircare",
        durationMin: 75,
        price: 220,
        popular: 2,
        image:
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "s3",
        name: "Nocturnal Rouge Artistry",
        subtitle: "Editorial Makeup & Finishing",
        description:
            "A full editorial makeup session sculpted to your " +
            "features — from dewy natural to haute couture " +
            "drama — by our master colour artists.",
        category: "Makeup",
        durationMin: 90,
        price: 165,
        popular: 3,
        image:
            "https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "s4",
        name: "Alpine Clay Ritual",
        subtitle: "Purifying & Pore Refinement",
        description:
            "Mineral-rich Swiss alpine clay draws out impurities " +
            "while bamboo charcoal refines enlarged pores, " +
            "revealing visibly clearer, more even skin.",
        category: "Skincare",
        durationMin: 45,
        price: 120,
        popular: 5,
        image:
            "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "s5",
        name: "Sculpting Blowout",
        subtitle: "Volume, Shape & Shine",
        description:
            "Precision heat styling elevated to its finest — " +
            "your hair sculpted and set with volumising techniques " +
            "and high-gloss finishing sprays that last for days.",
        category: "Haircare",
        durationMin: 60,
        price: 140,
        popular: 6,
        image:
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "s6",
        name: "Gilded Glow Makeup",
        subtitle: "Bridal & Special Occasion",
        description:
            "A long-wear bridal-grade application using champagne " +
            "pigments and skin-perfecting bases — engineered to " +
            "photograph beautifully under any light.",
        category: "Makeup",
        durationMin: 75,
        price: 195,
        popular: 1,
        image:
            "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&w=900&q=80",
    },
];