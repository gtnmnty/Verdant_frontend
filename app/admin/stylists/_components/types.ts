export interface AdminStylistService {
  id: string;
  name: string;
  price: number;
  durationInMinutes: number;
}

export interface AdminStylist {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  photo: string;
  status: string; // lowercase display status, e.g. "active"
  branchId: string | null;
  branchName: string | null;
  services: AdminStylistService[]; // live assignments straight from the backend
  createdAt: string;
}

export const STATUS_TO_BACKEND: Record<string, string> = {
  active: "ACTIVE",
  inactive: "INACTIVE",
  suspended: "SUSPENDED",
  pending: "PENDING",
  archived: "ARCHIVED", // backend value with no form option; mapped so it still displays
};
export const STATUS_FROM_BACKEND: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_TO_BACKEND).map(([k, v]) => [v, k]),
);
