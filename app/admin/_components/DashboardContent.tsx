"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Plus,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { StatusBadge } from "@/app/admin/_components/StatusBadge";
import { CustomerAvatar } from "@/app/admin/appointments/_components/AppointmentsContent";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/admin/role-context";
import { gqlRequest } from "@/utils/graphqlClient";
import {Skeleton, SkeletonRegion} from "@/components/ui/skeleton";

// ---------- data ----------

interface DashAppointment {
  id: string;
  appointmentCode: string;
  user: { fullName: string; avatarUrl: string | null };
  serviceName: string;
  stylist: { name: string } | null;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
}

interface DashOrder {
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

interface DashProduct {
  stockQuantity: number;
  lowStockThreshold: number;
}

interface AuditEntry {
  id: string;
  title: string;
  detail: string | null;
  actorLabel: string | null;
  createdAt: string;
}

// Every role gets the appointment queries (a stylist only ever receives their own, enforced by the backend).
const APPOINTMENTS_QUERY = `
    query DashboardAppointments {
        upcoming: adminAppointments(status: UPCOMING, sort: SCHEDULED_SOONEST, page: 1, pageSize: 50) {
            items {
                id appointmentCode serviceName scheduledAt durationMinutes status
                user { fullName avatarUrl }
                stylist { name }
            }
        }
        pending: adminAppointments(status: PENDING, sort: SCHEDULED_SOONEST, page: 1, pageSize: 50) {
            items {
                id appointmentCode serviceName scheduledAt durationMinutes status
                user { fullName avatarUrl }
                stylist { name }
            }
            totalItems
        }
    }
`;

const ORDERS_QUERY = `
    query DashboardOrders {
        adminOrders(sort: DATE, direction: DESC, page: 1, pageSize: 100) {
            items { total orderStatus paymentStatus createdAt }
            totalItems
        }
    }
`;

const PRODUCTS_QUERY = `
    query DashboardProducts {
        adminProducts(page: 1, pageSize: 100) {
            items { stockQuantity lowStockThreshold }
        }
    }
`;

const AUDIT_QUERY = `
    query DashboardAudit {
        auditDashboardFeed(page: 0, size: 5) {
            content { id title detail actorLabel createdAt }
        }
    }
`;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function useSection<T>(enabled: boolean, load: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    load()
      .then((d) => { if (!cancelled) setData(d); })
      // A section the role can't load (or that fails) just stays empty; the rest of the dashboard still renders.
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `load` is a constant query for the lifetime of the page
  }, [enabled]);
  return { data, loading };
}

// ---------- pieces ----------

function StatCard({
  icon, tone, label, value, hint, href,
}: { icon: ReactNode; tone: string; label: string; value: string; hint?: string; href?: string }) {
  const body = (
    <div className="h-full rounded-2xl bg-admin-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className={`grid size-10 place-items-center rounded-xl ${tone}`}>{icon}</div>
        {hint ? <span className="text-xs font-medium text-admin-muted">{hint}</span> : null}
      </div>
      <div className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-admin-muted">{label}</p>
        <p className="mt-1 font-display text-3xl">{value}</p>
      </div>
    </div>
  );
  return href ? <Link href={href} className="block">{body}</Link> : body;
}

function BarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(1, ...data);
  return (
    <div>
      <svg viewBox="0 0 600 220" className="h-48 w-full" preserveAspectRatio="none" role="img" aria-label="Last 14 days">
        <line x1="0" x2="600" y1="60" y2="60" stroke="#e5e2db" strokeDasharray="4 4" />
        <line x1="0" x2="600" y1="130" y2="130" stroke="#e5e2db" strokeDasharray="4 4" />
        {data.map((v, i) => {
          const w = 600 / data.length;
          const h = (v / max) * 180;
          return <rect key={i} x={i * w + 6} y={200 - h} width={w - 12} height={Math.max(h, 2)} rx={6} fill="#d5e0d5" />;
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-admin-muted">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
}

function SlotList({ title, rows, emptyText, loading = false }: { title: string; rows: DashAppointment[]; emptyText: string; loading?: boolean }) {
  return (
    <section className="rounded-2xl bg-admin-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl sm:text-2xl">{title}</h2>
        <Link href="/admin/appointments" className="text-sm text-admin-muted hover:text-admin-ink">
          View all
        </Link>
      </div>
      {rows.length === 0 && loading ? (
        <SkeletonRegion label="Loading appointments" className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </SkeletonRegion>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-admin-muted">{emptyText}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((a) => {
            const dt = new Date(a.scheduledAt);
            return (
              <li
                key={a.id}
                className="grid grid-cols-[72px_auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border-l-4 border-admin-sage-deep bg-admin-cream/40 p-3"
              >
                <div className="leading-tight">
                  <p className="text-sm font-semibold">
                    {dt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </p>
                  <p className="text-[11px] text-admin-muted">
                    {dt.toLocaleDateString([], { month: "short", day: "numeric" })}
                  </p>
                </div>
                <CustomerAvatar name={a.user.fullName} src={a.user.avatarUrl ?? ""} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.user.fullName}</p>
                  <p className="truncate text-xs text-admin-muted">
                    {a.serviceName} • {a.durationMinutes}m
                  </p>
                </div>
                <StatusBadge status={a.status.toLowerCase() as "upcoming" | "pending"} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function QuickLink({ href, icon, title, hint, primary }: { href: string; icon: ReactNode; title: string; hint?: string; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-2xl p-4 shadow-sm ${
        primary ? "bg-admin-sidebar text-admin-sidebar-fg" : "bg-admin-sage/60 hover:bg-admin-sage"
      }`}
    >
      <div className={`grid size-10 shrink-0 place-items-center rounded-full ${primary ? "border border-white/30" : "bg-admin-surface"}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-display text-lg ${primary ? "text-white" : ""}`}>{title}</p>
        {hint ? <p className={`text-xs ${primary ? "opacity-80" : "text-admin-muted"}`}>{hint}</p> : null}
      </div>
      <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

// ---------- dashboard ----------

export function DashboardContent() {
  const { perms, role, me } = useRole();

  const canAppointments = perms.nav.appointments !== "hidden";
  const canOrders = perms.nav.orders !== "hidden";
  const canProducts = perms.caps.editCatalog; // low stock is a catalog concern
  const canAudit = perms.caps.viewAuditLog;
  const financials = perms.caps.seeFinancials;

  const appts = useSection(canAppointments, () =>
    gqlRequest<{
      upcoming: { items: DashAppointment[] };
      pending: { items: DashAppointment[]; totalItems: number };
    }>(APPOINTMENTS_QUERY),
  );
  const orders = useSection(canOrders, () =>
    gqlRequest<{ adminOrders: { items: DashOrder[]; totalItems: number } }>(ORDERS_QUERY),
  );
  const products = useSection(canProducts, () =>
    gqlRequest<{ adminProducts: { items: DashProduct[] } }>(PRODUCTS_QUERY),
  );
  const audit = useSection(canAudit, () =>
    gqlRequest<{ auditDashboardFeed: { content: AuditEntry[] } }>(AUDIT_QUERY),
  );

  const view = useMemo(() => {
    const now = new Date();
    const upcoming = (appts.data?.upcoming.items ?? []).filter((a) => new Date(a.scheduledAt) >= now);
    const pending = appts.data?.pending.items ?? [];
    const today = [...upcoming, ...pending].filter((a) => isSameDay(new Date(a.scheduledAt), now));

    const orderRows = orders.data?.adminOrders.items ?? [];
    const openOrders = orderRows.filter((o) => o.orderStatus === "PLACED" || o.orderStatus === "PROCESSING").length;
    const isPaid = (o: DashOrder) => o.paymentStatus === "PAID" || o.paymentStatus === "PROCESSED";
    const monthRevenue = orderRows
      .filter((o) => isPaid(o) && new Date(o.createdAt).getMonth() === now.getMonth()
        && new Date(o.createdAt).getFullYear() === now.getFullYear())
      .reduce((sum, o) => sum + o.total, 0);

    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (13 - i));
      return d;
    });
    const revenueSeries = days.map((d) =>
      orderRows.filter((o) => isPaid(o) && isSameDay(new Date(o.createdAt), d)).reduce((s, o) => s + o.total, 0));
    const volumeSeries = days.map((d) => orderRows.filter((o) => isSameDay(new Date(o.createdAt), d)).length);
    const labels = days.map((d) => d.toLocaleDateString([], { month: "short", day: "numeric" }));

    const lowStock = (products.data?.adminProducts.items ?? [])
      .filter((p) => p.stockQuantity <= p.lowStockThreshold).length;

    return {
      upcoming, pending, today, openOrders, monthRevenue, revenueSeries, volumeSeries, labels, lowStock,
      slots: [...pending, ...upcoming]
        .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))
        .slice(0, 6),
    };
  }, [appts.data, orders.data, products.data]);

  const [chart, setChart] = useState<"revenue" | "volume">("revenue");
  const showChart = canOrders && financials;

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const firstName = me.fullName.split(" ")[0];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">{greeting}, {firstName}</h1>
        <p className="text-sm text-admin-muted">
          {role === "stylist"
            ? "Here's your schedule."
            : role === "receptionist"
              ? "Here's what needs the front desk today."
              : "Here's how the salon is doing."}
        </p>
      </div>

      {/* Stats: only what this role can act on */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {canAppointments ? (
          <StatCard
            icon={<CalendarDays className="size-5 text-admin-ink" />}
            tone="bg-admin-sage"
            label={role === "stylist" ? "My appointments today" : "Today's appointments"}
            value={appts.loading ? "…" : String(view.today.length)}
            href="/admin/appointments"
          />
        ) : null}
        {canAppointments && role !== "stylist" ? (
          <StatCard
            icon={<CalendarCheck className="size-5 text-admin-ink" />}
            tone="bg-admin-blush"
            label="Awaiting approval"
            value={appts.loading ? "…" : String(appts.data?.pending.totalItems ?? 0)}
            hint={(appts.data?.pending.totalItems ?? 0) > 0 ? "Action needed" : undefined}
            href="/admin/appointments"
          />
        ) : null}
        {role === "stylist" ? (
          <StatCard
            icon={<CalendarCheck className="size-5 text-admin-ink" />}
            tone="bg-admin-blush"
            label="Upcoming"
            value={appts.loading ? "…" : String(view.upcoming.length)}
            href="/admin/appointments"
          />
        ) : null}
        {canOrders ? (
          <StatCard
            icon={<ClipboardList className="size-5 text-admin-ink" />}
            tone="bg-admin-blush"
            label="Open orders"
            value={orders.loading ? "…" : String(view.openOrders)}
            hint="Placed / processing"
            href="/admin/orders"
          />
        ) : null}
        {financials && canOrders ? (
          <StatCard
            icon={<Banknote className="size-5 text-admin-ink" />}
            tone="bg-admin-sage"
            label="Revenue this month"
            value={orders.loading ? "…" : `$${Math.round(view.monthRevenue).toLocaleString()}`}
            hint="Paid orders"
          />
        ) : null}
        {canProducts ? (
          <StatCard
            icon={<AlertTriangle className="size-5 text-admin-rose" />}
            tone="bg-admin-rose/15"
            label="Low stock"
            value={products.loading ? "…" : String(view.lowStock).padStart(2, "0")}
            hint={view.lowStock > 0 ? "Action needed" : undefined}
            href="/admin/products"
          />
        ) : null}
      </div>

      {/* Chart + activity: management roles only (revenue / audit are gated by role) */}
      {showChart || canAudit ? (
        <div className={`grid grid-cols-1 gap-4 ${showChart && canAudit ? "xl:grid-cols-[2fr_1fr]" : ""}`}>
          {showChart ? (
            <section className="rounded-2xl bg-admin-surface p-5 shadow-sm">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="font-display text-xl sm:text-2xl">Performance</h2>
                  <p className="text-sm text-admin-muted">
                    {chart === "revenue" ? "Paid revenue" : "Orders placed"} over the last 14 days
                  </p>
                </div>
                <div className="flex shrink-0 gap-1 rounded-full bg-admin-cream p-1">
                  {(["revenue", "volume"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setChart(k)}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${
                        chart === k ? "bg-admin-sidebar text-white" : "text-admin-muted hover:text-admin-ink"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <BarChart
                  data={chart === "revenue" ? view.revenueSeries : view.volumeSeries}
                  labels={view.labels}
                />
              </div>
            </section>
          ) : null}

          {canAudit ? (
            <section className="flex flex-col rounded-2xl bg-admin-surface p-5 shadow-sm">
              <h2 className="font-display text-xl sm:text-2xl">Recent Activity</h2>
              {(audit.data?.auditDashboardFeed.content ?? []).length === 0 ? (
                audit.loading ? (
                <SkeletonRegion label="Loading recent activity" className="mt-4 flex-1 space-y-4">
                  {Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-12 w-1 shrink-0 rounded-full"/>
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3"/>
                        <Skeleton className="h-3 w-1/2"/>
                      </div>
                    </div>
                  ))}
                </SkeletonRegion>
              ) : (
                <p className="mt-4 flex-1 text-sm text-admin-muted">No recent activity.</p>
              )
              ) : (
                <ul className="mt-4 flex-1 space-y-4">
                  {audit.data!.auditDashboardFeed.content.map((a) => (
                    <li key={a.id} className="flex gap-3">
                      <span className="mt-1 h-12 w-1 shrink-0 rounded-full bg-admin-sage-deep" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{a.title}</p>
                        <p className="truncate text-sm text-admin-muted">{a.detail ?? a.actorLabel ?? ""}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-admin-muted">
                          {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild variant="outline" className="mt-4 rounded-full border-admin-line">
                <Link href="/admin/audit-logs">View Audit Log</Link>
              </Button>
            </section>
          ) : null}
        </div>
      ) : null}

      <div className={`grid grid-cols-1 gap-4 ${canAppointments ? "xl:grid-cols-[1.4fr_1fr]" : ""}`}>
        {canAppointments ? (
          <SlotList
            title={role === "stylist" ? "My upcoming slots" : "Upcoming slots"}
            rows={view.slots}
            loading={appts.loading}
            emptyText="No upcoming appointments."
          />
        ) : null}

        <div className="grid content-start gap-3">
          {perms.caps.createAppointment ? (
            <QuickLink
              primary
              href="/admin/appointments"
              icon={<Plus className="size-5" />}
              title="New Appointment"
              hint="Quick schedule a client"
            />
          ) : null}
          {canOrders ? (
            <QuickLink href="/admin/orders" icon={<ShoppingCart className="size-5 text-admin-ink" />} title="Orders" hint="Review and update orders" />
          ) : null}
          {canProducts ? (
            <QuickLink href="/admin/products" icon={<AlertTriangle className="size-5 text-admin-ink" />} title="Inventory" hint={view.lowStock > 0 ? `${view.lowStock} item(s) low on stock` : "Stock levels look healthy"} />
          ) : null}
          <QuickLink href="/admin/settings" icon={<Settings className="size-5 text-admin-ink" />} title="My profile & settings" hint="Update your details and password" />
        </div>
      </div>
    </div>
  );
}
