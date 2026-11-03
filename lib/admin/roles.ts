export type Role = "owner" | "manager" | "admin" | "receptionist" | "stylist";

export type NavKey =
  | "dashboard"
  | "products"
  | "services"
  | "orders"
  | "appointments"
  | "stylists"
  | "accounts"
  | "branches"
  | "reviews"
  | "pages"
  | "journal"
  | "audit"
  | "settings";

export interface RolePerms {
  role: Role;
  label: string;
  nav: Record<NavKey, "full" | "view" | "hidden">;
  showSettings: boolean;
  primaryCta: "new-appointment" | "block-time" | "none";
  caps: {
    editCatalog: boolean;
    refundVoid: boolean;
    exportOrders: boolean;
    createAppointment: boolean;
    reassignAppointment: boolean;
    viewAllAppointments: boolean;
    manageStylistRoster: boolean;
    setCommission: boolean;
    stylistsOwnOnly: boolean;
    manageAccounts: boolean;
    manageManagers: boolean;
    editBranch: boolean;
    moderateReviews: boolean;
    respondReviews: boolean;
    reviewsOwnOnly: boolean;
    editPages: boolean;
    seeFinancials: boolean;
    suspendStaff: boolean;
    canFileLeave: boolean;
    canApproveLeave: boolean;
    manageStoreSettings: boolean;
    viewAuditLog: boolean;
  };
}

const MANAGER: RolePerms = {
  role: "manager",
  label: "Manager",
  nav: {
    dashboard: "full",
    products: "full",
    services: "full",
    orders: "full",
    appointments: "full",
    stylists: "full",
    accounts: "full",
    branches: "full",
    reviews: "full",
    pages: "view",
    journal: "full",
    audit: "full",
    settings: "full",
  },
  showSettings: true,
  primaryCta: "new-appointment",
  caps: {
    editCatalog: true,
    refundVoid: true,
    exportOrders: true,
    createAppointment: true,
    reassignAppointment: true,
    viewAllAppointments: true,
    manageStylistRoster: true,
    setCommission: true,
    stylistsOwnOnly: false,
    manageAccounts: true,
    manageManagers: true,
    editBranch: true,
    moderateReviews: true,
    respondReviews: true,
    reviewsOwnOnly: false,
    editPages: false,
    seeFinancials: true,
    suspendStaff: true,
    canFileLeave: false,
    canApproveLeave: true,
    manageStoreSettings: true,
    viewAuditLog: true,
  },
};

// The owner sees and can do everything a manager can.
const OWNER: RolePerms = { ...MANAGER, role: "owner", label: "Owner", nav: { ...MANAGER.nav, pages: "view" } };

const ADMIN: RolePerms = {
  role: "admin",
  label: "Admin",
  nav: {
    dashboard: "full",
    products: "full",
    services: "full",
    orders: "full",
    appointments: "full",
    stylists: "full",
    accounts: "full",
    branches: "full",
    reviews: "full",
    pages: "full",
    journal: "full",
    audit: "full",
    settings: "full",
  },
  showSettings: true,
  primaryCta: "new-appointment",
  caps: {
    editCatalog: true,
    refundVoid: true,
    exportOrders: true,
    createAppointment: true,
    reassignAppointment: true,
    viewAllAppointments: true,
    manageStylistRoster: true,
    setCommission: false,
    stylistsOwnOnly: false,
    manageAccounts: true,
    manageManagers: false,
    editBranch: true,
    moderateReviews: true,
    respondReviews: true,
    reviewsOwnOnly: false,
    editPages: true,
    seeFinancials: true,
    suspendStaff: false,
    canFileLeave: true,
    canApproveLeave: false,
    manageStoreSettings: true,
    viewAuditLog: true,
  },
};

const RECEPTIONIST: RolePerms = {
  role: "receptionist",
  label: "Receptionist",
  nav: {
    dashboard: "view",
    products: "view",
    services: "hidden",
    orders: "full",
    appointments: "full",
    stylists: "hidden",
    accounts: "hidden",
    branches: "hidden",
    reviews: "hidden",
    pages: "hidden",
    journal: "hidden",
    audit: "hidden",
    settings: "view",
  },
  showSettings: true,
  primaryCta: "new-appointment",
  caps: {
    editCatalog: false,
    refundVoid: false,
    exportOrders: false,
    createAppointment: true,
    reassignAppointment: false,
    viewAllAppointments: true,
    manageStylistRoster: false,
    setCommission: false,
    stylistsOwnOnly: false,
    manageAccounts: false,
    manageManagers: false,
    editBranch: false,
    moderateReviews: false,
    respondReviews: false,
    reviewsOwnOnly: false,
    editPages: false,
    seeFinancials: false,
    suspendStaff: false,
    canFileLeave: true,
    canApproveLeave: false,
    manageStoreSettings: false,
    viewAuditLog: false,
  },
};

const STYLIST: RolePerms = {
  role: "stylist",
  label: "Stylist",
  nav: {
    dashboard: "view",
    products: "hidden",
    services: "hidden",
    orders: "hidden",
    appointments: "view",
    stylists: "hidden",
    accounts: "hidden",
    branches: "hidden",
    reviews: "hidden",
    pages: "hidden",
    journal: "hidden",
    audit: "hidden",
    settings: "view",
  },
  showSettings: true,
  primaryCta: "block-time",
  caps: {
    editCatalog: false,
    refundVoid: false,
    exportOrders: false,
    createAppointment: false,
    reassignAppointment: false,
    viewAllAppointments: false,
    manageStylistRoster: false,
    setCommission: false,
    stylistsOwnOnly: true,
    manageAccounts: false,
    manageManagers: false,
    editBranch: false,
    moderateReviews: false,
    respondReviews: false,
    reviewsOwnOnly: true,
    editPages: false,
    seeFinancials: false,
    suspendStaff: false,
    canFileLeave: true,
    canApproveLeave: false,
    manageStoreSettings: false,
    viewAuditLog: false,
  },
};

export const ROLE_PERMS: Record<Role, RolePerms> = {
  owner: OWNER,
  manager: MANAGER,
  admin: ADMIN,
  receptionist: RECEPTIONIST,
  stylist: STYLIST,
};
export const ROLES: Role[] = ["owner", "manager", "admin", "receptionist", "stylist"];

export function navKeyFromPath(pathname: string): NavKey | null {
  const m = pathname.match(/^\/admin(?:\/([^/]+))?/);
  if (!m) return null;
  const seg = m[1];
  if (!seg) return "dashboard";
  const map: Record<string, NavKey> = {
    products: "products",
    services: "services",
    orders: "orders",
    appointments: "appointments",
    stylists: "stylists",
    accounts: "accounts",
    branches: "branches",
    reviews: "reviews",
    pages: "pages",
    journal: "journal",
    settings: "settings",
    "audit-logs": "audit",
  };
  return map[seg] ?? null;
}

// AccountRole from the backend ("OWNER"...) -> staff role used for permissions. CUSTOMER (and anything unknown)
// has no admin access.
export function roleFromBackend(role: string | null | undefined): Role | null {
  const r = role?.toLowerCase();
  return r && r in ROLE_PERMS ? (r as Role) : null;
}
