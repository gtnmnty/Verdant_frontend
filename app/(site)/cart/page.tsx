import type {Metadata} from "next";
import {CartContent} from "@/app/(site)/cart/_components/CartContent";

export const metadata: Metadata = {
    title: "Your Shopping Bag — Verdant Luxe",
    description:
        "Review your selections, delivery preferences, " +
        "and gift packaging before proceeding to secure checkout.",
    openGraph: {
        title: "Your Shopping Bag — Verdant Luxe",
        description: "Refined selections for your boutique ritual.",
    },
};

export default function CartPage() {
    return <div className="w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]"><CartContent/></div>;
}
