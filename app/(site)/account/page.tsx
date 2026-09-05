import type {Metadata} from "next";
import {AccountContent} from "@/app/(site)/account/_components/AccountContent";

export const metadata: Metadata = {
    title: "My Account — Verdant Luxe",
    description:
        "Manage your Verdant Luxe profile, " +
        "gift cards, favourites, and support tickets.",
    openGraph: {
        title: "My Account — Verdant Luxe",
        description: "Your personal space at Verdant Luxe.",
    },
};

export default function AccountPage() {
    return <div className="w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]"><AccountContent/></div>;
}
