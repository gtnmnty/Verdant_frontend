export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string; // lowercase display role, e.g. "manager"
  status: string; // lowercase display status, e.g. "active"
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal: string;
    country: string;
  };
  createdAt: string;
}

export const ROLE_TO_BACKEND: Record<string, string> = {
  owner: "OWNER",
  manager: "MANAGER",
  admin: "ADMIN",
  stylist: "STYLIST",
  receptionist: "RECEPTIONIST",
  customer: "CUSTOMER",
};
export const ROLE_FROM_BACKEND: Record<string, string> = Object.fromEntries(
  Object.entries(ROLE_TO_BACKEND).map(([k, v]) => [v, k]),
);

export const STATUS_TO_BACKEND: Record<string, string> = {
  unverified: "UNVERIFIED",
  active: "ACTIVE",
  inactive: "INACTIVE",
  suspended: "SUSPENDED",
  banned: "BANNED",
  deleted: "DELETED",
};
export const STATUS_FROM_BACKEND: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_TO_BACKEND).map(([k, v]) => [v, k]),
);
