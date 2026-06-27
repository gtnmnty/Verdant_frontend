"use client"

import {useEffect, useState, type SubmitEvent, ReactNode} from "react";
import { toast } from "sonner";
import {ArrowUp, Mail, MapPin, Phone, Clock, MessageCircle} from "lucide-react";
import { FaInstagram, FaYoutube, FaFacebook, FaXTwitter } from 'react-icons/fa6';
import Link from "next/link";

type LinkItem = { label: string; to?: string };

const socialIcons = [
  { icon: FaInstagram, to: 'https://instagram.com' },
  { icon: FaFacebook, to: 'https://facebook.com' },
  { icon: FaYoutube, to: 'https://youtube.com' },
  { icon: FaXTwitter, to: 'https://twitter.com' }
]

const QUICK_LINKS: LinkItem[] = [
  { label: "Home", to: "/" },
  { label: "About Us" },
  { label: "Services", to: "/services" },
  { label: "Collections", to: "/collections" },
  { label: "Gallery" },
  { label: "Reviews" },
  { label: "Contact Us" },
];

const CUSTOMER_LINKS: LinkItem[] = [
  { label: "Personal Space", to: "/account" },
  { label: "Appointments", to: "/appointments" },
  { label: "Orders", to: "/orders" },
  { label: "Wishlist" },
  { label: "Cart" },
  { label: "Gift Cards" },
  { label: "Support & FAQ", to: "/account" },
  { label: "Track Order", to: "/orders" },
];

const LEGAL_LINKS = ["Privacy Policy", "Terms of Service", "Accessibility", "Cookies Policy"] as const;

export default function Footer(){
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
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
      setLoading(false)
      setEmail("")
      toast.success("Thank you for subscribing!")
    }, 700);
  }

  return (
    <footer className="mt-24 border-t border-blush/40 bg-surface-low text-on-surface">
      <div className="mx-auto w-[min(80vw,1400px)] py-[clamp(2.5rem,5vw,4rem)]">
        <div className="flex flex-col items-center text-center">
          <Link href="/homeage" className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none
                tracking-[0.22em] text-primary">
            VERDANT&nbsp;LUXE
          </Link>
          <div className="mt-5 flex items-center gap-4">
            <span className="h-px w-12 bg-champagne-gold/70" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.32em]
                  text-champagne-gold">
                  Salon & Studio
            </span>
            <span className="h-px w-12 bg-champagne-gold/70" />
          </div>

          <SocialIcons/>

          <form onSubmit={onSubscribe} className="mt-8 w-full max-w-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-soft-rose">
              Stay Updated
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Private invitations, seasonal rituals, and quiet luxuries.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="footer-email" className="sr-only">Email</label>
              <input
                id="footer-email" type="email"
                required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="min-w-0 flex-1 rounded-full border border-blush/60 bg-surface-lowest
                px-5 py-3 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60
                focus:border-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase
                tracking-[0.18em] text-primary-foreground transition-opacity disabled:opacity-60"
              >
                {loading ? "Sending…" : "Subscribe"}
              </button>
            </div>
          </form>
        </div>

        <div className="my-[clamp(2rem,4vw,3rem)] h-px bg-blush/40" />

        <div className="grid gap-10 text-center md:grid-cols-3 md:text-left">
          <FooterColumn title="Quick Links">
            {QUICK_LINKS.map((l) => <FooterLink key={l.label} item={l} />)}
          </FooterColumn>
          <FooterColumn title="Customer Area">
            {CUSTOMER_LINKS.map((l) => <FooterLink key={l.label} item={l} />)}
          </FooterColumn>
          <div className="min-w-0">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-soft-rose">
              Contact & Support
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-on-surface-variant">
              <li className="flex items-start justify-center gap-2 md:justify-start">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-champagne-gold" />
                <span>35G Liberty Ave, Quezon City</span>
              </li>
              <li className="flex items-start justify-center gap-2 md:justify-start">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-champagne-gold" />
                <span>concierge@verdantluxe.com</span>
              </li>
              <li className="flex items-start justify-center gap-2 md:justify-start">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-champagne-gold" />
                <span>+1 (555) 000 0000</span>
              </li>
              <li className="flex items-start justify-center gap-2 md:justify-start">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-champagne-gold" />
                <span>Mon–Sat · 9:00 AM – 6:00 PM EST</span>
              </li>
            </ul>
            <ul className="mt-5 space-y-2 text-xs">
              <li>
                <a href="#" className="text-on-surface-variant hover:text-primary">
                Shipping & Delivery
                </a>
              </li>
              <li>
                <a href="#" className="text-on-surface-variant hover:text-primary">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <button onClick={() => toast.success("Live chat opening soon…")}
                        className="inline-flex items-center gap-1.5 text-on-surface-variant
                        hover:text-primary">
                  <MessageCircle className="h-3.5 w-3.5" /> Live Chat / Contact Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-blush/40
             pt-6 text-xs text-on-surface-variant sm:flex-row">
          <p>© {new Date().getFullYear()} Verdant Luxe. All rights reserved.</p>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <li key={l}><a href="#" className="hover:text-primary">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 grid h-11 w-11 place-items-center
          rounded-full bg-primary text-primary-foreground shadow-lg transition-transform
          hover:-translate-y-0.5">
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </footer>
  )
}


function SocialIcons(){
  return (
    <div className="mt-6 flex gap-3">
      {socialIcons.map(({ icon: Icon, to }, i) => (
        <a key={i} href={to} target="_blank" rel="noopener noreferrer" aria-label="Social"
           className="grid h-10 w-10 place-items-center rounded-full border border-blush/60
       text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  )
}

function FooterColumn({title, children}: {title: string, children: ReactNode}){
  return (
    <div className="min-w-0">
      <h4 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-soft-rose">{title}</h4>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  )
}

function FooterLink({ item }: { item: LinkItem }) {
  return (
    <li>
      {item.to ? (
        <Link href={item.to} className="text-sm text-on-surface-variant
              transition-colors hover:text-primary">
          {item.label}
        </Link>
      ) : (
        <a href="#" className="text-sm text-on-surface-variant
           transition-colors hover:text-primary">
          {item.label}
        </a>
      )}
    </li>
  );
}