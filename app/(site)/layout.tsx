import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";

export default function SiteLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-stone-50 text-stone-800 scroll-smooth overflow-x-hidden">
            <Header />
            <main className="w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-0 pt-[clamp(56px,8vw,76px)]">
                {children}
            </main>
        </div>
    );
}