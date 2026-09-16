import type { Metadata } from "next";
import { AdminProvider } from "@/lib/admin/store";
import { AdminShellClient } from "@/app/admin/_components/AdminShellClient";
import { AdminRoleBridge } from "@/app/admin/AdminRoleBridge";
import React from "react";

export const metadata: Metadata = {
    title: "Admin — Verdant Salon",
    description: "Verdant Salon management dashboard.",
    robots: { index: false, follow: false },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminProvider>
            <AdminRoleBridge>
                <AdminShellClient>{children}</AdminShellClient>
            </AdminRoleBridge>
        </AdminProvider>
    );
}
