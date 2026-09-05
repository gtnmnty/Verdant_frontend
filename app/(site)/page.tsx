import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { AtmosphereSection } from "@/app/(site)/_components/AtmosphereSection";
import HeroSection from "@/app/(site)/_components/HeroSection";
import ServicesSection from "@/app/(site)/_components/ServiceSection";
import CollectionSection from "@/app/(site)/_components/CollectionSection";
import PhilosophySection from "@/app/(site)/_components/PhilosophySection";
import PromoBanner from "@/app/(site)/_components/PromoBanner";
import { Footer } from "@/components/layout/Footer";

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

export default function HomePage() {
    return (
        <div
            className={
                "min-h-screen bg-stone-50 text-stone-800 " +
                "scroll-smooth overflow-x-hidden"
            }
        >
            <Header />
            <main
                className={
                    "w-full px-[clamp(12px,5vw,10vw)] " +
                    "sm:px-[6vw] lg:px-[10vw] " +
                    "pt-[clamp(56px,8vw,76px)]"
                }
            >
                <HeroSection />
                <ServicesSection />
                <CollectionSection />
                <AtmosphereSection />
                <PhilosophySection />
                <PromoBanner />
                <Footer />
            </main>
        </div>
    );
}
