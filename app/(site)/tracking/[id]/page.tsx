import type { Metadata } from "next";
import { TrackingContent } from "@/app/(site)/tracking/[id]/_components/TrackingContent";

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
    return <TrackingContent id={id} />;
}