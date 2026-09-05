"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, LogOut, Plus, Settings } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ADMIN_NAV, type AdminNavItem } from "@/app/admin/_components/nav";

export function AdminSidebar({
  collapsed,
  onNavigate,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  onToggleCollapsed?: () => void;
}) {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <aside className="flex h-full w-full flex-col bg-admin-sidebar text-admin-sidebar-fg">
        <div
          className={`flex items-center gap-2 pt-6 pb-4 ${collapsed ? "justify-center px-2" : "px-6"}`}
        >
          <div className="min-w-0 flex-1">
            {collapsed ? (
              <div className="grid size-9 place-items-center rounded-lg bg-white/10 font-display text-base text-white">
                V
              </div>
            ) : (
              <>
                <h1 className="truncate font-display text-2xl leading-none">
                  Verdant Salon
                </h1>
                <p className="mt-1 text-xs tracking-wide text-admin-sidebar-fg/60">
                  Premium Management
                </p>
              </>
            )}
          </div>
          {onToggleCollapsed ? (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="hidden size-8 shrink-0 place-items-center rounded-md text-admin-sidebar-fg/70 hover:bg-white/10 hover:text-white lg:grid"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronsRight className="size-4" />
              ) : (
                <ChevronsLeft className="size-4" />
              )}
            </button>
          ) : null}
        </div>

        <nav className={`flex-1 overflow-y-auto ${collapsed ? "px-2" : "px-3"}`}>
          <ul className="flex flex-col gap-1">
            {ADMIN_NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    active={active}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`pt-4 pb-3 ${collapsed ? "px-2" : "px-4"}`}>
          {collapsed ? (
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <Link
                  href="/admin/appointments"
                  onClick={onNavigate}
                  aria-label="New Appointment"
                  className="grid size-10 place-items-center rounded-md bg-admin-sage text-admin-ink hover:bg-admin-sage-deep"
                >
                  <Plus className="size-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">New Appointment</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/admin/appointments"
              onClick={onNavigate}
              className="flex items-center justify-center gap-2 rounded-md bg-admin-sage px-4 py-2.5 text-sm font-medium text-admin-ink hover:bg-admin-sage-deep"
            >
              <Plus className="size-4" />
              New Appointment
            </Link>
          )}
        </div>

        <div className={`border-t border-white/10 py-3 ${collapsed ? "px-2" : "px-3"}`}>
          <Link
            href="/admin/settings"
            onClick={onNavigate}
            aria-label="Settings"
            title={collapsed ? "Settings" : undefined}
            className={`flex items-center gap-3 rounded-md py-2.5 text-sm text-admin-sidebar-fg/80 hover:bg-white/5 hover:text-white ${
              collapsed ? "justify-center px-2" : "px-3"
            }`}
          >
            <Settings className="size-4" />
            {!collapsed ? <span>Settings</span> : null}
          </Link>
          <button
            type="button"
            onClick={() => toast.success("Signed out.")}
            aria-label="Logout"
            className={`flex w-full items-center gap-3 rounded-md py-2.5 text-sm text-admin-sidebar-fg/80 hover:bg-white/5 hover:text-white ${
              collapsed ? "justify-center px-2" : "px-3"
            }`}
          >
            <LogOut className="size-4" />
            {!collapsed ? "Logout" : null}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: AdminNavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-label={item.label}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
        collapsed ? "justify-center" : ""
      } ${
        active
          ? "bg-white/10 text-white"
          : "text-admin-sidebar-fg/80 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed ? <span className="flex-1 truncate">{item.label}</span> : null}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}
