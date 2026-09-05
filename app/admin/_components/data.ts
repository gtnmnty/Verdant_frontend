const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0f2a1d,b8c9b8,e0b06a,c25450,d5e0d5&textColor=ffffff`;

export interface DashboardAppointment {
  id: string;
  customer: string;
  customerAvatar: string;
  serviceName: string;
  startsAt: string;
  durationMin: number;
  status: "upcoming" | "pending" | "completed" | "cancelled";
}

export const DASHBOARD_APPOINTMENTS: DashboardAppointment[] = [
  {
    id: "ap1",
    customer: "Sophie Laurent",
    customerAvatar: avatar("Sophie Laurent"),
    serviceName: "Keratin Treatment",
    startsAt: "2026-08-21T10:30:00",
    durationMin: 120,
    status: "upcoming",
  },
  {
    id: "ap2",
    customer: "David Chen",
    customerAvatar: avatar("David Chen"),
    serviceName: "Scalp Therapy",
    startsAt: "2026-08-21T12:15:00",
    durationMin: 45,
    status: "pending",
  },
  {
    id: "ap3",
    customer: "Hannah Park",
    customerAvatar: avatar("Hannah Park"),
    serviceName: "Balayage & Cut",
    startsAt: "2026-08-21T14:00:00",
    durationMin: 180,
    status: "upcoming",
  },
];

export interface ActivityItem {
  id: string;
  kind: "booked" | "restock" | "cancellation" | "shift" | "review" | "order";
  title: string;
  body: string;
  at: string;
}

export const DASHBOARD_ACTIVITY: ActivityItem[] = [
  { id: "ac1", kind: "booked", title: "New Appointment Booked", body: "Julianne Smith — Balayage & Cut", at: "12 min ago" },
  { id: "ac2", kind: "restock", title: "Inventory Restocked", body: "Aveda Damage Remedy Shampoos (24×)", at: "1 hour ago" },
  { id: "ac3", kind: "cancellation", title: "Cancellation", body: "Robert Miller — Men's Grooming", at: "3 hours ago" },
  { id: "ac4", kind: "shift", title: "Stylist Shift Update", body: "Marcus Johnson added to Weekend Shift", at: "5 hours ago" },
];

export const ACTIVITY_TONE: Record<ActivityItem["kind"], string> = {
  booked: "bg-admin-sidebar",
  restock: "bg-admin-amber",
  cancellation: "bg-admin-rose",
  shift: "bg-admin-ink",
  review: "bg-admin-sage-deep",
  order: "bg-admin-sage-deep",
};

export const REVENUE_SERIES = [42, 55, 60, 48, 70, 64, 78, 52, 82, 70, 88, 95];
export const VOLUME_SERIES = [18, 22, 26, 21, 30, 28, 33, 24, 36, 31, 39, 42];

export const DASHBOARD_STATS = {
  todayAppointments: 20,
  pendingOrders: 16,
  monthlyRevenue: 42850,
  lowStockAlerts: 4,
};

export const INVENTORY_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1600&q=60";
