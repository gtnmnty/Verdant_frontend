"use client"

import {useState} from "react";


type LinkItem = { label: string; to?: string };

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

  return (
    <footer>
      <div>

      </div>
    </footer>
  )
}