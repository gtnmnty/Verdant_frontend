import type { Metadata } from "next";
import { AtmosphereSection } from "@/app/(site)/_components/AtmosphereSection";
import HeroSection from "@/app/(site)/_components/HeroSection";
import ServicesSection from "@/app/(site)/_components/ServiceSection";
import CollectionSection from "@/app/(site)/_components/CollectionSection";
import PhilosophySection from "@/app/(site)/_components/PhilosophySection";
import PromoBanner from "@/app/(site)/_components/PromoBanner";
import { Footer } from "@/components/layout/Footer";
import { PAGE_GUTTER } from "@/utils/pageGutter";

export const metadata: Metadata = {
    title: "Verdant — Hair Is Our Craft",
    description:
        `Verdant is a boutique salon offering expert hair styling, 
         spa treatments, and professional coloring crafted by master stylists.`,
    openGraph: {
        title: "Verdant — Hair Is Our Craft",
        description:
            "Boutique hair styling, spa treatments and luxe products. " +
            "Book your experience at Verdant.",
    },
};

// Header, background and top offset come from the (site) layout.
// Hero and footer sit outside the gutter so their backgrounds run edge to edge.
export default function HomePage() {
    return (
        <>
            <HeroSection />
            <div className={`w-full ${PAGE_GUTTER}`}>
                <ServicesSection />
                <CollectionSection />
                <AtmosphereSection />
                <PhilosophySection />
                <PromoBanner />
            </div>
            <Footer />
        </>
    );
}
