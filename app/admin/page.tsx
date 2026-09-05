import type { Metadata } from "next";
import { DashboardStats } from "@/app/admin/_components/DashboardStats";
import { DashboardChart } from "@/app/admin/_components/DashboardChart";
import { DashboardActivity } from "@/app/admin/_components/DashboardActivity";
import { DashboardUpcoming } from "@/app/admin/_components/DashboardUpcoming";
import { DashboardQuickActions } from "@/app/admin/_components/DashboardQuickActions";
import { DashboardBanner } from "@/app/admin/_components/DashboardBanner";

export const metadata: Metadata = {
    title: "Dashboard — Admin — Verdant Salon",
};

export default function AdminDashboardPage() {
    return (
        <div className="space-y-5">
            <DashboardStats />

            <div
                className={
                    "grid grid-cols-1 gap-4 " +
                    "xl:grid-cols-[2fr_1fr]"
                }
            >
                <DashboardChart />
                <DashboardActivity />
            </div>

            <div
                className={
                    "grid grid-cols-1 gap-4 " +
                    "xl:grid-cols-[1.4fr_1fr]"
                }
            >
                <DashboardUpcoming />
                <DashboardQuickActions />
            </div>

            <DashboardBanner />
        </div>
    );
}
