export interface Ticket {
    id: string;
    subject: string;
    status: "Open" | "Resolved" | "In Review";
    date: string;
}

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
