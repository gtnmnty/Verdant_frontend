import type {Metadata} from "next";
import {HelpHero} from "@/app/(site)/help-support/_components/HelpHero";
import {TopicSearch} from "@/app/(site)/help-support/_components/TopicSearch";
import {ConciergeChannels} from "@/app/(site)/help-support/_components/ConciergeChannels";
import {StayInspired} from "@/app/(site)/help-support/_components/StayInspired";

export const metadata: Metadata = {
    title: "Concierge Help & Support — Verdant Luxe",
    description:
        "Find answers on bookings, memberships, " +
        "product care and gift cards, or reach the " +
        "Verdant Luxe concierge by email, phone or " +
        "live chat.",
    openGraph: {
        title: "Concierge Help & Support — Verdant Luxe",
        description:
            "How may we assist your journey? Browse support " +
            "topics or speak with the Verdant Luxe concierge team.",
        type: "website",
        images: [
            "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1400&q=80",
        ],
    },
    twitter: {
        card: "summary_large_image",
        images: [
            "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1400&q=80",
        ],
    },
};

export default function HelpSupportPage() {
    return (
        <div className="pb-[clamp(2rem,5vw,4rem)] w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]">
            <HelpHero/>
            <TopicSearch/>
            <ConciergeChannels/>
            <StayInspired/>
        </div>
    );
}
