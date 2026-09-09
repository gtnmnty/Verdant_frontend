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
  createdAt: string;
}

export const STATUS_TO_BACKEND: Record<string, string> = {
  active: "ACTIVE",
  inactive: "INACTIVE",
  suspended: "SUSPENDED",
  pending: "PENDING",
};
export const STATUS_FROM_BACKEND: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_TO_BACKEND).map(([k, v]) => [v, k]),
);
