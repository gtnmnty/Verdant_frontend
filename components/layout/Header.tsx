"use client"

import {useState, useEffect, useRef} from "react";
import {
    CartIcon,
    CloseIcon,
    MenuIcon,
    NotificationIcon,
    ProfileIcon,
    WishlistIcon,
} from "@/components/icons";

const NAV_LINKS = [
    { label: "Home", href: "/home" },
    { label: "Collections", href: "/collections" },
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
];

const ICON_ACTIONS = [
    { label: "Wishlist", icon: WishlistIcon },
    { label: "Cart", icon: CartIcon },
    { label: "Profile", icon: ProfileIcon },
    { label: "Notifications", icon: NotificationIcon },
];

export default function Header(){
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);

    useEffect(() =>{
      const onScroll = () => setIsScrolled(window.scrollY > 10);
      onScroll();
      window.addEventListener("scroll", onScroll, {passive: true})
      return () => window.removeEventListener("scroll", onScroll)
    }, [])

  useEffect(() => {
    if(!isMenuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if(e.key === "Escape"){
        setIsMenuOpen(false);
        toggleRef.current?.focus();
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (drawerRef.current && !drawerRef.current.contains(target) &&
        !toggleRef.current?.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("pointerdown", onPointerDown);

    const firstLink = drawerRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.body.style.overflow = prevOverflow;
    };

  }, [isMenuOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header
      id="site-header"
      className={`fixed inset-x-0 top-0 z-50 border-b border-blush/35 
      bg-surface/90 backdrop-blur-md site-header 
      ${isScrolled ? "is-scrolled" : ""}`}>

        <div className="flex h-[clamp(56px,8vw,76px)] w-full items-center
             justify-between gap-4 px-[10vw] lg:grid
             lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
          <nav aria-label="Primary" className="hidden items-center
               gap-[clamp(12px,2vw,32px)] lg:flex">
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href}
                   className="whitespace-nowrap text-[clamp(9px,1.1vw,12px)]
                   font-semibold uppercase tracking-[0.14em] text-on-surface-variant
                   transition-colors duration-200 hover:text-primary">
                    {link.label}
                </a>
              ))}
          </nav>

          <a href="/home" aria-label="Verdant Luxe home"
            className="min-w-0 truncate font-serif text-[clamp(16px,3vw,30px)]
            leading-none tracking-tight text-primary lg:justify-self-center">
              Verdant Luxe
          </a>

          <div role="toolbar" aria-label="Actions" className="hidden items-center
                justify-end gap-[clamp(10px,1.6vw,22px)] lg:flex">
            {ICON_ACTIONS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                aria-label={label}
                className="flex h-[clamp(28px,3vw,36px)] w-[clamp(28px,3vw,36px)]
                items-center justify-center text-primary opacity-75
                transition-opacity duration-200 hover:opacity-100">
                  <Icon className="h-[clamp(16px,1.8vw,20px)] w-[clamp(16px,1.8vw,20px)]" />
              </button>
            ))}
          </div>

          <button
            ref={toggleRef}
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center
            text-primary transition-opacity duration-200 hover:opacity-70 lg:hidden">
              {isMenuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile navigation drawer */}
        <div id="mobile-nav-drawer" ref={drawerRef} className={`mobile-drawer overflow-y-auto 
          border-t border-blush/30 bg-surface-lowest lg:hidden ${
            isMenuOpen ? "is-open" : ""}`}>
            <nav aria-label="Mobile" className="flex flex-col px-4 py-2 sm:px-6">
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="border-b border-blush/20 py-4 text-sm font-semibold uppercase
                  tracking-[0.14em] text-on-surface-variant transition-colors duration-200
                  hover:text-primary">
                    {link.label}
                </a>
              ))}
              {ICON_ACTIONS.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 border-b border-blush/20 py-4 text-sm font-semibold
                  uppercase tracking-[0.14em] text-on-surface-variant transition-colors duration-200
                  last:border-b-0 hover:text-primary">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {label}
                </button>
              ))}
            </nav>
        </div>
    </header>
  );
}