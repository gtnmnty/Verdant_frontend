import type {Metadata} from "next";
import {AboutHero} from "@/app/about/_components/AboutHero";
import {PhilosophySection} from "@/app/about/_components/PhilosophySection";
import {HeritageSection} from "@/app/about/_components/HeritageSection";
import {TeamSection} from "@/app/about/_components/TeamSection";
import {AboutCta} from "@/app/about/_components/AboutCta";

export const metadata: Metadata = {
    title: "Our Story — Verdant Luxe Atelier",
    description:
        `Established 2012. Discover the heritage, 
     philosophy and master stylists behind Verdant Luxe 
     — where high-fashion editorial craft meets the intimacy of personal care.`,
    openGraph: {
        title: "Our Story — Verdant Luxe Atelier",
        description:
            "A decade of refinement, one client at a time. Meet the visionaries behind the Verdant Luxe atelier.",
        type: "website",
        images: [
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80",
        ],
    },
    twitter: {
        card: "summary_large_image",
        images: [
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1920&q=80",
        ],
    },
};

export default function AboutPage() {
    return (
        <>
            <AboutHero/>
            <PhilosophySection/>
            <HeritageSection/>
            <TeamSection/>
            <AboutCta/>
        </>
    );
}
