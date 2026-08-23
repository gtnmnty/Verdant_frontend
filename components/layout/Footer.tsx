"use client";

import {useEffect, useState, type SubmitEvent, type ReactNode} from "react";
import Link from "next/link";
import {toast} from "sonner";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import {ArrowUp, Mail, MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

type LinkItem = { label: string; href?: string };

const QUICK_LINKS: LinkItem[] = [
    {label: "Home", href: "/"},
    {label: "About Us", href: "/about"},
    {label: "Services", href: "/services"},
    {label: "Collection", href: "/collections"},
    {label: "Journal", href: "/journal"},
    {label: "Reviews", href: "#"},
    {label: "Contact Us", href: "#"},
];

const CUSTOMER_LINKS: LinkItem[] = [
    {label: "Personal Space", href: "/account"},
    {label: "Appointments", href: "/appointments"},
    {label: "Orders", href: "/orders"},
    {label: "Wishlist", href: "#"},
    {label: "Cart", href: "/cart"},
    {label: "Gift Cards", href: "#"},
    {label: "Support & FAQ", href: "/help-support"},
];

const LEGAL_LINKS = [
    "Privacy Policy",
    "Terms of Service",
    "Accessibility",
    "Cookies Policy",
] as const;

export function Footer() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 400);
        onScroll();
        window.addEventListener("scroll", onScroll, {passive: true});
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const onSubscribe = (e: SubmitEvent) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            toast.error("Please enter a valid email.");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setEmail("");
            toast.success("Welcome to the inner circle.");
        }, 700);
    };

    return (
        <footer className="mt-24 border-t border-blush/40 bg-surface-low text-on-surface">
            <div className="mx-auto w-[min(90vw,1400px)] py-[clamp(2.5rem,5vw,4rem)]">
                {/* Top: brand -> divider -> socials -> newsletter */}
                <div className="flex flex-col items-center text-center">
                    <Link
                        href="/"
                        className="font-display text-[clamp(1.75rem,4vw,3rem)]
                        leading-none tracking-[0.22em] text-primary"
                    >
                        VERDANT&nbsp;LUXE
                    </Link>
                    <div className="mt-5 flex items-center gap-4">
                        <span className="h-px w-12 bg-champagne-gold/70"/>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-champagne-gold">
              Salon &amp; Studio
            </span>
                        <span className="h-px w-12 bg-champagne-gold/70"/>
                    </div>

                    <div className="mt-6 flex gap-3">
                        {[FaInstagram, FaFacebook, FaYoutube, FaTwitter].map((Icon, i) => (
                            <a
                                key={i}
                                href="#"
                                aria-label="Social"
                                className="grid h-10 w-10 place-items-center rounded-full
                                border border-blush/60 text-primary transition-colors hover:bg-primary
                                hover:text-primary-foreground"
                            >
                                <Icon className="h-4 w-4"/>
                            </a>
                        ))}
                    </div>

                    <form onSubmit={onSubscribe} className="mt-8 w-full max-w-md px-4 sm:px-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-soft-rose">
                            Stay Updated
                        </p>
                        <p className="mt-2 text-sm text-on-surface-variant">
                            Private invitations, seasonal rituals, and quiet luxuries.
                        </p>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <label htmlFor="footer-email" className="sr-only">
                                Email
                            </label>
                            <Input
                                id="footer-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="min-w-0 flex-1 bg-surface-lowest"
                            />
                            <Button type="submit" disabled={loading} className="uppercase text-xs">
                                {loading ? "Sending…" : "Subscribe"}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="my-[clamp(2rem,4vw,3rem)] h-px bg-blush/40"/>

                {/* Bottom: three responsive columns */}
                <div className="grid gap-10 px-4 text-center sm:px-0 sm:grid-cols-2 sm:text-left md:grid-cols-3">
                    <FooterColumn title="Quick Links">
                        {QUICK_LINKS.map((l) => (
                            <FooterLink key={l.label} item={l}/>
                        ))}
                    </FooterColumn>
                    <FooterColumn title="Customer Area">
                        {CUSTOMER_LINKS.map((l) => (
                            <FooterLink key={l.label} item={l}/>
                        ))}
                    </FooterColumn>
                    <div className="min-w-0 sm:col-span-2 md:col-span-1">
                        <h4 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-soft-rose">
                            Contact &amp; Support
                        </h4>
                        <ul className="mt-5 space-y-3 text-sm text-on-surface-variant">
                            <li className="flex items-start justify-center gap-2 sm:justify-start">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-champagne-gold"/>
                                <span>35G Liberty Ave, Quezon City</span>
                            </li>
                            <li className="flex items-start justify-center gap-2 sm:justify-start">
                                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-champagne-gold"/>
                                <span>concierge@verdantluxe.com</span>
                            </li>
                            <li className="flex items-start justify-center gap-2 sm:justify-start">
                                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-champagne-gold"/>
                                <span>+1 (555) 000 0000</span>
                            </li>
                            <li className="flex items-start justify-center gap-2 sm:justify-start">
                                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-champagne-gold"/>
                                <span>Mon–Sat · 9:00 AM – 6:00 PM EST</span>
                            </li>
                        </ul>
                        <ul className="mt-5 space-y-2 text-xs">
                            <li>
                                <a href="#" className="text-on-surface-variant hover:text-primary">
                                    Shipping &amp; Delivery
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-on-surface-variant hover:text-primary">
                                    Returns &amp; Refunds
                                </a>
                            </li>
                            <li>
                                <button
                                    onClick={() => toast.success("Live chat opening soon…")}
                                    className="inline-flex items-center gap-1.5
                                    text-on-surface-variant hover:text-primary"
                                >
                                    <MessageCircle className="h-3.5 w-3.5"/> Live Chat / Contact
                                    Support
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div
                    className="mt-12 flex flex-col items-center justify-between gap-4 border-t
                    border-blush/40 px-4 pt-6 text-xs text-on-surface-variant sm:flex-row sm:px-0">
                    <p>© {new Date().getFullYear()} Verdant Luxe. All rights reserved.</p>
                    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
                        {LEGAL_LINKS.map((l) => (
                            <li key={l}>
                                <a href="#" className="hover:text-primary">
                                    {l}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {showTop && (
                <button
                    onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
                    aria-label="Back to top"
                    className="fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center
                    rounded-full bg-primary text-primary-foreground shadow-lg transition-transform
                    hover:-translate-y-0.5"
                >
                    <ArrowUp className="h-5 w-5"/>
                </button>
            )}
        </footer>
    );
}

function FooterColumn({title, children }: { title: string; children: ReactNode; }) {
    return (
        <div className="min-w-0">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-soft-rose">
                {title}
            </h4>
            <ul className="mt-5 space-y-3">{children}</ul>
        </div>
    );
}

function FooterLink({item}: { item: LinkItem }) {
    return (
        <li>
            {item.href?.startsWith("/") ? (
                <Link
                    href={item.href}
                    className="text-sm text-on-surface-variant transition-colors hover:text-primary"
                >
                    {item.label}
                </Link>
            ) : (
                <a
                    href={item.href ?? "#"}
                    className="text-sm text-on-surface-variant transition-colors hover:text-primary"
                >
                    {item.label}
                </a>
            )}
        </li>
    );
}