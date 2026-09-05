import type {Metadata} from "next";
import {ServicesHero} from "@/app/(site)/services/_components/ServicesHero";
import {ServicesExplorer} from "@/app/(site)/services/_components/ServicesExplorer";
import {Header} from "@/components/layout/Header";

export const metadata: Metadata = {
    title: "Signature Services — Verdant Luxe",
    description:
        "Immerse yourself in Verdant Luxe's meticulously crafted treatments — body, skin, and spirit restored.",
    openGraph: {
        title: "Signature Services — Verdant Luxe",
        description:
            "Editorial facials, bond-rebuilding hair rituals, and aromatherapy makeup artistry from master artisans.",
        type: "website",
    },
};

export default function ServicesPage() {
    return (
        <div className="pb-20 w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]">
            <Header/>
            <ServicesHero/>
            <ServicesExplorer/>
        </div>
    );
}
