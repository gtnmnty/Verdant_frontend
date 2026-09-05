import type { Metadata } from "next";
import { NotificationsFeed } from "@/app/(site)/notifications/_components/NotificationsFeed";

export const metadata: Metadata = {
  title: "Notifications — Verdant Luxe",
  description:
    "Your Verdant Luxe activity feed: appointment updates, order progress, account changes and salon announcements.",
  openGraph: {
    title: "Notifications — Verdant Luxe",
    description:
      "Track appointment, order and account activity across your Verdant Luxe experience.",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
};

export default function NotificationsPage() {
  return <div className="w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]"><NotificationsFeed/></div>;
}
