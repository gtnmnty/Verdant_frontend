"use client";

import {useState} from "react";
import {SideNav} from "@/app/(site)/account/_components/SideNav";
import {ProfileSection} from "@/app/(site)/account/_components/ProfileSection";
import {GiftCardsSection} from "@/app/(site)/account/_components/GiftCardsSection";
import {FavouritesSection} from "@/app/(site)/account/_components/FavouritesSection";
import {SupportSection} from "@/app/(site)/account/_components/SupportSection";

export type SectionId = "profile" | "gift-cards" | "favourites" | "support";

export function AccountContent() {
    const [section, setSection] = useState<SectionId>("profile");

    return (
        <div className="mx-auto w-[min(90vw,1400px)] pb-16">
            <header className="mb-8 text-center md:text-left">
                <p className="text-[10px] font-semibold uppercase
                 tracking-[0.22em] text-soft-rose">
                    Personal Space
                </p>
                <h1 className="mt-2 font-display
                 text-[clamp(2rem,4.5vw,3.25rem)]
                 leading-tight tracking-tight text-primary">
                    Welcome, Elena
                </h1>
            </header>

            <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
                <SideNav active={section} onChange={setSection}/>
                <div className="min-w-0">
                    {section === "profile" && <ProfileSection/>}
                    {section === "gift-cards" && <GiftCardsSection/>}
                    {section === "favourites" && <FavouritesSection/>}
                    {section === "support" && <SupportSection/>}
                </div>
            </div>
        </div>
    );
}
