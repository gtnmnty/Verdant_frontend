"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, ChevronLeft, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/app/admin/_components/AdminSidebar";
import { activeAdminNavItem } from "@/app/admin/_components/nav";

export function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const current = activeAdminNavItem(pathname);
  const title = current?.label ?? "Dashboard";
  const isDetail = pathname.split("/").length > 3;
  const unreadNotifications = 3;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-1.5 border-b border-admin-line bg-admin-bg/95 px-2 backdrop-blur sm:gap-2 sm:px-6">
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

        <h2 className="min-w-0 flex-1 truncate font-display text-lg sm:flex-none sm:text-2xl">
          {title}
        </h2>

        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-3">
          <div className="relative hidden min-w-0 max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
            <Input
              placeholder="Search services, clients, or orders…"
              className="h-10 w-full min-w-0 rounded-full border-admin-line bg-admin-surface pl-10"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            onClick={() => setSearchOpen((o) => !o)}
            aria-label="Search"
          >
            <Search className="size-5" />
          </Button>

          <button
            type="button"
            onClick={() => toast.message("No new notifications right now.")}
            aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`}
            className="relative grid size-9 place-items-center rounded-full text-admin-ink hover:bg-admin-surface"
          >
            <Bell className="size-5" />
            {unreadNotifications > 0 ? (
              <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-admin-rose text-[9px] font-semibold text-white">
                {unreadNotifications}
              </span>
            ) : null}
          </button>

          <div className="flex items-center gap-2 rounded-full bg-admin-surface px-1 py-1 pr-2 shadow-sm sm:pr-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-admin-sage text-xs font-semibold text-admin-ink">
              EV
            </div>
            <div className="hidden min-w-0 text-left leading-tight sm:block">
              <div className="truncate text-sm font-medium">Elena Vance</div>
              <div className="truncate text-[11px] text-admin-muted">Manager</div>
            </div>
          </div>
        </div>
      </header>

      {searchOpen ? (
        <div className="border-b border-admin-line bg-admin-surface px-3 py-2 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-admin-muted" />
            <Input
              autoFocus
              placeholder="Search…"
              className="h-9 w-full rounded-full border-admin-line bg-admin-bg pl-9"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
