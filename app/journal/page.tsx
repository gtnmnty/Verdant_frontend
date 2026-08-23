import type {Metadata} from "next";
import {JournalContent} from "@/app/journal/_components/JournalContent";

export const metadata: Metadata = {
    title: "The Journal — Verdant Luxe",
    description:
        "Real rituals, real results — a look " +
        "inside the client transformations " +
        "our stylists craft every day.",
    openGraph: {
        title: "The Journal — Verdant Luxe",
        description: "Client stories from the " +
                     "Verdant Luxe atelier.",
    },
};

export default function JournalPage() {
    return <JournalContent/>;
}
