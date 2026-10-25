import type {Metadata} from "next";
import {ResetPasswordFlow} from "@/app/(site)/reset-password/_components/ResetPasswordFlow";

export const metadata: Metadata = {
    title: "Set Your Password — Verdant Luxe",
    description: "Choose a password for your Verdant Luxe account.",
    // The emailed link carries a one-time token in the URL. Never send the page address as a Referer to
    // other sites, and keep the page out of search results.
    referrer: "no-referrer",
    robots: {index: false, follow: false},
};

export default function ResetPasswordPage() {
    return <div className="w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]"><ResetPasswordFlow/></div>;
}
