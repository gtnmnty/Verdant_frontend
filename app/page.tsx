import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import HeroSection from "@/app/_components/HeroSection";
import ServicesSection from "@/app/_components/ServiceSection";
import CollectionSection from "@/app/_components/CollectionSection";
import PhilosophySection from "@/app/_components/PhilosophySection";
// import AtmosphereSection from "@/app/_components/AtmosphereSection";
import PromoBanner from "@/app/_components/PromoBanner";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Parfois — Hair Is Our Craft",
  description:
    "Parfois is a boutique salon offering expert hair styling, spa treatments, and professional coloring crafted by master stylists.",
  openGraph: {
    title: "Parfois — Hair Is Our Craft",
    description:
      "Boutique hair styling, spa treatments and luxe products. Book your experience at Parfois.",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 scroll-smooth overflow-x-hidden">
      <Header />
      <main className="w-full px-[10vw] pt-[clamp(56px,8vw,76px)]">
        <HeroSection />
        <ServicesSection />
        <CollectionSection />
        <PhilosophySection />
        {/*<AtmosphereSection />*/}
        <PromoBanner />
        <Footer/>
      </main>
    </div>
  );
}
