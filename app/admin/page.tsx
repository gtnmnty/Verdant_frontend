import type { Metadata } from "next";
import { DashboardContent } from "@/app/admin/_components/DashboardContent";

export const metadata: Metadata = {
    title: "Dashboard — Admin — Verdant Salon",
};

export default function AdminDashboardPage() {
    return <DashboardContent />;
}
