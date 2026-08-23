"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {toast} from "sonner";
import {
    Bell,
    Heart,
    Menu,
    ShoppingBag,
    User,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
    {label: "Home", href: "/"},
    {label: "About Us", href: "/about"},
    {label: "Services", href: "/services"},
    {label: "Collection", href: "/collections"},
    {label: "Journal", href: "/journal"},
];

const ICON_ACTIONS = [
    {label: "Wishlist", icon: Heart},
    {label: "Cart", icon: ShoppingBag, href: "/cart"},
    {label: "Profile", icon: User, href: "/account"},
];

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const unread = 2;

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener("scroll", onScroll, {passive: true});
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 border-b border-blush/35 
            bg-surface/90 backdrop-blur-md transition-shadow ${
                isScrolled ? "shadow-sm" : ""
            }`}
        >
            <div className="flex h-[clamp(56px,8vw,76px)] w-full items-center
                 justify-between gap-4 px-[5vw] sm:px-[6vw] lg:grid
                 lg:grid-cols-[1fr_auto_1fr] lg:gap-0 lg:px-[10vw]">
                {/* Desktop primary nav */}
                <nav
                    aria-label="Primary"
                    className="hidden items-center gap-[clamp(12px,2vw,32px)] lg:flex"
                >
                    {NAV_LINKS.map((link) =>
                        link.href.startsWith("/") ? (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="whitespace-nowrap text-[clamp(9px,1.1vw,12px)]
                                font-semibold uppercase tracking-[0.14em] text-on-surface-variant
                                transition-colors duration-200 hover:text-primary"
                            >
                                {link.label}
                            </Link>
                        ) : (
                            <a key={link.label} href={link.href}
                               className="whitespace-nowrap text-[clamp(9px,1.1vw,12px)]
                               font-semibold uppercase tracking-[0.14em] text-on-surface-variant
                               transition-colors duration-200 hover:text-primary"
                            >
                                {link.label}
                            </a>
                        ),
                    )}
                </nav>

                {/* Wordmark */}
                <Link
                    href="/"
                    aria-label="Verdant Luxe home"
                    className="min-w-0 truncate font-display
                    text-[clamp(16px,3vw,30px)] leading-none
                    tracking-tight text-primary
                    lg:justify-self-center"
                >
                    Verdant Luxe
                </Link>

                {/* Desktop icon toolbar */}
                <div
                    role="toolbar"
                    aria-label="Actions"
                    className="hidden items-center justify-end gap-[clamp(10px,1.6vw,22px)] lg:flex"
                >
                    {ICON_ACTIONS.map(({label, icon: Icon, href}) =>
                        href ? (
                            <Link
                                key={label}
                                href={href}
                                aria-label={label}
                                className="flex h-[clamp(28px,3vw,36px)] w-[clamp(28px,3vw,36px)]
                                items-center justify-center text-primary opacity-75
                                transition-opacity duration-200 hover:opacity-100"
                            >
                                <Icon className="h-[clamp(16px,1.8vw,20px)] w-[clamp(16px,1.8vw,20px)]"/>
                            </Link>
                        ) : (
                            <button
                                key={label}
                                onClick={() => toast.success("Saved to your wishlist.")}
                                aria-label={label}
                                className="flex h-[clamp(28px,3vw,36px)] w-[clamp(28px,3vw,36px)]
                                items-center justify-center text-primary opacity-75 transition-opacity
                                duration-200 hover:opacity-100"
                            >
                                <Icon className="h-[clamp(16px,1.8vw,20px)] w-[clamp(16px,1.8vw,20px)]"/>
                            </button>
                        ),
                    )}

                    <Link
                        href="/notifications"
                        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
                        className="relative flex h-[clamp(28px,3vw,36px)] w-[clamp(28px,3vw,36px)]
                        items-center justify-center text-primary opacity-75 transition-opacity
                        duration-200 hover:opacity-100"
                    >
                        <Bell className="h-[clamp(16px,1.8vw,20px)] w-[clamp(16px,1.8vw,20px)]"/>
                        {unread > 0 ? (
                            <span className="absolute -right-1 -top-1 grid h-4 min-w-4
                                  place-items-center rounded-full bg-soft-rose px-1 text-[10px]
                                  font-semibold leading-none text-white">
                                {unread > 9 ? "9+" : unread}
                            </span>
                        ) : null}
                    </Link>
                </div>

                {/* Mobile / collapsed: hamburger toggle -> shadcn Sheet */}
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                    <SheetTrigger asChild>
                        <button
                            type="button"
                            aria-label="Open menu"
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center
                            text-primary transition-opacity duration-200 hover:opacity-70 lg:hidden"
                        >
                            <Menu className="h-5 w-5"/>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[85vw] max-w-sm">
                        <SheetHeader>
                            <SheetTitle>Verdant Luxe</SheetTitle>
                        </SheetHeader>
                        <nav aria-label="Mobile" className="flex flex-col px-4">
                            {NAV_LINKS.map((link) =>
                                link.href.startsWith("/") ? (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="border-b border-blush/20 py-4 text-sm font-semibold
                                        uppercase tracking-[0.14em] text-on-surface-variant transition-colors
                                        duration-200 hover:text-primary"
                                    >
                                        {link.label}
                                    </Link>
                                ) : (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="border-b border-blush/20 py-4 text-sm font-semibold uppercase
                                        tracking-[0.14em] text-on-surface-variant transition-colors duration-200
                                        hover:text-primary"
                                    >
                                        {link.label}
                                    </a>
                                ),
                            )}
                            {ICON_ACTIONS.map(({label, icon: Icon, href}) =>
                                href ? (
                                    <Link
                                        key={label}
                                        href={href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 border-b border-blush/20
                                        py-4 text-sm font-semibold uppercase tracking-[0.14em]
                                        text-on-surface-variant transition-colors duration-200
                                        last:border-b-0 hover:text-primary"
                                    >
                                        <Icon className="h-4 w-4 flex-shrink-0"/>
                                        {label}
                                    </Link>
                                ) : (
                                    <button
                                        key={label}
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            toast.success("Saved to your wishlist.");
                                        }}
                                        className="flex items-center gap-3 border-b
                                        border-blush/20 py-4 text-sm font-semibold uppercase tracking-[0.14em]
                                        text-on-surface-variant transition-colors duration-200 last:border-b-0
                                        hover:text-primary"
                                    >
                                        <Icon className="h-4 w-4 flex-shrink-0"/>
                                        {label}
                                    </button>
                                ),
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
