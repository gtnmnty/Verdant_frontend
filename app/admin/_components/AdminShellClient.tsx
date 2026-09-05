"use client";

import {useEffect, useState, type ReactNode} from "react";
import {AdminSidebar} from "@/app/admin/_components/AdminSidebar";
import {AdminTopbar} from "@/app/admin/_components/AdminTopbar";

const COLLAPSED_KEY = "admin.sidebar.collapsed";

export function AdminShellClient({children}: { children: ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    // Hydrate the collapsed preference from localStorage after mount, so the
    // server-rendered markup and first client render always match.
    useEffect(() => {
        try {
            const stored = localStorage.getItem(COLLAPSED_KEY);
            if (stored === "1") setCollapsed(true);
        } catch {
            /* noop */
        }
        setHydrated(true);
    }, []);

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
            } catch {
                /* noop */
            }
            return next;
        });
    };

    const sidebarWidth = collapsed ? "w-16" : "w-64";

    return (
        <div className="min-h-screen w-full bg-admin-bg font-sans text-admin-ink">
            {/*
        The sidebar is fixed to the viewport (not sticky, not relative) so it
        never scrolls with the page content, regardless of page height or any
        ancestor's overflow/height quirks. The content column is offset by a
        matching left padding so nothing renders underneath it.
      */}
            <div
                className={`fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 lg:block ${sidebarWidth} ${
                    hydrated ? "" : "invisible"
                }`}
            >
                <AdminSidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed}/>
            </div>

            <div
                className={`flex min-h-screen w-full flex-col transition-[padding] duration-200 ${
                    collapsed ? "lg:pl-16" : "lg:pl-64"
                }`}
            >
                <AdminTopbar/>
                <main className="w-full min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
