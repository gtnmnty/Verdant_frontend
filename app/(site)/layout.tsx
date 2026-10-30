import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";

export default function SiteLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 scroll-smooth overflow-x-hidden">
            <Header />
            {/* Horizontal padding lives in each page's wrapper, so it isn't applied twice. */}
            <main className="w-full pt-[clamp(56px,8vw,76px)]">
                {children}
            </main>
        </div>
    );
}