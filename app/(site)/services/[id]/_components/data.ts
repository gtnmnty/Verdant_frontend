// The backend has no public "branches" listing endpoint (only adminBranches,
// which is role-gated), so branch selection in the booking form stays
// hardcoded for now until that endpoint exists.
export const BRANCHES = [
    "Verdant Luxe — Mayfair",
    "Verdant Luxe — Marais",
    "Verdant Luxe — SoHo",
];

export const TIME_SLOTS = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"];

// No backend model for FAQ content — kept static.
export const FAQ = [
    {
        q: "How early should I arrive?",
        a: "Please arrive 10 minutes before your appointment to enjoy a complimentary refreshment.",
    },
    {
        q: "Can I reschedule my booking?",
        a: "Yes — reschedule up to 24 hours in advance at no charge via your account dashboard.",
    },
    {
        q: "Do you offer touch-ups?",
        a: "We include a complimentary 7-day touch-up window for any concerns after your service.",
    },
];