"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Heart, ShoppingBag, User, Bell, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "Services", href: "/services" },
  { label: "Stylists", href: "/stylists" },
]

const notifications = [
  {
    title: "New Arrival — The Celadon Edit",
    desc: "Our latest capsule collection is now live. Explore 14 new pieces inspired by quiet luxury.",
    time: "2 hours ago",
    unread: true,
  },
  {
    title: "Appointment Confirmed",
    desc: "Your Signature Balayage & Cut with Jean-Pierre is confirmed for Oct 24, 10:30 AM.",
    time: "1 day ago",
    unread: true,
  },
  {
    title: "Order Shipped",
    desc: "Order #PF-92834 is on its way. Expected delivery by Oct 31.",
    time: "3 days ago",
    unread: false,
  },
]

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadIds, setUnreadIds] = useState(
    notifications.map((n, i) => (n.unread ? i : null)).filter((i) => i !== null) as number[]
  )
  const notifRef = useRef<HTMLDivElement>(null)

  const hasUnread = unreadIds.length > 0

  // close notif on outside click / escape
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setNotifOpen(false)
        setDrawerOpen(false)
      }
    }
    document.addEventListener("click", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("click", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : ""
  }, [drawerOpen])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto grid h-[68px] max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-5 md:px-16">
          {/* Left nav */}
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="label-caps group relative pb-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-foreground transition-transform duration-200 group-hover:scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Brand */}
          <Link
            href="/frontend/public"
            className="col-start-2 justify-self-center font-heading text-2xl tracking-wide transition-opacity hover:opacity-65 md:text-[1.7rem]"
          >
            Parfois Luxe
          </Link>

          {/* Right icons (desktop) */}
          <div className="hidden items-center justify-self-end md:flex">
            <Link
              href="/account/favorites"
              aria-label="Wishlist"
              className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>

            <div className="relative" ref={notifRef}>
              <button
                aria-label="Notifications"
                onClick={(e) => {
                  e.stopPropagation()
                  setNotifOpen((v) => !v)
                }}
                className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {hasUnread && (
                  <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full border-[1.5px] border-background bg-secondary" />
                )}
              </button>

              {/* Notification popup */}
              <div
                className={cn(
                  "absolute right-0 top-[calc(100%+8px)] w-[340px] origin-top-right rounded bg-card shadow-lg ring-1 ring-border transition-all duration-200",
                  notifOpen
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
                )}
                role="dialog"
                aria-label="Notifications"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 className="font-heading text-lg">Notifications</h3>
                  <button
                    onClick={() => setUnreadIds([])}
                    className="label-caps text-secondary transition-opacity hover:opacity-65"
                  >
                    Mark all read
                  </button>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {notifications.map((n, i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex gap-3 border-b border-border px-4 py-3 last:border-b-0 transition-colors hover:bg-muted",
                        unreadIds.includes(i) && "bg-surface-container-low"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-[7px] w-[7px] flex-shrink-0 rounded-full bg-secondary transition-opacity",
                          unreadIds.includes(i) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <p className="mb-0.5 text-sm font-medium">{n.title}</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">{n.desc}</p>
                        <p className="mt-1 text-[0.68rem] text-muted-foreground">{n.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border px-4 py-3 text-center">
                  <Link
                    href="/account"
                    onClick={() => setNotifOpen(false)}
                    className="label-caps text-secondary transition-opacity hover:opacity-65"
                  >
                    View all
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Hamburger (mobile) */}
          <button
            aria-label="Menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="col-start-3 flex h-[38px] w-[38px] items-center justify-center justify-self-end rounded text-foreground transition-colors hover:bg-accent md:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={cn(
          "fixed inset-0 z-[300] bg-black/35 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-[400] flex h-dvh w-[min(320px,86vw)] flex-col gap-7 border-l border-border bg-background px-8 py-6 transition-transform duration-300 ease-out md:hidden",
          drawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border pb-6">
          <span className="font-heading text-xl tracking-wide">Parfois Luxe</span>
          <button
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setDrawerOpen(false)}
              className="label-caps border-b border-border py-3.5 text-muted-foreground transition-all hover:pl-2 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 border-t border-border pt-4">
          <Link
            href="/account/favorites"
            onClick={() => setDrawerOpen(false)}
            aria-label="Wishlist"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Link>
          <Link
            href="/cart"
            onClick={() => setDrawerOpen(false)}
            aria-label="Cart"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Link>
          <Link
            href="/account"
            onClick={() => setDrawerOpen(false)}
            aria-label="Account"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </Link>
          <button
            aria-label="Notifications"
            onClick={() => {
              setDrawerOpen(false)
              setTimeout(() => setNotifOpen(true), 350)
            }}
            className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {hasUnread && (
              <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full border-[1.5px] border-background bg-secondary" />
            )}
          </button>
        </div>
      </div>
    </>
  )
}
