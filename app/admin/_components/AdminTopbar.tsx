"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/app/admin/_components/AdminSidebar";
import { activeAdminNavItem } from "@/app/admin/_components/nav";
import { AdminNotificationBell } from "@/app/admin/_components/AdminNotificationBell";
import { useAuth } from "@/context/AuthContext";
import { gqlRequest } from "@/utils/graphqlClient";

interface Me {
  fullName: string;
  role: string;
}

const ME_QUERY = `query AdminTopbarMe { me { fullName role } }`;

// "STYLIST" -> "Stylist"
const roleLabel = (role: string) => role.charAt(0) + role.slice(1).toLowerCase();

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
  const { loading: authLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  const current = activeAdminNavItem(pathname);
  const title = current?.label ?? "Dashboard";
  const isDetail = pathname.split("/").length > 3;

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    gqlRequest<{ me: Me }>(ME_QUERY)
      .then((res) => {
        if (!cancelled && res?.me) setMe(res.me);
      })
      .catch(() => {
        // The user chip just stays hidden; pages report their own load errors.
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading]);

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

      {me ? (
        <div className="flex items-center gap-3">
          <div className="hidden text-right leading-tight sm:block">
            <div className="truncate text-sm font-medium">{me.fullName}</div>
            <div className="text-[11px] text-admin-muted">{roleLabel(me.role)}</div>
          </div>
          <div
            className="grid size-9 shrink-0 place-items-center rounded-full bg-admin-sage text-xs font-semibold text-admin-ink"
            aria-label={`${me.fullName}, ${roleLabel(me.role)}`}
          >
            {initials(me.fullName)}
          </div>
        </div>
      ) : null}
    </header>
  );
}
