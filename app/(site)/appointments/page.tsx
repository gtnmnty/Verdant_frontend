import type {Metadata} from "next";
import {AppointmentsFeed} from "@/app/(site)/appointments/_components/AppointmentsFeed";

export const metadata: Metadata = {
    title: "My Appointments — Verdant Luxe",
    description:
        "Review and manage your Verdant Luxe appointments — reschedule, cancel, or book again.",
    openGraph: {
        title: "My Appointments — Verdant Luxe",
        description: "Personalized beauty, tailored to your schedule.",
    },
};

export default function AppointmentsPage() {
    return <div className="w-full px-[clamp(12px,5vw,10vw)] sm:px-[6vw] lg:px-[10vw]"><AppointmentsFeed/></div>;
}
