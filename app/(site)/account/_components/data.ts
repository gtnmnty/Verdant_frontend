export interface GiftCard {
    id: string;
    code: string;
    balance: number;
    expires: string;
}

export interface TxRow {
    id: string;
    date: string;
    description: string;
    amount: number;
}

export const INITIAL_GIFT_CARDS: GiftCard[] = [
    {id: "g1", code: "VLX-7782-AURA", balance: 250, expires: "Dec 2027"},
    {id: "g2", code: "VLX-3391-BLOOM", balance: 80, expires: "Jun 2027"},
];

export const INITIAL_TX: TxRow[] = [
    {id: "t1", date: "Oct 22, 2026", description: "Redeemed on Order #VL-91022", amount: -45},
    {id: "t2", date: "Sep 02, 2026", description: "Top-up — Birthday Bonus", amount: 100},
    {id: "t3", date: "Aug 14, 2026", description: "Gift from Camille R.", amount: 150},
];

export type FavKind = "Service" | "Product";

export interface Fav {
    id: string;
    name: string;
    kind: FavKind;
    price: number;
    image: string;
    category: string;
}

export const MOCK_FAVS: Fav[] = [
    {
        id: "f1",
        name: "Signature Balayage",
        kind: "Service",
        price: 320,
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
        category: "Hair"
    },
    {
        id: "f2",
        name: "Luxe Hydration Facial",
        kind: "Service",
        price: 180,
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
        category: "Skincare"
    },
    {
        id: "f3",
        name: "Rose Gold Serum",
        kind: "Product",
        price: 145,
        image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
        category: "Skincare"
    },
    {
        id: "f4",
        name: "Repair & Restore Shampoo",
        kind: "Product",
        price: 68,
        image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&q=80",
        category: "Hair"
    },
    {
        id: "f5",
        name: "Velvet Lip Trio",
        kind: "Product",
        price: 95,
        image: "https://images.unsplash.com/photo-1631214540242-3cd8c4b0a0c4?w=600&q=80",
        category: "Makeup"
    },
];

export interface Ticket {
    id: string;
    subject: string;
    status: "Open" | "Resolved" | "In Review";
    date: string;
}

export const INITIAL_TICKETS: Ticket[] = [
    {id: "T-2104", subject: "Allergy disclosure update", status: "Open", date: "Oct 18, 2026"},
    {id: "T-2089", subject: "Loyalty points missing", status: "Resolved", date: "Sept 24, 2026"},
    {id: "T-2071", subject: "Late delivery #VL-89542", status: "In Review", date: "Aug 12, 2026"},
];

export const FAQS = [
    {
        q: "How do I reschedule an appointment?",
        a: "Visit My Appointments and select Reschedule on " +
            "any upcoming booking. Changes are free up to " +
            "24 hours before your visit."
    },
    {
        q: "What is your return policy?",
        a: "Unopened products may be returned within 30 " +
            "days for a full refund. Bespoke and custom " +
            "items are final sale."
    },
    {
        q: "Do you offer home services?",
        a: "Yes — our Home Atelier brings select rituals " +
            "to your door within central districts. " +
            "Choose Home Service when booking."
    },
    {
        q: "How do gift cards work?",
        a: "Gift cards are delivered instantly via email and " +
            "can be redeemed in salon, online, " +
            "or applied at checkout."
    },
    {
        q: "How can I join Verdant Privé?",
        a: "Membership is invitation-based once you reach 500 " +
            "loyalty points. Track your status from your Profile."
    },
];

export function ticketTone(s: Ticket["status"]) {
    if (s === "Resolved") return "border-emerald-300 text-emerald-700";
    if (s === "In Review") return "border-amber-300 text-amber-700";
    return "border-blush/60 text-primary";
}
