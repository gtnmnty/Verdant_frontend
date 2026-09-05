export type Status = "upcoming" | "pending" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  service: string;
  stylist: string;
  branch: string;
  date: string; // ISO
  durationMin: number;
  price: number;
  status: Status;
  image: string;
}

export const STATUS_META: Record<Status, { label: string; chip: string }> = {
  upcoming: { label: "Upcoming", chip: "bg-blush/60 text-primary" },
  pending: { label: "Pending Confirmation", chip: "bg-champagne-gold/20 text-[#8a6d1f]" },
  completed: { label: "Completed", chip: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelled", chip: "bg-rose-100 text-rose-700" },
};

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return (
      d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) +
      " · " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}