import {
  CalendarDays,
  FileText,
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
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/services", label: "Services", icon: Scissors },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/admin/stylists", label: "Stylists", icon: UserCircle2 },
  { href: "/admin/accounts", label: "Accounts", icon: Users },
  { href: "/admin/branches", label: "Branches", icon: Store },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
];

export function activeAdminNavItem(pathname: string) {
  return ADMIN_NAV.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href),
  );
}
