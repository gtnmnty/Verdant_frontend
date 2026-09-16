import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
    title: "Verdant Luxe",
    description: "Verdant Luxe salon and retail experience.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" className="h-full antialiased">
            <body className="min-h-screen overflow-x-hidden bg-background font-sans text-on-surface antialiased">
                <main>
                    <Providers>{children}</Providers>
                </main>
            </body>
        </html>
    );
}
