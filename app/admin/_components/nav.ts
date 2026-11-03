import type { NavKey } from "@/lib/admin/roles";
import {
  CalendarDays,
  BookOpen,
  LayoutDashboard,
  Package,
  Scissors,
  ScrollText,
  ShoppingCart,
  Star,
  Store,
  UserCircle2,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  navKey: NavKey; // what the signed-in role may see (RolePerms.nav)
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, navKey: "dashboard" },
  { href: "/admin/products", label: "Products", icon: Package, navKey: "products" },
  { href: "/admin/services", label: "Services", icon: Scissors, navKey: "services" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, navKey: "orders" },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays, navKey: "appointments" },
  { href: "/admin/stylists", label: "Stylists", icon: UserCircle2, navKey: "stylists" },
  { href: "/admin/accounts", label: "Accounts", icon: Users, navKey: "accounts" },
  { href: "/admin/branches", label: "Branches", icon: Store, navKey: "branches" },
  { href: "/admin/reviews", label: "Reviews", icon: Star, navKey: "reviews" },
  { href: "/admin/journal", label: "Journal", icon: BookOpen, navKey: "journal" },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText, navKey: "audit" },
];

export function activeAdminNavItem(pathname: string) {
  return ADMIN_NAV.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href),
  );
}
