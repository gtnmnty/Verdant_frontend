import Link from "next/link";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { DASHBOARD_APPOINTMENTS } from "@/app/admin/_components/data";

export function DashboardUpcoming() {
  return (
    <section className="rounded-2xl bg-admin-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl sm:text-2xl">Upcoming Slots</h2>
        <Link
          href="/admin/appointments"
          className="text-sm text-admin-muted hover:text-admin-ink"
        >
          Full Calendar
        </Link>
      </div>
      <ul className="mt-4 space-y-3">
        {DASHBOARD_APPOINTMENTS.map((a) => {
          const dt = new Date(a.startsAt);
          const time = dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
          return (
            <li
              key={a.id}
              className="grid grid-cols-[60px_auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border-l-4 border-admin-sage-deep bg-admin-cream/40 p-3"
            >
              <span className="text-sm font-semibold leading-tight">{time}</span>
              {/* eslint-disable-next-line @next/next/no-img-element -- Dicebear returns SVG; next/image blocks SVGs by default and it's not worth loosening that config for a decorative avatar */}
              <img
                src={a.customerAvatar}
                alt=""
                className="size-9 shrink-0 rounded-full"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{a.customer}</p>
                <p className="truncate text-xs text-admin-muted">
                  {a.serviceName} • {a.durationMin}m
                </p>
              </div>
              <StatusBadge status={a.status} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
