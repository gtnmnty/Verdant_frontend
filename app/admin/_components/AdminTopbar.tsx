"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/app/admin/_components/AdminSidebar";
import { activeAdminNavItem } from "@/app/admin/_components/nav";
import { AdminNotificationBell } from "@/app/admin/_components/AdminNotificationBell";
import { useRole } from "@/lib/admin/role-context";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

export function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { me, perms } = useRole();

  const current = activeAdminNavItem(pathname);
  const title = current?.label ?? "Dashboard";
  const isDetail = pathname.split("/").length > 3;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-admin-line bg-admin-bg/95 px-3 backdrop-blur sm:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 max-w-[85vw] p-0">
          <AdminSidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {isDetail ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hidden sm:inline-flex"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </Button>
      ) : null}

      <h2 className="min-w-0 flex-1 truncate font-display text-xl sm:text-2xl">{title}</h2>

      <AdminNotificationBell />

      {(
        <div className="flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <div className="truncate text-sm font-medium">{me.fullName}</div>
            <div className="text-[11px] text-admin-muted">{perms.label}</div>
          </div>
          <div
            className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-admin-sage text-xs font-semibold text-admin-ink"
            aria-label={`${me.fullName}, ${perms.label}`}
          >
            {me.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded avatar URLs
              <img src={me.avatarUrl} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              initials(me.fullName)
            )}
          </div>
        </div>
      )}
    </header>
  );
}
