import type {Metadata} from "next";
import {ChangePasswordFlow} from "@/app/change-password/_components/ChangePasswordFlow";

export const metadata: Metadata = {
    title: "Change Password — Verdant Luxe",
    description: "Update your Verdant Luxe account password securely.",
    openGraph: {
        title: "Change Password — Verdant Luxe",
        description: "Update your Verdant Luxe account password securely.",
    },
};

export default function ChangePasswordPage() {
    return <ChangePasswordFlow/>;
}
