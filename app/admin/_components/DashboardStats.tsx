import { AlertTriangle, Banknote, CalendarDays, ClipboardList } from "lucide-react";
import { DASHBOARD_STATS } from "@/app/admin/_components/data";

function StatCard({
  icon,
  iconTone,
  trend,
  trendTone,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconTone: string;
  trend: string;
  trendTone: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-admin-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className={`grid size-10 place-items-center rounded-xl ${iconTone}`}>{icon}</div>
        <span className={`text-xs font-medium ${trendTone}`}>{trend}</span>
      </div>
      <div className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-admin-muted">
          {label}
        </p>
        <p className="mt-1 font-display text-3xl">{value}</p>
      </div>
    </div>
  );
}

export function DashboardStats() {
  const { todayAppointments, pendingOrders, monthlyRevenue, lowStockAlerts } =
    DASHBOARD_STATS;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<CalendarDays className="size-5 text-admin-ink" />}
        iconTone="bg-admin-sage"
        trend="+12% vs Yesterday"
        trendTone="text-admin-muted"
        label="Today's Appointments"
        value={String(todayAppointments)}
      />
      <StatCard
        icon={<ClipboardList className="size-5 text-admin-ink" />}
        iconTone="bg-admin-blush"
        trend={`${Math.round(pendingOrders / 8)} Priority`}
        trendTone="text-admin-muted"
        label="Pending Orders"
        value={String(pendingOrders)}
      />
      <StatCard
        icon={<Banknote className="size-5 text-admin-ink" />}
        iconTone="bg-admin-sage"
        trend="On Track"
        trendTone="text-admin-muted"
        label="Monthly Revenue"
        value={`$${monthlyRevenue.toLocaleString()}`}
      />
      <StatCard
        icon={<AlertTriangle className="size-5 text-admin-rose" />}
        iconTone="bg-admin-rose/15"
        trend="Action Required"
        trendTone="text-admin-rose"
        label="Low Stock Alerts"
        value={String(lowStockAlerts).padStart(2, "0")}
      />
    </div>
  );
}
