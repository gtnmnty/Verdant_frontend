import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { TrackingSummary } from "@/app/(site)/tracking/[id]/_components/TrackingSummary";
import { TrackingItemCard } from "@/app/(site)/tracking/[id]/_components/TrackingItemCard";
import { ShipmentDetails } from "@/app/(site)/tracking/[id]/_components/ShipmentDetails";
import { TrackingActions } from "@/app/(site)/tracking/[id]/_components/TrackingActions";
import { MOCK_ITEMS } from "@/app/(site)/tracking/[id]/_components/data";

export const metadata: Metadata = {
  title: "Track Order — Verdant Luxe",
  description: "Track the shipment status of your Verdant Luxe order.",
};

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const total = MOCK_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="pb-20">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-xs
                        font-semibold uppercase tracking-[0.18em]
                        text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Return to Order History
      </Link>

      <header className="mt-8 text-center">
        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)]
                 leading-tight tracking-tight text-primary">
          Track Order
        </h1>
        <Sparkles className="mx-auto mt-2 h-5 w-5 text-champagne-gold" />
      </header>

      <TrackingSummary
        id={id}
        placedOn="August 8, 2026"
        itemCount={MOCK_ITEMS.length}
        total={total}
      />

      <section className="mt-10 space-y-6">
        {MOCK_ITEMS.map((item) => (
          <TrackingItemCard key={item.id} item={item} />
        ))}
      </section>

      <ShipmentDetails
        courier="DHL Express"
        trackingNumber="DHL839201938"
        eta="August 26, 2026"
        shippingAddress="35G Liberty Ave, Quezon City, PH"
        paymentMethod="Visa •••• 4242"
      />

      <TrackingActions />
    </div>
  );
}
