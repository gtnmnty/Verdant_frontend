import type {Metadata} from "next";
import {ChangePasswordFlow} from "@/app/(site)/change-password/_components/ChangePasswordFlow";

export const metadata: Metadata = {
    title: "Change Password — Verdant Luxe",
    description: "Update your Verdant Luxe account password securely.",
    openGraph: {
        title: "Change Password — Verdant Luxe",
        description: "Update your Verdant Luxe account password securely.",
    },
};

export default function ChangePasswordPage() {
    return <div className="w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]"><ChangePasswordFlow/></div>;
}
