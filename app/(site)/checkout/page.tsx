import type {Metadata} from "next";
import {CheckoutContent} from "@/app/(site)/checkout/_components/CheckoutContent";

export const metadata: Metadata = {
    title: "Checkout — Verdant Luxe",
    description:
        "Complete your Verdant Luxe order: shipping, " +
        "secure payment, and review in three simple steps.",
    openGraph: {
        title: "Checkout — Verdant Luxe",
        description: "Secure checkout for your boutique ritual.",
    },
};

export default function CheckoutPage() {
    return <div className="w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]"><CheckoutContent/></div>;
}
