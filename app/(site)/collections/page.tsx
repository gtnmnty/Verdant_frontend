import type {Metadata} from "next";
import {CollectionsHero} from "@/app/(site)/collections/_components/CollectionsHero";
import {CollectionsExplorer} from "@/app/(site)/collections/_components/CollectionsExplorer";

export const metadata: Metadata = {
    title: "Signature Collections — Verdant Luxe",
    description:
        "Discover Verdant Luxe's curated edit of " +
        "luxury skincare, haircare, makeup, and " +
        "fragrance essentials.",
    openGraph: {
        title: "Signature Collections — Verdant Luxe",
        description:
            "A meticulously sourced range of luxury " +
            "essentials designed to elevate " +
            "your daily ritual.",
        type: "website",
    },
};

export default function CollectionsPage() {
    return (
        <div className="pb-20 w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]">
            <CollectionsHero/>
            <CollectionsExplorer/>
        </div>
    );
}
